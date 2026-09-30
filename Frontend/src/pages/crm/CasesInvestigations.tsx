import React, { useState, useEffect } from 'react';
import { FolderOpen, Plus, ChevronRight, Search } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { cases } from '../../data/cases';
import { Case } from '../../types';
import { PriorityBadge, StatusBadge, SearchBar, FilterButton, PageHeader, StatCard, SectorBadge, Tabs, Btn } from '../../components/common';

const CasesInvestigations: React.FC = () => {
  const { setCurrentPage } = useAppStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [selected, setSelected] = useState<Case | null>(cases[0]);
  const [tab, setTab] = useState('overview');

  useEffect(() => { setCurrentPage('cases-investigations'); }, [setCurrentPage]);

  const filtered = cases.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchPriority = priorityFilter === 'ALL' || c.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const statusColors: Record<string, string> = {
    NEW: '#10b981', OPEN: '#3b82f6', INVESTIGATING: '#ef4444',
    MONITORING: '#f59e0b', ESCALATED: '#ff2020', RESOLVED: '#10b981', CLOSED: '#64748b',
  };

  return (
    <div className="flex flex-col h-full" style={{ height: 'calc(100vh - 56px)' }}>
      <PageHeader
        title="Cases & Investigations"
        subtitle={`${cases.filter(c => c.status !== 'CLOSED').length} active cases`}
        icon={<FolderOpen size={16} />}
        actions={
          <div className="flex items-center gap-2">
            <SearchBar value={search} onChange={setSearch} placeholder="Search cases..." className="w-48" />
            <Btn variant="primary" size="sm" icon={<Plus size={13} />}>Create Case</Btn>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <StatCard icon={<FolderOpen size={16} />} label="Total Cases" value={cases.length} accent="var(--color-primary)" />
        <StatCard icon={<FolderOpen size={16} />} label="Investigating" value={cases.filter(c => c.status === 'INVESTIGATING').length} accent="var(--color-danger)" />
        <StatCard icon={<FolderOpen size={16} />} label="Escalated" value={cases.filter(c => c.status === 'ESCALATED').length} accent="var(--color-critical)" />
        <StatCard icon={<FolderOpen size={16} />} label="Monitoring" value={cases.filter(c => c.status === 'MONITORING').length} accent="var(--color-warning)" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-2 shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Status:</span>
        {['ALL', 'NEW', 'OPEN', 'INVESTIGATING', 'MONITORING', 'ESCALATED', 'RESOLVED', 'CLOSED'].map(s => (
          <FilterButton key={s} label={s} active={statusFilter === s} onClick={() => setStatusFilter(s)} />
        ))}
        <span className="text-xs ml-2" style={{ color: 'var(--color-text-muted)' }}>Priority:</span>
        {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(p => (
          <FilterButton key={p} label={p} active={priorityFilter === p} onClick={() => setPriorityFilter(p)} />
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Cases list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filtered.map(c => (
            <div
              key={c.id}
              onClick={() => setSelected(c)}
              className="card p-4 cursor-pointer transition-all"
              style={{
                border: selected?.id === c.id ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                borderLeft: `3px solid ${statusColors[c.status] || '#64748b'}`,
              }}
            >
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-mono font-semibold" style={{ color: 'var(--color-primary)' }}>{c.id}</span>
                    <PriorityBadge priority={c.priority} size="sm" />
                    <StatusBadge status={c.status} size="sm" />
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(100,116,139,0.12)', color: '#94a3b8' }}>
                      {c.caseType}
                    </span>
                  </div>
                  <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>{c.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{c.description}</p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap text-xs">
                    <SectorBadge sector={c.sector} />
                    <span style={{ color: 'var(--color-text-muted)' }}>Officer: {c.assignedOfficer}</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>Unit: {c.assignedUnit}</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>Updated: {c.lastUpdated.split('T')[0]}</span>
                    {c.incidents > 0 && <span style={{ color: 'var(--color-danger)' }}>{c.incidents} incidents</span>}
                  </div>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-1">
                  <ChevronRight size={14} style={{ color: 'var(--color-text-muted)' }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Selected case detail */}
        {selected && (
          <div className="hidden xl:flex flex-col w-80 shrink-0 overflow-y-auto"
            style={{ borderLeft: '1px solid var(--color-border)', background: 'var(--color-bg-surface)' }}>
            <div className="px-4 pt-4">
              <Tabs
                tabs={[
                  { id: 'overview', label: 'Overview' },
                  { id: 'entities', label: 'Entities' },
                  { id: 'timeline', label: 'Activity' },
                ]}
                activeTab={tab}
                onTabChange={setTab}
              />
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {tab === 'overview' && (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <PriorityBadge priority={selected.priority} />
                      <StatusBadge status={selected.status} />
                    </div>
                    <h3 className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{selected.title}</h3>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{selected.description}</p>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    {[
                      { label: 'Case ID', value: selected.id },
                      { label: 'Type', value: selected.caseType },
                      { label: 'Region', value: selected.region },
                      { label: 'Sector', value: selected.sector },
                      { label: 'Officer', value: selected.assignedOfficer },
                      { label: 'Unit', value: selected.assignedUnit },
                      { label: 'Opened', value: selected.openedDate },
                      { label: 'Updated', value: selected.lastUpdated.split('T')[0] },
                      { label: 'Incidents', value: selected.incidents.toString() },
                      { label: 'Intel Inputs', value: selected.intelligenceInputs.toString() },
                    ].map(item => (
                      <div key={item.label} className="flex justify-between">
                        <span style={{ color: 'var(--color-text-muted)' }}>{item.label}</span>
                        <span className="font-medium text-right" style={{ color: 'var(--color-text-secondary)' }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                  {selected.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {selected.tags.map(tag => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded"
                          style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {tab === 'entities' && (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>LINKED PERSONS</p>
                    {selected.linkedPersons.length > 0 ? selected.linkedPersons.map(p => (
                      <div key={p} className="text-xs py-1 px-2 rounded mb-1" style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)' }}>
                        👤 {p}
                      </div>
                    )) : <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>None</p>}
                  </div>
                  <div>
                    <p className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>LINKED VEHICLES</p>
                    {selected.linkedVehicles.length > 0 ? selected.linkedVehicles.map(v => (
                      <div key={v} className="text-xs py-1 px-2 rounded mb-1" style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)' }}>
                        🚗 {v}
                      </div>
                    )) : <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>None</p>}
                  </div>
                  <div>
                    <p className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>LINKED CAMERAS</p>
                    {selected.linkedCameras.map(c => (
                      <div key={c} className="text-xs py-1 px-2 rounded mb-1" style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)' }}>
                        📷 {c}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {tab === 'timeline' && (
                <div className="space-y-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  <p>Activity timeline for {selected.id}</p>
                  {[
                    { time: '21:12', action: 'Case created by Insp. Amit Tomar' },
                    { time: '21:10', action: 'Alert ALT-2041 linked' },
                    { time: '21:08', action: 'Detection DET-3041 associated' },
                  ].map((ev, i) => (
                    <div key={i} className="flex gap-2 py-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <span className="font-mono" style={{ color: 'var(--color-text-disabled)' }}>{ev.time}</span>
                      <span style={{ color: 'var(--color-text-secondary)' }}>{ev.action}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CasesInvestigations;
