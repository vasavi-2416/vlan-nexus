import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Moon, Sun, Database, RefreshCw, Check } from 'lucide-react';
import { StorageService } from '../services/storage';
import { ToastContainer, ToastMessage } from '../components/common/Toast';
import { useTheme } from '../context/ThemeContext';

export const Settings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [profileName, setProfileName] = useState('Administrator');
  const [profileEmail, setProfileEmail] = useState('admin@vlannexus.net');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (title: string, message?: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all VLANs, devices, and ACL rules to initial enterprise state?')) {
      StorageService.resetDemoData();
      addToast('Data Reset Successful', 'Restored default enterprise demo data', 'info');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-[1600px] mx-auto">
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-2.5">
            <SettingsIcon className="w-7 h-7 text-cyan-400" /> System Settings & Preferences
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Manage profile settings, appearance theme, notification rules, and database reset.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
            <User className="w-4 h-4 text-cyan-400" /> Profile & Credentials
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Administrator Display Name</label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Administrator Email</label>
              <input
                type="email"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-cyan-500"
              />
            </div>
            <button
              onClick={() => addToast('Profile Saved', 'Updated administrator details')}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold uppercase tracking-wider text-[11px]"
            >
              Save Profile Changes
            </button>
          </div>
        </div>

        {/* Appearance Theme Card */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Moon className="w-4 h-4 text-purple-400" /> Visual Theme & Appearance
          </h3>
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-200">Dark NOC Cyber-Tech Theme (Default)</div>
                <div className="text-[11px] text-slate-400">Deep navy NOC palette with glowing elements</div>
              </div>
              <button
                onClick={() => {
                  setTheme('dark');
                  addToast('Theme Applied', 'Dark NOC Mode activated');
                }}
                className={`p-3 rounded-xl border flex items-center gap-2 transition-all ${
                  theme === 'dark'
                    ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold ring-2 ring-cyan-500/30'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>Dark Mode</span>
                {theme === 'dark' && <Check className="w-3.5 h-3.5 text-cyan-400 ml-1" />}
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <div>
                <div className="font-bold text-slate-200">Light Mode Theme</div>
                <div className="text-[11px] text-slate-400">Clean high-contrast light interface</div>
              </div>
              <button
                onClick={() => {
                  setTheme('light');
                  addToast('Theme Applied', 'Light Mode activated');
                }}
                className={`p-3 rounded-xl border flex items-center gap-2 transition-all ${
                  theme === 'light'
                    ? 'bg-amber-950 border-amber-500 text-amber-300 font-bold ring-2 ring-amber-500/30'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Light Mode</span>
                {theme === 'light' && <Check className="w-3.5 h-3.5 text-amber-400 ml-1" />}
              </button>
            </div>
          </div>
        </div>

        {/* Data Reset Card */}
        <div className="lg:col-span-12 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
              <Database className="w-4 h-4" /> Reset Enterprise Demo Data
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Restore default 3 VLANs (Students, Faculty, Admin), 26 endpoints, subinterfaces, and ACL rules.
            </p>
          </div>
          <button
            onClick={handleResetData}
            className="px-4 py-2.5 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800/80 font-bold text-xs uppercase tracking-wider flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Reset Demo State
          </button>
        </div>
      </div>
    </div>
  );
};
