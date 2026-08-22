import React, { useEffect } from 'react';
import { Building2, MapPin, Users, Camera, Phone } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { organizations } from '../../data/cases';
import { StatusBadge, SectorBadge, PageHeader, StatCard } from '../../components/common';

const Organizations: React.FC = () => {
  const { setCurrentPage } = useAppStore();
  useEffect(() => { setCurrentPage('organizations'); }, [setCurrentPage]);

  const typeIcon = { BOP: '🛡️', CHECKPOINT: '🚧', SECURITY_UNIT: '👮', REGIONAL_OFFICE: '🏛️', PARTNER_AGENCY: '🤝' };
  const typeLabel = { BOP: 'Border Out Post', CHECKPOINT: 'Checkpoint', SECURITY_UNIT: 'Security Unit', REGIONAL_OFFICE: 'Regional Office', PARTNER_AGENCY: 'Partner Agency' };

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ height: 'calc(100vh - 56px)' }}>
      <PageHeader
        title="Organizations & Units"
        subtitle="Operational entities and unit management"
        icon={<Building2 size={16} />}
      />
      <div className="grid grid-cols-3 gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <StatCard icon={<Building2 size={16} />} label="Total Units" value={organizations.length} accent="var(--color-primary)" />
        <StatCard icon={<Building2 size={16} />} label="Operational" value={organizations.filter(o => o.operationalStatus === 'OPERATIONAL').length} accent="var(--color-success)" />
        <StatCard icon={<Building2 size={16} />} label="Total Active Cases" value={organizations.reduce((s, o) => s + o.activeCases, 0)} accent="var(--color-warning)" />
      </div>
      <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {organizations.map(org => (
          <div key={org.id} className="card p-4">
            <div className="flex items-start gap-3 mb-3">
              <span className="text-2xl">{typeIcon[org.type]}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{org.name}</p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{typeLabel[org.type]}</p>
              </div>
              <StatusBadge status={org.operationalStatus} size="sm" />
            </div>
            <div className="space-y-1.5 text-xs">
              {[
                { icon: <MapPin size={11} />, label: 'Region', value: org.region },
                { icon: <Users size={11} />, label: 'Officer', value: org.contactOfficer },
                { icon: <Phone size={11} />, label: 'Contact', value: org.contactPhone },
                { icon: <Camera size={11} />, label: 'Cameras', value: org.connectedCameras },
                { icon: <Users size={11} />, label: 'Personnel', value: org.personnel || 'N/A' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <span style={{ color: 'var(--color-text-muted)' }}>{item.icon}</span>
                  <span style={{ color: 'var(--color-text-muted)' }}>{item.label}:</span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>{item.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <SectorBadge sector={org.sector} />
              <span className="text-xs font-semibold" style={{ color: org.activeCases > 3 ? 'var(--color-danger)' : 'var(--color-text-muted)' }}>
                {org.activeCases} active case{org.activeCases !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Organizations;
