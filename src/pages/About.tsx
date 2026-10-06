import React from 'react';
import { Info, Shield, Radio, GitFork, Network, Server, BookOpen, CheckCircle2 } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="p-4 md:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-2.5">
            <Info className="w-7 h-7 text-cyan-400" /> Academic Purpose & Project Context
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Computer Networks Project — VLAN-Based Network Segmentation with Inter-VLAN Routing.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Project Title & Objective Card */}
        <div className="lg:col-span-12 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-cyan-950 text-cyan-400 border border-cyan-800">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                Project Title: VLAN-Based Network Segmentation with Inter-VLAN Routing
              </h2>
              <p className="text-xs text-cyan-400 font-mono">Academic Network Architecture Capstone</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <strong className="text-slate-100 block mb-1">Core Project Objective:</strong>
            To divide a physical enterprise network into multiple logical VLANs and enable secure communication between different VLAN segments through Router-on-a-Stick Inter-VLAN Routing while providing a centralized commercial-grade NOC visualization and management interface.
          </div>
        </div>

        {/* Core Technology Concepts */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Network className="w-4 h-4 text-purple-400" /> Fundamental Networking Concepts
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            {[
              { title: 'VLAN', desc: 'Virtual Local Area Network logical broadcast isolation' },
              { title: 'LAN Segmentation', desc: 'Dividing network into secure functional zones' },
              { title: '802.1Q Trunking', desc: 'Standardized IEEE VLAN frame tagging protocol' },
              { title: 'IPv4 Addressing', desc: 'Class C subnet assignment (/24 prefix length)' },
              { title: 'Router-on-a-Stick', desc: 'Single trunk physical link with subinterfaces' },
              { title: 'Inter-VLAN Routing', desc: 'Layer 3 packet forwarding between subnets' },
              { title: 'Access Control Lists', desc: 'Packet filtering firewall rules (ALLOW / DENY)' },
              { title: 'Network Diagnostics', desc: 'ICMP echo request/reply connectivity testing' },
            ].map((c) => (
              <div key={c.title} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <div className="font-bold text-cyan-400 font-mono mb-0.5">{c.title}</div>
                <div className="text-[11px] text-slate-400 leading-tight">{c.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Cisco Packet Tracer Implementation Details */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Server className="w-4 h-4 text-indigo-400" /> Cisco Packet Tracer Reference Topology
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono space-y-1.5">
              <div className="text-cyan-400 font-bold">Physical Hardware Stack:</div>
              <div className="text-slate-300">● 1x Cisco 2911 ISR Router (Inter-VLAN Gateway)</div>
              <div className="text-slate-300">● 1x Cisco Catalyst 3560 Core Switch</div>
              <div className="text-slate-300">● Endpoint Workstation PCs (Students, Faculty, Admin)</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono space-y-1 text-[11px]">
              <div className="text-purple-400 font-bold mb-1">Configured Logical VLANs:</div>
              <div className="flex justify-between">
                <span>VLAN 10 — Students:</span>
                <span className="text-slate-300">192.168.10.0/24 (Gateway: 192.168.10.1)</span>
              </div>
              <div className="flex justify-between">
                <span>VLAN 20 — Faculty:</span>
                <span className="text-slate-300">192.168.20.0/24 (Gateway: 192.168.20.1)</span>
              </div>
              <div className="flex justify-between">
                <span>VLAN 30 — Administration:</span>
                <span className="text-slate-300">192.168.30.0/24 (Gateway: 192.168.30.1)</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-1">
              <div className="text-emerald-400 font-bold">Router Subinterface Configuration:</div>
              <div>interface GigabitEthernet0/0.10</div>
              <div className="text-slate-400 pl-3">encapsulation dot1Q 10</div>
              <div className="text-slate-400 pl-3">ip address 192.168.10.1 255.255.255.0</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
