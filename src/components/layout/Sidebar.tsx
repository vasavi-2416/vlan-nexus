import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  Network,
  HardDrive,
  GitFork,
  Radio,
  Activity,
  Lock,
  FileText,
  PieChart,
  Settings,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Zap,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'VLAN Management', path: '/vlans', icon: Network },
    { name: 'Device Management', path: '/devices', icon: HardDrive },
    { name: 'Network Topology', path: '/topology', icon: GitFork },
    { name: 'Inter-VLAN Routing', path: '/routing', icon: Radio },
    { name: 'Connectivity Test', path: '/connectivity', icon: Activity },
    { name: 'ACL / Security', path: '/security', icon: Lock },
    { name: 'Network Logs', path: '/logs', icon: FileText },
    { name: 'Reports', path: '/reports', icon: PieChart },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 bg-[#070b18] border-r border-slate-800/80 transition-all duration-300 flex flex-col justify-between ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Header / Branding */}
      <div>
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/60">
          <NavLink to="/dashboard" className="flex items-center space-x-3 overflow-hidden">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-blue-500/20 shrink-0">
              <Shield className="w-5 h-5 text-cyan-200" />
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="font-extrabold text-base tracking-wider text-slate-100 flex items-center gap-1.5">
                  VLAN <span className="text-cyan-400">NEXUS</span>
                </span>
                <span className="text-[10px] tracking-wide text-slate-400 font-medium">
                  Network Command Center
                </span>
              </div>
            )}
          </NavLink>

          <button
            onClick={onToggleCollapse}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-260px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center px-3.5 py-3 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
                title={collapsed ? item.name : undefined}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                {!collapsed && (
                  <span className="ml-3 text-xs tracking-wide truncate">
                    {item.name}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Promo / Network Security Card */}
      {!collapsed && (
        <div className="p-3 m-3 rounded-2xl bg-gradient-to-b from-blue-950/80 to-slate-900 border border-blue-800/40 text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white">
            <Shield className="w-6 h-6 text-cyan-100" />
          </div>
          <div className="font-bold text-xs text-slate-100">Secure. Segment. Succeed.</div>
          <div className="text-[10px] text-slate-400 leading-tight">
            Intelligent VLAN Management for Modern Networks
          </div>
          <button className="w-full py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold tracking-wider uppercase flex items-center justify-center gap-1">
            <span>Learn More</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </aside>
  );
};
