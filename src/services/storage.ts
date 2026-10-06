import { Vlan, Device, RouterSubinterface, AclRule, ActivityLog, TrafficDataPoint, ConnectivityTestResult } from '../types';

const KEYS = {
  VLANS: 'vlan_nexus_vlans',
  DEVICES: 'vlan_nexus_devices',
  SUBINTERFACES: 'vlan_nexus_subinterfaces',
  ACL_RULES: 'vlan_nexus_acl_rules',
  ACTIVITY_LOGS: 'vlan_nexus_logs',
  TRAFFIC: 'vlan_nexus_traffic',
  CONNECTIVITY_HISTORY: 'vlan_nexus_connectivity_history',
};

// Authoritative Cisco Packet Tracer Configuration
const DEFAULT_VLANS: Vlan[] = [
  {
    id: 10,
    name: 'STUDENTS',
    network: '192.168.10.0/24',
    subnetMask: '255.255.255.0',
    gateway: '192.168.10.1',
    description: 'Student workstation segment with standard ACL policy',
    color: '#3B82F6', // Blue
    activeDevicesCount: 2,
    totalCapacity: 254,
    status: 'Active',
  },
  {
    id: 20,
    name: 'FACULTY',
    network: '192.168.20.0/24',
    subnetMask: '255.255.255.0',
    gateway: '192.168.20.1',
    description: 'Faculty and academic staff network segment',
    color: '#8B5CF6', // Purple
    activeDevicesCount: 2,
    totalCapacity: 254,
    status: 'Active',
  },
  {
    id: 30,
    name: 'ADMINISTRATION',
    network: '192.168.30.0/24',
    subnetMask: '255.255.255.0',
    gateway: '192.168.30.1',
    description: 'Secure admin infrastructure and server segment',
    color: '#06B6D4', // Cyan
    activeDevicesCount: 2,
    totalCapacity: 254,
    status: 'Active',
  },
];

// Authoritative 6 Default Packet Tracer Endpoint PCs
const DEFAULT_DEVICES: Device[] = [
  // VLAN 10 (Students)
  { id: 'dev-101', name: 'Student-PC1', type: 'PC', ipAddress: '192.168.10.10', macAddress: '00:50:79:66:68:01', vlanId: 10, switchPort: 'Fa0/2', gateway: '192.168.10.1', status: 'Online', lastSeen: 'Just now' },
  { id: 'dev-102', name: 'Student-PC2', type: 'PC', ipAddress: '192.168.10.11', macAddress: '00:50:79:66:68:02', vlanId: 10, switchPort: 'Fa0/3', gateway: '192.168.10.1', status: 'Online', lastSeen: 'Just now' },

  // VLAN 20 (Faculty)
  { id: 'dev-201', name: 'Faculty-PC1', type: 'PC', ipAddress: '192.168.20.10', macAddress: '00:50:79:77:68:01', vlanId: 20, switchPort: 'Fa0/4', gateway: '192.168.20.1', status: 'Online', lastSeen: 'Just now' },
  { id: 'dev-202', name: 'Faculty-PC2', type: 'PC', ipAddress: '192.168.20.11', macAddress: '00:50:79:77:68:02', vlanId: 20, switchPort: 'Fa0/5', gateway: '192.168.20.1', status: 'Online', lastSeen: 'Just now' },

  // VLAN 30 (Administration)
  { id: 'dev-301', name: 'Admin-PC1', type: 'PC', ipAddress: '192.168.30.10', macAddress: '00:50:79:88:68:01', vlanId: 30, switchPort: 'Fa0/6', gateway: '192.168.30.1', status: 'Online', lastSeen: 'Just now' },
  { id: 'dev-302', name: 'Admin-PC2', type: 'PC', ipAddress: '192.168.30.11', macAddress: '00:50:79:88:68:02', vlanId: 30, switchPort: 'Fa0/7', gateway: '192.168.30.1', status: 'Online', lastSeen: 'Just now' },
];

