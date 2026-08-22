import React, { useState, useEffect } from 'react';
import { UserSquare, User, Plus, Filter } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { intelligenceContacts } from '../../data/cases';
import { IntelligenceContact } from '../../types';
import { ThreatLevelBadge, StatusBadge, PriorityBadge, SearchBar, FilterButton, PageHeader, StatCard, SectorBadge } from '../../components/common';

const IntelligenceContacts: React.FC = () => {
  const { setCurrentPage } = useAppStore();
  const [search, setSearch] = useState('');
  const [threatFilter, setThreatFilter] = useState('ALL');
  const [selected, setSelected] = useState<IntelligenceContact | null>(intelligenceContacts[0]);
  const [view, setView] = useState<'cards' | 'table'>('cards');

  useEffect(() => { setCurrentPage('intelligence-contacts'); }, [setCurrentPage]);

  const filtered = intelligenceContacts.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      (c.alias && c.alias.toLowerCase().includes(search.toLowerCase()));
    const matchThreat = threatFilter === 'ALL' || c.threatLevel === threatFilter;
    return matchSearch && matchThreat;
  });

  return (
    <div className="flex flex-col h-full" style={{ height: 'calc(100vh - 56px)' }}>
      <PageHeader
        title="Intelligence Contacts"
        subtitle="Person intelligence and threat profiles"
        icon={<UserSquare size={16} />}
        actions={
          <div className="flex items-center gap-2">
            <SearchBar value={search} onChange={setSearch} placeholder="Search contacts..." className="w-48" />
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium hover:opacity-80"
              style={{ background: 'rgba(59,130,246,0.12)', color: 'var(--color-primary)', border: '1px solid rgba(59,130,246,0.25)' }}>
              <Plus size={13} /> Add Contact
            </button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <StatCard icon={<User size={16} />} label="Total Contacts" value={intelligenceContacts.length} accent="var(--color-primary)" />
        <StatCard icon={<User size={16} />} label="Extreme Threat" value={intelligenceContacts.filter(c => c.threatLevel === 'EXTREME').length} accent="var(--color-critical)" />
        <StatCard icon={<User size={16} />} label="Active" value={intelligenceContacts.filter(c => c.status === 'ACTIVE').length} accent="var(--color-warning)" />
        <StatCard icon={<User size={16} />} label="Critical Priority" value={intelligenceContacts.filter(c => c.priority === 'CRITICAL').length} accent="var(--color-danger)" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 px-4 py-2 shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Threat:</span>
        {['ALL', 'EXTREME', 'HIGH', 'MEDIUM', 'LOW'].map(t => (
          <FilterButton key={t} label={t} active={threatFilter === t} onClick={() => setThreatFilter(t)} />
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(contact => (
              <div
                key={contact.id}
                onClick={() => setSelected(contact)}
                className="card p-4 cursor-pointer transition-all"
                style={{
                  border: selected?.id === contact.id ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                  borderLeft: `3px solid ${contact.threatLevel === 'EXTREME' ? '#ff2020' : contact.threatLevel === 'HIGH' ? '#ef4444' : contact.threatLevel === 'MEDIUM' ? '#f59e0b' : '#10b981'}`,
                }}
              >
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: 'var(--color-bg-elevated)', border: '2px solid var(--color-border)' }}>
                    <User size={20} style={{ color: 'var(--color-text-muted)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{contact.name}</p>
                    {contact.alias && (
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>a.k.a. "{contact.alias}"</p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-1">
                      <ThreatLevelBadge level={contact.threatLevel} size="sm" />
                      <PriorityBadge priority={contact.priority} size="sm" />
                      <StatusBadge status={contact.status} size="sm" />
                    </div>
                  </div>
                </div>
                <div className="mt-2 space-y-1 text-xs">
                  <div><span style={{ color: 'var(--color-text-muted)' }}>Region: </span><span style={{ color: 'var(--color-text-secondary)' }}>{contact.region}</span></div>
                  <div><span style={{ color: 'var(--color-text-muted)' }}>Last Location: </span><span style={{ color: 'var(--color-text-secondary)' }}>{contact.lastKnownLocation}</span></div>
                  <div><span style={{ color: 'var(--color-text-muted)' }}>Category: </span><span style={{ color: 'var(--color-text-secondary)' }}>{contact.category}</span></div>
                  <div><span style={{ color: 'var(--color-text-muted)' }}>Officer: </span><span style={{ color: 'var(--color-text-secondary)' }}>{contact.assignedOfficer}</span></div>
                  <div className="pt-1 border-t text-xs italic" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                    {contact.recentActivity}
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <SectorBadge sector={contact.sector} />
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {contact.relatedCases.length} case{contact.relatedCases.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="hidden xl:flex flex-col w-72 shrink-0 overflow-y-auto p-4 gap-4"
            style={{ borderLeft: '1px solid var(--color-border)', background: 'var(--color-bg-surface)' }}>
            <div className="card p-4">
              <div className="text-center mb-3">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2"
                  style={{ background: 'var(--color-bg-elevated)', border: '2px solid var(--color-border)' }}>
                  <User size={28} style={{ color: 'var(--color-text-muted)' }} />
                </div>
                <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{selected.name}</p>
                {selected.alias && <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>"{selected.alias}"</p>}
                <div className="flex justify-center gap-2 mt-2 flex-wrap">
                  <ThreatLevelBadge level={selected.threatLevel} />
                  <StatusBadge status={selected.status} />
                </div>
              </div>
              <div className="space-y-1.5 text-xs">
                {[
                  { label: 'Contact ID', value: selected.id },
                  { label: 'Category', value: selected.category },
                  { label: 'Nationality', value: selected.nationality },
                  { label: 'Age', value: selected.age ? `${selected.age} yrs` : 'Unknown' },
                  { label: 'Region', value: selected.region },
                  { label: 'Last Location', value: selected.lastKnownLocation },
                  { label: 'Officer', value: selected.assignedOfficer },
                  { label: 'Added', value: selected.addedDate },
                  { label: 'Updated', value: selected.lastUpdated },
                ].map(item => (
                  <div key={item.label} className="flex justify-between">
                    <span style={{ color: 'var(--color-text-muted)' }}>{item.label}</span>
                    <span className="font-medium text-right" style={{ color: 'var(--color-text-secondary)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
              {selected.relatedCases.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>RELATED CASES</p>
                  {selected.relatedCases.map(c => (
                    <span key={c} className="inline-block text-xs px-2 py-0.5 rounded mr-1 mb-1"
                      style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}>
                      {c}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-3 p-2 rounded text-xs italic" style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-muted)' }}>
                {selected.recentActivity}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntelligenceContacts;
