import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, Eye, Search, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { alerts, systemEvents } from '../../data/alerts';
import { Alert } from '../../types';
import { SeverityBadge, StatusBadge, SearchBar, FilterButton, PageHeader, StatCard, SectorBadge, Tabs } from '../../components/common';

const AlertsEvents: React.FC = () => {
  const { setCurrentPage } = useAppStore();
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [alertList, setAlertList] = useState<Alert[]>([...alerts]);
  const [activeTab, setActiveTab] = useState('alerts');

  useEffect(() => { setCurrentPage('alerts-events'); }, [setCurrentPage]);

  const filtered = alertList.filter(a => {
    const matchSearch = a.type.toLowerCase().includes(search.toLowerCase()) ||
      a.camera.toLowerCase().includes(search.toLowerCase()) ||
      a.location.toLowerCase().includes(search.toLowerCase());
    const matchSev = severityFilter === 'ALL' || a.severity === severityFilter;
    const matchSt = statusFilter === 'ALL' || a.status === statusFilter;
    return matchSearch && matchSev && matchSt;
  });

  const acknowledge = (id: string) => {
    setAlertList(prev => prev.map(a => a.id === id && a.status === 'NEW' ? { ...a, status: 'ACKNOWLEDGED' } : a));
  };
  const resolve = (id: string) => {
    setAlertList(prev => prev.map(a => a.id === id ? { ...a, status: 'RESOLVED' } : a));
  };

  const tabs = [
    { id: 'alerts', label: 'Alerts', count: alertList.length },
    { id: 'events', label: 'System Events', count: systemEvents.length },
  ];

  return (
    <div className="flex flex-col h-full" style={{ height: 'calc(100vh - 56px)' }}>
      <PageHeader
        title="Alerts & Events"
        subtitle="Security event monitoring and management"
        icon={<Bell size={16} />}
        accent="var(--color-warning)"
        actions={<SearchBar value={search} onChange={setSearch} placeholder="Search alerts..." className="w-48" />}
      />

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3 px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <StatCard icon={<AlertTriangle size={16} />} label="Critical" value={alertList.filter(a => a.severity === 'CRITICAL').length} accent="var(--color-critical)" />
        <StatCard icon={<AlertTriangle size={16} />} label="High" value={alertList.filter(a => a.severity === 'HIGH').length} accent="var(--color-danger)" />
        <StatCard icon={<AlertTriangle size={16} />} label="Medium" value={alertList.filter(a => a.severity === 'MEDIUM').length} accent="var(--color-warning)" />
        <StatCard icon={<Bell size={16} />} label="New" value={alertList.filter(a => a.status === 'NEW').length} accent="var(--color-primary)" />
        <StatCard icon={<CheckCircle size={16} />} label="Resolved" value={alertList.filter(a => a.status === 'RESOLVED').length} accent="var(--color-success)" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-2 shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Severity:</span>
        {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'].map(s => (
          <FilterButton key={s} label={s} active={severityFilter === s} onClick={() => setSeverityFilter(s)} />
        ))}
        <span className="text-xs ml-3" style={{ color: 'var(--color-text-muted)' }}>Status:</span>
        {['ALL', 'NEW', 'ACKNOWLEDGED', 'INVESTIGATING', 'RESOLVED'].map(s => (
          <FilterButton key={s} label={s.replace(/_/g, ' ')} active={statusFilter === s} onClick={() => setStatusFilter(s)} />
        ))}
      </div>

      {/* Tabs */}
      <div className="px-4 shrink-0">
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {activeTab === 'alerts' && (
          <>
            {filtered.map(alert => (
              <div
                key={alert.id}
                className="card p-4 transition-all"
                style={{
                  borderLeft: `3px solid ${
                    alert.severity === 'CRITICAL' ? '#ff2020' :
                    alert.severity === 'HIGH' ? '#ef4444' :
                    alert.severity === 'MEDIUM' ? '#f59e0b' : '#3b82f6'
                  }`,
                  background: alert.severity === 'CRITICAL' && alert.status === 'NEW' ? 'rgba(255,32,32,0.04)' : 'var(--color-bg-card)',
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>{alert.id}</span>
                      <SeverityBadge severity={alert.severity} size="sm" />
                      <StatusBadge status={alert.status} size="sm" />
                      <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{alert.type}</span>
                    </div>
                    <p className="text-xs mb-2 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{alert.description}</p>
                    <div className="flex items-center gap-3 flex-wrap text-xs">
                      <span style={{ color: 'var(--color-text-muted)' }}>📷 {alert.camera}</span>
                      <span style={{ color: 'var(--color-text-muted)' }}>📍 {alert.location}</span>
                      <SectorBadge sector={alert.sector} />
                      <span style={{ color: 'var(--color-text-muted)' }}>
                        🕐 {new Date(alert.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    {alert.status === 'NEW' && (
                      <button onClick={() => acknowledge(alert.id)}
                        className="px-2 py-1 rounded text-xs hover:opacity-80 transition-opacity"
                        style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)', whiteSpace: 'nowrap' }}>
                        Acknowledge
                      </button>
                    )}
                    <button className="px-2 py-1 rounded text-xs hover:opacity-80"
                      style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)', whiteSpace: 'nowrap' }}>
                      Investigate
                    </button>
                    {alert.status !== 'RESOLVED' && (
                      <button onClick={() => resolve(alert.id)}
                        className="px-2 py-1 rounded text-xs hover:opacity-80"
                        style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)', whiteSpace: 'nowrap' }}>
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {activeTab === 'events' && (
          <div className="space-y-2">
            {systemEvents.map(ev => (
              <div key={ev.id} className="card p-3 flex items-start gap-3">
                <SeverityBadge severity={ev.severity} size="sm" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>{ev.id}</span>
                    <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{ev.eventType.replace(/_/g, ' ')}</span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{ev.description}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-disabled)' }}>
                    {new Date(ev.timestamp).toLocaleString('en-IN')}
                    {ev.camera && ` · ${ev.camera}`}
                    {ev.location && ` · ${ev.location}`}
                  </p>
                </div>
                <StatusBadge status={ev.status} size="sm" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsEvents;
