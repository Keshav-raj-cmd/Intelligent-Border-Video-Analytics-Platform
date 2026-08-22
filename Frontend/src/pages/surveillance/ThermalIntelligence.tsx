import React, { useEffect } from 'react';
import { Thermometer, Target, Activity, Eye } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { thermalTargets } from '../../data/detections';
import { PageHeader, StatCard, StatusBadge } from '../../components/common';

const ThermalCameraFeed: React.FC<{ hasTarget?: boolean; targetX?: number; targetY?: number; targetSize?: number }> = ({
  hasTarget, targetX = 45, targetY = 35, targetSize = 8,
}) => (
  <div className="relative camera-feed-thermal rounded-lg overflow-hidden" style={{ height: '200px' }}>
    {/* Thermal gradient overlay */}
    <div className="absolute inset-0" style={{
      background: 'radial-gradient(ellipse at 70% 50%, rgba(30,5,5,0.9) 0%, rgba(10,2,2,0.95) 100%)',
    }} />
    {/* Scan line */}
    <div className="scan-line" />
    {/* Cold background elements */}
    <div className="absolute" style={{ left: '10%', top: '50%', width: '25%', height: '35%', background: 'rgba(0,10,40,0.6)', borderRadius: '2px' }} />
    <div className="absolute" style={{ right: '15%', top: '40%', width: '20%', height: '30%', background: 'rgba(0,5,30,0.5)', borderRadius: '2px' }} />

    {/* Human heat signature */}
    {hasTarget && (
      <div className="absolute" style={{ left: `${targetX}%`, top: `${targetY}%`, width: `${targetSize}%`, height: `${targetSize * 2}%` }}>
        {/* Body heat */}
        <div className="w-full h-full" style={{
          background: 'radial-gradient(ellipse, rgba(255,120,0,0.85) 0%, rgba(255,60,0,0.5) 40%, rgba(200,20,0,0.2) 70%, transparent 100%)',
          borderRadius: '40%',
          boxShadow: '0 0 16px rgba(255,100,0,0.6)',
        }} />
        {/* Head */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full"
          style={{ width: '60%', height: '40%', background: 'radial-gradient(circle, rgba(255,160,0,0.9) 0%, rgba(255,100,0,0.6) 100%)' }} />
        {/* Target crosshair */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="border-2 rounded-full" style={{ width: '130%', height: '150%', borderColor: 'rgba(255,200,0,0.5)', top: '-25%', left: '-15%', position: 'absolute' }} />
        </div>
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs px-1 py-0.5 rounded whitespace-nowrap"
          style={{ background: 'rgba(255,100,0,0.85)', color: '#fff', fontSize: '8px' }}>
          HUMAN 36.8°C
        </div>
      </div>
    )}

    {/* Temperature scale */}
    <div className="absolute right-2 top-2 bottom-2 w-3 rounded overflow-hidden">
      <div className="w-full h-full thermal-gradient opacity-70" />
    </div>
    <div className="absolute right-6 top-2 flex flex-col justify-between text-xs h-full py-1"
      style={{ color: '#94a3b8', fontSize: '8px' }}>
      <span>40°</span>
      <span>25°</span>
      <span>10°</span>
    </div>

    {/* THERMAL badge */}
    <div className="absolute top-2 left-2 text-xs px-1.5 py-0.5 rounded font-bold"
      style={{ background: 'rgba(180,40,0,0.85)', color: '#fff', fontSize: '8px' }}>THERMAL IR</div>
  </div>
);

const ThermalTargetCard: React.FC<{ target: typeof thermalTargets[0] }> = ({ target }) => {
  const movColor = target.movement === 'DETECTED' ? '#f59e0b' : target.movement === 'STATIONARY' ? '#3b82f6' : '#64748b';
  const typeColor = target.targetType === 'HUMAN' ? '#ef4444' : target.targetType === 'VEHICLE' ? '#a78bfa' : '#64748b';

  return (
    <div className="card p-4" style={{ borderLeft: `3px solid ${typeColor}` }}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold font-mono" style={{ color: 'var(--color-text-primary)' }}>{target.id}</span>
            <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: `${typeColor}18`, color: typeColor }}>
              {target.targetType}
            </span>
          </div>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{target.location}</p>
        </div>
        <span className="text-xs px-2 py-1 rounded" style={{ background: `${movColor}15`, color: movColor }}>
          {target.movement}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Camera', value: target.camera },
          { label: 'Distance', value: `${target.distance}m` },
          { label: 'Confidence', value: `${target.confidence}%` },
          { label: 'Temperature', value: target.temperature ? `${target.temperature}°C` : 'N/A' },
          { label: 'Detected', value: new Date(target.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }) },
        ].map(item => (
          <div key={item.label} className="text-xs">
            <span style={{ color: 'var(--color-text-muted)' }}>{item.label}: </span>
            <span style={{ color: 'var(--color-text-secondary)' }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ThermalIntelligence: React.FC = () => {
  const { setCurrentPage } = useAppStore();

  useEffect(() => { setCurrentPage('thermal-intelligence'); }, [setCurrentPage]);

  return (
    <div className="flex flex-col h-full" style={{ height: 'calc(100vh - 56px)' }}>
      <PageHeader
        title="Thermal Intelligence"
        subtitle="Infrared surveillance · Heat signature analysis"
        icon={<Thermometer size={16} />}
        accent="#dc2626"
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <StatCard icon={<Target size={16} />} label="Active Targets" value={thermalTargets.filter(t => t.movement !== 'LOST').length} sub="All thermal cameras" accent="#dc2626" />
        <StatCard icon={<Activity size={16} />} label="Moving Targets" value={thermalTargets.filter(t => t.movement === 'DETECTED').length} sub="In motion" accent="var(--color-warning)" />
        <StatCard icon={<Eye size={16} />} label="Human Signatures" value={thermalTargets.filter(t => t.targetType === 'HUMAN').length} sub="Detected" accent="#ef4444" />
        <StatCard icon={<Thermometer size={16} />} label="Thermal Cameras" value={2} sub="Operational" accent="var(--color-success)" />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Thermal camera previews */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card overflow-hidden">
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>North Road Thermal</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>BOP North – KM 12 · CAM-003</p>
                  </div>
                  <StatusBadge status="ONLINE" size="sm" />
                </div>
                <ThermalCameraFeed hasTarget targetX={45} targetY={30} targetSize={7} />
                <div className="mt-2 flex items-center gap-2 text-xs" style={{ color: 'var(--color-warning)' }}>
                  <Target size={11} /> Target T-204 detected · 42m · 36.8°C
                </div>
              </div>
            </div>

            <div className="card overflow-hidden">
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>South Thermal Overwatch</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>South Sector – OP Delta · CAM-012</p>
                  </div>
                  <StatusBadge status="ONLINE" size="sm" />
                </div>
                <ThermalCameraFeed hasTarget targetX={60} targetY={40} targetSize={6} />
                <div className="mt-2 flex items-center gap-2 text-xs" style={{ color: 'var(--color-primary-light)' }}>
                  <Target size={11} /> Target T-203 stationary · 87m · 37.1°C
                </div>
              </div>
            </div>
          </div>

          {/* Active targets */}
          <div>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
              Detected Thermal Targets
            </h3>
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
              {thermalTargets.map(target => (
                <ThermalTargetCard key={target.id} target={target} />
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="hidden xl:flex flex-col w-64 shrink-0 p-4 overflow-y-auto"
          style={{ borderLeft: '1px solid var(--color-border)', background: 'var(--color-bg-surface)' }}>
          <h3 className="text-xs font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>THERMAL STATUS</h3>
          <div className="space-y-2 mb-4">
            {[
              { label: 'Detection Range', value: '500m' },
              { label: 'Temperature Range', value: '−20°C to 60°C' },
              { label: 'Resolution', value: '640×480' },
              { label: 'Frame Rate', value: '15 fps' },
              { label: 'Fog Penetration', value: 'Yes' },
              { label: 'Rain Compensation', value: 'Active' },
            ].map(item => (
              <div key={item.label} className="flex justify-between text-xs">
                <span style={{ color: 'var(--color-text-muted)' }}>{item.label}</span>
                <span style={{ color: 'var(--color-text-secondary)' }}>{item.value}</span>
              </div>
            ))}
          </div>

          <h3 className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>HEAT SCALE</h3>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 h-4 rounded thermal-gradient" style={{ opacity: 0.8 }} />
            <div className="text-xs flex flex-col justify-between" style={{ color: 'var(--color-text-muted)' }}>
              <span style={{ fontSize: '9px' }}>Hot</span>
              <span style={{ fontSize: '9px' }}>Cold</span>
            </div>
          </div>

          <h3 className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>TARGET LEGEND</h3>
          {[
            { type: 'Human', color: '#ef4444', desc: 'Body heat 36–38°C' },
            { type: 'Vehicle', color: '#a78bfa', desc: 'Engine heat 50–80°C' },
            { type: 'Animal', color: '#f59e0b', desc: 'Variable 35–40°C' },
            { type: 'Unknown', color: '#64748b', desc: 'Unclassified signature' },
          ].map(item => (
            <div key={item.type} className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: item.color, opacity: 0.8 }} />
              <div>
                <span className="text-xs font-medium" style={{ color: item.color }}>{item.type}</span>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)', fontSize: '10px' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThermalIntelligence;
