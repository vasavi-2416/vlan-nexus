export interface Vlan {
  id: number; // e.g. 10, 20, 30
  name: string; // e.g. Students
  network: string; // e.g. 192.168.10.0/24
  subnetMask: string; // 255.255.255.0
  gateway: string; // 192.168.10.1
  description: string;
  color: string; // hex or tailwind color code
  activeDevicesCount: number;
  totalCapacity: number;
  status: 'Active' | 'Inactive';
}

export type DeviceType = 'PC' | 'Laptop' | 'Server' | 'Printer' | 'Switch' | 'Router';

export interface Device {
  id: string;
  name: string; // e.g. Student-PC1
  type: DeviceType;
  ipAddress: string; // e.g. 192.168.10.10
  macAddress: string; // e.g. 00:50:79:66:68:01
  vlanId: number; // e.g. 10
  switchPort: string; // e.g. Fa0/1
  gateway: string; // e.g. 192.168.10.1
  status: 'Online' | 'Offline';
  lastSeen: string;
}

export interface RouterSubinterface {
  name: string; // e.g. G0/0.10
  vlanId: number;
  vlanName: string;
  encapsulation: string; // e.g. 802.1Q 10
  ipAddress: string; // e.g. 192.168.10.1
  subnetMask: string;
  status: 'UP' | 'DOWN';
  rxBytes: string;
  txBytes: string;
}

export interface AclRule {
  id: string; // e.g. ACL-001
  sourceVlanId: number | 'ALL';
  destinationVlanId: number | 'ALL';
  protocol: 'ICMP' | 'IP' | 'TCP' | 'UDP';
  port: string;
  action: 'ALLOW' | 'DENY';
  enabled: boolean;
  description: string;
  hitCount: number;
}

export interface ConnectivityTestStep {
  name: string;
  type: 'SOURCE' | 'SWITCH' | 'TRUNK' | 'ROUTER' | 'SUBINTERFACE' | 'DESTINATION';
  ip?: string;
  detail?: string;
}

export interface ConnectivityTestResult {
  id: string;
  timestamp: string;
  sourceDeviceId: string;
  sourceDeviceName: string;
  sourceIp: string;
  sourceVlanId: number;
  destinationDeviceId: string;
  destinationDeviceName: string;
  destinationIp: string;
  destinationVlanId: number;
  protocol: string;
  packetSize: number;
  status: 'SUCCESS' | 'BLOCKED' | 'FAILED';
  pathSteps: ConnectivityTestStep[];
  latencyMs: number;
  packetsSent: number;
  packetsReceived: number;
  packetLossPercent: number;
  failureReason?: string;
  isSameVlan: boolean;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  event: string;
  details: string;
  sourceIp?: string;
  destIp?: string;
  vlanId?: number;
  severity: 'info' | 'warning' | 'error' | 'success';
  category: 'VLAN' | 'DEVICE' | 'ROUTING' | 'ACL' | 'SYSTEM';
}

export interface TrafficDataPoint {
  time: string;
  downloadMbps: number;
  uploadMbps: number;
  totalMbps: number;
  vlan10: number;
  vlan20: number;
  vlan30: number;
}

export interface UserProfile {
  username: string;
  name: string;
  role: string;
  email: string;
  avatar: string;
}
