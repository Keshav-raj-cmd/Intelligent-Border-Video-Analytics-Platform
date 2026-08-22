import React, { useState, useEffect } from 'react';
import {
  Video, Grid3x3, LayoutGrid, Pause, Play, Volume2, VolumeX,
  Maximize2, Camera as CameraIcon, ChevronUp, ChevronDown,
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Crosshair,
  RotateCcw, Wifi, WifiOff, AlertTriangle, Search,
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { cameras } from '../../data/cameras';
import { Camera } from '../../types';
import { SearchBar, StatusBadge, SectorBadge, FilterButton, PageHeader } from '../../components/common';

// ── Camera Feed visual simulation ──
const CameraFeed: React.FC<{ camera: Camera; large?: boolean }> = ({ camera, large }) => {
  const isOffline = camera.status === 'OFFLINE';
  const isNight = camera.type === 'NIGHT_VISION';
  const isThermal = camera.type === 'THERMAL';

  const overlays = [
    camera.detectionCount > 20 && { label: 'PERSON', confidence: 96, x: 25, y: 30, color: '#3b82f6' },
    camera.type === 'ANPR' && { label: 'VEHICLE', confidence: 92, x: 55, y: 55, color: '#a78bfa' },
    camera.alerts > 0 && { label: 'ALERT ZONE', confidence: null, x: 60, y: 20, color: '#ef4444' },
  ].filter(Boolean);

  return (
    <div
      className={`relative w-full ${large ? 'h-64' : 'h-40'} rounded overflow-hidden ${
        isNight ? 'camera-feed-night' : isThermal ? 'camera-feed-thermal' : 'camera-feed'
      }`}
    >
      {isOffline ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <WifiOff size={large ? 32 : 20} style={{ color: '#64748b' }} />
          <span className="text-xs font-medium" style={{ color: '#64748b' }}>CAMERA OFFLINE</span>
        </div>
      ) : (
        <>
          {/* Scan line animation */}
          <div className="scan-line" />

          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }} />

          {/* Simulated scene elements */}
          <div className="absolute inset-0">
            {/* Road/horizon line */}
            <div className="absolute bottom-1/3 left-0 right-0 h-px" style={{ background: 'rgba(100,116,139,0.2)' }} />
            {/* Tree silhouette */}
            <div className="absolute bottom-1/3 left-1/4" style={{ width: 3, height: 30, background: 'rgba(30,50,30,0.8)' }} />
            {/* Another element */}
            <div className="absolute bottom-1/3 right-1/3" style={{ width: 4, height: 20, background: 'rgba(30,50,30,0.6)' }} />
          </div>

          {/* Detection overlays */}
          {overlays.map((ov: any, i) => (
            <div key={i} className="detection-box" style={{
              left: `${ov.x}%`, top: `${ov.y}%`,
              width: ov.label === 'PERSON' ? '18%' : '22%',
              height: ov.label === 'PERSON' ? '25%' : '18%',
              borderColor: ov.color,
            }}>
              <div
                className="absolute -top-5 left-0 text-xs px-1 rounded"
                style={{ background: `${ov.color}cc`, color: '#fff', fontSize: '9px', whiteSpace: 'nowrap' }}
              >
                {ov.label} {ov.confidence && `${ov.confidence}%`}
              </div>
            </div>
          ))}

          {/* Thermal people shapes */}
          {isThermal && (
            <div className="absolute inset-0">
              <div className="absolute rounded-full" style={{
                width: '12%', height: '20%', left: '40%', bottom: '35%',
                background: 'radial-gradient(ellipse, rgba(255,100,0,0.7) 0%, rgba(255,50,0,0.3) 60%, transparent 100%)',
              }} />
            </div>
          )}

          {/* Night vision tint */}
          {isNight && (
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(0,60,20,0.2)' }} />
          )}

          {/* LIVE badge */}
          <div className="absolute top-2 left-2">
            <span className="live-indicator text-xs font-bold px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(239,68,68,0.85)', color: '#fff', fontSize: '9px' }}>
              LIVE
            </span>
          </div>

          {/* Camera ID */}
          <div className="absolute top-2 right-2 text-xs font-mono px-1 rounded"
            style={{ background: 'rgba(0,0,0,0.6)', color: '#94a3b8', fontSize: '9px' }}>
            {camera.id}
          </div>

          {/* Time overlay */}
          <div className="absolute bottom-2 right-2 text-xs font-mono"
            style={{ color: '#94a3b8', fontSize: '9px' }}>
            {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
          </div>
        </>
      )}
    </div>
  );
};

