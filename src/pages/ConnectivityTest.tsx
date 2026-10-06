import React, { useState, useEffect } from 'react';
import {
  Activity,
  Zap,
  Play,
  CheckCircle2,
  AlertTriangle,
  Radio,
  GitFork,
  Server,
  ArrowRight,
  RefreshCw,
  Layers,
  History,
} from 'lucide-react';
import { StorageService } from '../services/storage';
import { NetworkSimulator } from '../services/networkSimulator';
import { Device, ConnectivityTestResult } from '../types';
import { ToastContainer, ToastMessage } from '../components/common/Toast';

export const ConnectivityTest: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [sourceId, setSourceId] = useState<string>('dev-101'); // Student-PC1
  const [destinationId, setDestinationId] = useState<string>('dev-201'); // Faculty-PC1
  const [protocol, setProtocol] = useState<string>('ICMP');
  const [packetSize, setPacketSize] = useState<number>(64);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [currentResult, setCurrentResult] = useState<ConnectivityTestResult | null>(null);
  const [history, setHistory] = useState<ConnectivityTestResult[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const devs = StorageService.getDevices();
    setDevices(devs);
    if (devs.length >= 2) {
      setSourceId(devs[0].id);
      setDestinationId(devs[2] ? devs[2].id : devs[1].id);
    }
    setHistory(StorageService.getConnectivityHistory());
  };

  const addToast = (title: string, message?: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleExecutePing = () => {
    if (sourceId === destinationId) {
      addToast('Invalid Test', 'Source and Destination devices must be different', 'warning');
      return;
    }

    setIsExecuting(true);
    setCurrentResult(null);

    setTimeout(() => {
      try {
        const result = NetworkSimulator.runPingTest(sourceId, destinationId, protocol, packetSize);
        setCurrentResult(result);
        setHistory(StorageService.getConnectivityHistory());

        if (result.status === 'SUCCESS') {
          addToast('ICMP Echo Success', `Ping ${result.destinationDeviceName} (${result.destinationIp}): 0% loss, ${result.latencyMs}ms`);
        } else if (result.status === 'BLOCKED') {
          addToast('Packet Blocked by ACL', result.failureReason || 'Blocked by firewall policy', 'error');
        } else {
          addToast('Ping Test Failed', result.failureReason || 'Host unreachable', 'error');
        }
      } catch (err: any) {
        addToast('Execution Error', err.message || 'Failed to execute test', 'error');
      } finally {
        setIsExecuting(false);
      }
    }, 800);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-[1600px] mx-auto">
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-2.5">
            <Activity className="w-7 h-7 text-cyan-400" /> Connectivity Test & Diagnostic Tool
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Simulated ICMP Echo diagnostic suite testing 802.1Q inter-VLAN routing and ACL policy enforcement.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Test Setup Form */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Zap className="w-4 h-4 text-cyan-400" /> Configure Ping Diagnostic Test
          </h3>

          <div className="space-y-4 text-xs">
            {/* Source Host Select */}
            <div>
              <label className="block text-slate-300 font-bold mb-1.5">Source Device (Origin)</label>
              <select
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:border-cyan-500 font-semibold"
              >
                {devices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.ipAddress}) — VLAN {d.vlanId} [{d.switchPort}]
                  </option>
                ))}
              </select>
            </div>

            {/* Destination Host Select */}
            <div>
              <label className="block text-slate-300 font-bold mb-1.5">Destination Device (Target)</label>
              <select
                value={destinationId}
                onChange={(e) => setDestinationId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:border-cyan-500 font-semibold"
              >
                {devices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.ipAddress}) — VLAN {d.vlanId} [{d.switchPort}]
                  </option>
                ))}
              </select>
            </div>

            {/* Protocol & Packet Size */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Protocol</label>
                <select
                  value={protocol}
                  onChange={(e) => setProtocol(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:border-cyan-500"
                >
                  <option value="ICMP">ICMP Echo</option>
                  <option value="IP">IP Packet</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Packet Payload Size</label>
                <select
                  value={packetSize}
                  onChange={(e) => setPacketSize(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:border-cyan-500 font-mono"
                >
                  <option value={64}>64 Bytes</option>
                  <option value={128}>128 Bytes</option>
                  <option value={256}>256 Bytes</option>
                  <option value={512}>512 Bytes</option>
                  <option value={1024}>1024 Bytes</option>
                </select>
              </div>
            </div>

            {/* Quick Scenario Preset Buttons */}
            <div className="pt-2">
              <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                Quick Test Scenarios:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const student = devices.find((d) => d.name === 'Student-PC1');
                    const faculty = devices.find((d) => d.name === 'Faculty-PC1');
                    if (student && faculty) {
                      setSourceId(student.id);
                      setDestinationId(faculty.id);
                    }
                  }}
                  className="p-2 rounded-xl bg-slate-950 border border-blue-800/60 hover:bg-blue-950/40 text-[10px] text-blue-300 font-semibold text-left"
                >
                  Student → Faculty (ALLOW)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const student = devices.find((d) => d.name === 'Student-PC1');
                    const admin = devices.find((d) => d.name === 'Admin-PC1');
                    if (student && admin) {
                      setSourceId(student.id);
                      setDestinationId(admin.id);
                    }
                  }}
                  className="p-2 rounded-xl bg-slate-950 border border-rose-800/60 hover:bg-rose-950/40 text-[10px] text-rose-300 font-semibold text-left"
                >
                  Student → Admin (ACL DENY)
                </button>
              </div>
            </div>

            <button
              onClick={handleExecutePing}
              disabled={isExecuting}
              className="w-full mt-4 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
              {isExecuting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isExecuting ? 'Executing Diagnostic...' : 'Execute Test Connection'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Diagnostic Output & Path Trace */}
        <div className="lg:col-span-7 space-y-6">
          {currentResult ? (
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2.5 rounded-xl ${
                      currentResult.status === 'SUCCESS'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : currentResult.status === 'BLOCKED'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}
                  >
                    {currentResult.status === 'SUCCESS' ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-100 text-sm">
                      Diagnostic Output: {currentResult.status}
                    </h3>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {currentResult.sourceDeviceName} ({currentResult.sourceIp}) → {currentResult.destinationDeviceName} ({currentResult.destinationIp})
                    </div>
                  </div>
                </div>

                <span className="text-xs font-mono text-slate-500">{currentResult.timestamp}</span>
              </div>

              {/* Status Banner */}
              {currentResult.status === 'BLOCKED' && (
                <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs font-mono space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-rose-400">
                    <AlertTriangle className="w-4 h-4" /> {currentResult.failureReason}
                  </div>
                  <div className="text-[11px] text-rose-300/80 leading-relaxed">
                    Access Control List policy evaluates this flow as DENY. Packet dropped at R1-ROUTER ingress subinterface G0/0.10.
                  </div>
                </div>
              )}

              {currentResult.status === 'SUCCESS' && (
                <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-xs font-mono space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" /> 4 ICMP Packets Transmitted, 4 Received (0% Packet Loss)
                  </div>
                  <div className="text-[11px] text-emerald-300/80">
                    Round-trip latency: {currentResult.latencyMs}ms | Route: {currentResult.isSameVlan ? 'Intra-VLAN L2 Switch' : 'Inter-VLAN 802.1Q Trunk Router-on-a-Stick'}
                  </div>
                </div>
              )}

              {/* Step-by-Step Path Trace */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                  Simulated Network Path Trace
                </h4>
                <div className="space-y-2">
                  {currentResult.pathSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs font-mono"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="w-5 h-5 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-cyan-400 font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-bold text-slate-200">{step.name}</span>
                          {step.ip && <span className="text-cyan-400 ml-2">({step.ip})</span>}
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400">{step.detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 rounded-3xl bg-slate-900/50 border border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-500 text-xs space-y-2">
              <Zap className="w-8 h-8 text-slate-700" />
              <span>Select source and destination hosts and click "Execute Test Connection"</span>
            </div>
          )}

          {/* Connectivity History Table */}
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden p-5 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" /> Recent Diagnostic Test History
            </h4>

            <div className="max-h-48 overflow-y-auto divide-y divide-slate-800/60 font-mono text-xs">
              {history.slice(0, 5).map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="text-slate-300 font-bold">{item.sourceDeviceName}</span>
                    <span className="text-slate-500 px-1 hover:text-slate-300">→</span>
                    <span className="text-slate-300 font-bold">{item.destinationDeviceName}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-[10px] text-slate-500">{item.timestamp}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        item.status === 'SUCCESS'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
