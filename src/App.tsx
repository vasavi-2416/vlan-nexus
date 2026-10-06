import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { CommandPalette } from './components/common/CommandPalette';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { VlanManagement } from './pages/VlanManagement';
import { DeviceManagement } from './pages/DeviceManagement';
import { NetworkTopology } from './pages/NetworkTopology';
import { InterVlanRouting } from './pages/InterVlanRouting';
import { ConnectivityTest } from './pages/ConnectivityTest';
import { AclSecurity } from './pages/AclSecurity';
import { NetworkLogs } from './pages/NetworkLogs';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { About } from './pages/About';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const location = useLocation();

  if (location.pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen noc-grid-bg flex flex-col font-sans transition-colors duration-300">
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div
        className={`transition-all duration-300 flex-1 flex flex-col ${
          sidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
        }`}
      >
        <Header
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onToggleSidebarMobile={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />

        <main className="flex-1 pb-16 pt-8 px-4 md:px-8 max-w-[1700px] mx-auto w-full">{children}</main>

        <footer className="py-4 px-8 border-t border-slate-800/80 bg-[#070b18]/90 text-slate-500 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 transition-colors">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-300">VLAN NEXUS</span>
            <span>— Enterprise Network Management System</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            Computer Networks Project • Router-on-a-Stick 802.1Q
          </div>
        </footer>
      </div>
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/vlans" element={<VlanManagement />} />
            <Route path="/devices" element={<DeviceManagement />} />
            <Route path="/topology" element={<NetworkTopology />} />
            <Route path="/routing" element={<InterVlanRouting />} />
            <Route path="/connectivity" element={<ConnectivityTest />} />
            <Route path="/security" element={<AclSecurity />} />
            <Route path="/logs" element={<NetworkLogs />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </MainLayout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
