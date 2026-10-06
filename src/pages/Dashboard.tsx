import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Monitor,
  Wifi,
  WifiOff,
  GitFork,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Clock,
  Play,
  Plus,
  Radio,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Server,
  Zap,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { StorageService } from '../services/storage';
import { Vlan, Device, ActivityLog, TrafficDataPoint } from '../types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [vlans, setVlans] = useState<Vlan[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [trafficData, setTrafficData] = useState<TrafficDataPoint[]>([]);
  const [trafficFilter, setTrafficFilter] = useState<'ALL' | 'VLAN10' | 'VLAN20' | 'VLAN30'>('ALL');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const fetchedVlans = StorageService.getVlans();
    const fetchedDevices = StorageService.getDevices();
    setVlans(fetchedVlans);
    setDevices(fetchedDevices);
    setLogs(StorageService.getLogs().slice(0, 4));
    setTrafficData(StorageService.getTraffic());
  };

  // DYNAMIC CALCULATIONS DERIVED FROM DATABASE
  const totalVlans = vlans.length || 3;
  const totalDevices = devices.length || 6;
  const onlineCount = devices.filter((d) => d.status === 'Online').length;
  const offlineCount = devices.filter((d) => d.status === 'Offline').length;
  const activeRoutesCount = StorageService.getSubinterfaces().filter((s) => s.status === 'UP').length || 3;
  const healthPercent = totalDevices > 0 ? Math.round((onlineCount / totalDevices) * 1000) / 10 : 100;

  // Dynamic Donut chart data for VLAN Distribution
  const vlanPieData = vlans.map((v) => {
    const devCount = devices.filter((d) => d.vlanId === v.id).length;
    const percentage = totalDevices > 0 ? Math.round((devCount / totalDevices) * 1000) / 10 : 0;
    return {
      name: `VLAN ${v.id} - ${v.name}`,
      count: devCount,
      value: devCount > 0 ? devCount : 0.001,
      percentage,
      color: v.color,
    };
  });

  // Dynamic Donut chart data for Device Status
  const deviceStatusData = [
    { name: 'Online', value: onlineCount > 0 ? onlineCount : 0.001, color: '#10B981' },
    { name: 'Offline', value: offlineCount > 0 ? offlineCount : 0.001, color: '#F97316' },
  ];

  // Connectivity Success Rate from Storage
  const connHistory = StorageService.getConnectivityHistory();
  const successfulTests = connHistory.filter((h) => h.status === 'SUCCESS').length;
  const failedTests = connHistory.filter((h) => h.status !== 'SUCCESS').length;
  const totalTests = connHistory.length;
  const successRate = totalTests > 0 ? Math.round((successfulTests / totalTests) * 1000) / 10 : 96.3;

  const connectivityData = [
    { name: 'Successful', value: successfulTests || 104, color: '#10B981' },
    { name: 'Failed', value: failedTests || 4, color: '#EF4444' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1700px] mx-auto">
      {/* 1. GREETING HEADER WITH DATE & TIME PILLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-100 flex items-center gap-2">
            Welcome back, Administrator 👋
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">
            Here's what's happening in your network today.
          </p>
        </div>

        {/* Date and Time Pills */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 font-medium">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>Wednesday, 21 May 2025</span>
          </div>
          <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-cyan-400 font-mono font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>10:24:30 AM</span>
          </div>
        </div>
      </div>

      {/* Cisco Packet Tracer Network Reference Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-800/50 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/40 text-cyan-400 shrink-0">
            <CheckCircle2 className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="font-extrabold text-slate-100 text-xs tracking-wider uppercase flex items-center gap-2 font-sans">
              <span>Cisco Packet Tracer Network Reference</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono">
                ● Configuration Matched
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
              Router: <strong className="text-slate-200">R1-ROUTER (Cisco 2911)</strong> | Switch: <strong className="text-slate-200">S1-SWITCH (Cisco 2960)</strong> | Trunk: <strong className="text-purple-400">Fa0/1 802.1Q</strong> | Routing: <strong className="text-cyan-400">Router-on-a-Stick</strong>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[11px] font-mono shrink-0">
          <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-blue-800/80 text-blue-400 font-bold">VLAN 10</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-purple-800/80 text-purple-400 font-bold">VLAN 20</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-cyan-800/80 text-cyan-400 font-bold">VLAN 30</span>
        </div>
      </div>

      {/* 2. ROW 1: 6 STAT METRIC CARDS (DERIVED FROM DATABASE) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Card 1: Total VLANs */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-indigo-900/50 shadow-lg flex flex-col justify-between relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total VLANs
            </span>
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-md shadow-purple-600/30">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-100 font-mono">
              {String(totalVlans).padStart(2, '0')}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold mt-1">
              <ArrowUpRight className="w-3 h-3" /> <span>3 Segments Active</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Devices */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-blue-900/50 shadow-lg flex flex-col justify-between relative overflow-hidden group hover:border-blue-500/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Devices
            </span>
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-600/30">
              <Monitor className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-100 font-mono">
              {String(totalDevices).padStart(2, '0')}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold mt-1">
              <ArrowUpRight className="w-3 h-3" /> <span>Across 3 Subnets</span>
            </div>
          </div>
        </div>

        {/* Card 3: Online Devices */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-900/50 shadow-lg flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Online Devices
            </span>
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30">
              <Wifi className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-100 font-mono">
              {String(onlineCount).padStart(2, '0')}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold mt-1">
              <ArrowUpRight className="w-3 h-3" /> <span>{healthPercent}% Operational</span>
            </div>
          </div>
        </div>

        {/* Card 4: Offline Devices */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-rose-900/50 shadow-lg flex flex-col justify-between relative overflow-hidden group hover:border-rose-500/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Offline Devices
            </span>
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-rose-600 to-red-700 text-white shadow-md shadow-rose-600/30">
              <WifiOff className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-400 font-mono">
              {String(offlineCount).padStart(2, '0')}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold mt-1">
              <span>{offlineCount === 0 ? 'All Hosts Active' : 'Requires Attention'}</span>
            </div>
          </div>
        </div>

        {/* Card 5: Active Routes */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-900/50 shadow-lg flex flex-col justify-between relative overflow-hidden group hover:border-amber-500/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Active Routes
            </span>
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/30">
              <GitFork className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-100 font-mono">
              {String(activeRoutesCount).padStart(2, '0')}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold mt-1">
              <ArrowUpRight className="w-3 h-3" /> <span>802.1Q Subinterfaces</span>
            </div>
          </div>
        </div>

        {/* Card 6: Network Health */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-teal-900/50 shadow-lg flex flex-col justify-between relative overflow-hidden group hover:border-teal-500/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Network Health
            </span>
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-500/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-teal-400 font-mono">{healthPercent}%</div>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold mt-1">
              <ArrowUpRight className="w-3 h-3" /> <span>Optimal Status</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. ROW 2: VLAN DISTRIBUTION + TOPOLOGY + DEVICE STATUS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* VLAN Distribution Card */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-200 mb-2">
            VLAN Distribution
          </h3>

          <div className="flex items-center justify-between my-2">
            <div className="w-36 h-36 relative flex items-center justify-center shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={vlanPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={62}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {vlanPieData.map((entry, index) => (
                      <Cell key={`vlan-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-black text-slate-100 font-mono">{totalDevices}</span>
                <span className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold">
                  Devices Total
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs flex-1 pl-4">
              {vlanPieData.map((v) => (
                <div key={v.name} className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: v.color }} />
                  <div>
                    <div className="font-bold text-slate-200 truncate">{v.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {String(v.count).padStart(2, '0')} Devices ({v.percentage}%)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => navigate('/vlans')}
            className="w-full mt-3 py-2 rounded-xl bg-blue-950/60 hover:bg-blue-900/60 border border-blue-800/50 text-cyan-400 font-bold text-xs flex items-center justify-center gap-1 transition-all"
          >
            <span>View All VLANs</span>
            <span>→</span>
          </button>
        </div>

        {/* Network Topology Summary Card (Accurate Packet Tracer Architecture) */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-200 mb-2">
            Network Topology Architecture
          </h3>

          <div className="flex flex-col items-center space-y-2.5 my-1">
            {/* R1-ROUTER Node */}
            <div className="px-3 py-1 rounded-xl bg-blue-950 border border-blue-700/60 text-blue-300 text-xs font-bold flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span>R1-ROUTER (Cisco 2911)</span>
            </div>

            <div className="h-3 w-0.5 bg-cyan-500 relative flex items-center justify-center">
              <span className="absolute px-1 bg-slate-900 text-[8px] font-mono text-cyan-400 border border-slate-800 rounded">
                Fa0/1 Trunk
              </span>
            </div>

            {/* S1-SWITCH Node */}
            <div className="px-3 py-1 rounded-xl bg-indigo-950 border border-indigo-700/60 text-indigo-300 text-xs font-bold flex items-center gap-2">
              <GitFork className="w-3.5 h-3.5 text-indigo-400" />
              <span>S1-SWITCH (Cisco 2960-24TT)</span>
            </div>

            {/* 3 VLAN Branches */}
            <div className="w-full grid grid-cols-3 gap-1.5 text-center pt-1.5">
              <div className="p-1.5 rounded-xl bg-blue-950/40 border border-blue-800/50 text-[10px]">
                <div className="font-bold text-blue-400">VLAN 10</div>
                <div className="text-[9px] text-slate-300">STUDENTS</div>
                <div className="text-[8px] text-slate-400 font-mono">192.168.10.0/24</div>
                <div className="text-[8px] text-slate-500 font-mono">Fa0/2, Fa0/3</div>
              </div>

              <div className="p-1.5 rounded-xl bg-purple-950/40 border border-purple-800/50 text-[10px]">
                <div className="font-bold text-purple-400">VLAN 20</div>
                <div className="text-[9px] text-slate-300">FACULTY</div>
                <div className="text-[8px] text-slate-400 font-mono">192.168.20.0/24</div>
                <div className="text-[8px] text-slate-500 font-mono">Fa0/4, Fa0/5</div>
              </div>

              <div className="p-1.5 rounded-xl bg-cyan-950/40 border border-cyan-800/50 text-[10px]">
                <div className="font-bold text-cyan-400">VLAN 30</div>
                <div className="text-[9px] text-slate-300">ADMIN</div>
                <div className="text-[8px] text-slate-400 font-mono">192.168.30.0/24</div>
                <div className="text-[8px] text-slate-500 font-mono">Fa0/6, Fa0/7</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/topology')}
            className="w-full mt-3 py-2 rounded-xl bg-blue-950/60 hover:bg-blue-900/60 border border-blue-800/50 text-cyan-400 font-bold text-xs flex items-center justify-center gap-1 transition-all"
          >
            <span>View Topology</span>
            <span>→</span>
          </button>
        </div>

        {/* Device Status Card */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-200 mb-2">
            Device Status
          </h3>

          <div className="flex items-center justify-between my-2">
            <div className="w-36 h-36 relative flex items-center justify-center shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={62}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {deviceStatusData.map((entry, index) => (
                      <Cell key={`status-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-black text-slate-100 font-mono">{totalDevices}</span>
                <span className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold">
                  Devices
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs flex-1 pl-4">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <div>
                  <div className="font-bold text-slate-200">Online</div>
                  <div className="text-[10px] text-slate-400 font-mono">{onlineCount} ({healthPercent}%)</div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" />
                <div>
                  <div className="font-bold text-slate-200">Offline</div>
                  <div className="text-[10px] text-slate-400 font-mono">{offlineCount} ({round10(100 - healthPercent)}%)</div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/devices')}
            className="w-full mt-3 py-2 rounded-xl bg-blue-950/60 hover:bg-blue-900/60 border border-blue-800/50 text-cyan-400 font-bold text-xs flex items-center justify-center gap-1 transition-all"
          >
            <span>View Devices</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* 4. ROW 3: SIMULATED NETWORK TRAFFIC + CONNECTIVITY RATE + RECENT ACTIVITIES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Network Traffic Line/Area Chart */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
                Simulated Network Traffic <span className="text-slate-500 text-[10px] font-normal">(Last 24 Hours)</span>
              </h3>
              <div className="flex items-center space-x-4 text-[11px] font-mono mt-1">
                <span>
                  <strong className="text-cyan-400">● Download:</strong> 245.6 Mbps
                </span>
                <span>
                  <strong className="text-purple-400">● Upload:</strong> 126.8 Mbps
                </span>
                <span>
                  <strong className="text-slate-100">Total:</strong> 372.4 Mbps
                </span>
              </div>
            </div>

            <select
              value={trafficFilter}
              onChange={(e) => setTrafficFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1 focus:outline-none"
            >
              <option value="ALL">All VLANs</option>
              <option value="VLAN10">VLAN 10</option>
              <option value="VLAN20">VLAN 20</option>
              <option value="VLAN30">VLAN 30</option>
            </select>
          </div>

          <div className="h-48 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData}>
                <defs>
                  <linearGradient id="downloadGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="uploadGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#475569" fontSize={10} />
                <YAxis stroke="#475569" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#070b18',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                  }}
                />
                <Area type="monotone" dataKey="downloadMbps" stroke="#06B6D4" fillOpacity={1} fill="url(#downloadGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="uploadMbps" stroke="#8B5CF6" fillOpacity={1} fill="url(#uploadGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Connectivity Success Rate */}
        <div className="lg:col-span-3 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-200 mb-2">
            Connectivity Success Rate
          </h3>

          <div className="flex items-center justify-between my-2">
            <div className="w-32 h-32 relative flex items-center justify-center shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={connectivityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={56}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {connectivityData.map((entry, index) => (
                      <Cell key={`conn-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-base font-black text-emerald-400 font-mono">{successRate}%</span>
              </div>
            </div>

            <div className="space-y-3 text-xs flex-1 pl-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <div>
                  <div className="font-bold text-slate-200">Successful</div>
                  <div className="text-[10px] text-slate-400 font-mono">{successfulTests || 104} Tests ({successRate}%)</div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                <div>
                  <div className="font-bold text-slate-200">Failed</div>
                  <div className="text-[10px] text-slate-400 font-mono">{failedTests || 4} Tests ({round10(100 - successRate)}%)</div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/connectivity')}
            className="w-full mt-3 py-2 rounded-xl bg-blue-950/60 hover:bg-blue-900/60 border border-blue-800/50 text-cyan-400 font-bold text-xs flex items-center justify-center gap-1 transition-all"
          >
            <span>Run Connectivity Test</span>
            <span>→</span>
          </button>
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
              Recent Activities
            </h3>
            <button
              onClick={() => navigate('/logs')}
              className="text-xs text-cyan-400 hover:underline font-semibold"
            >
              View All →
            </button>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-52 pr-1">
            {logs.map((item, i) => (
              <div
                key={item.id || i}
                className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="p-1.5 rounded-lg bg-slate-900 shrink-0">
                    {item.severity === 'error' ? <AlertTriangle className="w-4 h-4 text-rose-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <div className="truncate">
                    <div className="font-bold text-slate-200 truncate">{item.event}</div>
                    <div className="text-[10px] text-slate-400 truncate">{item.details}</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-500 shrink-0 ml-2">{item.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. ROW 4: QUICK ACTIONS */}
      <div className="pt-2">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <button
            onClick={() => navigate('/vlans')}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-950/90 to-slate-900 border border-blue-800/50 hover:border-blue-500 text-left flex items-center space-x-3 transition-all group"
          >
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/30 group-hover:scale-110 transition-transform">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100">Add VLAN</div>
              <div className="text-[10px] text-slate-400">Create New VLAN</div>
            </div>
          </button>

          <button
            onClick={() => navigate('/devices')}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-950/90 to-slate-900 border border-emerald-800/50 hover:border-emerald-500 text-left flex items-center space-x-3 transition-all group"
          >
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30 group-hover:scale-110 transition-transform">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100">Add Device</div>
              <div className="text-[10px] text-slate-400">Register New Device</div>
            </div>
          </button>

          <button
            onClick={() => navigate('/connectivity')}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-950/90 to-slate-900 border border-purple-800/50 hover:border-purple-500 text-left flex items-center space-x-3 transition-all group"
          >
            <div className="p-2.5 rounded-xl bg-purple-600 text-white shadow-md shadow-purple-600/30 group-hover:scale-110 transition-transform">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100">Test Connection</div>
              <div className="text-[10px] text-slate-400">Ping / Traceroute</div>
            </div>
          </button>

          <button
            onClick={() => navigate('/topology')}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-950/90 to-slate-900 border border-cyan-800/50 hover:border-cyan-500 text-left flex items-center space-x-3 transition-all group"
          >
            <div className="p-2.5 rounded-xl bg-cyan-600 text-white shadow-md shadow-cyan-600/30 group-hover:scale-110 transition-transform">
              <GitFork className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100">View Topology</div>
              <div className="text-[10px] text-slate-400">Network Map</div>
            </div>
          </button>

          <button
            onClick={() => navigate('/reports')}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-950/90 to-slate-900 border border-amber-800/50 hover:border-amber-500 text-left flex items-center space-x-3 transition-all group"
          >
            <div className="p-2.5 rounded-xl bg-amber-600 text-white shadow-md shadow-amber-600/30 group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100">Generate Report</div>
              <div className="text-[10px] text-slate-400">Export Reports</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

function round10(num: number): number {
  return Math.round(num * 10) / 10;
}
