import React, { useState, useEffect } from 'react';
import { Clock, Activity, Bell, AlertTriangle, Camera, User, Car, Shield, FileText, CheckSquare } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { PageHeader } from '../../components/common';
import { alerts } from '../../data/alerts';
import { detections } from '../../data/detections';
import { vehicles } from '../../data/vehicles';
import { cases } from '../../data/cases';
import { tasks } from '../../data/tasks';

interface TimelineEvent {
  id: string;
  type: 'ALERT' | 'DETECTION' | 'VEHICLE' | 'CASE' | 'TASK' | 'SYSTEM';
  title: string;
  description: string;
  timestamp: string;
  sector?: string;
  severity?: string;
  actor?: string;
}

const buildTimeline = (): TimelineEvent[] => {
  const events: TimelineEvent[] = [
    ...alerts.map(a => ({
      id: a.id, type: 'ALERT' as const,
      title: a.type, description: `${a.camera} — ${a.location}`,
      timestamp: a.timestamp, sector: a.sector, severity: a.severity,
    })),
    ...detections.slice(0, 5).map(d => ({
      id: d.id, type: 'DETECTION' as const,
      title: `Human detected${d.faceDetected ? ' (Face)' : ''}`,
      description: `${d.camera} — ${d.location} · Confidence: ${d.confidence}%`,
      timestamp: d.timestamp, sector: d.sector,
    })),
    ...vehicles.filter(v => v.flagged).map(v => ({
      id: v.id, type: 'VEHICLE' as const,
      title: `Flagged vehicle: ${v.plateNumber}`,
      description: `${v.camera} — ${v.location} · ${v.direction}`,
      timestamp: v.timestamp, sector: v.sector,
    })),
    ...cases.slice(0, 3).map(c => ({
      id: c.id, type: 'CASE' as const,
      title: `Case ${c.status.toLowerCase()}: ${c.title}`,
      description: `Priority: ${c.priority} · Officer: ${c.assignedOfficer}`,
      timestamp: c.lastUpdated, sector: c.sector, severity: c.priority,
    })),
    ...tasks.slice(0, 4).map(t => ({
      id: t.id, type: 'TASK' as const,
      title: `Task ${t.status.toLowerCase()}: ${t.title}`,
      description: `${t.assignedOfficer} · Due: ${t.dueDate}`,
      timestamp: new Date().toISOString(), actor: t.assignedOfficer,
    })),
  ];
  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const typeConfig = {
  ALERT: { icon: <Bell size={14} />, color: '#ef4444', bg: 'rgba(239,68,68,0.12)', label: 'Alert' },
  DETECTION: { icon: <User size={14} />, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', label: 'Detection' },
  VEHICLE: { icon: <Car size={14} />, color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', label: 'Vehicle' },
  CASE: { icon: <FileText size={14} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'Case' },
  TASK: { icon: <CheckSquare size={14} />, color: '#10b981', bg: 'rgba(16,185,129,0.12)', label: 'Task' },
  SYSTEM: { icon: <Activity size={14} />, color: '#64748b', bg: 'rgba(100,116,139,0.12)', label: 'System' },
};

const ActivityTimeline: React.FC = () => {
  const { setCurrentPage } = useAppStore();
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [events] = useState(buildTimeline);

  useEffect(() => { setCurrentPage('activity-timeline'); }, [setCurrentPage]);

  const filtered = typeFilter === 'ALL' ? events : events.filter(e => e.type === typeFilter);

  const formatTime = (ts: string) => {
    try {
      return new Date(ts).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
      });
    } catch { return ts; }
  };

  return (
    <div className="flex flex-col h-full" style={{ height: 'calc(100vh - 56px)' }}>
      <PageHeader
        title="Activity Timeline"
        subtitle="Chronological security event feed"
        icon={<Clock size={16} />}
      />
      {/* Filters */}
      <div className="flex items-center gap-2 px-4 py-3 shrink-0 flex-wrap" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Type:</span>
        <button onClick={() => setTypeFilter('ALL')}
          className="text-xs px-2.5 py-1 rounded transition-all"
          style={typeFilter === 'ALL' ? { background: 'var(--color-primary)', color: '#fff' } : { background: 'var(--color-bg-elevated)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
          All ({events.length})
        </button>
        {Object.entries(typeConfig).map(([type, cfg]) => (
          <button key={type} onClick={() => setTypeFilter(type)}
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded transition-all"
            style={typeFilter === type
              ? { background: cfg.color, color: '#fff' }
              : { background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
            {cfg.icon}
            {cfg.label} ({events.filter(e => e.type === type).length})
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto">
          {filtered.map((event, i) => {
            const cfg = typeConfig[event.type];
            return (
              <div key={event.id} className="flex gap-4 mb-4">
                {/* Timeline spine */}
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}40` }}>
                    {cfg.icon}
                  </div>
                  {i < filtered.length - 1 && (
                    <div className="w-px flex-1 mt-1" style={{ background: 'var(--color-border)', minHeight: '24px' }} />
                  )}
                </div>
                {/* Event card */}
                <div className="flex-1 pb-2">
                  <div
                    className="card p-3"
                    style={{ borderLeft: `2px solid ${cfg.color}60` }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: cfg.bg, color: cfg.color, fontSize: '10px' }}>
                          {cfg.label.toUpperCase()}
                        </span>
                        {event.sector && (
                          <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(100,116,139,0.12)', color: '#94a3b8', fontSize: '10px' }}>
                            {event.sector}
                          </span>
                        )}
                        {event.severity && (
                          <span className="text-xs font-bold" style={{
                            color: event.severity === 'CRITICAL' ? '#ff2020' : event.severity === 'HIGH' ? '#ef4444' : event.severity === 'MEDIUM' ? '#f59e0b' : '#3b82f6',
                          }}>
                            {event.severity}
                          </span>
                        )}
                        <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)', fontSize: '10px' }}>{event.id}</span>
                      </div>
                      <span className="text-xs shrink-0 font-mono" style={{ color: 'var(--color-text-disabled)', fontSize: '10px' }}>
                        {formatTime(event.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{event.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{event.description}</p>
                    {event.actor && (
                      <p className="text-xs mt-1" style={{ color: 'var(--color-text-disabled)' }}>by {event.actor}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ActivityTimeline;