const DEFAULT_SUBINTERFACES: RouterSubinterface[] = [
  {
    name: 'G0/0.10',
    vlanId: 10,
    vlanName: 'STUDENTS',
    encapsulation: '802.1Q 10',
    ipAddress: '192.168.10.1',
    subnetMask: '255.255.255.0',
    status: 'UP',
    rxBytes: '14.2 MB',
    txBytes: '28.6 MB',
  },
  {
    name: 'G0/0.20',
    vlanId: 20,
    vlanName: 'FACULTY',
    encapsulation: '802.1Q 20',
    ipAddress: '192.168.20.1',
    subnetMask: '255.255.255.0',
    status: 'UP',
    rxBytes: '42.8 MB',
    txBytes: '51.3 MB',
  },
  {
    name: 'G0/0.30',
    vlanId: 30,
    vlanName: 'ADMINISTRATION',
    encapsulation: '802.1Q 30',
    ipAddress: '192.168.30.1',
    subnetMask: '255.255.255.0',
    status: 'UP',
    rxBytes: '89.1 MB',
    txBytes: '112.4 MB',
  },
];

const DEFAULT_ACL_RULES: AclRule[] = [
  {
    id: 'ACL-001',
    sourceVlanId: 10,
    destinationVlanId: 20,
    protocol: 'ICMP',
    port: 'Any',
    action: 'ALLOW',
    enabled: true,
    description: 'Allow Students to communicate with Faculty',
    hitCount: 142,
  },
  {
    id: 'ACL-002',
    sourceVlanId: 10,
    destinationVlanId: 30,
    protocol: 'IP',
    port: 'Any',
    action: 'DENY',
    enabled: true,
    description: 'Block Students from Administration',
    hitCount: 89,
  },
  {
    id: 'ACL-003',
    sourceVlanId: 20,
    destinationVlanId: 30,
    protocol: 'IP',
    port: 'Any',
    action: 'ALLOW',
    enabled: true,
    description: 'Allow Faculty access to Administration',
    hitCount: 264,
  },
  {
    id: 'ACL-004',
    sourceVlanId: 30,
    destinationVlanId: 'ALL',
    protocol: 'IP',
    port: 'Any',
    action: 'ALLOW',
    enabled: true,
    description: 'Allow Administration access to all segments',
    hitCount: 512,
  },
];

const DEFAULT_ACTIVITY_LOGS: ActivityLog[] = [
  { id: 'log-101', timestamp: '19:48:12', event: 'Inter-VLAN Route Used', details: 'Packet routed via G0/0.10 -> G0/0.20 subinterfaces', sourceIp: '192.168.10.10', destIp: '192.168.20.10', vlanId: 10, severity: 'success', category: 'ROUTING' },
  { id: 'log-102', timestamp: '19:42:05', event: 'ACL Policy Match (Blocked)', details: 'ACL-002 denied traffic from Student-PC1 (192.168.10.10) to Admin-PC1 (192.168.30.10)', sourceIp: '192.168.10.10', destIp: '192.168.30.10', vlanId: 10, severity: 'error', category: 'ACL' },
  { id: 'log-103', timestamp: '19:35:40', event: 'ICMP Ping Test Success', details: 'Student-PC1 (192.168.10.10) -> Faculty-PC1 (192.168.20.10) (0% loss, 4ms)', sourceIp: '192.168.10.10', destIp: '192.168.20.10', vlanId: 10, severity: 'info', category: 'SYSTEM' },
  { id: 'log-104', timestamp: '19:20:18', event: 'Device Connected', details: 'Student-PC1 (192.168.10.10) link state changed to UP on Fa0/2', sourceIp: '192.168.10.10', vlanId: 10, severity: 'info', category: 'DEVICE' },
];

const DEFAULT_TRAFFIC: TrafficDataPoint[] = [
  { time: '00:00', downloadMbps: 12, uploadMbps: 4, totalMbps: 16, vlan10: 5, vlan20: 6, vlan30: 5 },
  { time: '04:00', downloadMbps: 8, uploadMbps: 2, totalMbps: 10, vlan10: 2, vlan20: 3, vlan30: 5 },
  { time: '08:00', downloadMbps: 65, uploadMbps: 24, totalMbps: 89, vlan10: 38, vlan20: 32, vlan30: 19 },
  { time: '12:00', downloadMbps: 110, uploadMbps: 48, totalMbps: 158, vlan10: 68, vlan20: 52, vlan30: 38 },
  { time: '16:00', downloadMbps: 145, uploadMbps: 62, totalMbps: 207, vlan10: 95, vlan20: 64, vlan30: 48 },
  { time: '20:00', downloadMbps: 92, uploadMbps: 38, totalMbps: 130, vlan10: 54, vlan20: 42, vlan30: 34 },
  { time: '24:00', downloadMbps: 45, uploadMbps: 18, totalMbps: 63, vlan10: 24, vlan20: 21, vlan30: 18 },
];

