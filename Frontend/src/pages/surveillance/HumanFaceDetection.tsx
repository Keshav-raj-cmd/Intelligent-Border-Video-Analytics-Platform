import React, { useState, useEffect } from 'react';
import { User, Eye, MapPin, Clock, Shield, Activity } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { detections } from '../../data/detections';
import { SeverityBadge, StatusBadge, SearchBar, FilterButton, PageHeader, StatCard } from '../../components/common';

const FaceBox: React.FC<{ confidence: number; identified?: boolean }> = ({ confidence, identified }) => (
  <div className="relative camera-feed rounded-lg overflow-hidden" style={{ height: '140px' }}>
    <div className="scan-line" />
    {/* Face bounding box */}
    <div className="absolute" style={{ left: '30%', top: '15%', width: '40%', height: '60%' }}>
      {/* Corner brackets */}
      {[
        { top: -2, left: -2, borderTop: '2px solid', borderLeft: '2px solid', width: 10, height: 10 },
        { top: -2, right: -2, borderTop: '2px solid', borderRight: '2px solid', width: 10, height: 10 },
        { bottom: -2, left: -2, borderBottom: '2px solid', borderLeft: '2px solid', width: 10, height: 10 },
        { bottom: -2, right: -2, borderBottom: '2px solid', borderRight: '2px solid', width: 10, height: 10 },
      ].map((style, i) => (
        <div key={i} className="absolute" style={{
          ...style,
          borderColor: identified ? '#10b981' : '#3b82f6',
        }} />
      ))}
      <div className="absolute -top-6 left-0 text-xs px-1 rounded" style={{
        background: identified ? 'rgba(16,185,129,0.85)' : 'rgba(59,130,246,0.85)',
        color: '#fff', fontSize: '9px', whiteSpace: 'nowrap',
      }}>
        {identified ? 'IDENTIFIED' : 'FACE DETECTED'} {confidence}%
      </div>
      {/* Simulated face */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full" style={{ background: 'rgba(100,120,140,0.3)', border: '1px solid rgba(100,120,140,0.2)' }}>
          <div className="w-full h-full flex items-center justify-center">
            <User size={20} style={{ color: 'rgba(148,163,184,0.5)' }} />
          </div>
        </div>
      </div>
    </div>
    {/* Confidence bar */}
    <div className="absolute bottom-2 left-2 right-2">
      <div className="flex justify-between text-xs mb-0.5" style={{ fontSize: '8px', color: '#64748b' }}>
        <span>Confidence</span><span>{confidence}%</span>
      </div>
      <div style={{ height: '2px', background: 'rgba(100,116,139,0.3)', borderRadius: '1px' }}>
        <div style={{ width: `${confidence}%`, height: '100%', background: identified ? '#10b981' : '#3b82f6', borderRadius: '1px' }} />
      </div>
    </div>
  </div>
);

const MotionPanel: React.FC = () => {
  const metrics = [
    { label: 'Motion Level', value: 72, color: '#f59e0b' },
    { label: 'Face Visibility', value: 84, color: '#3b82f6' },
    { label: 'Frame Quality', value: 91, color: '#10b981' },
    { label: 'Detection Confidence', value: 87, color: '#3b82f6' },
    { label: 'Tracking Stability', value: 65, color: '#a78bfa' },
  ];
  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
        Fast Movement Detection
      </h3>
      <div className="space-y-3">
        {metrics.map(m => (
          <div key={m.label}>
            <div className="flex justify-between text-xs mb-1">
              <span style={{ color: 'var(--color-text-secondary)' }}>{m.label}</span>
              <span className="font-medium" style={{ color: m.color }}>{m.value}%</span>
            </div>
            <div style={{ height: '4px', background: 'var(--color-border)', borderRadius: '2px' }}>
              <div style={{ width: `${m.value}%`, height: '100%', background: m.color, borderRadius: '2px', transition: 'width 0.5s ease' }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 p-2 rounded text-xs" style={{ background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.15)', color: 'var(--color-text-muted)' }}>
        Active frame analysis at 30fps. Motion blur compensation enabled.
      </div>
    </div>
  );
};

const HumanFaceDetection: React.FC = () => {
  const { setCurrentPage } = useAppStore();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selected, setSelected] = useState(detections[0]);

  useEffect(() => { setCurrentPage('human-face-detection'); }, [setCurrentPage]);

  const filtered = detections.filter(d => {
    const matchSearch = d.camera.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'ALL' || d.trackingStatus === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="flex flex-col h-full" style={{ height: 'calc(100vh - 56px)' }}>
      <PageHeader title="Human & Face Detection"
        subtitle={`${detections.length} detections today`}
        icon={<User size={16} />}
        actions={<SearchBar value={search} onChange={setSearch} placeholder="Search..." className="w-48" />}
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <StatCard icon={<User size={16} />} label="Humans Detected" value={62} sub="Today" accent="var(--color-primary)" />
        <StatCard icon={<Eye size={16} />} label="Face Detected" value={18} sub="High confidence" accent="var(--color-success)" />
        <StatCard icon={<Shield size={16} />} label="Identified" value={2} sub="Criminal DB match" accent="var(--color-danger)" />
        <StatCard icon={<Activity size={16} />} label="Tracking" value={3} sub="Active targets" accent="var(--color-warning)" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 px-4 py-2 shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
        {['ALL', 'TRACKING', 'IDENTIFIED', 'LOST', 'UNKNOWN'].map(f => (
          <FilterButton key={f} label={f} active={typeFilter === f} onClick={() => setTypeFilter(f)} />
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Detection list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.map(det => (
            <div key={det.id}
              onClick={() => setSelected(det)}
              className="card p-4 cursor-pointer transition-all"
              style={{ border: selected?.id === det.id ? '1px solid var(--color-primary)' : '1px solid var(--color-border)' }}>
              <div className="flex gap-4">
                <div className="shrink-0 w-36">
                  <FaceBox confidence={det.confidence} identified={det.trackingStatus === 'IDENTIFIED'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>{det.id}</span>
                    <StatusBadge status={det.trackingStatus} size="sm" />
                    {det.faceDetected && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>FACE</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {[
                      { label: 'Camera', value: det.camera },
                      { label: 'Location', value: det.location },
                      { label: 'Sector', value: det.sector },
                      { label: 'Confidence', value: `${det.confidence}%` },
                      { label: 'Detected', value: new Date(det.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }) },
                      { label: 'Person ID', value: det.personId || 'Unknown' },
                    ].map(item => (
                      <div key={item.label} className="text-xs">
                        <span style={{ color: 'var(--color-text-muted)' }}>{item.label}: </span>
                        <span style={{ color: 'var(--color-text-secondary)' }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                  {det.attributes && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {Object.entries(det.attributes).map(([k, v]) => (
                        <span key={k} className="text-xs px-2 py-0.5 rounded"
                          style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
                          {k}: {v}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right panel */}
        <div className="hidden xl:flex flex-col w-72 shrink-0 overflow-y-auto p-4 gap-4"
          style={{ borderLeft: '1px solid var(--color-border)', background: 'var(--color-bg-surface)' }}>
          {selected && (
            <div className="card p-4">
              <h3 className="text-xs font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>DETECTION DETAILS</h3>
              <FaceBox confidence={selected.confidence} identified={selected.trackingStatus === 'IDENTIFIED'} />
              <div className="mt-3 space-y-2">
                {[
                  { label: 'Detection ID', value: selected.id },
                  { label: 'Person ID', value: selected.personId || 'Unknown' },
                  { label: 'Camera', value: selected.camera },
                  { label: 'Location', value: selected.location },
                  { label: 'Confidence', value: `${selected.confidence}%` },
                  { label: 'Tracking', value: selected.trackingStatus },
                  { label: 'Face Detected', value: selected.faceDetected ? 'Yes' : 'No' },
                  { label: 'Detected At', value: new Date(selected.timestamp).toLocaleString('en-IN') },
                ].map(item => (
                  <div key={item.label} className="flex justify-between text-xs">
                    <span style={{ color: 'var(--color-text-muted)' }}>{item.label}</span>
                    <span className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <MotionPanel />
        </div>
      </div>
    </div>
  );
};

export default HumanFaceDetection;
