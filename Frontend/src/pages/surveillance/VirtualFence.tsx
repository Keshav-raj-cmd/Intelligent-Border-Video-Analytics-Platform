import React, { useState, useEffect } from 'react';
import { Shield, Plus, Edit2, Trash2, Power, PowerOff, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { FenceZone } from '../../types';
import { PageHeader, SeverityBadge, Btn } from '../../components/common';

const initialZones: FenceZone[] = [
  { id: 'FZ-001', name: 'Zone A – North Perimeter', type: 'BOUNDARY', enabled: true, camera: 'CAM-001', alertCount: 3, lastTriggered: '2026-08-22T19:10:18', color: '#3b82f6' },
  { id: 'FZ-002', name: 'Zone B – Restricted Inner', type: 'RESTRICTED', enabled: true, camera: 'CAM-002', alertCount: 1, lastTriggered: '2026-08-22T21:10:34', color: '#ef4444' },
  { id: 'FZ-003', name: 'Zone C – Warning Buffer', type: 'WARNING', enabled: true, camera: 'CAM-001', alertCount: 5, lastTriggered: '2026-08-22T20:30:00', color: '#f59e0b' },
  { id: 'FZ-004', name: 'Entry Gate Alpha', type: 'ENTRY', enabled: true, camera: 'CAM-004', alertCount: 0, color: '#10b981' },
  { id: 'FZ-005', name: 'Exit Gate Bravo', type: 'EXIT', enabled: false, camera: 'CAM-005', alertCount: 0, color: '#10b981' },
];

const mockIntrusions = [
  { id: 'INT-001', zone: 'Zone B – Restricted Inner', severity: 'CRITICAL' as const, time: '21:10:34', camera: 'CAM-002', description: 'Unauthorized person crossed Virtual Fence Zone B.' },
  { id: 'INT-002', zone: 'Zone A – North Perimeter', severity: 'HIGH' as const, time: '19:10:18', camera: 'CAM-001', description: 'Two individuals crossed virtual boundary line.' },
  { id: 'INT-003', zone: 'Zone C – Warning Buffer', severity: 'MEDIUM' as const, time: '20:30:00', camera: 'CAM-001', description: 'Person detected in warning zone without clearance.' },
];

const FenceSurveillancePreview: React.FC<{ zones: FenceZone[] }> = ({ zones }) => {
  return (
    <div className="relative w-full rounded-lg overflow-hidden camera-feed" style={{ height: '340px' }}>
      <div className="scan-line" />
      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)',
        backgroundSize: '30px 30px',
      }} />

      {/* Zone overlays */}
      {zones.filter(z => z.enabled).map((zone) => {
        const zoneStyle: Record<FenceZone['type'], { left: string; top: string; width: string; height: string }> = {
          BOUNDARY: { left: '10%', top: '10%', width: '80%', height: '80%' },
          RESTRICTED: { left: '30%', top: '25%', width: '40%', height: '40%' },
          WARNING: { left: '20%', top: '18%', width: '60%', height: '60%' },
          ENTRY: { left: '5%', top: '40%', width: '12%', height: '20%' },
          EXIT: { left: '83%', top: '40%', width: '12%', height: '20%' },
        };
        const pos = zoneStyle[zone.type];
        return (
          <div
            key={zone.id}
            className="absolute fence-zone"
            style={{
              ...pos,
              borderColor: zone.color,
              background: `${zone.color}08`,
              borderStyle: zone.type === 'BOUNDARY' ? 'solid' : 'dashed',
              borderWidth: zone.type === 'BOUNDARY' ? '2px' : '1.5px',
            }}
          >
            <div className="absolute -top-5 left-1 text-xs px-1 rounded"
              style={{ background: `${zone.color}cc`, color: '#fff', fontSize: '9px', whiteSpace: 'nowrap' }}>
              {zone.name}
            </div>
            {zone.alertCount > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: 'var(--color-danger)', color: '#fff', fontSize: '9px' }}>
                {zone.alertCount}
              </div>
            )}
          </div>
        );
      })}

      {/* LIVE badge */}
      <div className="absolute top-3 left-3">
        <span className="live-indicator text-xs font-bold px-1.5 py-0.5 rounded"
          style={{ background: 'rgba(239,68,68,0.85)', color: '#fff', fontSize: '9px' }}>LIVE</span>
      </div>

      {/* Camera label */}
      <div className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded font-mono"
        style={{ background: 'rgba(0,0,0,0.7)', color: '#94a3b8', fontSize: '9px' }}>BOP NORTH – VIRTUAL FENCE VIEW</div>

      {/* Simulated intrusion person */}
      <div className="absolute" style={{ left: '35%', top: '38%', width: '4%', height: '10%' }}>
        <div className="w-full h-full" style={{
          background: 'rgba(239,68,68,0.4)',
          boxShadow: '0 0 8px rgba(239,68,68,0.6)',
          borderRadius: '2px',
        }} />
        <div className="absolute -top-4 -left-2 text-xs px-1 rounded"
          style={{ background: 'rgba(239,68,68,0.85)', color: '#fff', fontSize: '8px', whiteSpace: 'nowrap' }}>
          INTRUDER
        </div>
      </div>
    </div>
  );
};

