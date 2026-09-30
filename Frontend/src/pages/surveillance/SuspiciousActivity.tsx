import React, { useState, useEffect } from 'react';
import { AlertTriangle, Eye, CheckCircle, Clock } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { suspiciousActivities } from '../../data/detections';
import { SuspiciousActivity as SuspiciousActivityType } from '../../types';
import { SeverityBadge, StatusBadge, FilterButton, SearchBar, PageHeader, StatCard, SectorBadge } from '../../components/common';

const activityIcons: Record<string, string> = {
  LOITERING: '🕐', UNUSUAL_MOVEMENT: '🔄', RUNNING: '🏃', GROUP_GATHERING: '👥',
  OBJECT_ABANDONMENT: '📦', REPEATED_CROSSING: '🔁', RESTRICTED_AREA: '⛔',
};

const activityLabels: Record<string, string> = {
  LOITERING: 'Loitering', UNUSUAL_MOVEMENT: 'Unusual Movement', RUNNING: 'Running',
  GROUP_GATHERING: 'Group Gathering', OBJECT_ABANDONMENT: 'Object Abandonment',
  REPEATED_CROSSING: 'Repeated Crossing', RESTRICTED_AREA: 'Restricted Area Entry',
};

const SuspiciousActivity: React.FC = () => {
  const { setCurrentPage } = useAppStore();
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<SuspiciousActivityType | null>(suspiciousActivities[0]);

  useEffect(() => { setCurrentPage('suspicious-activity'); }, [setCurrentPage]);

  const filtered = suspiciousActivities.filter(a => {
    const matchSeverity = severityFilter === 'ALL' || a.severity === severityFilter;
    const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;
    const matchSearch = a.camera.toLowerCase().includes(search.toLowerCase()) ||
      activityLabels[a.activityType]?.toLowerCase().includes(search.toLowerCase());
    return matchSeverity && matchStatus && matchSearch;
  });

  return (
    <div className="flex flex-col h-full" style={{ height: 'calc(100vh - 56px)' }}>
      <PageHeader
        title="Suspicious Activity Detection"
        subtitle={`${suspiciousActivities.length} events detected`}
        icon={<AlertTriangle size={16} />}
        accent="var(--color-warning)"
        actions={<SearchBar value={search} onChange={setSearch} placeholder="Search activity..." className="w-48" />}
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <StatCard icon={<AlertTriangle size={16} />} label="Critical Events" value={suspiciousActivities.filter(a => a.severity === 'CRITICAL').length} accent="var(--color-critical)" />
        <StatCard icon={<Eye size={16} />} label="Under Review" value={suspiciousActivities.filter(a => a.status === 'UNDER_REVIEW').length} accent="var(--color-warning)" />
        <StatCard icon={<CheckCircle size={16} />} label="Confirmed" value={suspiciousActivities.filter(a => a.status === 'CONFIRMED').length} accent="var(--color-danger)" />
        <StatCard icon={<Clock size={16} />} label="False Alarms" value={suspiciousActivities.filter(a => a.status === 'FALSE_ALARM').length} accent="var(--color-success)" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-2 shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Severity:</span>
        {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(s => (
          <FilterButton key={s} label={s} active={severityFilter === s} onClick={() => setSeverityFilter(s)}
            color={s === 'CRITICAL' ? '#ff2020' : s === 'HIGH' ? '#ef4444' : s === 'MEDIUM' ? '#f59e0b' : s === 'LOW' ? '#3b82f6' : 'var(--color-primary)'} />
        ))}
        <span className="text-xs ml-3" style={{ color: 'var(--color-text-muted)' }}>Status:</span>
        {['ALL', 'UNDER_REVIEW', 'CONFIRMED', 'FALSE_ALARM'].map(s => (
          <FilterButton key={s} label={s.replace(/_/g, ' ')} active={statusFilter === s} onClick={() => setStatusFilter(s)} />
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.map(activity => (
            <div
              key={activity.id}
              onClick={() => setSelected(activity)}
              className="card p-4 cursor-pointer transition-all hover:border-blue-500/30"
              style={{
                border: selected?.id === activity.id ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                borderLeft: `3px solid ${activity.severity === 'CRITICAL' ? '#ff2020' : activity.severity === 'HIGH' ? '#ef4444' : activity.severity === 'MEDIUM' ? '#f59e0b' : '#3b82f6'}`,
              }}
            >
              <div className="flex items-start gap-4">
                {/* Activity type icon */}
                <div className="text-2xl shrink-0">{activityIcons[activity.activityType] || '⚠️'}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      {activityLabels[activity.activityType]}
                    </span>
                    <SeverityBadge severity={activity.severity} size="sm" />
                    <StatusBadge status={activity.status.replace(/_/g, '_')} size="sm" />
                    <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>{activity.id}</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 mb-2">
                    {[
                      { label: 'Camera', value: activity.camera },
                      { label: 'Location', value: activity.location },
                      { label: 'Sector', value: activity.sector },
                      { label: 'Confidence', value: `${activity.confidence}%` },
                    ].map(item => (
                      <div key={item.label} className="text-xs">
                        <span style={{ color: 'var(--color-text-muted)' }}>{item.label}: </span>
                        <span style={{ color: 'var(--color-text-secondary)' }}>{item.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <SectorBadge sector={activity.sector} />
                    {activity.duration && (
                      <span className="text-xs flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                        <Clock size={11} /> {activity.duration}
                      </span>
                    )}
                    {activity.personsInvolved !== undefined && (
                      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        👤 {activity.personsInvolved} person{activity.personsInvolved !== 1 ? 's' : ''}
                      </span>
                    )}
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {new Date(activity.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </span>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="flex flex-col gap-1 shrink-0">
                  <button className="px-2 py-1 rounded text-xs hover:opacity-80"
                    style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}>
                    Review
                  </button>
                  <button className="px-2 py-1 rounded text-xs hover:opacity-80"
                    style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
                    Resolve
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right panel */}
        {selected && (
          <div className="hidden xl:block w-64 shrink-0 overflow-y-auto p-4"
            style={{ borderLeft: '1px solid var(--color-border)', background: 'var(--color-bg-surface)' }}>
            <h3 className="text-xs font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>EVENT DETAIL</h3>
            <div className="text-3xl mb-2">{activityIcons[selected.activityType]}</div>
            <div className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
              {activityLabels[selected.activityType]}
            </div>
            <div className="space-y-2">
              {[
                { label: 'Event ID', value: selected.id },
                { label: 'Activity Type', value: activityLabels[selected.activityType] },
                { label: 'Camera', value: selected.camera },
                { label: 'Location', value: selected.location },
                { label: 'Sector', value: selected.sector },
                { label: 'Severity', value: selected.severity },
                { label: 'Confidence', value: `${selected.confidence}%` },
                { label: 'Status', value: selected.status },
                { label: 'Duration', value: selected.duration || 'N/A' },
                { label: 'Persons', value: selected.personsInvolved?.toString() || 'Unknown' },
                { label: 'Detected', value: new Date(selected.timestamp).toLocaleString('en-IN') },
              ].map(item => (
                <div key={item.label} className="flex justify-between text-xs">
                  <span style={{ color: 'var(--color-text-muted)' }}>{item.label}</span>
                  <span className="font-medium text-right" style={{ color: 'var(--color-text-secondary)' }}>{item.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              <button className="w-full py-1.5 rounded text-xs font-medium hover:opacity-80"
                style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}>
                View Camera Feed
              </button>
              <button className="w-full py-1.5 rounded text-xs font-medium hover:opacity-80"
                style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
                Create Case
              </button>
              <button className="w-full py-1.5 rounded text-xs font-medium hover:opacity-80"
                style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
                Mark Resolved
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuspiciousActivity;