// ── Camera Card ──
const CameraCard: React.FC<{
  camera: Camera;
  selected: boolean;
  onSelect: () => void;
  compact?: boolean;
}> = ({ camera, selected, onSelect, compact }) => {
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);

  return (
    <div
      onClick={onSelect}
      className="card overflow-hidden cursor-pointer transition-all duration-150"
      style={{
        border: selected ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
        boxShadow: selected ? '0 0 0 1px var(--color-primary)' : 'none',
      }}
    >
      <CameraFeed camera={camera} large={!compact} />

      {/* Camera info */}
      <div className="p-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>{camera.name}</p>
            <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{camera.location}</p>
          </div>
          <StatusBadge status={camera.status} size="sm" />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5 mt-2">
          <button
            onClick={e => { e.stopPropagation(); setPaused(!paused); }}
            className="p-1 rounded hover:bg-white/5 transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {paused ? <Play size={12} /> : <Pause size={12} />}
          </button>
          <button
            onClick={e => { e.stopPropagation(); setMuted(!muted); }}
            className="p-1 rounded hover:bg-white/5"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {muted ? <VolumeX size={12} /> : <Volume2 size={12} />}
          </button>
          <button className="p-1 rounded hover:bg-white/5" style={{ color: 'var(--color-text-muted)' }}>
            <Maximize2 size={12} />
          </button>
          <div className="flex-1" />
          {camera.alerts > 0 && (
            <span className="text-xs flex items-center gap-1" style={{ color: 'var(--color-danger)' }}>
              <AlertTriangle size={10} /> {camera.alerts}
            </span>
          )}
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {camera.detectionCount} det
          </span>
        </div>
      </div>
    </div>
  );
};

// ── PTZ Controls ──
const PTZControls: React.FC<{ cameraId: string }> = ({ cameraId }) => (
  <div className="card p-4">
    <h4 className="text-xs font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>
      PTZ Control — {cameraId}
    </h4>
    <div className="grid grid-cols-3 gap-1.5 mb-3">
      <div />
      <button className="p-2 rounded text-center hover:bg-white/5 transition-colors" style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)' }}>
        <ChevronUp size={16} className="mx-auto" />
      </button>
      <div />
      <button className="p-2 rounded hover:bg-white/5" style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)' }}>
        <ChevronLeft size={16} className="mx-auto" />
      </button>
      <button className="p-2 rounded hover:bg-white/5" style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-primary)' }}>
        <Crosshair size={16} className="mx-auto" />
      </button>
      <button className="p-2 rounded hover:bg-white/5" style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)' }}>
        <ChevronRight size={16} className="mx-auto" />
      </button>
      <div />
      <button className="p-2 rounded hover:bg-white/5" style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)' }}>
        <ChevronDown size={16} className="mx-auto" />
      </button>
      <div />
    </div>
    <div className="flex gap-2 mb-3">
      <button className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-xs hover:opacity-80 transition-opacity" style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)' }}>
        <ZoomIn size={12} /> Zoom +
      </button>
      <button className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-xs hover:opacity-80" style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)' }}>
        <ZoomOut size={12} /> Zoom -
      </button>
    </div>
    <div>
      <p className="text-xs mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Presets</p>
      <div className="grid grid-cols-3 gap-1">
        {['Home', 'Gate', 'Perimeter', 'Road', 'OP-1', 'OP-2'].map(p => (
          <button key={p} className="py-1 rounded text-xs hover:opacity-80 transition-opacity"
            style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
            {p}
          </button>
        ))}
      </div>
    </div>
    <button className="w-full mt-2 flex items-center justify-center gap-1 py-1.5 rounded text-xs hover:opacity-80"
      style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-muted)' }}>
      <RotateCcw size={12} /> Reset
    </button>
  </div>
);

