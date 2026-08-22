import React, { useEffect } from 'react';
import { Users, UserCheck, UserX, Phone, Shield } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { teamMembers } from '../../data/tasks';
import { TeamMember } from '../../types';
import { StatusBadge, PageHeader, StatCard, ProgressBar } from '../../components/common';

const OfficerCard: React.FC<{ officer: TeamMember }> = ({ officer }) => {
  const workload = officer.workload || 0;
  const workloadColor = workload > 80 ? '#ef4444' : workload > 60 ? '#f59e0b' : '#10b981';
  const status = officer.status || officer.availability || 'AVAILABLE';
  const statusColor: Record<string, string> = {
    ON_DUTY: '#10b981', AVAILABLE: '#3b82f6', OFF_DUTY: '#64748b', LEAVE: '#94a3b8',
  };

  return (
    <div className="card p-4" style={{ borderLeft: `3px solid ${statusColor[status] || '#64748b'}` }}>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 font-bold text-sm"
          style={{ background: 'linear-gradient(135deg, #1e3a8a, #0e7490)', color: '#93c5fd' }}>
          {officer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{officer.name}</p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{officer.rank} · {officer.unit}</p>
          <StatusBadge status={status} size="sm" />
        </div>
      </div>
      <div className="space-y-2 text-xs">
        <div><span style={{ color: 'var(--color-text-muted)' }}>Specialization: </span><span style={{ color: 'var(--color-text-secondary)' }}>{officer.specialization}</span></div>
        <div><span style={{ color: 'var(--color-text-muted)' }}>Sector: </span><span style={{ color: 'var(--color-text-secondary)' }}>{officer.sector}</span></div>
        <div><span style={{ color: 'var(--color-text-muted)' }}>Active Cases: </span><span style={{ color: 'var(--color-text-secondary)' }}>{officer.activeCases}</span></div>
        <div><span style={{ color: 'var(--color-text-muted)' }}>Pending Tasks: </span><span style={{ color: 'var(--color-text-secondary)' }}>{officer.pendingTasks}</span></div>
        {officer.currentAssignment && (
          <div className="pt-1">
            <p className="text-xs px-2 py-1 rounded italic" style={{ background: 'rgba(59,130,246,0.07)', color: 'var(--color-primary-light)', border: '1px solid rgba(59,130,246,0.15)' }}>
              📋 {officer.currentAssignment}
            </p>
          </div>
        )}
      </div>
      <div className="mt-3">
        <div className="flex justify-between text-xs mb-1">
          <span style={{ color: 'var(--color-text-muted)' }}>Workload</span>
          <span style={{ color: workloadColor }}>{workload}%</span>
        </div>
        <ProgressBar value={workload} color={workloadColor} height={4} />
      </div>
      <div className="mt-3 flex gap-2">
        <button className="flex-1 flex items-center justify-center gap-1 py-1 rounded text-xs hover:opacity-80"
          style={{ background: 'rgba(59,130,246,0.08)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.15)' }}>
          <Phone size={11} /> Contact
        </button>
        <button className="flex-1 flex items-center justify-center gap-1 py-1 rounded text-xs hover:opacity-80"
          style={{ background: 'rgba(100,116,139,0.08)', color: '#94a3b8', border: '1px solid var(--color-border)' }}>
          <Shield size={11} /> Assign
        </button>
      </div>
    </div>
  );
};

const TeamOperations: React.FC = () => {
  const { setCurrentPage } = useAppStore();
  useEffect(() => { setCurrentPage('team-operations'); }, [setCurrentPage]);

  const onDuty = teamMembers.filter(m => (m.status || m.availability) === 'ON_DUTY').length;
  const available = teamMembers.filter(m => (m.status || m.availability) === 'AVAILABLE').length;
  const offDuty = teamMembers.filter(m => {
    const s = m.status || m.availability;
    return s === 'OFF_DUTY' || s === 'LEAVE';
  }).length;

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ height: 'calc(100vh - 56px)' }}>
      <PageHeader
        title="Team Operations"
        subtitle="Personnel status and assignments"
        icon={<Users size={16} />}
      />
      <div className="grid grid-cols-3 gap-3 px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <StatCard icon={<UserCheck size={16} />} label="On Duty" value={onDuty} sub="Available for assignments" accent="var(--color-success)" />
        <StatCard icon={<Users size={16} />} label="Available" value={available} sub="Free for tasking" accent="var(--color-primary)" />
        <StatCard icon={<UserX size={16} />} label="Off Duty / Leave" value={offDuty} sub="Not available" accent="var(--color-warning)" />
      </div>
      <div className="flex-1 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {teamMembers.map(officer => (
            <OfficerCard key={officer.id} officer={officer} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamOperations;
