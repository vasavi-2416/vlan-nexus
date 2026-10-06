import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User, ArrowRight, Activity, CheckCircle, Server, GitFork } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (username === 'admin' && password === 'admin123') {
        navigate('/dashboard');
      } else {
        setError('Invalid credentials. Demo credentials are admin / admin123');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#070a12] noc-grid-bg text-slate-100 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-5xl rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-2xl grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* Left Side: Brand Visual & Network Graphics */}
        <div className="lg:col-span-6 p-8 lg:p-12 bg-gradient-to-br from-blue-950/60 via-slate-900 to-indigo-950/60 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between relative overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Header */}
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-xl shadow-cyan-500/20">
                <Shield className="w-6 h-6 text-cyan-200" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-wider text-slate-100">
                  VLAN <span className="text-cyan-400">NEXUS</span>
                </h1>
                <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
                  Network Management System
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              Enterprise NOC visualization and management engine for segmented networks. Complete 802.1Q trunking and Router-on-a-Stick Inter-VLAN routing controls.
            </p>
          </div>

          {/* Center Interactive Abstract Network Diagram */}
          <div className="my-8 relative z-10 p-6 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" /> Topology Segment Matrix
            </div>

            <div className="space-y-3">
              {[
                { name: 'VLAN 10 — Students', subnet: '192.168.10.0/24', color: 'border-blue-500/50 bg-blue-950/30 text-blue-300' },
                { name: 'VLAN 20 — Faculty', subnet: '192.168.20.0/24', color: 'border-purple-500/50 bg-purple-950/30 text-purple-300' },
                { name: 'VLAN 30 — Administration', subnet: '192.168.30.0/24', color: 'border-cyan-500/50 bg-cyan-950/30 text-cyan-300' },
              ].map((v) => (
                <div
                  key={v.name}
                  className={`p-3 rounded-xl border ${v.color} flex items-center justify-between text-xs font-mono`}
                >
                  <span className="font-semibold">{v.name}</span>
                  <span>{v.subnet}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <GitFork className="w-3.5 h-3.5 text-emerald-400" /> 802.1Q Trunk Active
              </span>
              <span className="flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-cyan-400" /> Router Subinterfaces: 3/3 UP
              </span>
            </div>
          </div>

          {/* Bottom Security Note */}
          <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 border-t border-slate-800/60 pt-4">
            <span>Computer Networks Capstone Project</span>
            <span className="text-emerald-400 font-mono text-[11px]">v2.4 Enterprise</span>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="lg:col-span-6 p-8 lg:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-100">Welcome back</h2>
              <p className="text-xs text-slate-400 mt-1">
                Administrator Authentication Portal
              </p>
            </div>

            {/* Demo Credentials Alert Pill */}
            <div className="mb-6 p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-800/50 text-xs text-cyan-200 flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5 text-cyan-300">Demo Account Credentials:</span>
                <code className="text-cyan-200 font-mono bg-cyan-900/60 px-1.5 py-0.5 rounded mr-2">admin</code>
                Password: <code className="text-cyan-200 font-mono bg-cyan-900/60 px-1.5 py-0.5 rounded">admin123</code>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Username or Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors font-medium"
                    placeholder="Enter username..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors font-medium"
                    placeholder="Enter password..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center space-x-2 text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-cyan-500 focus:ring-0"
                  />
                  <span>Remember session</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert('Demo Mode: Use username "admin" and password "admin123"')}
                  className="text-cyan-400 hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to NOC Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};
