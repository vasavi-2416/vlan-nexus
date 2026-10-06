import React, { useState, useEffect } from 'react';
import { FileText, Search, Filter, Download, Activity, CheckCircle2, AlertTriangle, AlertCircle, Info as InfoIcon } from 'lucide-react';
import { StorageService } from '../services/storage';
import { ActivityLog } from '../types';
import { Badge } from '../components/common/Badge';

export const NetworkLogs: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'success' | 'info' | 'warning' | 'error'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'VLAN' | 'DEVICE' | 'ROUTING' | 'ACL' | 'SYSTEM'>('ALL');

  useEffect(() => {
    setLogs(StorageService.getLogs());
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.sourceIp && log.sourceIp.includes(searchQuery)) ||
      (log.destIp && log.destIp.includes(searchQuery));
    const matchesSeverity = severityFilter === 'ALL' || log.severity === severityFilter;
    const matchesCategory = categoryFilter === 'ALL' || log.category === categoryFilter;
    return matchesSearch && matchesSeverity && matchesCategory;
  });

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Category', 'Event', 'Details', 'Source IP', 'Destination IP', 'VLAN', 'Severity'];
    const rows = filteredLogs.map((l) => [
      l.timestamp,
      l.category,
      `"${l.event}"`,
      `"${l.details}"`,
      l.sourceIp || '',
      l.destIp || '',
      l.vlanId || '',
      l.severity,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vlan_nexus_audit_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSeverityBadge = (sev: ActivityLog['severity']) => {
    switch (sev) {
      case 'success':
        return <Badge variant="success">● SUCCESS</Badge>;
      case 'error':
        return <Badge variant="error">● ERROR</Badge>;
      case 'warning':
        return <Badge variant="warning">● WARNING</Badge>;
      default:
        return <Badge variant="info">● INFO</Badge>;
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-cyan-400" /> Network Audit Logs
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Real-time security and operational event logs across all logical VLAN segments.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all"
        >
          <Download className="w-4 h-4 text-cyan-400" /> Export CSV Log Report
        </button>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events, IP, details..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" /> Filter Category:
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="ROUTING">Routing</option>
            <option value="ACL">ACL Security</option>
            <option value="VLAN">VLAN</option>
            <option value="DEVICE">Device</option>
            <option value="SYSTEM">System</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="success">Success Only</option>
            <option value="info">Info Only</option>
            <option value="warning">Warning Only</option>
            <option value="error">Error / Blocked Only</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="p-4">Timestamp</th>
                <th className="p-4">Category</th>
                <th className="p-4">Event Type</th>
                <th className="p-4">Details</th>
                <th className="p-4">Source IP</th>
                <th className="p-4">Destination IP</th>
                <th className="p-4">VLAN</th>
                <th className="p-4">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-mono text-slate-400">{log.timestamp}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded bg-slate-950 text-cyan-400 font-mono text-[10px] border border-slate-800">
                      {log.category}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-slate-200">{log.event}</td>
                  <td className="p-4 text-slate-300 max-w-md">{log.details}</td>
                  <td className="p-4 font-mono text-slate-300">{log.sourceIp || '—'}</td>
                  <td className="p-4 font-mono text-slate-300">{log.destIp || '—'}</td>
                  <td className="p-4 font-mono font-bold text-purple-400">
                    {log.vlanId ? `VLAN ${log.vlanId}` : '—'}
                  </td>
                  <td className="p-4">{getSeverityBadge(log.severity)}</td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No log records match your filter parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
