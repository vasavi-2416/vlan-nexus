import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Network, HardDrive, Lock, Shield, ArrowRight, X } from 'lucide-react';
import { StorageService } from '../../services/storage';
import { Device, Vlan, AclRule } from '../../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [vlans, setVlans] = useState<Vlan[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [aclRules, setAclRules] = useState<AclRule[]>([]);

  useEffect(() => {
    if (isOpen) {
      setVlans(StorageService.getVlans());
      setDevices(StorageService.getDevices());
      setAclRules(StorageService.getAclRules());
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open triggered from shortcut
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredVlans = vlans.filter(
    (v) =>
      v.name.toLowerCase().includes(query.toLowerCase()) ||
      v.id.toString().includes(query) ||
      v.network.includes(query)
  );

  const filteredDevices = devices.filter(
    (d) =>
      d.name.toLowerCase().includes(query.toLowerCase()) ||
      d.ipAddress.includes(query) ||
      d.macAddress.toLowerCase().includes(query.toLowerCase())
  );

  const filteredAcl = aclRules.filter(
    (r) =>
      r.id.toLowerCase().includes(query.toLowerCase()) ||
      r.description.toLowerCase().includes(query.toLowerCase())
  );

  const handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-20 px-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, device IP, VLAN name, or page..."
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="p-4 overflow-y-auto space-y-4 max-h-96">
          {/* Quick Pages */}
          {!query && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Quick Navigation
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { title: 'Dashboard', path: '/dashboard' },
                  { title: 'VLAN Management', path: '/vlans' },
                  { title: 'Device Management', path: '/devices' },
                  { title: 'Network Topology', path: '/topology' },
                  { title: 'Inter-VLAN Routing', path: '/routing' },
                  { title: 'Connectivity Test', path: '/connectivity' },
                  { title: 'ACL & Security', path: '/security' },
                  { title: 'Audit Logs', path: '/logs' },
                ].map((p) => (
                  <button
                    key={p.path}
                    onClick={() => handleNavigate(p.path)}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 text-xs text-slate-200 text-left transition-colors"
                  >
                    <span>{p.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* VLAN Results */}
          {filteredVlans.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Network className="w-3.5 h-3.5 text-cyan-400" /> VLAN Segments ({filteredVlans.length})
              </div>
              <div className="space-y-1">
                {filteredVlans.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => handleNavigate('/vlans')}
                    className="w-full p-2.5 rounded-xl bg-slate-800/30 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-xs text-left transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: v.color }}
                      />
                      <span className="font-semibold text-slate-200">
                        VLAN {v.id} - {v.name}
                      </span>
                    </div>
                    <span className="font-mono text-slate-400 text-[11px]">{v.network}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Device Results */}
          {filteredDevices.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-blue-400" /> Devices ({filteredDevices.length})
              </div>
              <div className="space-y-1">
                {filteredDevices.slice(0, 6).map((d) => (
                  <button
                    key={d.id}
                    onClick={() => handleNavigate('/devices')}
                    className="w-full p-2.5 rounded-xl bg-slate-800/30 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-xs text-left transition-colors"
                  >
                    <div>
                      <div className="font-medium text-slate-200">{d.name}</div>
                      <div className="text-[11px] text-slate-400">
                        Port {d.switchPort} • VLAN {d.vlanId}
                      </div>
                    </div>
                    <span className="font-mono text-cyan-400 bg-slate-900 px-2 py-1 rounded border border-slate-700">
                      {d.ipAddress}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ACL Results */}
          {filteredAcl.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-purple-400" /> Security ACL Rules ({filteredAcl.length})
              </div>
              <div className="space-y-1">
                {filteredAcl.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleNavigate('/security')}
                    className="w-full p-2.5 rounded-xl bg-slate-800/30 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-xs text-left transition-colors"
                  >
                    <div>
                      <span className="font-bold text-slate-200 mr-2">{r.id}</span>
                      <span className="text-slate-400">{r.description}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.action === 'ALLOW' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                      }`}
                    >
                      {r.action}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 text-slate-500 text-[11px] flex justify-between">
          <span>Navigate with mouse or click items</span>
          <span>Press <kbd className="px-1 bg-slate-800 text-slate-400 rounded">ESC</kbd> to close</span>
        </div>
      </div>
    </div>
  );
};
