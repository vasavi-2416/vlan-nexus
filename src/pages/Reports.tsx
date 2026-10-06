import React, { useState } from 'react';
import { PieChart, Download, Printer, Eye, FileSpreadsheet, CheckCircle2, Shield, Network, HardDrive, Radio, Activity } from 'lucide-react';
import { StorageService } from '../services/storage';
import { Modal } from '../components/common/Modal';

export const Reports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const reportsList = [
    {
      id: 'vlan-summary',
      title: 'VLAN Summary Report',
      description: 'Comprehensive report on configured logical VLAN segments, subnet allocations, and gateway IP configurations.',
      icon: Network,
      color: 'text-blue-400 bg-blue-950 border-blue-800',
    },
    {
      id: 'device-inventory',
      title: 'Device Inventory Report',
      description: 'Detailed list of 6 Packet Tracer endpoint PCs, MAC addresses, switch port assignments, and online status.',
      icon: HardDrive,
      color: 'text-indigo-400 bg-indigo-950 border-indigo-800',
    },
    {
      id: 'routing-report',
      title: 'Routing & Subinterface Report',
      description: 'Router-on-a-Stick subinterfaces (G0/0.10, G0/0.20, G0/0.30) and 802.1Q encapsulation metrics.',
      icon: Radio,
      color: 'text-purple-400 bg-purple-950 border-purple-800',
    },
    {
      id: 'connectivity-report',
      title: 'Connectivity Diagnostic Report',
      description: 'ICMP ping test history, latency averages, and Inter-VLAN packet loss percentages.',
      icon: Activity,
      color: 'text-cyan-400 bg-cyan-950 border-cyan-800',
    },
    {
      id: 'security-report',
      title: 'Security & ACL Policy Report',
      description: 'Firewall rules, permit/deny policies, and blocked cross-VLAN traffic attempt audit.',
      icon: Shield,
      color: 'text-emerald-400 bg-emerald-950 border-emerald-800',
    },
    {
      id: 'health-report',
      title: 'Network Health Audit Report',
      description: 'Overall system health 98.6%, throughput, and operational status overview.',
      icon: CheckCircle2,
      color: 'text-amber-400 bg-amber-950 border-amber-800',
    },
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadReportCSV = (reportId: string) => {
    let dataStr = '';
    if (reportId === 'vlan-summary') {
      const vlans = StorageService.getVlans();
      dataStr = 'VLAN ID,Name,Network,Gateway,Status\n' + vlans.map((v) => `${v.id},${v.name},${v.network},${v.gateway},${v.status}`).join('\n');
    } else {
      const devices = StorageService.getDevices();
      dataStr = 'Name,Type,IP,MAC,VLAN,Port,Status\n' + devices.map((d) => `${d.name},${d.type},${d.ipAddress},${d.macAddress},${d.vlanId},${d.switchPort},${d.status}`).join('\n');
    }

    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + dataStr);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${reportId}_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-2.5">
            <PieChart className="w-7 h-7 text-cyan-400" /> Enterprise Report Center
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Generate, preview, and download formal network operational reports.
          </p>
        </div>
      </div>

      {/* Grid of Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportsList.map((rep) => {
          const Icon = rep.icon;
          return (
            <div
              key={rep.id}
              className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all space-y-4"
            >
              <div className="space-y-3">
                <div className={`p-3 rounded-2xl border ${rep.color} w-fit`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-100">{rep.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{rep.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedReport(rep.id)}
                  className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-cyan-400 flex items-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> Preview
                </button>
                <button
                  onClick={() => handleDownloadReportCSV(rep.id)}
                  className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> CSV
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Report Preview Modal */}
      <Modal
        isOpen={selectedReport !== null}
        onClose={() => setSelectedReport(null)}
        title="VLAN NEXUS Official Network Report"
        subtitle="Formal Computer Networks Project Documentation"
        maxWidth="2xl"
      >
        <div className="space-y-4 text-xs font-sans">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between items-center">
            <div>
              <div className="font-bold text-sm text-cyan-400">VLAN NEXUS Management System</div>
              <div className="text-[11px] text-slate-400">Report ID: RPT-2026-VLAN</div>
            </div>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" /> Print Document
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="font-bold text-slate-100 text-xs uppercase tracking-wider">Executive Report Summary</h4>
            <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
              <div className="p-2 rounded bg-slate-900">Total Segments: 3 VLANs</div>
              <div className="p-2 rounded bg-slate-900">Total Hosts: 26 Devices</div>
              <div className="p-2 rounded bg-slate-900">Routing Status: Optimal</div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
