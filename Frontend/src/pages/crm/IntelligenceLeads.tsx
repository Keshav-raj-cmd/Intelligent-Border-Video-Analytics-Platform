import React, { useState, useEffect } from 'react';
import { Lightbulb, Plus } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { leads } from '../../data/cases';
import { Lead } from '../../types';
import { PriorityBadge, SearchBar, FilterButton, PageHeader, StatCard, SectorBadge } from '../../components/common';

const IntelligenceLeads: React.FC = () => {
  const { setCurrentPage } = useAppStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selected, setSelected] = useState<Lead | null>(leads[0]);

  useEffect(() => { setCurrentPage('intelligence-leads'); }, [setCurrentPage]);

  const filtered = leads.filter(l => {
    const matchSearch = l.description.toLowerCase().includes(search.toLowerCase()) || l.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const reliabilityColor: Record<string, string> = {
    A: '#10b981', B: '#3b82f6', C: '#f59e0b', D: '#ef4444', E: '#64748b',
  };

  const statusColor: Record<string, string> = {
    NEW: '#10b981', UNDER_REVIEW: '#f59e0b', VERIFIED: '#3b82f6',
    ACTIONED: '#a78bfa', DISMISSED: '#64748b',
  };

  return (
    <div className="flex flex-col h-full" style={{ height: 'calc(100vh - 56px)' }}>
      <PageHeader
        title="Intelligence Leads"
        subtitle="Actionable intelligence inputs"
        icon={<Lightbulb size={16} />}
        accent="var(--color-warning)"
        actions={
          <div className="flex items-center gap-2">
            <SearchBar value={search} onChange={setSearch} placeholder="Search leads..." className="w-48" />
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium hover:opacity-80"
              style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}>
              <Plus size={13} /> Add Lead
            </button>
          </div>
        }
      />
      <div className="grid grid-cols-4 gap-3 px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <StatCard icon={<Lightbulb size={16} />} label="Total Leads" value={leads.length} accent="var(--color-primary)" />
        <StatCard icon={<Lightbulb size={16} />} label="New" value={leads.filter(l => l.status === 'NEW').length} accent="var(--color-success)" />
        <StatCard icon={<Lightbulb size={16} />} label="Under Review" value={leads.filter(l => l.status === 'UNDER_REVIEW').length} accent="var(--color-warning)" />
        <StatCard icon={<Lightbulb size={16} />} label="Verified" value={leads.filter(l => l.status === 'VERIFIED').length} accent="var(--color-primary)" />
      </div>
      <div className="flex items-center gap-2 px-4 py-2 shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Status:</span>
        {['ALL', 'NEW', 'UNDER_REVIEW', 'VERIFIED', 'ACTIONED', 'DISMISSED'].map(s => (
          <FilterButton key={s} label={s.replace(/_/g, ' ')} active={statusFilter === s} onClick={() => setStatusFilter(s)} />
        ))}
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.map(lead => (
            <div key={lead.id} onClick={() => setSelected(lead)}
              className="card p-4 cursor-pointer transition-all"
              style={{ border: selected?.id === lead.id ? '1px solid var(--color-primary)' : '1px solid var(--color-border)' }}>
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>{lead.id}</span>
                    <PriorityBadge priority={lead.priority} size="sm" />
                    <span className="text-xs px-1.5 py-0.5 rounded font-semibold"
                      style={{ background: `${statusColor[lead.status]}15`, color: statusColor[lead.status], border: `1px solid ${statusColor[lead.status]}30` }}>
                      {lead.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 rounded"
                      style={{ background: 'rgba(100,116,139,0.12)', color: '#94a3b8' }}>
                      {lead.sourceType.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded"
                      style={{ background: `${reliabilityColor[lead.reliability] || '#64748b'}18`, color: reliabilityColor[lead.reliability] || '#94a3b8' }}>
                      Rel. {lead.reliability}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{lead.description}</p>
                  <div className="mt-2 flex items-center gap-3 flex-wrap text-xs">
                    <SectorBadge sector={lead.sector} />
                    <span style={{ color: 'var(--color-text-muted)' }}>Handler: {lead.handler}</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>Received: {lead.receivedDate}</span>
                    {lead.relatedCase && <span style={{ color: 'var(--color-primary)' }}>→ {lead.relatedCase}</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <button className="px-2 py-1 rounded text-xs hover:opacity-80"
                    style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)', whiteSpace: 'nowrap' }}>
                    Review
                  </button>
                  <button className="px-2 py-1 rounded text-xs hover:opacity-80"
                    style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)', whiteSpace: 'nowrap' }}>
                    Action
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <div className="hidden xl:flex flex-col w-72 shrink-0 overflow-y-auto p-4"
            style={{ borderLeft: '1px solid var(--color-border)', background: 'var(--color-bg-surface)' }}>
            <h3 className="text-xs font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>LEAD DETAIL</h3>
            <div className="card p-4 space-y-2 text-xs">
              {[
                { label: 'Lead ID', value: selected.id },
                { label: 'Status', value: selected.status.replace(/_/g, ' ') },
                { label: 'Priority', value: selected.priority },
                { label: 'Source Type', value: selected.sourceType.replace(/_/g, ' ') },
                { label: 'Reliability', value: selected.reliability },
                { label: 'Sector', value: selected.sector },
                { label: 'Handler', value: selected.handler },
                { label: 'Received', value: selected.receivedDate },
                { label: 'Related Case', value: selected.relatedCase || 'None' },
                { label: 'Classification', value: selected.classification },
              ].map(item => (
                <div key={item.label} className="flex justify-between">
                  <span style={{ color: 'var(--color-text-muted)' }}>{item.label}</span>
                  <span className="font-medium text-right" style={{ color: 'var(--color-text-secondary)' }}>{item.value}</span>
                </div>
              ))}
              <div className="pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <p style={{ color: 'var(--color-text-muted)' }}>{selected.description}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntelligenceLeads;
