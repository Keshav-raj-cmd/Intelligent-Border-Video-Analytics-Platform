import React, { useEffect } from 'react';
import { LayoutDashboard, FolderOpen, Users, Lightbulb, CheckSquare, AlertTriangle, TrendingUp } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { cases, leads } from '../../data/cases';
import { tasks } from '../../data/tasks';
import { StatCard, PriorityBadge, StatusBadge, PageHeader } from '../../components/common';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const CRMOverview: React.FC = () => {
  const { setCurrentPage } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => { setCurrentPage('crm-overview'); }, [setCurrentPage]);

  const activeCases = cases.filter(c => c.status !== 'CLOSED');
  const openInvestigations = cases.filter(c => c.status === 'INVESTIGATING' || c.status === 'ESCALATED');
  const newLeads = leads.filter(l => l.status === 'NEW' || l.status === 'UNDER_REVIEW');
  const pendingTasks = tasks.filter(t => t.status === 'PENDING' || t.status === 'OVERDUE');
  const overdueTasks = tasks.filter(t => t.status === 'OVERDUE');

  const caseStatusData = [
    { name: 'Investigating', value: cases.filter(c => c.status === 'INVESTIGATING').length, color: '#ef4444' },
    { name: 'Monitoring', value: cases.filter(c => c.status === 'MONITORING').length, color: '#f59e0b' },
    { name: 'Escalated', value: cases.filter(c => c.status === 'ESCALATED').length, color: '#ff2020' },
    { name: 'Open', value: cases.filter(c => c.status === 'OPEN').length, color: '#3b82f6' },
    { name: 'New', value: cases.filter(c => c.status === 'NEW').length, color: '#10b981' },
    { name: 'Closed', value: cases.filter(c => c.status === 'CLOSED').length, color: '#475569' },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ height: 'calc(100vh - 56px)' }}>
      <PageHeader
        title="CRM & Operations Overview"
        subtitle="Security intelligence and case operations dashboard"
        icon={<LayoutDashboard size={16} />}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 px-4 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <StatCard icon={<FolderOpen size={16} />} label="Active Cases" value={activeCases.length} sub="All sectors" accent="var(--color-primary)" onClick={() => navigate('/crm/cases')} />
        <StatCard icon={<AlertTriangle size={16} />} label="Investigations" value={openInvestigations.length} sub="Open" accent="var(--color-danger)" onClick={() => navigate('/crm/cases')} />
        <StatCard icon={<Lightbulb size={16} />} label="New Leads" value={newLeads.length} sub="Pending review" accent="var(--color-warning)" onClick={() => navigate('/crm/leads')} />
        <StatCard icon={<CheckSquare size={16} />} label="Pending Tasks" value={pendingTasks.length} sub={`${overdueTasks.length} overdue`} accent="var(--color-danger)" onClick={() => navigate('/crm/tasks')} />
        <StatCard icon={<Users size={16} />} label="High-Priority Persons" value={3} sub="Extreme threat" accent="var(--color-critical)" onClick={() => navigate('/crm/contacts')} />
        <StatCard icon={<TrendingUp size={16} />} label="Tasks Due Today" value={tasks.filter(t => t.dueDate === '2026-08-22' && t.status !== 'COMPLETED').length} sub="Today" accent="var(--color-warning)" onClick={() => navigate('/crm/tasks')} />
      </div>

      <div className="flex-1 p-4">
        <div className="grid grid-cols-12 gap-4">

          {/* Case Status Chart */}
          <div className="col-span-12 lg:col-span-5 card p-4">
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>Case Status Overview</h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={caseStatusData} layout="vertical">
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', borderRadius: '6px' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {caseStatusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Cases */}
          <div className="col-span-12 lg:col-span-7 card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Recent Cases</h3>
              <button onClick={() => navigate('/crm/cases')} className="text-xs hover:opacity-80" style={{ color: 'var(--color-primary)' }}>View all</button>
            </div>
            <div className="space-y-2">
              {activeCases.slice(0, 5).map(c => (
                <div key={c.id} className="flex items-center gap-3 px-3 py-2 rounded hover:bg-white/3 transition-colors cursor-pointer"
                  style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }}
                  onClick={() => navigate('/crm/cases')}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>{c.id}</span>
                      <span className="text-xs font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{c.title}</span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{c.assignedOfficer} · {c.lastUpdated.split('T')[0]}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <PriorityBadge priority={c.priority} size="sm" />
                    <StatusBadge status={c.status} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Priority Intelligence */}
          <div className="col-span-12 lg:col-span-6 card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Priority Intelligence</h3>
              <button onClick={() => navigate('/crm/leads')} className="text-xs hover:opacity-80" style={{ color: 'var(--color-primary)' }}>All leads</button>
            </div>
            <div className="space-y-2">
              {leads.slice(0, 4).map(lead => (
                <div key={lead.id} className="flex items-start gap-3 p-3 rounded"
                  style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>{lead.id}</span>
                      <PriorityBadge priority={lead.priority} size="sm" />
                      <span className="text-xs px-1 rounded" style={{ background: 'rgba(100,116,139,0.15)', color: '#94a3b8', fontSize: '10px' }}>
                        {lead.sourceType.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed truncate" style={{ color: 'var(--color-text-secondary)' }}>{lead.description}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{lead.sector} · {lead.status.replace(/_/g, ' ')}</p>
                  </div>
                  <span className="text-xs shrink-0 font-bold px-1.5 py-0.5 rounded"
                    style={{ background: 'rgba(100,116,139,0.12)', color: '#94a3b8' }}>
                    {lead.reliability}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Tasks */}
          <div className="col-span-12 lg:col-span-6 card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Upcoming Follow-ups</h3>
              <button onClick={() => navigate('/crm/tasks')} className="text-xs hover:opacity-80" style={{ color: 'var(--color-primary)' }}>All tasks</button>
            </div>
            <div className="space-y-2">
              {tasks.filter(t => t.status !== 'COMPLETED').slice(0, 5).map(task => (
                <div key={task.id} className="flex items-center gap-3 p-2 rounded"
                  style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{task.title}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {task.assignedOfficer} · Due {task.dueDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <PriorityBadge priority={task.priority} size="sm" />
                    {task.status === 'OVERDUE' && (
                      <span className="text-xs px-1 py-0.5 rounded" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>OVERDUE</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CRMOverview;