export class StorageService {
  public static init(): void {
    if (!localStorage.getItem(KEYS.VLANS)) {
      localStorage.setItem(KEYS.VLANS, JSON.stringify(DEFAULT_VLANS));
    }
    if (!localStorage.getItem(KEYS.DEVICES)) {
      localStorage.setItem(KEYS.DEVICES, JSON.stringify(DEFAULT_DEVICES));
    } else {
      // Purge old 26 demo devices if cached in browser localStorage
      const saved = localStorage.getItem(KEYS.DEVICES);
      if (saved) {
        const parsed: Device[] = JSON.parse(saved);
        const hasObsoleteDemo = parsed.some(
          (d) =>
            d.name.includes('Laptop') ||
            d.name.includes('Server') ||
            d.name.includes('Printer') ||
            d.name.includes('NAS') ||
            d.name.includes('Student-PC3') ||
            d.name.includes('Faculty-PC3') ||
            d.name.includes('Admin-PC3')
        );
        if (hasObsoleteDemo) {
          localStorage.setItem(KEYS.DEVICES, JSON.stringify(DEFAULT_DEVICES));
        }
      }
    }
    if (!localStorage.getItem(KEYS.SUBINTERFACES)) {
      localStorage.setItem(KEYS.SUBINTERFACES, JSON.stringify(DEFAULT_SUBINTERFACES));
    }
    if (!localStorage.getItem(KEYS.ACL_RULES)) {
      localStorage.setItem(KEYS.ACL_RULES, JSON.stringify(DEFAULT_ACL_RULES));
    }
    if (!localStorage.getItem(KEYS.ACTIVITY_LOGS)) {
      localStorage.setItem(KEYS.ACTIVITY_LOGS, JSON.stringify(DEFAULT_ACTIVITY_LOGS));
    }
    if (!localStorage.getItem(KEYS.TRAFFIC)) {
      localStorage.setItem(KEYS.TRAFFIC, JSON.stringify(DEFAULT_TRAFFIC));
    }
  }

  // VLANs
  public static getVlans(): Vlan[] {
    this.init();
    const data = localStorage.getItem(KEYS.VLANS);
    const vlans: Vlan[] = data ? JSON.parse(data) : DEFAULT_VLANS;
    const devices = this.getDevices();

    return vlans.map(v => {
      const activeCount = devices.filter(d => d.vlanId === v.id && d.status === 'Online').length;
      return { ...v, activeDevicesCount: activeCount };
    });
  }

  public static saveVlans(vlans: Vlan[]): void {
    localStorage.setItem(KEYS.VLANS, JSON.stringify(vlans));
  }

  public static addVlan(vlan: Omit<Vlan, 'activeDevicesCount'>): Vlan {
    const vlans = this.getVlans();
    const newVlan: Vlan = { ...vlan, activeDevicesCount: 0 };
    vlans.push(newVlan);
    this.saveVlans(vlans);

    const subinterfaces = this.getSubinterfaces();
    subinterfaces.push({
      name: `G0/0.${newVlan.id}`,
      vlanId: newVlan.id,
      vlanName: newVlan.name,
      encapsulation: `802.1Q ${newVlan.id}`,
      ipAddress: newVlan.gateway,
      subnetMask: newVlan.subnetMask,
      status: 'UP',
      rxBytes: '0 KB',
      txBytes: '0 KB',
    });
    this.saveSubinterfaces(subinterfaces);

    this.addLog({
      event: 'VLAN Created',
      details: `Created new segment VLAN ${newVlan.id} (${newVlan.name}) - ${newVlan.network}`,
      vlanId: newVlan.id,
      severity: 'success',
      category: 'VLAN',
    });

    return newVlan;
  }

