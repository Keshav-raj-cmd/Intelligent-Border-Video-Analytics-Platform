import React, { useState, useEffect } from 'react';
import { Car, AlertTriangle, Flag, Search, ChevronRight, Eye } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { vehicles } from '../../data/vehicles';
import { Vehicle } from '../../types';
import { SearchBar, FilterButton, SectorBadge, PageHeader, StatCard, Btn } from '../../components/common';

const PlateDisplay: React.FC<{ plate: string; flagged: boolean }> = ({ plate, flagged }) => (
  <div className="relative camera-feed rounded overflow-hidden" style={{ height: '70px' }}>
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        className="px-4 py-2 rounded font-mono font-bold text-lg tracking-widest"
        style={{
          background: flagged ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)',
          border: `2px solid ${flagged ? '#ef4444' : 'rgba(255,255,255,0.15)'}`,
          color: flagged ? '#ef4444' : '#f1f5f9',
        }}
      >
        {plate}
      </div>
    </div>
    {flagged && (
      <div className="absolute top-1 right-1 text-xs flex items-center gap-1 px-1.5 py-0.5 rounded"
        style={{ background: 'rgba(239,68,68,0.85)', color: '#fff', fontSize: '9px' }}>
        <AlertTriangle size={9} /> FLAGGED
      </div>
    )}
    <div className="absolute top-1 left-1 text-xs px-1 rounded"
      style={{ background: 'rgba(0,0,0,0.7)', color: '#94a3b8', fontSize: '8px' }}>
      ANPR
    </div>
  </div>
);