// ── Main Live Surveillance Page ──
const LiveSurveillance: React.FC = () => {
  const { setCurrentPage } = useAppStore();
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [layout, setLayout] = useState<'4' | '6' | '9'>('6');
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(cameras[0]);

  useEffect(() => { setCurrentPage('live-surveillance'); }, [setCurrentPage]);

  const sectors = ['ALL', 'NORTH', 'EAST', 'WEST', 'CENTRAL', 'SOUTH'];
  const statuses = ['ALL', 'ONLINE', 'OFFLINE', 'DEGRADED'];

  const filtered = cameras.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.location.toLowerCase().includes(search.toLowerCase());
    const matchSector = sectorFilter === 'ALL' || c.sector === sectorFilter;
    const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchSearch && matchSector && matchStatus;
  });

  const gridCount = parseInt(layout);

  return (
    <div className="flex h-full" style={{ height: 'calc(100vh - 56px)' }}>
      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 shrink-0 flex items-center gap-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <Video size={16} style={{ color: 'var(--color-primary)' }} />
          <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Live Surveillance</h2>
          <div className="flex-1" />
          {/* Layout switcher */}
          <div className="flex items-center gap-1 p-0.5 rounded" style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }}>
            {(['4', '6', '9'] as const).map(l => (
              <button key={l} onClick={() => setLayout(l)}
                className="px-2 py-1 rounded text-xs font-medium transition-all"
                style={layout === l ? { background: 'var(--color-primary)', color: '#fff' } : { color: 'var(--color-text-muted)' }}>
                {l === '4' ? <><Grid3x3 size={13} /></> : l === '6' ? <><LayoutGrid size={13} /></> : <><Grid3x3 size={13} className="opacity-50" /></>}
              </button>
            ))}
          </div>
          <SearchBar value={search} onChange={setSearch} placeholder="Search cameras..." className="w-48" />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 px-4 py-2 shrink-0 flex-wrap" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Sector:</span>
          {sectors.map(s => (
            <FilterButton key={s} label={s} active={sectorFilter === s} onClick={() => setSectorFilter(s)} />
          ))}
          <span className="text-xs ml-3" style={{ color: 'var(--color-text-muted)' }}>Status:</span>
          {statuses.map(s => (
            <FilterButton key={s} label={s} active={statusFilter === s} onClick={() => setStatusFilter(s)} />
          ))}
        </div>

        {/* Camera grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className={`grid gap-3 ${
            layout === '4' ? 'grid-cols-1 md:grid-cols-2' :
            layout === '6' ? 'grid-cols-2 lg:grid-cols-3' :
            'grid-cols-2 md:grid-cols-3 lg:grid-cols-3'
          }`}>
            {filtered.slice(0, gridCount).map(cam => (
              <CameraCard
                key={cam.id}
                camera={cam}
                selected={selectedCamera?.id === cam.id}
                onSelect={() => setSelectedCamera(cam)}
                compact={layout === '9'}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right panel: Selected camera details + PTZ */}
      {selectedCamera && (
        <div
          className="hidden lg:flex flex-col shrink-0 overflow-y-auto"
          style={{ width: '280px', borderLeft: '1px solid var(--color-border)', background: 'var(--color-bg-surface)' }}
        >
          <div className="p-4">
            <h3 className="text-xs font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>
              SELECTED CAMERA
            </h3>
            <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--color-text-primary)' }}>{selectedCamera.name}</p>
            <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>{selectedCamera.location}</p>

            <CameraFeed camera={selectedCamera} large />

            <div className="mt-3 space-y-2">
              {[
                { label: 'Camera ID', value: selectedCamera.id },
                { label: 'Type', value: selectedCamera.type },
                { label: 'Resolution', value: selectedCamera.resolution },
                { label: 'FPS', value: selectedCamera.fps },
                { label: 'Coverage', value: selectedCamera.coverage },
                { label: 'IP Address', value: selectedCamera.ipAddress },
                { label: 'Last Activity', value: selectedCamera.lastActivity },
                { label: 'AI Monitoring', value: selectedCamera.aiMonitoring ? 'Enabled' : 'Disabled' },
              ].map(item => (
                <div key={item.label} className="flex justify-between text-xs">
                  <span style={{ color: 'var(--color-text-muted)' }}>{item.label}</span>
                  <span className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="px-4 pb-4">
            {selectedCamera.type === 'PTZ' && <PTZControls cameraId={selectedCamera.id} />}
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveSurveillance;
