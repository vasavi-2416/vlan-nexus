import React, { useState, useEffect } from 'react';
import { Network, Plus, Search, Filter, Edit, Trash2, Eye, Server, Shield, CheckCircle } from 'lucide-react';
import { StorageService } from '../services/storage';
import { Vlan } from '../types';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { ToastContainer, ToastMessage } from '../components/common/Toast';
import { Badge } from '../components/common/Badge';

export const VlanManagement: React.FC = () => {
  const [vlans, setVlans] = useState<Vlan[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Active' | 'Inactive'>('ALL');

  // Modals & Dialogs
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVlan, setEditingVlan] = useState<Vlan | null>(null);
  const [viewingVlan, setViewingVlan] = useState<Vlan | null>(null);
  const [deletingVlanId, setDeletingVlanId] = useState<number | null>(null);

  // Form fields
  const [formData, setFormData] = useState({
    id: 40,
    name: '',
    network: '',
    subnetMask: '255.255.255.0',
    gateway: '',
    description: '',
    color: '#3B82F6',
  });
  const [formError, setFormError] = useState('');

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    loadVlans();
  }, []);

  const loadVlans = () => {
    setVlans(StorageService.getVlans());
  };

  const addToast = (title: string, message?: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleOpenAdd = () => {
    const nextId = Math.max(...vlans.map((v) => v.id), 0) + 10;
    setFormData({
      id: nextId,
      name: '',
      network: `192.168.${nextId}.0/24`,
      subnetMask: '255.255.255.0',
      gateway: `192.168.${nextId}.1`,
      description: '',
      color: '#06B6D4',
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (vlan: Vlan) => {
    setEditingVlan(vlan);
    setFormData({
      id: vlan.id,
      name: vlan.name,
      network: vlan.network,
      subnetMask: vlan.subnetMask,
      gateway: vlan.gateway,
      description: vlan.description,
      color: vlan.color,
    });
    setFormError('');
  };

  const handleSaveVlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('VLAN Name is required');
      return;
    }
    if (!formData.network.trim() || !formData.gateway.trim()) {
      setFormError('Network CIDR and Gateway are required');
      return;
    }

    if (editingVlan) {
      StorageService.updateVlan({
        ...editingVlan,
        name: formData.name,
        network: formData.network,
        subnetMask: formData.subnetMask,
        gateway: formData.gateway,
        description: formData.description,
        color: formData.color,
      });
      addToast('VLAN Updated', `Successfully updated VLAN ${editingVlan.id}`);
      setEditingVlan(null);
    } else {
      // Check duplicate ID
      if (vlans.some((v) => v.id === Number(formData.id))) {
        setFormError(`VLAN ID ${formData.id} already exists`);
        return;
      }
      StorageService.addVlan({
        id: Number(formData.id),
        name: formData.name,
        network: formData.network,
        subnetMask: formData.subnetMask,
        gateway: formData.gateway,
        description: formData.description || 'Custom network segment',
        color: formData.color,
        totalCapacity: 254,
        status: 'Active',
      });
      addToast('VLAN Created', `Created new segment VLAN ${formData.id} (${formData.name})`);
      setIsAddModalOpen(false);
    }

    loadVlans();
  };

  const handleDeleteConfirm = () => {
    if (deletingVlanId !== null) {
      StorageService.deleteVlan(deletingVlanId);
      addToast('VLAN Deleted', `Removed VLAN ID ${deletingVlanId}`, 'warning');
      setDeletingVlanId(null);
      loadVlans();
    }
  };

  const filteredVlans = vlans.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.id.toString().includes(searchQuery) ||
      v.network.includes(searchQuery);
    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-[1600px] mx-auto">
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-2.5">
            <Network className="w-7 h-7 text-cyan-400" /> VLAN Management
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Configure and monitor logical network segments and subinterfaces.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" /> Add New VLAN
        </button>
      </div>

      {/* Controls Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search VLAN ID, name, subnet..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* VLAN Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="p-4">VLAN ID</th>
                <th className="p-4">Name</th>
                <th className="p-4">Network CIDR</th>
                <th className="p-4">Subnet Mask</th>
                <th className="p-4">Gateway IP</th>
                <th className="p-4">Active Devices</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredVlans.map((v) => (
                <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center space-x-2.5">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: v.color }}
                      />
                      <span className="font-mono font-bold text-slate-100 text-sm">
                        {v.id}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 font-bold text-slate-200">{v.name}</td>
                  <td className="p-4 font-mono text-cyan-400">{v.network}</td>
                  <td className="p-4 font-mono text-slate-400">{v.subnetMask}</td>
                  <td className="p-4 font-mono text-slate-200">{v.gateway}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 font-mono">
                      {v.activeDevicesCount} / {v.totalCapacity}
                    </span>
                  </td>
                  <td className="p-4">
                    <Badge variant={v.status === 'Active' ? 'success' : 'slate'}>
                      ● {v.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-right space-x-1">
                    <button
                      onClick={() => setViewingVlan(v)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(v)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800"
                      title="Edit VLAN"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingVlanId(v.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                      title="Delete VLAN"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredVlans.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No VLAN segments match your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit VLAN Modal */}
      <Modal
        isOpen={isAddModalOpen || editingVlan !== null}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingVlan(null);
        }}
        title={editingVlan ? `Edit VLAN ${editingVlan.id}` : 'Create New VLAN Segment'}
        subtitle="Configure 802.1Q VLAN parameters"
      >
        <form onSubmit={handleSaveVlan} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">VLAN ID</label>
              <input
                type="number"
                disabled={editingVlan !== null}
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-cyan-500"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">VLAN Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Students, Faculty, Guests"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-cyan-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Network (CIDR)</label>
              <input
                type="text"
                value={formData.network}
                onChange={(e) => setFormData({ ...formData, network: e.target.value })}
                placeholder="192.168.X.0/24"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-cyan-500"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Subnet Mask</label>
              <input
                type="text"
                value={formData.subnetMask}
                onChange={(e) => setFormData({ ...formData, subnetMask: e.target.value })}
                placeholder="255.255.255.0"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-cyan-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Default Gateway IP</label>
            <input
              type="text"
              value={formData.gateway}
              onChange={(e) => setFormData({ ...formData, gateway: e.target.value })}
              placeholder="192.168.X.1"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Operational details for this segment..."
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-cyan-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingVlan(null);
              }}
              className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold uppercase tracking-wider"
            >
              Save VLAN
            </button>
          </div>
        </form>
      </Modal>

      {/* View Detail Modal */}
      <Modal
        isOpen={viewingVlan !== null}
        onClose={() => setViewingVlan(null)}
        title={viewingVlan ? `VLAN ${viewingVlan.id} — ${viewingVlan.name}` : ''}
        subtitle="Network Segment Inspection"
      >
        {viewingVlan && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Gateway:</span>
                <span className="text-cyan-400 font-bold">{viewingVlan.gateway}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Network:</span>
                <span className="text-slate-200">{viewingVlan.network}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Subnet Mask:</span>
                <span className="text-slate-200">{viewingVlan.subnetMask}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Router Subinterface:</span>
                <span className="text-indigo-400 font-bold">G0/0.{viewingVlan.id}</span>
              </div>
            </div>
            <p className="text-slate-300">{viewingVlan.description}</p>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deletingVlanId !== null}
        onClose={() => setDeletingVlanId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete VLAN Segment"
        message={`Are you sure you want to delete VLAN ${deletingVlanId}? Devices assigned to this VLAN will lose routing configuration.`}
      />
    </div>
  );
};
