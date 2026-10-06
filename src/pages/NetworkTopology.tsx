import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  GitFork,
  Radio,
  Monitor,
  Play,
  X,
  Layers,
  Cpu,
  Network,
} from 'lucide-react';
import { StorageService } from '../services/storage';
import { Device } from '../types';

// ─── Custom Node Renderer ───────────────────────────────────────────────────
const CustomNetworkNode = ({ data }: { data: any }) => {
  const isRouter     = data.nodeType === 'ROUTER';
  const isSwitch     = data.nodeType === 'SWITCH';
  const isVlanHeader = data.nodeType === 'VLAN_HEADER';

  let bgClass   = 'bg-slate-900/95 border-slate-700 text-slate-200';
  let glowClass = 'shadow-lg shadow-slate-950';

  if (isRouter) {
    bgClass   = 'bg-gradient-to-br from-indigo-950 to-slate-900 border-indigo-500/80 text-indigo-100';
    glowClass = 'shadow-2xl shadow-indigo-500/30 ring-2 ring-indigo-500/40';
  } else if (isSwitch) {
    bgClass   = 'bg-gradient-to-br from-blue-950 to-slate-900 border-blue-500/80 text-blue-100';
    glowClass = 'shadow-2xl shadow-blue-500/30 ring-2 ring-blue-500/40';
  } else if (isVlanHeader) {
    if (data.vlanId === 10) { bgClass = 'bg-blue-950/90 border-blue-500/80 text-blue-100';   glowClass = 'shadow-xl shadow-blue-500/20 ring-1 ring-blue-500/30'; }
    if (data.vlanId === 20) { bgClass = 'bg-purple-950/90 border-purple-500/80 text-purple-100'; glowClass = 'shadow-xl shadow-purple-500/20 ring-1 ring-purple-500/30'; }
    if (data.vlanId === 30) { bgClass = 'bg-cyan-950/90 border-cyan-500/80 text-cyan-100';   glowClass = 'shadow-xl shadow-cyan-500/20 ring-1 ring-cyan-500/30'; }
  } else if (data.vlanId === 10) {
    bgClass = 'bg-slate-900/95 border-blue-700/50 text-slate-100';
  } else if (data.vlanId === 20) {
    bgClass = 'bg-slate-900/95 border-purple-700/50 text-slate-100';
  } else if (data.vlanId === 30) {
    bgClass = 'bg-slate-900/95 border-cyan-700/50 text-slate-100';
  }

  const isDimmed = data.highlightVlan !== 'ALL' && data.vlanId && data.vlanId !== data.highlightVlan;

  return (
    <div
      className={`rounded-2xl border ${bgClass} ${glowClass} ${
        isDimmed ? 'opacity-15 scale-95' : 'opacity-100'
      } transition-all duration-300 font-sans relative hover:scale-105 cursor-pointer select-none`}
      style={{ width: isVlanHeader ? 220 : isRouter || isSwitch ? 220 : 210 }}
    >
      <Handle type="target" position={Position.Top} className="!bg-cyan-400 !w-3 !h-3 !border-2 !border-slate-900" />

      {isVlanHeader ? (
        <div className="px-4 py-3 space-y-1 text-center">
          <div className="text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 whitespace-nowrap">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: data.color }} />
            <span>{data.label}</span>
          </div>
          <div className="text-[10px] font-mono text-slate-300 font-bold">{data.subtext}</div>
          <div className="text-[9px] font-mono text-slate-400">GW: {data.gateway}</div>
        </div>
      ) : (
        <div className="px-3 py-2.5 flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 shrink-0">
            {isRouter && <Radio    className="w-4 h-4 text-indigo-400" />}
            {isSwitch && <GitFork  className="w-4 h-4 text-blue-400"   />}
            {!isRouter && !isSwitch && <Monitor className="w-4 h-4 text-cyan-400" />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-extrabold text-xs leading-tight text-slate-100 whitespace-nowrap overflow-hidden text-ellipsis">{data.label}</div>
            {data.subtext && (
              <div className="text-[10px] text-slate-400 font-mono mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">{data.subtext}</div>
            )}
          </div>
        </div>
      )}

      {!isVlanHeader && data.vlanId && (
        <div className="px-3 pb-2 flex items-center justify-between text-[10px] border-t border-slate-800/60 pt-1.5 mt-0">
          <span className="font-mono text-cyan-300 font-bold">VLAN {data.vlanId}</span>
          <span className="flex items-center gap-1 font-mono text-slate-400">
            <span className={`w-1.5 h-1.5 rounded-full ${data.status === 'Online' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
            {data.status || 'Online'}
          </span>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-cyan-400 !w-3 !h-3 !border-2 !border-slate-900" />
    </div>
  );
};

const nodeTypes = { custom: CustomNetworkNode };

// ─── Main Component ─────────────────────────────────────────────────────────
export const NetworkTopology: React.FC = () => {
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNodeInfo, setSelectedNodeInfo] = useState<any | null>(null);
  const [highlightVlan, setHighlightVlan] = useState<number | 'ALL'>('ALL');

  useEffect(() => {
    buildTopologyNodes();
  }, [highlightVlan]);

  const buildTopologyNodes = () => {
    const devices: Device[] = StorageService.getDevices();

    // ── Layout Constants ────────────────────────────────────────────
    // Canvas effective width ~1400px. Three VLAN columns, each 240px node width.
    // Columns centered at: x=140 (VLAN10), x=580 (VLAN20), x=1020 (VLAN30)
    // Router and switch centered between col1 and col3: x = (140+1020)/2 - 110 = 470
    const COL = { v10: 140, v20: 580, v30: 1020 };
    const CENTER_X = (COL.v10 + COL.v30) / 2 - 110; // ~470

    const initialNodes: Node[] = [
      // ── Tier 1: Router ─────────────────────────────────────────────
      {
        id: 'node-router',
        type: 'custom',
        position: { x: CENTER_X, y: 20 },
        data: {
          label: 'R1-ROUTER',
          subtext: 'Cisco 2911 · G0/0',
          nodeType: 'ROUTER',
          details: {
            deviceName: 'R1-ROUTER',
            model:      'Cisco 2911',
            interface:  'G0/0',
            subinterfaces: ['G0/0.10 — VLAN 10 STUDENTS', 'G0/0.20 — VLAN 20 FACULTY', 'G0/0.30 — VLAN 30 ADMIN'],
            protocol:   '802.1Q (Router-on-a-Stick)',
          },
        },
      },
      // ── Tier 2: Switch ──────────────────────────────────────────────
      {
        id: 'node-switch',
        type: 'custom',
        position: { x: CENTER_X, y: 160 },
        data: {
          label: 'S1-SWITCH',
          subtext: 'Cisco 2960-24TT',
          nodeType: 'SWITCH',
          details: {
            deviceName: 'S1-SWITCH',
            model:     'Cisco 2960-24TT',
            trunkPort: 'Fa0/1 — 802.1Q TRUNK → R1',
            ports: [
              { port: 'Fa0/1', vlan: '802.1Q TRUNK → R1-ROUTER' },
              { port: 'Fa0/2', vlan: 'VLAN 10 — Student-PC1' },
              { port: 'Fa0/3', vlan: 'VLAN 10 — Student-PC2' },
              { port: 'Fa0/4', vlan: 'VLAN 20 — Faculty-PC1' },
              { port: 'Fa0/5', vlan: 'VLAN 20 — Faculty-PC2' },
              { port: 'Fa0/6', vlan: 'VLAN 30 — Admin-PC1' },
              { port: 'Fa0/7', vlan: 'VLAN 30 — Admin-PC2' },
            ],
          },
        },
      },
      // ── Tier 3: VLAN Segment Headers ────────────────────────────────
      {
        id: 'vlan-header-10',
        type: 'custom',
        position: { x: COL.v10, y: 310 },
        data: {
          label:   'VLAN 10 — STUDENTS',
          subtext: '192.168.10.0/24',
          gateway: '192.168.10.1',
          color:   '#3B82F6',
          vlanId:  10,
          nodeType: 'VLAN_HEADER',
          highlightVlan,
        },
      },
      {
        id: 'vlan-header-20',
        type: 'custom',
        position: { x: COL.v20, y: 310 },
        data: {
          label:   'VLAN 20 — FACULTY',
          subtext: '192.168.20.0/24',
          gateway: '192.168.20.1',
          color:   '#8B5CF6',
          vlanId:  20,
          nodeType: 'VLAN_HEADER',
          highlightVlan,
        },
      },
      {
        id: 'vlan-header-30',
        type: 'custom',
        position: { x: COL.v30, y: 310 },
        data: {
          label:   'VLAN 30 — ADMINISTRATION',
          subtext: '192.168.30.0/24',
          gateway: '192.168.30.1',
          color:   '#06B6D4',
          vlanId:  30,
          nodeType: 'VLAN_HEADER',
          highlightVlan,
        },
      },
    ];

    const initialEdges: Edge[] = [
      {
        id: 'e-rtr-sw',
        source: 'node-router',
        target: 'node-switch',
        type: 'smoothstep',
        animated: true,
        label: 'Fa0/1 ↔ G0/0  802.1Q TRUNK',
        labelStyle: { fill: '#22d3ee', fontSize: 10, fontFamily: 'monospace', fontWeight: 'bold' },
        style: { stroke: '#8b5cf6', strokeWidth: 3 },
      },
      {
        id: 'e-sw-vlan10',
        source: 'node-switch',
        target: 'vlan-header-10',
        type: 'smoothstep',
        style: { stroke: '#3B82F6', strokeWidth: 2.5, opacity: highlightVlan !== 'ALL' && highlightVlan !== 10 ? 0.15 : 1 },
      },
      {
        id: 'e-sw-vlan20',
        source: 'node-switch',
        target: 'vlan-header-20',
        type: 'smoothstep',
        style: { stroke: '#8B5CF6', strokeWidth: 2.5, opacity: highlightVlan !== 'ALL' && highlightVlan !== 20 ? 0.15 : 1 },
      },
      {
        id: 'e-sw-vlan30',
        source: 'node-switch',
        target: 'vlan-header-30',
        type: 'smoothstep',
        style: { stroke: '#06B6D4', strokeWidth: 2.5, opacity: highlightVlan !== 'ALL' && highlightVlan !== 30 ? 0.15 : 1 },
      },
    ];

    // ── Tier 4: Endpoint PCs ──────────────────────────────────────────
    const vlan10Devs = devices.filter((d) => d.vlanId === 10);
    const vlan20Devs = devices.filter((d) => d.vlanId === 20);
    const vlan30Devs = devices.filter((d) => d.vlanId === 30);

    const addDeviceNodes = (
      devs: Device[],
      colX: number,
      vlanId: number,
      headerId: string,
      edgeColor: string,
    ) => {
      devs.forEach((dev, idx) => {
        const nodeId = `dev-${dev.id}`;
        initialNodes.push({
          id: nodeId,
          type: 'custom',
          position: { x: colX, y: 460 + idx * 125 },
          data: {
            label:    dev.name,
            subtext:  `${dev.ipAddress} · ${dev.switchPort}`,
            vlanId,
            status:   dev.status,
            highlightVlan,
            rawDevice: dev,
          },
        });
        initialEdges.push({
          id: `e-${headerId}-${dev.id}`,
          source: headerId,
          target: nodeId,
          type: 'smoothstep',
          animated: dev.status === 'Online',
          label: dev.switchPort,
          labelStyle: { fill: edgeColor, fontSize: 9, fontFamily: 'monospace', fontWeight: 700 },
          style: { stroke: edgeColor, strokeWidth: 2, opacity: highlightVlan !== 'ALL' && highlightVlan !== vlanId ? 0.15 : 1 },
        });
      });
    };

    addDeviceNodes(vlan10Devs, COL.v10, 10, 'vlan-header-10', '#3B82F6');
    addDeviceNodes(vlan20Devs, COL.v20, 20, 'vlan-header-20', '#8B5CF6');
    addDeviceNodes(vlan30Devs, COL.v30, 30, 'vlan-header-30', '#06B6D4');

    setNodes(initialNodes);
    setEdges(initialEdges);
  };

  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNodeInfo(node.data);
  }, []);

  const HIGHLIGHT_OPTS = [
    { id: 'ALL', label: 'All Segments', color: 'bg-slate-600' },
    { id: 10,    label: 'VLAN 10 — Students',       color: 'bg-blue-500' },
    { id: 20,    label: 'VLAN 20 — Faculty',         color: 'bg-purple-500' },
    { id: 30,    label: 'VLAN 30 — Administration',  color: 'bg-cyan-500' },
  ];

  return (
    <div className="p-4 md:p-8 space-y-5 max-w-[1700px] mx-auto">

      {/* ── 1. Page Header ─────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-2.5">
          <GitFork className="w-7 h-7 text-cyan-400 shrink-0" />
          Interactive Network Topology
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1 font-medium">
          Cisco Packet Tracer reference topology — R1-ROUTER → S1-SWITCH (Fa0/1 Trunk) → VLAN 10 / 20 / 30 endpoints
        </p>
      </div>

      {/* ── 2. Legend + Highlight Controls Card ───────────────────────── */}
      <div className="rounded-2xl bg-slate-900/95 border border-slate-800 shadow-xl p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 font-sans border-r border-slate-700 pr-4 mr-1">
              Network Legend
            </span>
            <span className="flex items-center gap-2 text-slate-300">
              <span className="w-3 h-3 rounded-full bg-indigo-500 shrink-0" />
              R1-ROUTER · Cisco 2911
            </span>
            <span className="flex items-center gap-2 text-slate-300">
              <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
              VLAN 10 — STUDENTS (192.168.10.0/24)
            </span>
            <span className="flex items-center gap-2 text-slate-300">
              <span className="w-3 h-3 rounded-full bg-purple-500 shrink-0" />
              VLAN 20 — FACULTY (192.168.20.0/24)
            </span>
            <span className="flex items-center gap-2 text-slate-300">
              <span className="w-3 h-3 rounded-full bg-cyan-500 shrink-0" />
              VLAN 30 — ADMINISTRATION (192.168.30.0/24)
            </span>
            <span className="flex items-center gap-2 text-slate-300">
              <span className="w-3 h-3 rounded-full bg-purple-400 animate-pulse shrink-0" />
              802.1Q Trunk: Fa0/1 ↔ G0/0
            </span>
          </div>

          {/* Highlight VLAN filter */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-semibold text-slate-400 font-sans whitespace-nowrap">Highlight:</span>
            <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              {HIGHLIGHT_OPTS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setHighlightVlan(opt.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-sans transition-all whitespace-nowrap ${
                    highlightVlan === opt.id
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Topology Canvas ─────────────────────────────────────────── */}
      <div className="h-[700px] rounded-2xl bg-slate-950/95 border border-slate-800 shadow-2xl relative overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.12 }}
          minZoom={0.3}
          maxZoom={2}
          attributionPosition="bottom-right"
        >
          <Background color="#1e293b" gap={30} size={1} />
          <Controls className="!bg-slate-900 !border-slate-700 !text-slate-300 rounded-xl shadow-xl !m-4" />
          <MiniMap
            nodeColor={(n) => {
              if (n.data.nodeType === 'ROUTER') return '#6366f1';
              if (n.data.nodeType === 'SWITCH') return '#3b82f6';
              if (n.data.vlanId === 10) return '#3b82f6';
              if (n.data.vlanId === 20) return '#8b5cf6';
              if (n.data.vlanId === 30) return '#06b6d4';
              return '#475569';
            }}
            className="!bg-slate-900/90 !border-slate-700 rounded-xl !m-4"
          />
        </ReactFlow>

        {/* Node Inspector Panel */}
        {selectedNodeInfo && (
          <div className="absolute top-4 right-4 w-80 rounded-2xl bg-slate-900/98 border border-slate-700 shadow-2xl p-5 backdrop-blur-xl z-20">
            {/* Inspector Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-3 mb-4 gap-3">
              <div className="min-w-0">
                <h3 className="font-extrabold text-slate-100 text-sm leading-tight">{selectedNodeInfo.label}</h3>
                <span className="text-[11px] text-cyan-400 font-mono block mt-0.5 truncate">
                  {selectedNodeInfo.subtext || selectedNodeInfo.nodeType || 'Node Details'}
                </span>
              </div>
              <button
                onClick={() => setSelectedNodeInfo(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Router Details */}
            {selectedNodeInfo.nodeType === 'ROUTER' && (
              <div className="space-y-2 text-xs font-mono">
                <InfoRow label="Device" value={selectedNodeInfo.details.deviceName} valueClass="text-slate-100 font-bold" />
                <InfoRow label="Model" value={selectedNodeInfo.details.model} valueClass="text-indigo-400 font-bold" />
                <InfoRow label="Interface" value={selectedNodeInfo.details.interface} valueClass="text-cyan-400 font-bold" />
                <InfoRow label="Protocol" value={selectedNodeInfo.details.protocol} valueClass="text-purple-400 font-bold" />
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 mb-2">Subinterfaces:</div>
                  {selectedNodeInfo.details.subinterfaces.map((s: string, i: number) => (
                    <div key={i} className="text-cyan-300 text-[11px] leading-relaxed">• {s}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Switch Details */}
            {selectedNodeInfo.nodeType === 'SWITCH' && (
              <div className="space-y-2 text-xs font-mono">
                <InfoRow label="Device" value={selectedNodeInfo.details.deviceName} valueClass="text-slate-100 font-bold" />
                <InfoRow label="Model" value={selectedNodeInfo.details.model} valueClass="text-blue-400 font-bold" />
                <InfoRow label="Trunk" value={selectedNodeInfo.details.trunkPort} valueClass="text-purple-400 font-bold" />
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 max-h-48 overflow-y-auto">
                  <div className="text-slate-400 mb-2">Port Mapping:</div>
                  {selectedNodeInfo.details.ports.map((p: any, i: number) => (
                    <div key={i} className="flex justify-between text-[11px] mb-1">
                      <span className="text-cyan-400 font-bold">{p.port}</span>
                      <span className="text-slate-300">{p.vlan}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PC Details */}
            {selectedNodeInfo.rawDevice && (
              <div className="space-y-2 text-xs font-mono">
                <InfoRow label="Name"     value={selectedNodeInfo.rawDevice.name}        valueClass="text-slate-100 font-bold" />
                <InfoRow label="IP"       value={selectedNodeInfo.rawDevice.ipAddress}   valueClass="text-cyan-400 font-bold" />
                <InfoRow label="MAC"      value={selectedNodeInfo.rawDevice.macAddress}  valueClass="text-slate-300" />
                <InfoRow label="VLAN"     value={`VLAN ${selectedNodeInfo.rawDevice.vlanId}`} valueClass="text-purple-400 font-bold" />
                <InfoRow label="Gateway"  value={selectedNodeInfo.rawDevice.gateway}     valueClass="text-slate-300" />
                <InfoRow label="Switch"   value="S1-SWITCH"                              valueClass="text-blue-400 font-bold" />
                <InfoRow label="Port"     value={selectedNodeInfo.rawDevice.switchPort}  valueClass="text-amber-400 font-bold" />
                <InfoRow
                  label="Status"
                  value={`● ${selectedNodeInfo.rawDevice.status}`}
                  valueClass={selectedNodeInfo.rawDevice.status === 'Online' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}
                />
                <button
                  onClick={() => navigate('/connectivity')}
                  className="w-full mt-2 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 font-sans transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Run Diagnostic Test
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 4. Footer Summary Row ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: <Cpu className="w-4 h-4 text-indigo-400" />, label: 'Router', value: 'R1-ROUTER · Cisco 2911' },
          { icon: <Network className="w-4 h-4 text-blue-400" />, label: 'Switch', value: 'S1-SWITCH · Cisco 2960-24TT' },
          { icon: <Layers className="w-4 h-4 text-cyan-400" />, label: 'VLANs Active', value: '3 Segments (10, 20, 30)' },
          { icon: <Monitor className="w-4 h-4 text-emerald-400" />, label: 'Endpoint PCs', value: '6 Devices (Fa0/2–Fa0/7)' },
        ].map((item, i) => (
          <div key={i} className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 shrink-0">{item.icon}</div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{item.label}</div>
              <div className="text-xs font-bold text-slate-200 font-mono mt-0.5 truncate">{item.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Tiny helper component for inspector rows ────────────────────────────────
const InfoRow = ({
  label,
  value,
  valueClass = 'text-slate-200',
}: {
  label: string;
  value: string;
  valueClass?: string;
}) => (
  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between gap-2 items-center">
    <span className="text-slate-400 shrink-0">{label}:</span>
    <span className={`${valueClass} text-right truncate`}>{value}</span>
  </div>
);