  public static updateVlan(vlan: Vlan): void {
    const vlans = this.getVlans().map(v => v.id === vlan.id ? vlan : v);
    this.saveVlans(vlans);
    this.addLog({
      event: 'VLAN Modified',
      details: `Updated settings for VLAN ${vlan.id} (${vlan.name})`,
      vlanId: vlan.id,
      severity: 'info',
      category: 'VLAN',
    });
  }

  public static deleteVlan(vlanId: number): void {
    const vlans = this.getVlans().filter(v => v.id !== vlanId);
    this.saveVlans(vlans);

    const devices = this.getDevices().filter(d => d.vlanId !== vlanId);
    this.saveDevices(devices);

    const subinterfaces = this.getSubinterfaces().filter(s => s.vlanId !== vlanId);
    this.saveSubinterfaces(subinterfaces);

    this.addLog({
      event: 'VLAN Deleted',
      details: `Removed VLAN segment ID ${vlanId}`,
      vlanId: vlanId,
      severity: 'warning',
      category: 'VLAN',
    });
  }

  // Devices
  public static getDevices(): Device[] {
    this.init();
    const data = localStorage.getItem(KEYS.DEVICES);
    let devices: Device[] = data ? JSON.parse(data) : DEFAULT_DEVICES;

    // Force-prune legacy 26 demo devices if cached in browser localStorage
    const hasLegacy = devices.some(
      (d) =>
        d.name.includes('Laptop') ||
        d.name.includes('Server') ||
        d.name.includes('Printer') ||
        d.name.includes('NAS') ||
        d.name.includes('Student-PC3') ||
        d.name.includes('Student-PC4') ||
        d.name.includes('Faculty-PC3') ||
        d.name.includes('Admin-PC3') ||
        d.name.includes('Admin-Server')
    );

    if (hasLegacy) {
      devices = DEFAULT_DEVICES;
      localStorage.setItem(KEYS.DEVICES, JSON.stringify(DEFAULT_DEVICES));
    }

    return devices;
  }

  public static saveDevices(devices: Device[]): void {
    localStorage.setItem(KEYS.DEVICES, JSON.stringify(devices));
  }

  public static addDevice(device: Omit<Device, 'id' | 'lastSeen'>): Device {
    const devices = this.getDevices();
    const newDevice: Device = {
      ...device,
      id: `dev-${Date.now().toString().slice(-4)}`,
      lastSeen: 'Just now',
    };
    devices.push(newDevice);
    this.saveDevices(devices);

    this.addLog({
      event: 'Device Registered',
      details: `Registered ${newDevice.name} (${newDevice.ipAddress}) on port ${newDevice.switchPort} (VLAN ${newDevice.vlanId})`,
      sourceIp: newDevice.ipAddress,
      vlanId: newDevice.vlanId,
      severity: 'info',
      category: 'DEVICE',
    });

    return newDevice;
  }

  public static updateDevice(device: Device): void {
    const devices = this.getDevices().map(d => d.id === device.id ? device : d);
    this.saveDevices(devices);
  }

  public static deleteDevice(deviceId: string): void {
    const devices = this.getDevices();
    const device = devices.find(d => d.id === deviceId);
    const filtered = devices.filter(d => d.id !== deviceId);
    this.saveDevices(filtered);

    if (device) {
      this.addLog({
        event: 'Device Removed',
        details: `De-registered host ${device.name} (${device.ipAddress})`,
        sourceIp: device.ipAddress,
        vlanId: device.vlanId,
        severity: 'warning',
        category: 'DEVICE',
      });
    }
  }

  // Subinterfaces
  public static getSubinterfaces(): RouterSubinterface[] {
    this.init();
    const data = localStorage.getItem(KEYS.SUBINTERFACES);
    return data ? JSON.parse(data) : DEFAULT_SUBINTERFACES;
  }

  public static saveSubinterfaces(subinterfaces: RouterSubinterface[]): void {
    localStorage.setItem(KEYS.SUBINTERFACES, JSON.stringify(subinterfaces));
  }