const VirtualFence: React.FC = () => {
  const { setCurrentPage } = useAppStore();
  const [zones, setZones] = useState<FenceZone[]>(initialZones);

  useEffect(() => { setCurrentPage('virtual-fence'); }, [setCurrentPage]);

  const toggleZone = (id: string) => {
    setZones(z => z.map(zone => zone.id === id ? { ...zone, enabled: !zone.enabled } : zone));
  };

  const typeColor: Record<string, string> = {
    RESTRICTED: '#ef4444', WARNING: '#f59e0b', BOUNDARY: '#3b82f6', ENTRY: '#10b981', EXIT: '#10b981',
  };

  return (
    <div className="flex flex-col h-full" style={{ height: 'calc(100vh - 56px)' }}>
      <PageHeader
        title="Virtual Fence"
        subtitle="Zone configuration and intrusion monitoring"
        icon={<Shield size={16} />}
        actions={
          <div className="flex items-center gap-2">
            <Btn variant="primary" size="sm" icon={<Plus size={13} />}>Add Zone</Btn>
          </div>
        }
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Main surveillance preview */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <FenceSurveillancePreview zones={zones} />

          {/* Active Intrusion Alerts */}
          <div>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
              Recent Intrusion Alerts
            </h3>
            <div className="space-y-2">
              {mockIntrusions.map(alert => (
                <div key={alert.id}
                  className="flex items-start gap-3 p-3 rounded-lg"
                  style={{
                    background: alert.severity === 'CRITICAL' ? 'rgba(255,32,32,0.06)' : 'var(--color-bg-elevated)',
                    border: `1px solid ${alert.severity === 'CRITICAL' ? 'rgba(255,32,32,0.25)' : 'var(--color-border)'}`,
                  }}>
                  <AlertTriangle size={16} style={{ color: alert.severity === 'CRITICAL' ? '#ff2020' : alert.severity === 'HIGH' ? '#ef4444' : '#f59e0b', marginTop: '2px' }} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <SeverityBadge severity={alert.severity} size="sm" />
                      <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{alert.zone}</span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {alert.description}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-disabled)' }}>
                      {alert.camera} · {alert.time}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Btn variant="secondary" size="sm">Acknowledge</Btn>
                    <Btn variant="danger" size="sm">Investigate</Btn>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Zone configuration panel */}
        <div className="hidden xl:flex flex-col w-72 shrink-0 overflow-y-auto p-4"
          style={{ borderLeft: '1px solid var(--color-border)', background: 'var(--color-bg-surface)' }}>
          <h3 className="text-xs font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>ZONE CONFIGURATION</h3>
          <div className="space-y-3">
            {zones.map(zone => (
              <div key={zone.id} className="card p-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="w-2 h-2 rounded-sm" style={{ background: zone.color }} />
                      <span className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>{zone.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs px-1.5 py-0.5 rounded"
                        style={{ background: `${typeColor[zone.type] || '#64748b'}18`, color: typeColor[zone.type] || '#94a3b8', fontSize: '10px' }}>
                        {zone.type}
                      </span>
                      {zone.alertCount > 0 && (
                        <span className="text-xs" style={{ color: 'var(--color-danger)' }}>
                          {zone.alertCount} alerts
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleZone(zone.id)}
                    className="p-1.5 rounded transition-colors"
                    style={{
                      background: zone.enabled ? 'rgba(16,185,129,0.12)' : 'rgba(100,116,139,0.12)',
                      color: zone.enabled ? '#10b981' : '#64748b',
                    }}
                    title={zone.enabled ? 'Disable Zone' : 'Enable Zone'}
                  >
                    {zone.enabled ? <Power size={13} /> : <PowerOff size={13} />}
                  </button>
                </div>
                <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  <span>Camera: {zone.camera}</span>
                </div>
                {zone.lastTriggered && (
                  <div className="text-xs mt-1" style={{ color: 'var(--color-text-disabled)' }}>
                    Last triggered: {new Date(zone.lastTriggered).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </div>
                )}
                <div className="flex gap-1 mt-2">
                  <button className="flex-1 flex items-center justify-center gap-1 py-1 rounded text-xs hover:opacity-80"
                    style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
                    <Edit2 size={10} /> Edit
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1 py-1 rounded text-xs hover:opacity-80"
                    style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <Trash2 size={10} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Zone legend */}
          <div className="mt-4 card p-3">
            <h4 className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>LEGEND</h4>
            {[
              { type: 'RESTRICTED', color: '#ef4444', desc: 'No entry permitted' },
              { type: 'WARNING', color: '#f59e0b', desc: 'Approach alert zone' },
              { type: 'BOUNDARY', color: '#3b82f6', desc: 'Outer perimeter' },
              { type: 'ENTRY/EXIT', color: '#10b981', desc: 'Designated gates' },
            ].map(item => (
              <div key={item.type} className="flex items-center gap-2 mb-1.5">
                <span className="w-3 h-3 rounded-sm" style={{ background: item.color, opacity: 0.8 }} />
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  <strong style={{ color: item.color }}>{item.type}</strong>: {item.desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualFence;
