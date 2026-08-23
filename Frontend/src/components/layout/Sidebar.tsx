import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Video, User, Car, Shield, AlertTriangle,
  Moon, Thermometer, Users, FileText, Bell, BarChart3,
  Database, Settings, ChevronDown, ChevronRight,
  Network, FolderOpen, Lightbulb, CheckSquare, Clock,
  UserSquare, Camera, Activity, Monitor, Building2,
  Crosshair, TrendingUp, Cpu, LogOut,
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface NavGroup {
  label: string;
  items: NavItem[];
  defaultOpen?: boolean;
}

const navGroups: NavGroup[] = [
  {
    label: 'COMMAND',
    defaultOpen: true,
    items: [
      { label: 'Command Dashboard', path: '/', icon: <LayoutDashboard size={16} /> },
    ],
  },
  {
    label: 'SURVEILLANCE',
    defaultOpen: true,
    items: [
      { label: 'Live Surveillance', path: '/surveillance/live', icon: <Video size={16} /> },
      { label: 'Human & Face Detection', path: '/surveillance/human-face', icon: <User size={16} /> },
      { label: 'Vehicle & ANPR', path: '/surveillance/vehicle-anpr', icon: <Car size={16} /> },
      { label: 'Virtual Fence', path: '/surveillance/virtual-fence', icon: <Shield size={16} /> },
      { label: 'Suspicious Activity', path: '/surveillance/suspicious-activity', icon: <AlertTriangle size={16} /> },
      { label: 'Night Surveillance', path: '/surveillance/night', icon: <Moon size={16} /> },
      { label: 'Thermal Intelligence', path: '/surveillance/thermal', icon: <Thermometer size={16} /> },
    ],
  },
  {
    label: 'INTELLIGENCE',
    defaultOpen: true,
    items: [
      { label: 'Criminal Network', path: '/intelligence/criminal-network', icon: <Network size={16} /> },
      { label: 'AI Reports & Queries', path: '/intelligence/ai-reports', icon: <FileText size={16} /> },
      { label: 'Alerts & Events', path: '/intelligence/alerts', icon: <Bell size={16} /> },
    ],
  },
  {
    label: 'CRM & OPERATIONS',
    defaultOpen: false,
    items: [
      { label: 'CRM Overview', path: '/crm', icon: <LayoutDashboard size={16} /> },
      { label: 'Intelligence Contacts', path: '/crm/contacts', icon: <UserSquare size={16} /> },
      { label: 'Organizations & Units', path: '/crm/organizations', icon: <Building2 size={16} /> },
      { label: 'Cases & Investigations', path: '/crm/cases', icon: <FolderOpen size={16} /> },
      { label: 'Intelligence Leads', path: '/crm/leads', icon: <Lightbulb size={16} /> },
      { label: 'Tasks & Follow-ups', path: '/crm/tasks', icon: <CheckSquare size={16} /> },
      { label: 'Activity Timeline', path: '/crm/timeline', icon: <Clock size={16} /> },
      { label: 'Team Operations', path: '/crm/team', icon: <Users size={16} /> },
    ],
  },
  {
    label: 'MANAGEMENT',
    defaultOpen: false,
    items: [
      { label: 'Camera Management', path: '/management/cameras', icon: <Camera size={16} /> },
      { label: 'Analytics', path: '/management/analytics', icon: <TrendingUp size={16} /> },
      { label: 'System Status', path: '/management/system', icon: <Cpu size={16} /> },
      { label: 'Settings', path: '/management/settings', icon: <Settings size={16} /> },
    ],
  },
];

const SidebarGroup: React.FC<{
  group: NavGroup;
  collapsed: boolean;
}> = ({ group, collapsed }) => {
  const [open, setOpen] = useState(group.defaultOpen ?? true);
  const location = useLocation();
  const hasActive = group.items.some(i =>
    i.path === '/' ? location.pathname === '/' : location.pathname.startsWith(i.path)
  );

  if (collapsed) {
    // In collapsed mode, show only icons
    return (
      <div className="mb-1">
        {group.items.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            title={item.label}
            className={({ isActive }) =>
              `flex items-center justify-center w-full h-9 rounded mx-auto my-0.5 transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`
            }
            style={{ width: '36px' }}
          >
            {item.icon}
          </NavLink>
        ))}
      </div>
    );
  }

  return (
    <div className="mb-2">
      {/* Group header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full px-3 py-1.5 text-xs font-semibold tracking-widest uppercase transition-colors duration-150"
        style={{ color: hasActive ? 'var(--color-primary-light)' : 'var(--color-text-muted)' }}
      >
        <span>{group.label}</span>
        {open
          ? <ChevronDown size={11} />
          : <ChevronRight size={11} />
        }
      </button>

      {/* Items */}
      {open && (
        <div className="space-y-0.5">
          {group.items.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 mx-2 rounded text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-300 font-medium'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`
              }
            >
              <span className="shrink-0">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

const Sidebar: React.FC = () => {
  const { sidebarCollapsed, setAuthenticated } = useAppStore();

  const handleLogout = () => {
    setAuthenticated(false);
  };

  return (
    <aside
      className="fixed top-0 left-0 h-full z-40 flex flex-col transition-all duration-300"
      style={{
        width: sidebarCollapsed ? '60px' : '240px',
        background: 'var(--color-bg-surface)',
        borderRight: '1px solid var(--color-border)',
      }}
    >
      {/* Logo / Brand */}
      <div
        className="flex items-center gap-3 px-3 py-4 shrink-0"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div
          className="shrink-0 w-8 h-8 rounded flex items-center justify-center font-bold text-sm"
          style={{
            background: 'linear-gradient(135deg, #1d4ed8, #0369a1)',
            color: '#fff',
          }}
        >
          <Crosshair size={16} />
        </div>
        {!sidebarCollapsed && (
          <div className="min-w-0">
            <div className="font-bold text-sm leading-none" style={{ color: 'var(--color-text-primary)' }}>
              IBVAP
            </div>
            <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-muted)' }}>
              Border Analytics Platform
            </div>
          </div>
        )}
      </div>

      {/* System Status Indicator */}
      {!sidebarCollapsed && (
        <div className="mx-3 mt-2 mb-1 px-2 py-1.5 rounded text-xs flex items-center gap-2"
          style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <span className="status-dot" style={{ background: 'var(--color-success)' }} />
          <span style={{ color: 'var(--color-success)' }}>System Operational</span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-1">
        {navGroups.map(group => (
          <SidebarGroup
            key={group.label}
            group={group}
            collapsed={sidebarCollapsed}
          />
        ))}
      </nav>

      {/* Bottom section */}
      {!sidebarCollapsed && (
        <div
          className="px-3 py-3 text-xs shrink-0 flex items-center justify-between"
          style={{
            borderTop: '1px solid var(--color-border)',
            color: 'var(--color-text-muted)',
          }}
        >
          <div>
            <div className="flex items-center gap-1.5">
              <Activity size={11} />
              <span>IBVAP v1.0 — Frontend</span>
            </div>
            <div className="mt-0.5 flex items-center gap-1.5">
              <Monitor size={11} />
              <span>15 Cameras | 5 Sectors</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-red-400 transition-colors"
            title="Secure Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
