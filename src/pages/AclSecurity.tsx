import React, { useState, useEffect } from 'react';
import {
  Lock,
  Plus,
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Edit,
  Trash2,
  RefreshCw,
  Search,
} from 'lucide-react';
import { StorageService } from '../services/storage';
import { AclRule, Vlan } from '../types';
import { ToastContainer, ToastMessage } from '../components/common/Toast';

export const AclSecurity: React.FC = () => {
  const [rules, setRules] = useState<AclRule[]>([]);
  const [vlans, setVlans] = useState<Vlan[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRule, setEditingRule] = useState<AclRule | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    sourceVlanId: '10' as any,
    destinationVlanId: '30' as any,
    protocol: 'IP',
    port: 'Any',
    action: 'DENY' as 'ALLOW' | 'DENY',
    enabled: true,
    description: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setRules(StorageService.getAclRules());
    setVlans(StorageService.getVlans());
  };

  const addToast = (title: string, message?: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleOpenAddModal = () => {
    setEditingRule(null);
    setFormData({
      sourceVlanId: '10',
      destinationVlanId: '30',
      protocol: 'IP',
      port: 'Any',
      action: 'DENY',
      enabled: true,
      description: 'Block Students from Administration',
    });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (rule: AclRule) => {
    setEditingRule(rule);
    setFormData({
      sourceVlanId: rule.sourceVlanId,
      destinationVlanId: rule.destinationVlanId,
      protocol: rule.protocol,
      port: rule.port,
      action: rule.action,
      enabled: rule.enabled,
      description: rule.description,
    });
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingRule) {
      const updated: AclRule = {
        ...editingRule,
        ...formData,
        protocol: formData.protocol as any,
      };
      StorageService.updateAclRule(updated);
      addToast('ACL Policy Saved', `Updated policy rule ${updated.id}`);
    } else {
      StorageService.addAclRule({
        ...formData,
        protocol: formData.protocol as any,
      });
      addToast('ACL Rule Created', `Created new ${formData.action} policy`);
    }

    setShowAddModal(false);
    loadData();
  };

  const handleDelete = (id: string) => {
    if (window.confirm(`Are you sure you want to delete policy ${id}?`)) {
      StorageService.deleteAclRule(id);
      addToast('Rule Deleted', `Removed policy ${id}`, 'warning');
      loadData();
    }
  };

  const handleToggleRule = (rule: AclRule) => {
    const updated: AclRule = { ...rule, enabled: !rule.enabled };
    StorageService.updateAclRule(updated);
    addToast('Rule Toggled', `${rule.id} is now ${updated.enabled ? 'Enabled' : 'Disabled'}`, 'info');
    loadData();
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-[1600px] mx-auto">
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-2.5">
            <Lock className="w-7 h-7 text-cyan-400" /> ACL Security & Firewall Segmentation Rules
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Router-on-a-Stick Access Control List (ACL) policies governing Inter-VLAN communication.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create ACL Rule
        </button>
      </div>

      {/* ACL Rules Table */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Rule ID</th>
                <th className="px-6 py-4">Source Segment</th>
                <th className="px-6 py-4">Destination Segment</th>
                <th className="px-6 py-4">Protocol / Port</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Policy Description</th>
                <th className="px-6 py-4">Hit Count</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 font-bold text-cyan-400 font-sans">{rule.id}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-bold">
                      {rule.sourceVlanId === 'ALL' ? 'ALL VLANs' : `VLAN ${rule.sourceVlanId}`}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-bold">
                      {rule.destinationVlanId === 'ALL' ? 'ALL VLANs' : `VLAN ${rule.destinationVlanId}`}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {rule.protocol} ({rule.port})
                  </td>
                  <td className="px-6 py-4 font-sans">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                        rule.action === 'ALLOW'
                          ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                          : 'bg-rose-950/80 text-rose-400 border-rose-800'
                      }`}
                    >
                      {rule.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-sans text-slate-200">{rule.description}</td>
                  <td className="px-6 py-4 text-slate-400 font-bold">{rule.hitCount} Hits</td>
                  <td className="px-6 py-4 font-sans">
                    <button
                      onClick={() => handleToggleRule(rule)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                        rule.enabled
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-slate-950 text-slate-500 border border-slate-800'
                      }`}
                    >
                      {rule.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEditModal(rule)}
                      className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white"
                      title="Edit Policy"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(rule.id)}
                      className="p-2 rounded-xl bg-slate-950 hover:bg-rose-950 text-slate-400 hover:text-rose-400"
                      title="Delete Policy"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100 border-b border-slate-800 pb-3">
              {editingRule ? `Edit ACL Policy (${editingRule.id})` : 'Create New ACL Security Rule'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Source VLAN</label>
                  <select
                    value={formData.sourceVlanId}
                    onChange={(e) => setFormData({ ...formData, sourceVlanId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-cyan-500"
                  >
                    <option value="10">VLAN 10 (STUDENTS)</option>
                    <option value="20">VLAN 20 (FACULTY)</option>
                    <option value="30">VLAN 30 (ADMINISTRATION)</option>
                    <option value="ALL">ALL VLANs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Destination VLAN</label>
                  <select
                    value={formData.destinationVlanId}
                    onChange={(e) => setFormData({ ...formData, destinationVlanId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-cyan-500"
                  >
                    <option value="10">VLAN 10 (STUDENTS)</option>
                    <option value="20">VLAN 20 (FACULTY)</option>
                    <option value="30">VLAN 30 (ADMINISTRATION)</option>
                    <option value="ALL">ALL VLANs</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Action</label>
                  <select
                    value={formData.action}
                    onChange={(e) => setFormData({ ...formData, action: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-cyan-500 font-bold"
                  >
                    <option value="ALLOW">ALLOW</option>
                    <option value="DENY">DENY</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Protocol</label>
                  <select
                    value={formData.protocol}
                    onChange={(e) => setFormData({ ...formData, protocol: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-cyan-500"
                  >
                    <option value="IP">IP</option>
                    <option value="ICMP">ICMP</option>
                    <option value="TCP">TCP</option>
                    <option value="UDP">UDP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Policy Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Block Students from Administration"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold uppercase tracking-wider text-[10px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold uppercase tracking-wider text-[10px] shadow-lg shadow-cyan-500/20"
                >
                  {editingRule ? 'Save Rule' : 'Create Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