const VehicleANPR: React.FC = () => {
  const { setCurrentPage } = useAppStore();
  const [search, setSearch] = useState('');
  const [dirFilter, setDirFilter] = useState('ALL');
  const [selected, setSelected] = useState<Vehicle | null>(vehicles[0]);
  const [showFlagged, setShowFlagged] = useState(false);

  useEffect(() => { setCurrentPage('vehicle-anpr'); }, [setCurrentPage]);

  const filtered = vehicles.filter(v => {
    const matchSearch =
      v.plateNumber.toLowerCase().includes(search.toLowerCase()) ||
      v.type.toLowerCase().includes(search.toLowerCase()) ||
      v.color.toLowerCase().includes(search.toLowerCase());
    const matchDir = dirFilter === 'ALL' || v.direction === dirFilter;
    const matchFlagged = !showFlagged || v.flagged;
    return matchSearch && matchDir && matchFlagged;
  });

  const flagged = vehicles.filter(v => v.flagged).length;
  const watchlisted = vehicles.filter(v => v.watchlisted).length;

  return (
    <div className="flex flex-col h-full" style={{ height: 'calc(100vh - 56px)' }}>
      <PageHeader
        title="Vehicle & ANPR Intelligence"
        subtitle={`${vehicles.length} vehicles detected today`}
        icon={<Car size={16} />}
        actions={
          <div className="flex items-center gap-2">
            <Btn variant={showFlagged ? 'danger' : 'secondary'} size="sm" icon={<Flag size={13} />}
              onClick={() => setShowFlagged(!showFlagged)}>
              {showFlagged ? 'All' : 'Flagged Only'}
            </Btn>
            <SearchBar value={search} onChange={setSearch} placeholder="Search plate, type..." className="w-48" />
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <StatCard icon={<Car size={16} />} label="Total Vehicles" value={vehicles.length} sub="Today" accent="var(--color-primary)" />
        <StatCard icon={<AlertTriangle size={16} />} label="Flagged" value={flagged} sub="Need review" accent="var(--color-danger)" />
        <StatCard icon={<Flag size={16} />} label="Watchlisted" value={watchlisted} sub="DB match" accent="var(--color-warning)" />
        <StatCard icon={<ChevronRight size={16} />} label="Inbound" value={vehicles.filter(v => v.direction === 'INBOUND').length} sub="Entry lane" accent="var(--color-success)" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 px-4 py-2 shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Direction:</span>
        {['ALL', 'INBOUND', 'OUTBOUND', 'CROSSING', 'UNKNOWN'].map(d => (
          <FilterButton key={d} label={d} active={dirFilter === d} onClick={() => setDirFilter(d)} />
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Vehicle list */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(v => (
              <div
                key={v.id}
                onClick={() => setSelected(v)}
                className="card overflow-hidden cursor-pointer transition-all"
                style={{ border: selected?.id === v.id ? '1px solid var(--color-primary)' : '1px solid var(--color-border)' }}
              >
                {/* Plate */}
                <div className="p-3">
                  <PlateDisplay plate={v.plateNumber} flagged={v.flagged} />
                </div>

                <div className="px-3 pb-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{v.plateNumber}</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{v.type} · {v.color}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded" style={{
                      background: v.direction === 'INBOUND' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                      color: v.direction === 'INBOUND' ? '#10b981' : '#ef4444',
                    }}>
                      {v.direction}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { label: 'Camera', value: v.camera.replace('East Checkpoint ', '').replace('BOP North ', '') },
                      { label: 'Confidence', value: `${v.confidence}%` },
                      { label: 'State', value: v.registrationState || 'Unknown' },
                      { label: 'Time', value: new Date(v.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }) },
                    ].map(item => (
                      <div key={item.label} className="text-xs">
                        <span style={{ color: 'var(--color-text-muted)' }}>{item.label}: </span>
                        <span style={{ color: 'var(--color-text-secondary)' }}>{item.value}</span>
                      </div>
                    ))}
                  </div>

                  {v.flagReason && (
                    <div className="flex items-start gap-1.5 px-2 py-1.5 rounded text-xs"
                      style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
                      <AlertTriangle size={11} className="shrink-0 mt-0.5" />
                      {v.flagReason}
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    <SectorBadge sector={v.sector} />
                    {v.watchlisted && (
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
                        WATCHLIST
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected vehicle detail */}
        {selected && (
          <div className="hidden xl:block w-72 shrink-0 overflow-y-auto p-4"
            style={{ borderLeft: '1px solid var(--color-border)', background: 'var(--color-bg-surface)' }}>
            <h3 className="text-xs font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>VEHICLE DETAIL</h3>
            <PlateDisplay plate={selected.plateNumber} flagged={selected.flagged} />
            <div className="mt-3 space-y-2">
              {[
                { label: 'Vehicle ID', value: selected.id },
                { label: 'Plate Number', value: selected.plateNumber },
                { label: 'Vehicle Type', value: selected.type },
                { label: 'Color', value: selected.color },
                { label: 'Owner', value: selected.ownerName || 'Unknown' },
                { label: 'State', value: selected.registrationState || 'Unknown' },
                { label: 'Camera', value: selected.camera },
                { label: 'Location', value: selected.location },
                { label: 'Sector', value: selected.sector },
                { label: 'Direction', value: selected.direction },
                { label: 'Confidence', value: `${selected.confidence}%` },
                { label: 'Detected', value: new Date(selected.timestamp).toLocaleString('en-IN') },
                { label: 'Watchlisted', value: selected.watchlisted ? 'YES' : 'No' },
                { label: 'Flagged', value: selected.flagged ? 'YES' : 'No' },
              ].map(item => (
                <div key={item.label} className="flex justify-between text-xs">
                  <span style={{ color: 'var(--color-text-muted)' }}>{item.label}</span>
                  <span className="font-medium text-right" style={{
                    color: (item.label === 'Watchlisted' || item.label === 'Flagged') && item.value !== 'No'
                      ? 'var(--color-danger)' : 'var(--color-text-secondary)',
                  }}>{item.value}</span>
                </div>
              ))}
            </div>
            {selected.flagReason && (
              <div className="mt-3 px-3 py-2 rounded text-xs"
                style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
                <strong>Flag Reason:</strong><br />{selected.flagReason}
              </div>
            )}
            <div className="mt-3 flex flex-col gap-2">
              <Btn variant="secondary" size="sm" icon={<Eye size={12} />} className="w-full justify-center">View Camera Feed</Btn>
              <Btn variant="danger" size="sm" icon={<AlertTriangle size={12} />} className="w-full justify-center">Raise Alert</Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleANPR;
