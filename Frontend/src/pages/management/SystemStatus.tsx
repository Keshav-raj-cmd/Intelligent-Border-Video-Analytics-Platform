import React, { useEffect } from 'react';
import { Cpu, HardDrive, Activity, Wifi, CheckCircle, AlertTriangle, Server } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { systemComponents, storageMetrics } from '../../data/analytics';
import { PageHeader, StatCard, ProgressBar } from '../../components/common';

const SystemStatus: React.FC = () => {
  const { setCurrentPage } = useAppStore();
  useEffect(() => { setCurrentPage('system-status'); }, [setCurrentPage]);

  const operational = systemComponents.filter(c => c.status === 'OPERATIONAL').length;
  const degraded = systemComponents.filter(c => c.status === 'DEGRADED').length;
  const offline = systemComponents.filter(c => c.status === 'OFFLINE').length;

  const statusColor: Record<string, string> = {
    OPERATIONAL: '#10b981', DEGRADED: '#f59e0b', OFFLINE: '#ef4444',
    STANDBY: '#64748b', MAINTENANCE: '#94a3b8',
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ height: 'calc(100vh - 56px)' }}>
      <PageHeader
        title="System Status"
        subtitle="AI engines, infrastructure, and storage health"
        icon={<Cpu size={16} />}
      />
      <div className="grid grid-cols-3 gap-3 px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <StatCard icon={<CheckCircle size={16} />} label="Operational" value={operational} sub="All systems nominal" accent="var(--color-success)" />
        <StatCard icon={<AlertTriangle size={16} />} label="Degraded" value={degraded} sub="Reduced capacity" accent="var(--color-warning)" />
        <StatCard icon={<AlertTriangle size={16} />} label="Offline" value={offline} sub="Not responding" accent="var(--color-danger)" />
      </div>

      <div className="flex-1 p-4 grid grid-cols-12 gap-4">

        {/* System components */}
        <div className="col-span-12 lg:col-span-7 space-y-3">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>System Components</h3>
          {systemComponents.map(sys => (
            <div key={sys.id} className="card p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: statusColor[sys.status] || '#94a3b8' }} />
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{sys.name}</p>
                    <span className="text-xs px-1.5 py-0.5 rounded font-medium"
                      style={{ background: `${statusColor[sys.status] || '#94a3b8'}18`, color: statusColor[sys.status] || '#94a3b8' }}>
                      {sys.status}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    {sys.type} · {sys.location}
                  </p>
                </div>
                <div className="text-right text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  <p>Uptime: <span style={{ color: parseFloat(sys.uptime as string) >= 99 ? '#10b981' : '#f59e0b' }}>{sys.uptime}%</span></p>
                  <p>Load: <span style={{ color: 'var(--color-text-secondary)' }}>{sys.load ?? sys.loadAvg ?? 0}%</span></p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {sys.cpuUsage !== undefined && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: 'var(--color-text-muted)' }}>CPU</span>
                      <span style={{ color: sys.cpuUsage > 80 ? '#ef4444' : '#10b981' }}>{sys.cpuUsage}%</span>
                    </div>
                    <ProgressBar value={sys.cpuUsage} color={sys.cpuUsage > 80 ? '#ef4444' : '#10b981'} height={4} />
                  </div>
                )}
                {sys.memoryUsage !== undefined && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: 'var(--color-text-muted)' }}>Memory</span>
                      <span style={{ color: sys.memoryUsage > 80 ? '#f59e0b' : '#3b82f6' }}>{sys.memoryUsage}%</span>
                    </div>
                    <ProgressBar value={sys.memoryUsage} color={sys.memoryUsage > 80 ? '#f59e0b' : '#3b82f6'} height={4} />
                  </div>
                )}
                {sys.networkLatency !== undefined && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: 'var(--color-text-muted)' }}>Latency</span>
                      <span style={{ color: 'var(--color-text-secondary)' }}>{sys.networkLatency}ms</span>
                    </div>
                    <ProgressBar value={Math.min(sys.networkLatency / 2, 100)} color="#a78bfa" height={4} />
                  </div>
                )}
              </div>
              {sys.lastMaintenance && (
                <p className="text-xs mt-2" style={{ color: 'var(--color-text-disabled)' }}>
                  Last maintenance: {sys.lastMaintenance} · Next: {sys.nextMaintenance || 'N/A'}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Storage and network */}
        <div className="col-span-12 lg:col-span-5 space-y-4">
          {/* Storage */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>Storage Utilization</h3>
            {storageMetrics.map(s => (
              <div key={s.id} className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>{s.name}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {s.used} / {s.total} · {s.type}
                    </p>
                  </div>
                  <span className="text-xs font-bold" style={{ color: s.usagePercent > 90 ? '#ef4444' : s.usagePercent > 75 ? '#f59e0b' : '#10b981' }}>
                    {s.usagePercent}%
                  </span>
                </div>
                <ProgressBar
                  value={s.usagePercent}
                  color={s.usagePercent > 90 ? '#ef4444' : s.usagePercent > 75 ? '#f59e0b' : '#10b981'}
                  height={6}
                />
              </div>
            ))}
          </div>

          {/* Network status */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>Network Status</h3>
            {[
              { label: 'Primary Fiber Link', status: 'ONLINE', latency: '< 1ms', bw: '1 Gbps' },
              { label: 'Backup Cellular Link', status: 'STANDBY', latency: '45ms', bw: '50 Mbps' },
              { label: 'VSAT Satellite', status: 'ONLINE', latency: '550ms', bw: '10 Mbps' },
              { label: 'Inter-BOP Radio', status: 'ONLINE', latency: '12ms', bw: '5 Mbps' },
            ].map(net => (
              <div key={net.label} className="flex items-center justify-between py-2"
                style={{ borderBottom: '1px solid var(--color-border)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: net.status === 'ONLINE' ? '#10b981' : '#64748b' }} />
                  <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{net.label}</span>
                </div>
                <div className="text-right text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  <span>{net.latency} · {net.bw}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>System Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Restart AI Engine', color: '#3b82f6', icon: '🔄' },
                { label: 'Clear Cache', color: '#a78bfa', icon: '🗑️' },
                { label: 'Run Diagnostics', color: '#10b981', icon: '🔍' },
                { label: 'Backup Config', color: '#f59e0b', icon: '💾' },
              ].map(action => (
                <button key={action.label}
                  className="flex items-center gap-2 p-2.5 rounded text-left text-xs font-medium hover:opacity-80 transition-opacity"
                  style={{ background: `${action.color}10`, border: `1px solid ${action.color}20`, color: action.color }}>
                  <span>{action.icon}</span>
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SystemStatus;
