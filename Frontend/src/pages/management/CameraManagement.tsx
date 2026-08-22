import React, { useState, useEffect } from 'react';
import { Camera as CameraIcon, Plus, Edit2, Trash2, RefreshCw, Wifi, WifiOff, Activity } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { cameras } from '../../data/cameras';
import { Camera } from '../../types';
import { StatusBadge, SectorBadge, SearchBar, FilterButton, PageHeader, StatCard, ProgressBar, Btn } from '../../components/common';

const CameraManagement: React.FC = () => {
  const { setCurrentPage } = useAppStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [selected, setSelected] = useState<Camera | null>(cameras[0]);

  useEffect(() => { setCurrentPage('camera-management'); }, [setCurrentPage]);

  const filtered = cameras.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchSector = sectorFilter === 'ALL' || c.sector === sectorFilter;
    return matchSearch && matchStatus && matchSector;
  });

  return (
    <div className="flex flex-col h-full" style={{ height: 'calc(100vh - 56px)' }}>
      <PageHeader
        title="Camera Management"
        subtitle={`${cameras.length} cameras across ${[...new Set(cameras.map(c => c.sector))].length} sectors`}
        icon={<CameraIcon size={16} />}
        actions={
          <div className="flex items-center gap-2">
            <SearchBar value={search} onChange={setSearch} placeholder="Search cameras..." className="w-48" />
            <Btn variant="primary" size="sm" icon={<Plus size={13} />}>Add Camera</Btn>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <StatCard icon={<Wifi size={16} />} label="Online" value={cameras.filter(c => c.status === 'ONLINE').length} sub="Active cameras" accent="var(--color-success)" />
        <StatCard icon={<WifiOff size={16} />} label="Offline" value={cameras.filter(c => c.status === 'OFFLINE').length} sub="No signal" accent="var(--color-danger)" />
        <StatCard icon={<Activity size={16} />} label="Degraded" value={cameras.filter(c => c.status === 'DEGRADED').length} sub="Reduced quality" accent="var(--color-warning)" />
        <StatCard icon={<CameraIcon size={16} />} label="AI Enabled" value={cameras.filter(c => c.aiMonitoring).length} sub="Active AI" accent="var(--color-primary)" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-2 shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Status:</span>
        {['ALL', 'ONLINE', 'OFFLINE', 'DEGRADED', 'MAINTENANCE'].map(s => (
          <FilterButton key={s} label={s} active={statusFilter === s} onClick={() => setStatusFilter(s)} />
        ))}
        <span className="text-xs ml-2" style={{ color: 'var(--color-text-muted)' }}>Sector:</span>
        {['ALL', 'NORTH', 'EAST', 'WEST', 'CENTRAL', 'SOUTH'].map(s => (
          <FilterButton key={s} label={s} active={sectorFilter === s} onClick={() => setSectorFilter(s)} />
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Camera table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-10" style={{ background: 'var(--color-bg-elevated)' }}>
              <tr>
                {['Camera', 'Status', 'Type', 'Resolution/FPS', 'Sector', 'AI', 'Detections', 'Alerts', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(cam => (
                <tr key={cam.id}
                  onClick={() => setSelected(cam)}
                  className="cursor-pointer transition-colors hover:bg-white/2"
                  style={{
                    borderBottom: '1px solid var(--color-border)',
                    background: selected?.id === cam.id ? 'rgba(59,130,246,0.06)' : 'transparent',
                  }}>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{cam.name}</p>
                      <p className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>{cam.id} · {cam.ipAddress}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={cam.status} size="sm" /></td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(100,116,139,0.12)', color: '#94a3b8' }}>
                      {cam.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {cam.resolution} · {cam.fps}fps
                  </td>
                  <td className="px-4 py-3"><SectorBadge sector={cam.sector} /></td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold ${cam.aiMonitoring ? 'text-green-400' : 'text-slate-500'}`}>
                      {cam.aiMonitoring ? '✓ ON' : '— OFF'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold" style={{ color: 'var(--color-primary-light)' }}>
                    {cam.detectionCount}
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold" style={{ color: cam.alerts > 0 ? 'var(--color-danger)' : 'var(--color-text-muted)' }}>
                    {cam.alerts}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="p-1 rounded hover:bg-white/5" style={{ color: 'var(--color-text-muted)' }} title="Edit">
                        <Edit2 size={12} />
                      </button>
                      <button className="p-1 rounded hover:bg-white/5" style={{ color: 'var(--color-text-muted)' }} title="Restart">
                        <RefreshCw size={12} />
                      </button>
                      <button className="p-1 rounded hover:bg-white/5" style={{ color: '#ef4444' }} title="Remove">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right detail panel */}
        {selected && (
          <div className="hidden xl:flex flex-col w-72 shrink-0 overflow-y-auto p-4 gap-4"
            style={{ borderLeft: '1px solid var(--color-border)', background: 'var(--color-bg-surface)' }}>
            <div className="card p-4">
              <h3 className="text-xs font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>CAMERA DETAIL</h3>
              <div className="flex items-center justify-between mb-3">
                <StatusBadge status={selected.status} />
                <SectorBadge sector={selected.sector} />
              </div>
              <div className="space-y-2 text-xs">
                {[
                  { label: 'Camera ID', value: selected.id },
                  { label: 'Name', value: selected.name },
                  { label: 'Type', value: selected.type },
                  { label: 'Location', value: selected.location },
                  { label: 'IP Address', value: selected.ipAddress },
                  { label: 'Resolution', value: selected.resolution },
                  { label: 'FPS', value: selected.fps.toString() },
                  { label: 'Coverage', value: selected.coverage },
                  { label: 'AI Monitoring', value: selected.aiMonitoring ? 'Enabled' : 'Disabled' },
                  { label: 'Detections', value: selected.detectionCount.toString() },
                  { label: 'Alerts', value: selected.alerts.toString() },
                  { label: 'Last Activity', value: selected.lastActivity },
                  { label: 'Installer', value: selected.installer || 'N/A' },
                  { label: 'Installed Date', value: selected.installedDate || 'N/A' },
                ].map(item => (
                  <div key={item.label} className="flex justify-between gap-2">
                    <span style={{ color: 'var(--color-text-muted)' }}>{item.label}</span>
                    <span className="font-medium text-right" style={{ color: 'var(--color-text-secondary)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Health metrics */}
            <div className="card p-4">
              <h3 className="text-xs font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>HEALTH METRICS</h3>
              {[
                { label: 'Signal Strength', value: selected.status === 'ONLINE' ? 87 : 0, color: '#10b981' },
                { label: 'Frame Drop Rate', value: selected.status === 'DEGRADED' ? 30 : 3, color: '#3b82f6' },
                { label: 'Storage Used', value: 68, color: '#a78bfa' },
                { label: 'AI CPU Usage', value: selected.aiMonitoring ? 45 : 0, color: '#f59e0b' },
              ].map(m => (
                <div key={m.label} className="mb-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: 'var(--color-text-muted)' }}>{m.label}</span>
                    <span style={{ color: m.color }}>{m.value}%</span>
                  </div>
                  <ProgressBar value={m.value} color={m.color} height={3} />
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <Btn variant="primary" size="sm" className="w-full justify-center" icon={<RefreshCw size={12} />}>Restart Feed</Btn>
              <Btn variant="secondary" size="sm" className="w-full justify-center" icon={<Edit2 size={12} />}>Edit Configuration</Btn>
              {!selected.aiMonitoring && <Btn variant="success" size="sm" className="w-full justify-center">Enable AI</Btn>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraManagement;
