import { ConnectivityTestResult, ConnectivityTestStep, Device, Vlan } from '../types';
import { StorageService } from './storage';

export class NetworkSimulator {
  public static runPingTest(
    sourceDeviceId: string,
    destinationDeviceId: string,
    protocol: string = 'ICMP',
    packetSize: number = 64
  ): ConnectivityTestResult {
    const devices = StorageService.getDevices();
    const vlans = StorageService.getVlans();
    const subinterfaces = StorageService.getSubinterfaces();
    const aclRules = StorageService.getAclRules();

    const sourceDev = devices.find(d => d.id === sourceDeviceId);
    const destDev = devices.find(d => d.id === destinationDeviceId);

    if (!sourceDev || !destDev) {
      throw new Error('Source or Destination device not found');
    }

    const sourceVlan = vlans.find(v => v.id === sourceDev.vlanId);
    const destVlan = vlans.find(v => v.id === destDev.vlanId);

    const isSameVlan = sourceDev.vlanId === destDev.vlanId;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const testId = `ping-${Date.now()}`;

    // Case 1: Same VLAN (L2 Intra-VLAN switching)
    if (isSameVlan) {
      if (destDev.status === 'Offline') {
        const result: ConnectivityTestResult = {
          id: testId,
          timestamp: timeStr,
          sourceDeviceId: sourceDev.id,
          sourceDeviceName: sourceDev.name,
          sourceIp: sourceDev.ipAddress,
          sourceVlanId: sourceDev.vlanId,
          destinationDeviceId: destDev.id,
          destinationDeviceName: destDev.name,
          destinationIp: destDev.ipAddress,
          destinationVlanId: destDev.vlanId,
          protocol,
          packetSize,
          status: 'FAILED',
          isSameVlan: true,
          pathSteps: [
            { name: sourceDev.name, type: 'SOURCE', ip: sourceDev.ipAddress, detail: `VLAN ${sourceDev.vlanId}` },
            { name: 'S1-SWITCH', type: 'SWITCH', detail: `Access Port ${sourceDev.switchPort}` },
            { name: destDev.name, type: 'DESTINATION', ip: destDev.ipAddress, detail: 'Host Offline (No Response)' },
          ],
          latencyMs: 0,
          packetsSent: 4,
          packetsReceived: 0,
          packetLossPercent: 100,
          failureReason: `Destination host ${destDev.name} (${destDev.ipAddress}) is offline or unreachable.`,
        };

        StorageService.addLog({
          event: 'Ping Test Failed',
          details: `${sourceDev.name} -> ${destDev.name}: Host offline (100% loss)`,
          sourceIp: sourceDev.ipAddress,
          destIp: destDev.ipAddress,
          vlanId: sourceDev.vlanId,
          severity: 'error',
          category: 'SYSTEM',
        });

        StorageService.addConnectivityResult(result);
        return result;
      }

      const result: ConnectivityTestResult = {
        id: testId,
        timestamp: timeStr,
        sourceDeviceId: sourceDev.id,
        sourceDeviceName: sourceDev.name,
        sourceIp: sourceDev.ipAddress,
        sourceVlanId: sourceDev.vlanId,
        destinationDeviceId: destDev.id,
        destinationDeviceName: destDev.name,
        destinationIp: destDev.ipAddress,
        destinationVlanId: destDev.vlanId,
        protocol,
        packetSize,
        status: 'SUCCESS',
        isSameVlan: true,
        pathSteps: [
          { name: sourceDev.name, type: 'SOURCE', ip: sourceDev.ipAddress, detail: `VLAN ${sourceDev.vlanId} (${sourceVlan?.name || 'Local'})` },
          { name: 'S1-SWITCH', type: 'SWITCH', detail: `Access Port ${sourceDev.switchPort} -> Access Port ${destDev.switchPort} (Direct L2)` },
          { name: destDev.name, type: 'DESTINATION', ip: destDev.ipAddress, detail: `VLAN ${destDev.vlanId} Host` },
        ],
        latencyMs: Math.floor(Math.random() * 2) + 1,
        packetsSent: 4,
        packetsReceived: 4,
        packetLossPercent: 0,
      };

      StorageService.addLog({
        event: 'Ping Test Success (Intra-VLAN)',
        details: `${sourceDev.name} -> ${destDev.name} (Direct VLAN ${sourceDev.vlanId} Layer 2 Switching on S1-SWITCH)`,
        sourceIp: sourceDev.ipAddress,
        destIp: destDev.ipAddress,
        vlanId: sourceDev.vlanId,
        severity: 'success',
        category: 'SYSTEM',
      });

      StorageService.addConnectivityResult(result);
      return result;
    }

    // Case 2: Inter-VLAN Routing required
    // Step 2A: Check ACL Policy Rules
    const matchingDenyRule = aclRules.find(rule => {
      if (!rule.enabled || rule.action !== 'DENY') return false;
      const srcMatch = rule.sourceVlanId === 'ALL' || String(rule.sourceVlanId) === String(sourceDev.vlanId);
      const dstMatch = rule.destinationVlanId === 'ALL' || String(rule.destinationVlanId) === String(destDev.vlanId);
      return srcMatch && dstMatch;
    });

    if (matchingDenyRule) {
      matchingDenyRule.hitCount += 1;
      StorageService.updateAclRule(matchingDenyRule);

      const reasonStr = `PACKET BLOCKED — ${matchingDenyRule.id}: ${matchingDenyRule.description}`;

      const result: ConnectivityTestResult = {
        id: testId,
        timestamp: timeStr,
        sourceDeviceId: sourceDev.id,
        sourceDeviceName: sourceDev.name,
        sourceIp: sourceDev.ipAddress,
        sourceVlanId: sourceDev.vlanId,
        destinationDeviceId: destDev.id,
        destinationDeviceName: destDev.name,
        destinationIp: destDev.ipAddress,
        destinationVlanId: destDev.vlanId,
        protocol,
        packetSize,
        status: 'BLOCKED',
        isSameVlan: false,
        pathSteps: [
          { name: sourceDev.name, type: 'SOURCE', ip: sourceDev.ipAddress, detail: `VLAN ${sourceDev.vlanId} Host` },
          { name: 'S1-SWITCH', type: 'SWITCH', detail: `Access Port ${sourceDev.switchPort}` },
          { name: '802.1Q TRUNK', type: 'TRUNK', detail: 'Switch Fa0/1 Trunk Link' },
          { name: `R1-ROUTER (G0/0.${sourceDev.vlanId})`, type: 'ROUTER', detail: `${matchingDenyRule.id} DENY Applied` },
          { name: destDev.name, type: 'DESTINATION', ip: destDev.ipAddress, detail: 'Packet Blocked' },
        ],
        latencyMs: 0,
        packetsSent: 4,
        packetsReceived: 0,
        packetLossPercent: 100,
        failureReason: reasonStr,
      };

      StorageService.addLog({
        event: 'ACL Policy Match (Blocked)',
        details: `${matchingDenyRule.id} denied traffic from ${sourceDev.name} (VLAN ${sourceDev.vlanId}) to ${destDev.name} (VLAN ${destDev.vlanId})`,
        sourceIp: sourceDev.ipAddress,
        destIp: destDev.ipAddress,
        vlanId: sourceDev.vlanId,
        severity: 'error',
        category: 'ACL',
      });

      StorageService.addConnectivityResult(result);
      return result;
    }

    // Step 2B: Check Subinterface Status
    const srcSubinterface = subinterfaces.find(s => s.vlanId === sourceDev.vlanId);
    const dstSubinterface = subinterfaces.find(s => s.vlanId === destDev.vlanId);

    if (srcSubinterface?.status === 'DOWN' || dstSubinterface?.status === 'DOWN') {
      const downName = srcSubinterface?.status === 'DOWN' ? srcSubinterface.name : dstSubinterface?.name;
      const result: ConnectivityTestResult = {
        id: testId,
        timestamp: timeStr,
        sourceDeviceId: sourceDev.id,
        sourceDeviceName: sourceDev.name,
        sourceIp: sourceDev.ipAddress,
        sourceVlanId: sourceDev.vlanId,
        destinationDeviceId: destDev.id,
        destinationDeviceName: destDev.name,
        destinationIp: destDev.ipAddress,
        destinationVlanId: destDev.vlanId,
        protocol,
        packetSize,
        status: 'FAILED',
        isSameVlan: false,
        pathSteps: [
          { name: sourceDev.name, type: 'SOURCE', ip: sourceDev.ipAddress, detail: `VLAN ${sourceDev.vlanId}` },
          { name: 'S1-SWITCH', type: 'SWITCH', detail: 'Fa0/1 802.1Q Trunk' },
          { name: `Router Subinterface ${downName}`, type: 'SUBINTERFACE', detail: 'Subinterface DOWN' },
        ],
        latencyMs: 0,
        packetsSent: 4,
        packetsReceived: 0,
        packetLossPercent: 100,
        failureReason: `Router-on-a-Stick gateway interface ${downName} is DOWN. Inter-VLAN routing unavailable.`,
      };

      StorageService.addConnectivityResult(result);
      return result;
    }

    // Step 2C: Check Destination Device Status
    if (destDev.status === 'Offline') {
      const result: ConnectivityTestResult = {
        id: testId,
        timestamp: timeStr,
        sourceDeviceId: sourceDev.id,
        sourceDeviceName: sourceDev.name,
        sourceIp: sourceDev.ipAddress,
        sourceVlanId: sourceDev.vlanId,
        destinationDeviceId: destDev.id,
        destinationDeviceName: destDev.name,
        destinationIp: destDev.ipAddress,
        destinationVlanId: destDev.vlanId,
        protocol,
        packetSize,
        status: 'FAILED',
        isSameVlan: false,
        pathSteps: [
          { name: sourceDev.name, type: 'SOURCE', ip: sourceDev.ipAddress, detail: `VLAN ${sourceDev.vlanId}` },
          { name: 'S1-SWITCH', type: 'SWITCH', detail: 'Fa0/1 802.1Q Trunk' },
          { name: `R1-ROUTER (G0/0.${sourceDev.vlanId} -> G0/0.${destDev.vlanId})`, type: 'ROUTER', detail: 'Inter-VLAN Forwarded' },
          { name: destDev.name, type: 'DESTINATION', ip: destDev.ipAddress, detail: 'Host Offline (No Response)' },
        ],
        latencyMs: 0,
        packetsSent: 4,
        packetsReceived: 0,
        packetLossPercent: 100,
        failureReason: `Destination host ${destDev.name} (${destDev.ipAddress}) in VLAN ${destDev.vlanId} is offline.`,
      };

      StorageService.addConnectivityResult(result);
      return result;
    }

    // Step 2D: Inter-VLAN Routing Successful!
    const result: ConnectivityTestResult = {
      id: testId,
      timestamp: timeStr,
      sourceDeviceId: sourceDev.id,
      sourceDeviceName: sourceDev.name,
      sourceIp: sourceDev.ipAddress,
      sourceVlanId: sourceDev.vlanId,
      destinationDeviceId: destDev.id,
      destinationDeviceName: destDev.name,
      destinationIp: destDev.ipAddress,
      destinationVlanId: destDev.vlanId,
      protocol,
      packetSize,
      status: 'SUCCESS',
      isSameVlan: false,
      pathSteps: [
        { name: sourceDev.name, type: 'SOURCE', ip: sourceDev.ipAddress, detail: `VLAN ${sourceDev.vlanId} Gateway: ${sourceVlan?.gateway}` },
        { name: 'S1-SWITCH', type: 'SWITCH', detail: `Access Port ${sourceDev.switchPort} -> Trunk Port Fa0/1` },
        { name: `R1-ROUTER (G0/0.${sourceDev.vlanId})`, type: 'SUBINTERFACE', ip: sourceVlan?.gateway, detail: `802.1Q Tag ${sourceDev.vlanId} Inbound` },
        { name: 'R1-ROUTER Routing Engine', type: 'ROUTER', detail: 'Layer 3 Inter-VLAN Packet Forwarding' },
        { name: `R1-ROUTER (G0/0.${destDev.vlanId})`, type: 'SUBINTERFACE', ip: destVlan?.gateway, detail: `802.1Q Tag ${destDev.vlanId} Outbound` },
        { name: 'S1-SWITCH', type: 'SWITCH', detail: `Trunk Port Fa0/1 -> Access Port ${destDev.switchPort}` },
        { name: destDev.name, type: 'DESTINATION', ip: destDev.ipAddress, detail: `VLAN ${destDev.vlanId} Host` },
      ],
      latencyMs: Math.floor(Math.random() * 3) + 3,
      packetsSent: 4,
      packetsReceived: 4,
      packetLossPercent: 0,
    };

    StorageService.addLog({
      event: 'Inter-VLAN Route Success',
      details: `${sourceDev.name} (VLAN ${sourceDev.vlanId}) -> R1-ROUTER (G0/0.${sourceDev.vlanId} -> G0/0.${destDev.vlanId}) -> ${destDev.name} (VLAN ${destDev.vlanId})`,
      sourceIp: sourceDev.ipAddress,
      destIp: destDev.ipAddress,
      vlanId: sourceDev.vlanId,
      severity: 'success',
      category: 'ROUTING',
    });

    StorageService.addConnectivityResult(result);
    return result;
  }
}