  public static toggleSubinterfaceStatus(name: string): void {
    const subinterfaces = this.getSubinterfaces().map(s => {
      if (s.name === name) {
        const nextStatus: 'UP' | 'DOWN' = s.status === 'UP' ? 'DOWN' : 'UP';
        return { ...s, status: nextStatus };
      }
      return s;
    });
    this.saveSubinterfaces(subinterfaces);
  }

  // ACL Rules
  public static getAclRules(): AclRule[] {
    this.init();
    const data = localStorage.getItem(KEYS.ACL_RULES);
    return data ? JSON.parse(data) : DEFAULT_ACL_RULES;
  }

  public static saveAclRules(rules: AclRule[]): void {
    localStorage.setItem(KEYS.ACL_RULES, JSON.stringify(rules));
  }

  public static addAclRule(rule: Omit<AclRule, 'id' | 'hitCount'>): AclRule {
    const rules = this.getAclRules();
    const newRule: AclRule = {
      ...rule,
      id: `ACL-${String(rules.length + 1).padStart(3, '0')}`,
      hitCount: 0,
    };
    rules.push(newRule);
    this.saveAclRules(rules);

    this.addLog({
      event: 'ACL Rule Created',
      details: `${newRule.id}: ${newRule.action} VLAN ${newRule.sourceVlanId} -> VLAN ${newRule.destinationVlanId}`,
      severity: 'info',
      category: 'ACL',
    });

    return newRule;
  }

  public static updateAclRule(rule: AclRule): void {
    const rules = this.getAclRules().map(r => r.id === rule.id ? rule : r);
    this.saveAclRules(rules);
  }

  public static deleteAclRule(ruleId: string): void {
    const rules = this.getAclRules().filter(r => r.id !== ruleId);
    this.saveAclRules(rules);
    this.addLog({
      event: 'ACL Rule Deleted',
      details: `Removed rule ${ruleId}`,
      severity: 'warning',
      category: 'ACL',
    });
  }

  // Activity Logs
  public static getLogs(): ActivityLog[] {
    this.init();
    const data = localStorage.getItem(KEYS.ACTIVITY_LOGS);
    return data ? JSON.parse(data) : DEFAULT_ACTIVITY_LOGS;
  }

  public static addLog(log: Omit<ActivityLog, 'id' | 'timestamp'>): ActivityLog {
    const logs = this.getLogs();
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const newLog: ActivityLog = {
      ...log,
      id: `log-${Date.now()}`,
      timestamp: timeStr,
    };
    logs.unshift(newLog);
    const trimmed = logs.slice(0, 100);
    localStorage.setItem(KEYS.ACTIVITY_LOGS, JSON.stringify(trimmed));
    return newLog;
  }

  // Traffic
  public static getTraffic(): TrafficDataPoint[] {
    this.init();
    const data = localStorage.getItem(KEYS.TRAFFIC);
    return data ? JSON.parse(data) : DEFAULT_TRAFFIC;
  }

  // Connectivity Test History
  public static getConnectivityHistory(): ConnectivityTestResult[] {
    const data = localStorage.getItem(KEYS.CONNECTIVITY_HISTORY);
    return data ? JSON.parse(data) : [];
  }

  public static addConnectivityResult(result: ConnectivityTestResult): void {
    const history = this.getConnectivityHistory();
    history.unshift(result);
    localStorage.setItem(KEYS.CONNECTIVITY_HISTORY, JSON.stringify(history.slice(0, 50)));
  }

  public static resetDemoData(): void {
    localStorage.setItem(KEYS.VLANS, JSON.stringify(DEFAULT_VLANS));
    localStorage.setItem(KEYS.DEVICES, JSON.stringify(DEFAULT_DEVICES));
    localStorage.setItem(KEYS.SUBINTERFACES, JSON.stringify(DEFAULT_SUBINTERFACES));
    localStorage.setItem(KEYS.ACL_RULES, JSON.stringify(DEFAULT_ACL_RULES));
    localStorage.setItem(KEYS.ACTIVITY_LOGS, JSON.stringify(DEFAULT_ACTIVITY_LOGS));
    localStorage.setItem(KEYS.TRAFFIC, JSON.stringify(DEFAULT_TRAFFIC));
    localStorage.removeItem(KEYS.CONNECTIVITY_HISTORY);
  }
}
