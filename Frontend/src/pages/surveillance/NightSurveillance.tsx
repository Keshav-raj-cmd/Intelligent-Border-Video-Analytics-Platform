import React, { useState, useEffect } from 'react';
import { Moon, Activity, Eye, AlertTriangle, Clock } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { cameras } from '../../data/cameras';
import { PageHeader, StatCard, StatusBadge } from '../../components/common';

const NightCameraFeed: React.FC<{ name: string; id: string; active: boolean; motionDetected?: boolean }> = ({
  name, id, active, motionDetected,
}) => (
  <div className="card overflow-hidden">
    <div className="relative camera-feed-night rounded-t-lg overflow-hidden" style={{ height: '160px' }}>
      {active ? (
        <>
          <div className="scan-line" />
          {/* Night vision green tint */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(0,60,20,0.25)' }} />
          {/* Grid */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'linear-gradient(rgba(0,255,80,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,80,0.15) 1px, transparent 1px)',
            backgroundSize: '25px 25px',
          }} />
          {/* Horizon */}
          <div className="absolute bottom-1/3 left-0 right-0 h-px" style={{ background: 'rgba(0,200,60,0.15)' }} />
          {/* Motion indicator */}
          {motionDetected && (
            <div className="absolute" style={{ left: '45%', top: '30%', width: '8%', height: '15%',
              background: 'rgba(0,255,80,0.25)', border: '1px solid rgba(0,255,80,0.5)', borderRadius: '2px' }}>
              <div className="absolute -top-5 -left-2 text-xs px-1 rounded"
                style={{ background: 'rgba(0,200,60,0.85)', color: '#000', fontSize: '8px', whiteSpace: 'nowrap' }}>
                MOTION
              </div>
            </div>
          )}
          <div className="absolute top-2 left-2">
            <span style={{ background: 'rgba(0,180,60,0.85)', color: '#000', fontSize: '8px' }}
              className="px-1.5 py-0.5 rounded font-bold">NIGHT IR</span>
          </div>
          <div className="absolute top-2 right-2 text-xs font-mono"
            style={{ background: 'rgba(0,0,0,0.7)', color: '#4ade80', fontSize: '8px', padding: '2px 4px', borderRadius: '2px' }}>
            {id}
          </div>
          <div className="absolute bottom-2 left-2 right-2 flex justify-between text-xs"
            style={{ color: 'rgba(0,200,60,0.7)', fontSize: '8px' }}>
            <span>LOW-LIGHT ENHANCED</span>
            <span>{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</span>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <Moon size={24} style={{ color: '#1d4ed8', opacity: 0.5 }} />
          <span className="text-xs" style={{ color: '#64748b' }}>OFFLINE</span>
        </div>
      )}
    </div>
    <div className="p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>{name}</p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Night Vision · IR Active</p>
        </div>
        <StatusBadge status={active ? 'ONLINE' : 'OFFLINE'} size="sm" />
      </div>
      {motionDetected && (
        <div className="mt-2 flex items-center gap-1.5 text-xs px-2 py-1 rounded"
          style={{ background: 'rgba(0,200,60,0.08)', border: '1px solid rgba(0,200,60,0.2)', color: '#4ade80' }}>
          <Activity size={11} /> Motion detected
        </div>
      )}
    </div>
  </div>
);

const MovementTimeline: React.FC = () => {
  const events = [
    { time: '21:10', event: 'Motion detected', camera: 'CAM-001', sector: 'NORTH', severity: 'HIGH' },
    { time: '20:45', event: 'Curfew movement detected', camera: 'CAM-007', sector: 'WEST', severity: 'MEDIUM' },
    { time: '20:30', event: 'Group activity', camera: 'CAM-012', sector: 'SOUTH', severity: 'MEDIUM' },
    { time: '19:55', event: 'Thermal target lost', camera: 'CAM-012', sector: 'SOUTH', severity: 'LOW' },
    { time: '19:30', event: 'Animal detected', camera: 'CAM-003', sector: 'NORTH', severity: 'INFO' },
    { time: '18:45', event: 'Patrol route verified', camera: 'CAM-011', sector: 'SOUTH', severity: 'INFO' },
  ];

  const severityColor: Record<string, string> = {
    HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#3b82f6', INFO: '#64748b',
  };

  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
        Night Movement Timeline
      </h3>
      <div className="space-y-2">
        {events.map((ev, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="flex flex-col items-center shrink-0">
              <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>{ev.time}</span>
              {i < events.length - 1 && <div className="w-px flex-1 mt-1" style={{ background: 'var(--color-border)', minHeight: '16px' }} />}
            </div>
            <div className="flex-1 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: severityColor[ev.severity] }} />
                <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>{ev.event}</span>
              </div>
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{ev.camera} · {ev.sector}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const NightSurveillance: React.FC = () => {
  const { setCurrentPage } = useAppStore();

  useEffect(() => { setCurrentPage('night-surveillance'); }, [setCurrentPage]);

  const nightCameras = cameras.filter(c => c.type === 'NIGHT_VISION' || c.sector === 'NORTH' || c.sector === 'WEST');

  return (
    <div className="flex flex-col h-full" style={{ height: 'calc(100vh - 56px)' }}>
      <PageHeader
        title="Night Surveillance"
        subtitle="Low-light monitoring · IR cameras active"
        icon={<Moon size={16} />}
        accent="#1d4ed8"
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <StatCard icon={<Eye size={16} />} label="Night Cameras" value={cameras.filter(c => c.type === 'NIGHT_VISION').length} sub="IR active" accent="#1d4ed8" />
        <StatCard icon={<Activity size={16} />} label="Motion Events" value={4} sub="Last 6 hours" accent="var(--color-warning)" />
        <StatCard icon={<AlertTriangle size={16} />} label="Night Alerts" value={2} sub="Active" accent="var(--color-danger)" />
        <StatCard icon={<Clock size={16} />} label="Curfew Status" value="ACTIVE" sub="20:00 – 06:00 hrs" accent="var(--color-success)" />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Night camera grid */}
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
            <NightCameraFeed name="BOP North Gate Alpha" id="CAM-001" active={true} motionDetected={true} />
            <NightCameraFeed name="West Sector Night Cam" id="CAM-007" active={true} motionDetected={false} />
            <NightCameraFeed name="North Gate Night Vision" id="CAM-014" active={false} />
            <NightCameraFeed name="South Patrol Road" id="CAM-011" active={true} motionDetected={false} />
            <NightCameraFeed name="BOP North Perimeter East" id="CAM-002" active={true} motionDetected={true} />
            <NightCameraFeed name="West Border Road" id="CAM-008" active={true} motionDetected={false} />
          </div>

          <MovementTimeline />
        </div>

        {/* Right: Night alert panel */}
        <div className="hidden xl:flex flex-col w-64 shrink-0 p-4 overflow-y-auto"
          style={{ borderLeft: '1px solid var(--color-border)', background: 'var(--color-bg-surface)' }}>
          <h3 className="text-xs font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>NIGHT ALERTS</h3>
          <div className="space-y-3">
            {[
              { time: '21:10', severity: 'CRITICAL', title: 'Border intrusion', camera: 'CAM-001' },
              { time: '20:45', severity: 'MEDIUM', title: 'Curfew violation', camera: 'CAM-007' },
              { time: '20:30', severity: 'MEDIUM', title: 'Group gathering', camera: 'CAM-012' },
            ].map((a, i) => (
              <div key={i} className="p-2 rounded"
                style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs font-bold" style={{ color: a.severity === 'CRITICAL' ? '#ff2020' : a.severity === 'HIGH' ? '#ef4444' : '#f59e0b' }}>
                    {a.severity}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{a.time}</span>
                </div>
                <p className="text-xs" style={{ color: 'var(--color-text-primary)' }}>{a.title}</p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{a.camera}</p>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <h3 className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>LOW-LIGHT STATUS</h3>
            <div className="space-y-2">
              {[
                { label: 'IR Illumination', value: 'Active', color: '#10b981' },
                { label: 'Fog Density', value: 'Low', color: '#10b981' },
                { label: 'Visibility', value: '350m', color: '#10b981' },
                { label: 'Moon Phase', value: 'Crescent', color: '#94a3b8' },
                { label: 'Cloud Cover', value: 'Partial', color: '#f59e0b' },
              ].map(item => (
                <div key={item.label} className="flex justify-between text-xs">
                  <span style={{ color: 'var(--color-text-muted)' }}>{item.label}</span>
                  <span style={{ color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NightSurveillance;
