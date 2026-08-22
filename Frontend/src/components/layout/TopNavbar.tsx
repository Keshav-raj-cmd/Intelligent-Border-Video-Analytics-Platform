import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Menu, Search, Bell, Bot, ChevronRight,
  AlertTriangle, User, Clock, X, MapPin,
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';

const pageTitles: Record<string, { title: string; breadcrumb: string[] }> = {
  '/': { title: 'Command Dashboard', breadcrumb: ['Command'] },
  '/surveillance/live': { title: 'Live Surveillance', breadcrumb: ['Surveillance', 'Live'] },
  '/surveillance/human-face': { title: 'Human & Face Detection', breadcrumb: ['Surveillance', 'Human & Face'] },
  '/surveillance/vehicle-anpr': { title: 'Vehicle & ANPR', breadcrumb: ['Surveillance', 'Vehicle & ANPR'] },
  '/surveillance/virtual-fence': { title: 'Virtual Fence', breadcrumb: ['Surveillance', 'Virtual Fence'] },
  '/surveillance/suspicious-activity': { title: 'Suspicious Activity', breadcrumb: ['Surveillance', 'Suspicious Activity'] },
  '/surveillance/night': { title: 'Night Surveillance', breadcrumb: ['Surveillance', 'Night'] },
  '/surveillance/thermal': { title: 'Thermal Intelligence', breadcrumb: ['Surveillance', 'Thermal'] },
  '/intelligence/criminal-network': { title: 'Criminal Identification Network', breadcrumb: ['Intelligence', 'Criminal Network'] },
  '/intelligence/ai-reports': { title: 'AI Reports & Queries', breadcrumb: ['Intelligence', 'AI Reports'] },
  '/intelligence/alerts': { title: 'Alerts & Events', breadcrumb: ['Intelligence', 'Alerts & Events'] },
  '/crm': { title: 'CRM Overview', breadcrumb: ['CRM & Operations'] },
  '/crm/contacts': { title: 'Intelligence Contacts', breadcrumb: ['CRM', 'Contacts'] },
  '/crm/organizations': { title: 'Organizations & Units', breadcrumb: ['CRM', 'Organizations'] },
  '/crm/cases': { title: 'Cases & Investigations', breadcrumb: ['CRM', 'Cases'] },
  '/crm/leads': { title: 'Intelligence Leads', breadcrumb: ['CRM', 'Leads'] },
  '/crm/tasks': { title: 'Tasks & Follow-ups', breadcrumb: ['CRM', 'Tasks'] },
  '/crm/timeline': { title: 'Activity Timeline', breadcrumb: ['CRM', 'Timeline'] },
  '/crm/team': { title: 'Team Operations', breadcrumb: ['CRM', 'Team'] },
  '/management/cameras': { title: 'Camera Management', breadcrumb: ['Management', 'Cameras'] },
  '/management/analytics': { title: 'Analytics', breadcrumb: ['Management', 'Analytics'] },
  '/management/system': { title: 'System Status', breadcrumb: ['Management', 'System'] },
  '/management/settings': { title: 'Settings', breadcrumb: ['Management', 'Settings'] },
};

const TopNavbar: React.FC = () => {
  const { toggleSidebar, toggleAIDrawer, notificationCount, alertCount } = useAppStore();
  const location = useLocation();
  const [now, setNow] = useState(new Date());
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const pageInfo = pageTitles[location.pathname] || { title: 'IBVAP', breadcrumb: [] };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <header
      className="h-14 flex items-center gap-3 px-4 shrink-0 z-20 relative"
      style={{
        background: 'var(--color-bg-surface)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {/* Sidebar toggle */}
      <button
        onClick={toggleSidebar}
        className="p-1.5 rounded transition-colors duration-150 hover:bg-white/5"
        style={{ color: 'var(--color-text-secondary)' }}
        id="sidebar-toggle"
        title="Toggle Sidebar"
      >
        <Menu size={18} />
      </button>

      {/* Page title + breadcrumb */}
      <div className="flex items-center gap-2 min-w-0">
        {pageInfo.breadcrumb.length > 1 && (
          <>
            {pageInfo.breadcrumb.slice(0, -1).map((crumb, i) => (
              <React.Fragment key={i}>
                <span className="text-xs hidden sm:block" style={{ color: 'var(--color-text-muted)' }}>
                  {crumb}
                </span>
                <ChevronRight size={12} className="hidden sm:block" style={{ color: 'var(--color-text-muted)' }} />
              </React.Fragment>
            ))}
          </>
        )}
        <h1 className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
          {pageInfo.title}
        </h1>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      {searchOpen ? (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded"
          style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-light)', width: '280px' }}>
          <Search size={14} style={{ color: 'var(--color-text-muted)' }} />
          <input
            autoFocus
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search cameras, alerts, cases..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--color-text-primary)' }}
          />
          <button onClick={() => { setSearchOpen(false); setSearchQuery(''); }}>
            <X size={14} style={{ color: 'var(--color-text-muted)' }} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors duration-150 hover:bg-white/5"
          style={{ color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
          id="global-search"
        >
          <Search size={14} />
          <span className="hidden md:block">Search...</span>
          <span className="hidden lg:block text-xs px-1 py-0.5 rounded"
            style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-disabled)' }}>
            Ctrl+K
          </span>
        </button>
      )}

      {/* Sector/Location indicator */}
      <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded text-xs"
        style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--color-primary-light)', border: '1px solid rgba(59,130,246,0.2)' }}>
        <MapPin size={11} />
        <span>All Sectors</span>
      </div>

      {/* Alert indicator */}
      {alertCount > 0 && (
        <button
          className="flex items-center gap-1.5 px-2 py-1 rounded text-xs animate-pulse"
          style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
          id="alert-indicator"
        >
          <AlertTriangle size={12} />
          <span>{alertCount} Critical</span>
        </button>
      )}

      {/* Date/Time */}
      <div className="hidden xl:flex flex-col items-end">
        <span className="text-mono text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
          {formatTime(now)}
        </span>
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {formatDate(now)}
        </span>
      </div>

      {/* Notifications */}
      <button
        className="relative p-1.5 rounded transition-colors duration-150 hover:bg-white/5"
        style={{ color: 'var(--color-text-secondary)' }}
        id="notifications-btn"
        title="Notifications"
      >
        <Bell size={18} />
        {notificationCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold"
            style={{ background: 'var(--color-danger)', color: '#fff', fontSize: '10px' }}
          >
            {notificationCount}
          </span>
        )}
      </button>

      {/* AI Assistant button */}
      <button
        onClick={toggleAIDrawer}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-all duration-150 hover:opacity-90"
        style={{
          background: 'linear-gradient(135deg, #1e3a8a, #1e40af)',
          color: '#93c5fd',
          border: '1px solid rgba(59,130,246,0.3)',
        }}
        id="ai-assistant-btn"
        title="AI Assistant"
      >
        <Bot size={15} />
        <span className="hidden sm:block">AI Assist</span>
      </button>

      {/* User profile */}
      <button
        className="flex items-center gap-2 pl-2"
        style={{ borderLeft: '1px solid var(--color-border)' }}
        id="user-profile-btn"
        title="User Profile"
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ background: 'linear-gradient(135deg, #1e40af, #0e7490)', color: '#fff' }}
        >
          VS
        </div>
        <div className="hidden lg:block text-left">
          <div className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>Insp. V. Singh</div>
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>SOC</div>
        </div>
      </button>
    </header>
  );
};

export default TopNavbar;
