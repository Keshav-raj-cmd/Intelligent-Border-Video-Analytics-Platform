import React, { useState, useEffect } from 'react';
import { Network, User, Search, AlertTriangle, Eye, Link2 } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { criminalProfiles } from '../../data/criminalProfiles';
import { CriminalProfile } from '../../types';
import { ThreatLevelBadge, StatusBadge, SearchBar, FilterButton, PageHeader, StatCard } from '../../components/common';

// ── Simple Network Graph ──
const NetworkGraph: React.FC<{ profile: CriminalProfile }> = ({ profile }) => {
  const nodes = [
    { id: profile.id, label: profile.name.split(' ')[0], type: 'PERSON', x: 50, y: 50, color: '#ef4444', size: 24 },
    ...profile.connections.map((connId, i) => {
      const conn = criminalProfiles.find(p => p.id === connId);
      return {
        id: connId, label: conn?.name.split(' ')[0] || connId, type: 'PERSON',
        x: i % 2 === 0 ? 25 : 75, y: i < 2 ? 25 : 75, color: '#a78bfa', size: 18,
      };
    }),
    { id: 'loc1', label: profile.lastKnownLocation.split('–')[0]?.trim() || 'Location', type: 'LOCATION', x: 80, y: 25, color: '#10b981', size: 16 },
    ...profile.associatedCases.slice(0, 2).map((caseId, i) => ({
      id: caseId, label: caseId, type: 'CASE', x: i === 0 ? 20 : 80, y: 75, color: '#f59e0b', size: 16,
    })),
  ];

  return (
    <div className="relative rounded-lg overflow-hidden" style={{ height: '240px', background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }}>
      {/* Grid */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'radial-gradient(var(--color-border) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }} />

      <svg className="absolute inset-0 w-full h-full">
        {/* Connection lines */}
        {nodes.slice(1).map(node => (
          <line key={node.id}
            x1={`${nodes[0].x}%`} y1={`${nodes[0].y}%`}
            x2={`${node.x}%`} y2={`${node.y}%`}
            stroke="rgba(100,116,139,0.3)" strokeWidth="1" strokeDasharray="4,4"
          />
        ))}
      </svg>

      {/* Nodes */}
      {nodes.map(node => (
        <div key={node.id}
          className="network-node absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
          style={{ left: `${node.x}%`, top: `${node.y}%` }}>
          <div
            className="rounded-full flex items-center justify-center font-bold"
            style={{
              width: node.size, height: node.size,
              background: `${node.color}25`,
              border: `2px solid ${node.color}`,
              color: node.color,
              fontSize: '8px',
              boxShadow: `0 0 8px ${node.color}40`,
            }}
          >
            {node.type === 'PERSON' ? <User size={node.size * 0.45} /> :
             node.type === 'LOCATION' ? '📍' : '📁'}
          </div>
          <span className="text-xs whitespace-nowrap" style={{ color: node.color, fontSize: '8px', background: 'rgba(0,0,0,0.6)', padding: '1px 3px', borderRadius: '2px' }}>
            {node.label}
          </span>
        </div>
      ))}

      {/* Legend */}
      <div className="absolute bottom-2 right-2 text-xs space-y-1">
        {[
          { color: '#ef4444', label: 'Subject' },
          { color: '#a78bfa', label: 'Associate' },
          { color: '#10b981', label: 'Location' },
          { color: '#f59e0b', label: 'Case' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ background: l.color }} />
            <span style={{ color: 'var(--color-text-muted)', fontSize: '9px' }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Profile Card ──
const ProfileCard: React.FC<{ profile: CriminalProfile; selected: boolean; onClick: () => void }> = ({
  profile, selected, onClick,
}) => (
  <div
    onClick={onClick}
    className="card p-4 cursor-pointer transition-all"
    style={{
      border: selected ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
      borderLeft: `3px solid ${profile.threatLevel === 'EXTREME' ? '#ff2020' : profile.threatLevel === 'HIGH' ? '#ef4444' : profile.threatLevel === 'MEDIUM' ? '#f59e0b' : '#10b981'}`,
    }}
  >
    <div className="flex gap-3">
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
        style={{ background: 'var(--color-bg-elevated)', border: '2px solid var(--color-border)' }}>
        <User size={20} style={{ color: 'var(--color-text-muted)' }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{profile.name}</p>
          <ThreatLevelBadge level={profile.threatLevel} size="sm" />
          <StatusBadge status={profile.status} size="sm" />
        </div>
        <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
          {profile.alias.length > 0 ? `a.k.a. "${profile.alias.join(', ')}"` : 'No known alias'}
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
          {[
            { label: 'ID', value: profile.id },
            { label: 'Region', value: profile.region },
            { label: 'Category', value: profile.category },
            { label: 'Last Seen', value: profile.lastSeen ? new Date(profile.lastSeen).toLocaleDateString('en-IN') : 'Unknown' },
          ].map(item => (
            <div key={item.label} className="text-xs">
              <span style={{ color: 'var(--color-text-muted)' }}>{item.label}: </span>
              <span style={{ color: 'var(--color-text-secondary)' }}>{item.value}</span>
            </div>
          ))}
        </div>
        <p className="text-xs mt-1.5" style={{ color: 'var(--color-text-muted)' }}>
          {profile.associatedCases.length} case{profile.associatedCases.length !== 1 ? 's' : ''} · Officer: {profile.assignedOfficer}
        </p>
      </div>
    </div>
  </div>
);

const CriminalNetwork: React.FC = () => {
  const { setCurrentPage } = useAppStore();
  const [search, setSearch] = useState('');
  const [threatFilter, setThreatFilter] = useState('ALL');
  const [selected, setSelected] = useState<CriminalProfile>(criminalProfiles[0]);

  useEffect(() => { setCurrentPage('criminal-network'); }, [setCurrentPage]);

  const filtered = criminalProfiles.filter(p => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.alias.some(a => a.toLowerCase().includes(search.toLowerCase()));
    const matchThreat = threatFilter === 'ALL' || p.threatLevel === threatFilter;
    return matchSearch && matchThreat;
  });

  return (
    <div className="flex flex-col h-full" style={{ height: 'calc(100vh - 56px)' }}>
      <PageHeader
        title="Criminal Identification Network"
        subtitle="Intelligence database · Person identification"
        icon={<Network size={16} />}
        accent="var(--color-danger)"
        actions={<SearchBar value={search} onChange={setSearch} placeholder="Search by name, ID, alias..." className="w-64" />}
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <StatCard icon={<AlertTriangle size={16} />} label="Total Profiles" value={criminalProfiles.length} accent="var(--color-primary)" />
        <StatCard icon={<AlertTriangle size={16} />} label="Extreme Threat" value={criminalProfiles.filter(p => p.threatLevel === 'EXTREME').length} accent="var(--color-critical)" />
        <StatCard icon={<Eye size={16} />} label="Wanted" value={criminalProfiles.filter(p => p.status === 'WANTED').length} accent="var(--color-danger)" />
        <StatCard icon={<Link2 size={16} />} label="Monitoring" value={criminalProfiles.filter(p => p.status === 'MONITORING').length} accent="var(--color-warning)" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 px-4 py-2 shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Threat:</span>
        {['ALL', 'EXTREME', 'HIGH', 'MEDIUM', 'LOW'].map(t => (
          <FilterButton key={t} label={t} active={threatFilter === t} onClick={() => setThreatFilter(t)}
            color={t === 'EXTREME' ? '#ff2020' : t === 'HIGH' ? '#ef4444' : t === 'MEDIUM' ? '#f59e0b' : 'var(--color-primary)'} />
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Profile list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.map(profile => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              selected={selected?.id === profile.id}
              onClick={() => setSelected(profile)}
            />
          ))}
        </div>

        {/* Right detail panel */}
        {selected && (
          <div className="hidden xl:flex flex-col w-80 shrink-0 overflow-y-auto p-4 gap-4"
            style={{ borderLeft: '1px solid var(--color-border)', background: 'var(--color-bg-surface)' }}>
            {/* Profile header */}
            <div className="card p-4">
              <div className="flex flex-col items-center text-center mb-3">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-2"
                  style={{ background: 'var(--color-bg-elevated)', border: '2px solid var(--color-border)' }}>
                  <User size={28} style={{ color: 'var(--color-text-muted)' }} />
                </div>
                <h3 className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{selected.name}</h3>
                {selected.alias.length > 0 && (
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>"{selected.alias.join(', ')}"</p>
                )}
                <div className="flex gap-2 mt-2">
                  <ThreatLevelBadge level={selected.threatLevel} />
                  <StatusBadge status={selected.status} />
                </div>
              </div>
              <div className="space-y-1.5">
                {[
                  { label: 'Person ID', value: selected.id },
                  { label: 'Age', value: `${selected.age} yrs` },
                  { label: 'Gender', value: selected.gender },
                  { label: 'Nationality', value: selected.nationality },
                  { label: 'Region', value: selected.region },
                  { label: 'Category', value: selected.category },
                  { label: 'Last Location', value: selected.lastKnownLocation },
                  { label: 'ID Status', value: selected.identificationStatus },
                  { label: 'Officer', value: selected.assignedOfficer },
                ].map(item => (
                  <div key={item.label} className="flex justify-between text-xs">
                    <span style={{ color: 'var(--color-text-muted)' }}>{item.label}</span>
                    <span className="font-medium text-right" style={{ color: 'var(--color-text-secondary)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{selected.description}</p>
            </div>

            {/* Network visualization */}
            <div className="card p-4">
              <h3 className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>NETWORK MAP</h3>
              <NetworkGraph profile={selected} />
            </div>

            {/* Associated cases */}
            {selected.associatedCases.length > 0 && (
              <div className="card p-4">
                <h3 className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>ASSOCIATED CASES</h3>
                <div className="space-y-1">
                  {selected.associatedCases.map(caseId => (
                    <div key={caseId} className="flex items-center gap-2 text-xs py-1">
                      <span style={{ color: 'var(--color-primary)' }}>📁</span>
                      <span style={{ color: 'var(--color-text-secondary)' }}>{caseId}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CriminalNetwork;
