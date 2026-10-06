import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Wifi,
  WifiOff,
  Server,
  Activity,
  Layers,
  ArrowUpDown,
  RefreshCw,
} from 'lucide-react';
import { StorageService } from '../services/storage';
import { Device, Vlan } from '../types';
import { ToastContainer, ToastMessage } from '../components/common/Toast';

export const DeviceManagement: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [vlans, setVlans] = useState<Vlan[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [vlanFilter, setVlanFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    type: 'PC',
    ipAddress: '',
    macAddress: '',
    vlanId: 10,
    switchPort: 'Fa0/8',
    gateway: '192.168.10.1',
    status: 'Online' as 'Online' | 'Offline',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const fetchedDevices = StorageService.getDevices();
    const fetchedVlans = StorageService.getVlans();
    setDevices(fetchedDevices);
    setVlans(fetchedVlans);
  };

  const addToast = (title: string, message?: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleOpenAddModal = () => {
    setEditingDevice(null);
    setFormData({
      name: '',
      type: 'PC',
      ipAddress: '192.168.10.12',
      macAddress: '00:50:79:' + Math.floor(Math.random() * 89 + 10) + ':68:' + Math.floor(Math.random() * 89 + 10),
      vlanId: 10,
      switchPort: 'Fa0/8',
      gateway: '192.168.10.1',
      status: 'Online',
    });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (dev: Device) => {
    setEditingDevice(dev);
    setFormData({
      name: dev.name,
      type: dev.type,
      ipAddress: dev.ipAddress,
      macAddress: dev.macAddress,
      vlanId: dev.vlanId,
      switchPort: dev.switchPort,
      gateway: dev.gateway,
      status: dev.status,
    });
    setShowAddModal(true);
  };

  const handleVlanChangeInForm = (vlanIdNum: number) => {
    const selectedVlan = vlans.find((v) => v.id === vlanIdNum);
    const gateway = selectedVlan ? selectedVlan.gateway : `192.168.${vlanIdNum}.1`;
    setFormData((prev) => ({
      ...prev,
      vlanId: vlanIdNum,
      gateway,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.ipAddress || !formData.switchPort) {
      addToast('Validation Error', 'Please fill all required fields', 'error');
      return;
    }

    if (editingDevice) {
      const updated: Device = {
        ...editingDevice,
        ...formData,
        type: formData.type as any,
      };
      StorageService.updateDevice(updated);
      addToast('Device Updated', `Updated settings for ${updated.name}`);
    } else {
      StorageService.addDevice({
        ...formData,
        type: formData.type as any,
      });
      addToast('Device Registered', `Registered ${formData.name} on switch port ${formData.switchPort}`);
    }

    setShowAddModal(false);
    loadData();
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to de-register device ${name}?`)) {
      StorageService.deleteDevice(id);
      addToast('Device Removed', `Removed ${name} from inventory`, 'warning');
      loadData();
    }
  };

  const handleToggleStatus = (dev: Device) => {
    const nextStatus = dev.status === 'Online' ? 'Offline' : 'Online';
    const updated: Device = { ...dev, status: nextStatus };
    StorageService.updateDevice(updated);
    addToast('Status Changed', `${dev.name} is now ${nextStatus}`, nextStatus === 'Online' ? 'success' : 'warning');
    loadData();
  };

  // Filtering
  const filteredDevices = devices.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.ipAddress.includes(searchTerm) ||
      d.macAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.switchPort.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesVlan = vlanFilter === 'ALL' || d.vlanId === Number(vlanFilter);
    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;

    return matchesSearch && matchesVlan && matchesStatus;
  });

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-[1600px] mx-auto">
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-2.5">
            <HardDrive className="w-7 h-7 text-cyan-400" /> Device Management & Endpoint Inventory
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Authoritative inventory of the 6 Cisco Packet Tracer PCs across VLAN 10 (Students), VLAN 20 (Faculty), and VLAN 30 (Administration).
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Register New Host
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search hostname, IP, MAC, port..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold text-slate-400">VLAN:</span>
            <select
              value={vlanFilter}
              onChange={(e) => setVlanFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none font-semibold"
            >
              <option value="ALL">All Segments</option>
              <option value="10">VLAN 10 - STUDENTS</option>
              <option value="20">VLAN 20 - FACULTY</option>
              <option value="30">VLAN 30 - ADMINISTRATION</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <span className="font-semibold text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none font-semibold"
            >
              <option value="ALL">All States</option>
              <option value="Online">Online Only</option>
              <option value="Offline">Offline Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Devices Inventory Table */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Device Hostname</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">IP Address</th>
                <th className="px-6 py-4">MAC Address</th>
                <th className="px-6 py-4">VLAN Assignment</th>
                <th className="px-6 py-4">Switch Port</th>
                <th className="px-6 py-4">Default Gateway</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredDevices.map((dev) => (
                <tr key={dev.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-100 font-sans flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                      <HardDrive className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <div>{dev.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{dev.id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400 font-sans">{dev.type}</td>
                  <td className="px-6 py-4 font-bold text-cyan-300">{dev.ipAddress}</td>
                  <td className="px-6 py-4 text-slate-400">{dev.macAddress}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border whitespace-nowrap inline-flex items-center"
                      style={{
                        backgroundColor: dev.vlanId === 10 ? 'rgba(59, 130, 246, 0.15)' : dev.vlanId === 20 ? 'rgba(139, 92, 246, 0.15)' : 'rgba(6, 182, 212, 0.15)',
                        borderColor: dev.vlanId === 10 ? '#3B82F6' : dev.vlanId === 20 ? '#8B5CF6' : '#06B6D4',
                        color: dev.vlanId === 10 ? '#60A5FA' : dev.vlanId === 20 ? '#C084FC' : '#22D3EE',
                      }}
                    >
                      VLAN {dev.vlanId}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-amber-400">{dev.switchPort}</td>
                  <td className="px-6 py-4 text-slate-400">{dev.gateway}</td>
                  <td className="px-6 py-4 font-sans">
                    <button
                      onClick={() => handleToggleStatus(dev)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 transition-all ${
                        dev.status === 'Online'
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 hover:bg-emerald-900/80'
                          : 'bg-rose-950/80 text-rose-400 border border-rose-800/80 hover:bg-rose-900/80'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${dev.status === 'Online' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
                      {dev.status}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEditModal(dev)}
                      className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                      title="Edit Host"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(dev.id, dev.name)}
                      className="p-2 rounded-xl bg-slate-950 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors"
                      title="De-register Host"
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
              {editingDevice ? `Edit Host (${editingDevice.name})` : 'Register New Host Device'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Hostname</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Student-PC3"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">VLAN Segment</label>
                  <select
                    value={formData.vlanId}
                    onChange={(e) => handleVlanChangeInForm(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-cyan-500"
                  >
                    {vlans.map((v) => (
                      <option key={v.id} value={v.id}>
                        VLAN {v.id} ({v.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Switch Port</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fa0/8"
                    value={formData.switchPort}
                    onChange={(e) => setFormData({ ...formData, switchPort: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">IP Address</label>
                <input
                  type="text"
                  required
                  placeholder="192.168.10.12"
                  value={formData.ipAddress}
                  onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">MAC Address</label>
                  <input
                    type="text"
                    required
                    value={formData.macAddress}
                    onChange={(e) => setFormData({ ...formData, macAddress: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Default Gateway</label>
                  <input
                    type="text"
                    readOnly
                    value={formData.gateway}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-3 py-2 text-slate-400 font-mono"
                  />
                </div>
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
                  {editingDevice ? 'Save Changes' : 'Register Host'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
