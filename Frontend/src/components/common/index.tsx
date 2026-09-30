import React from 'react';
import { Severity, Priority } from '../../types';

// ──────────────────────────────────────────
// StatusBadge
// ──────────────────────────────────────────
interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  ONLINE: { bg: 'rgba(16,185,129,0.15)', text: '#10b981', dot: '#10b981' },
  LIVE: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444', dot: '#ef4444' },
  OFFLINE: { bg: 'rgba(100,116,139,0.2)', text: '#64748b', dot: '#64748b' },
  DEGRADED: { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b', dot: '#f59e0b' },
  MAINTENANCE: { bg: 'rgba(100,116,139,0.15)', text: '#94a3b8', dot: '#64748b' },
  OPERATIONAL: { bg: 'rgba(16,185,129,0.15)', text: '#10b981', dot: '#10b981' },
  STANDBY: { bg: 'rgba(100,116,139,0.15)', text: '#94a3b8', dot: '#64748b' },
  ACTIVE: { bg: 'rgba(59,130,246,0.15)', text: '#60a5fa', dot: '#3b82f6' },
  INACTIVE: { bg: 'rgba(100,116,139,0.2)', text: '#64748b', dot: '#64748b' },
  TRACKING: { bg: 'rgba(59,130,246,0.15)', text: '#60a5fa', dot: '#3b82f6' },
  IDENTIFIED: { bg: 'rgba(16,185,129,0.15)', text: '#10b981', dot: '#10b981' },
  LOST: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444', dot: '#ef4444' },
  UNKNOWN: { bg: 'rgba(100,116,139,0.2)', text: '#94a3b8', dot: '#64748b' },
  LIMITED: { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b', dot: '#f59e0b' },
  ON_DUTY: { bg: 'rgba(16,185,129,0.15)', text: '#10b981', dot: '#10b981' },
  AVAILABLE: { bg: 'rgba(59,130,246,0.15)', text: '#60a5fa', dot: '#3b82f6' },
  OFF_DUTY: { bg: 'rgba(100,116,139,0.2)', text: '#64748b', dot: '#64748b' },
  LEAVE: { bg: 'rgba(100,116,139,0.15)', text: '#94a3b8', dot: '#94a3b8' },
  DETAINED: { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b', dot: '#f59e0b' },
  RELEASED: { bg: 'rgba(100,116,139,0.15)', text: '#94a3b8', dot: '#94a3b8' },
  RECORDING: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444', dot: '#ef4444' },
  PAUSED: { bg: 'rgba(100,116,139,0.2)', text: '#94a3b8', dot: '#94a3b8' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const cfg = statusConfig[status] || { bg: 'rgba(100,116,139,0.15)', text: '#94a3b8', dot: '#64748b' };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded font-medium ${size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-1'}`}
      style={{ background: cfg.bg, color: cfg.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cfg.dot }} />
      {status.replace(/_/g, ' ')}
    </span>
  );
};

// ──────────────────────────────────────────
// SeverityBadge
// ──────────────────────────────────────────
interface SeverityBadgeProps {
  severity: Severity | string;
  size?: 'sm' | 'md';
}

const severityConfig: Record<string, { bg: string; text: string; border: string }> = {
  CRITICAL: { bg: 'rgba(255,32,32,0.15)', text: '#ff4444', border: 'rgba(255,32,32,0.35)' },
  HIGH: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444', border: 'rgba(239,68,68,0.3)' },
  MEDIUM: { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
  LOW: { bg: 'rgba(59,130,246,0.12)', text: '#60a5fa', border: 'rgba(59,130,246,0.25)' },
  INFO: { bg: 'rgba(100,116,139,0.15)', text: '#94a3b8', border: 'rgba(100,116,139,0.2)' },
};

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, size = 'md' }) => {
  const cfg = severityConfig[severity] || severityConfig.INFO;
  return (
    <span
      className={`inline-flex items-center rounded font-semibold uppercase tracking-wider ${size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-1'}`}
      style={{ background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}` }}
    >
      {severity}
    </span>
  );
};

// ──────────────────────────────────────────
// PriorityBadge
// ──────────────────────────────────────────
interface PriorityBadgeProps {
  priority: Priority | string;
  size?: 'sm' | 'md';
}

const priorityConfig: Record<string, { bg: string; text: string }> = {
  CRITICAL: { bg: 'rgba(255,32,32,0.15)', text: '#ff4444' },
  HIGH: { bg: 'rgba(239,68,68,0.12)', text: '#ef4444' },
  MEDIUM: { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b' },
  LOW: { bg: 'rgba(16,185,129,0.12)', text: '#10b981' },
};

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const cfg = priorityConfig[priority] || { bg: 'rgba(100,116,139,0.15)', text: '#94a3b8' };
  return (
    <span
      className={`inline-flex items-center rounded font-medium ${size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-1'}`}
      style={{ background: cfg.bg, color: cfg.text }}
    >
      {priority}
    </span>
  );
};

// ──────────────────────────────────────────
// ThreatLevelBadge
// ──────────────────────────────────────────
export const ThreatLevelBadge: React.FC<{ level: string; size?: 'sm' | 'md' }> = ({ level, size = 'md' }) => {
  const config: Record<string, { bg: string; text: string }> = {
    EXTREME: { bg: 'rgba(255,32,32,0.18)', text: '#ff4444' },
    HIGH: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444' },
    MEDIUM: { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b' },
    LOW: { bg: 'rgba(16,185,129,0.12)', text: '#10b981' },
  };
  const cfg = config[level] || { bg: 'rgba(100,116,139,0.15)', text: '#94a3b8' };
  return (
    <span
      className={`inline-flex items-center rounded font-semibold ${size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-1'}`}
      style={{ background: cfg.bg, color: cfg.text }}
    >
      ⚠ {level}
    </span>
  );
};

// ──────────────────────────────────────────
// StatCard
// ──────────────────────────────────────────
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon, label, value, sub, accent = 'var(--color-primary)', trend, trendValue, onClick,
}) => (
  <div
    className={`card p-4 flex flex-col gap-3 ${onClick ? 'cursor-pointer hover:border-blue-500/40 transition-colors' : ''}`}
    style={{ borderLeft: `3px solid ${accent}` }}
    onClick={onClick}
  >
    <div className="flex items-start justify-between">
      <div
        className="w-9 h-9 rounded flex items-center justify-center shrink-0"
        style={{ background: `${accent}22`, color: accent }}
      >
        {icon}
      </div>
      {trendValue && (
        <span
          className="text-xs px-1.5 py-0.5 rounded"
          style={{
            background: trend === 'up' ? 'rgba(16,185,129,0.12)' : trend === 'down' ? 'rgba(239,68,68,0.12)' : 'rgba(100,116,139,0.12)',
            color: trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#94a3b8',
          }}
        >
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
        </span>
      )}
    </div>
    <div>
      <div className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{value}</div>
      <div className="text-xs font-medium mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{label}</div>
      {sub && <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{sub}</div>}
    </div>
  </div>
);

// ──────────────────────────────────────────
// PageHeader
// ──────────────────────────────────────────
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
  accent?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions, icon, accent = 'var(--color-primary)' }) => (
  <div
    className="flex items-center justify-between px-6 py-4 shrink-0"
    style={{ borderBottom: '1px solid var(--color-border)' }}
  >
    <div className="flex items-center gap-3">
      {icon && (
        <div
          className="w-8 h-8 rounded flex items-center justify-center"
          style={{ background: `${accent}22`, color: accent }}
        >
          {icon}
        </div>
      )}
      <div>
        <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>{title}</h2>
        {subtitle && <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{subtitle}</p>}
      </div>
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);

// ──────────────────────────────────────────
// SearchBar
// ──────────────────────────────────────────
interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder = 'Search...', className = '' }) => (
  <div className={`relative ${className}`}>
    <svg
      className="absolute left-3 top-1/2 -translate-y-1/2"
      width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="var(--color-text-muted)" strokeWidth="2"
      style={{ pointerEvents: 'none' }}
    >
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </svg>
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full pl-9 pr-3 py-2 text-sm rounded outline-none transition-colors"
      style={{
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
        color: 'var(--color-text-primary)',
      }}
    />
  </div>
);

// ──────────────────────────────────────────
// FilterButton
// ──────────────────────────────────────────
export const FilterButton: React.FC<{
  label: string;
  active: boolean;
  onClick: () => void;
  color?: string;
}> = ({ label, active, onClick, color = 'var(--color-primary)' }) => (
  <button
    onClick={onClick}
    className="px-3 py-1.5 rounded text-xs font-medium transition-all duration-150"
    style={
      active
        ? { background: `${color}22`, color, border: `1px solid ${color}44` }
        : { background: 'var(--color-bg-elevated)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }
    }
  >
    {label}
  </button>
);

// ──────────────────────────────────────────
// EmptyState
// ──────────────────────────────────────────
export const EmptyState: React.FC<{ icon?: React.ReactNode; title: string; sub?: string }> = ({ icon, title, sub }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    {icon && (
      <div className="mb-3" style={{ color: 'var(--color-text-muted)', opacity: 0.5 }}>
        {icon}
      </div>
    )}
    <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>{title}</p>
    {sub && <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{sub}</p>}
  </div>
);

// ──────────────────────────────────────────
// Btn (reusable button)
// ──────────────────────────────────────────
interface BtnProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const Btn: React.FC<BtnProps> = ({
  children, onClick, variant = 'secondary', size = 'md', icon, disabled, className = '', id,
}) => {
  const variantStyles: Record<string, React.CSSProperties> = {
    primary: { background: 'linear-gradient(135deg,#1d4ed8,#1e40af)', color: '#fff', border: '1px solid #2563eb' },
    secondary: { background: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' },
    danger: { background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' },
    ghost: { background: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid transparent' },
    success: { background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' },
  };
  const sizeStyles: Record<string, string> = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2.5 text-sm',
  };
  return (
    <button
      id={id}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-85 ${sizeStyles[size]} ${className}`}
      style={variantStyles[variant]}
    >
      {icon}
      {children}
    </button>
  );
};

// ──────────────────────────────────────────
// SectorBadge
// ──────────────────────────────────────────
export const SectorBadge: React.FC<{ sector: string }> = ({ sector }) => {
  const colors: Record<string, string> = {
    NORTH: '#60a5fa', EAST: '#a78bfa', WEST: '#34d399',
    CENTRAL: '#f59e0b', SOUTH: '#fb923c',
  };
  const c = colors[sector] || '#94a3b8';
  return (
    <span className="text-xs px-2 py-0.5 rounded" style={{ background: `${c}18`, color: c, border: `1px solid ${c}30` }}>
      {sector}
    </span>
  );
};

// ──────────────────────────────────────────
// ProgressBar
// ──────────────────────────────────────────
export const ProgressBar: React.FC<{ value: number; color?: string; height?: number }> = ({
  value, color = 'var(--color-primary)', height = 4,
}) => (
  <div className="progress-bar" style={{ height }}>
    <div
      className="progress-fill"
      style={{ width: `${Math.min(value, 100)}%`, background: color }}
    />
  </div>
);

// ──────────────────────────────────────────
// Tabs
// ──────────────────────────────────────────
interface Tab { id: string; label: string; count?: number }
export const Tabs: React.FC<{
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
}> = ({ tabs, activeTab, onTabChange }) => (
  <div
    className="flex items-center gap-1 px-1"
    style={{ borderBottom: '1px solid var(--color-border)' }}
  >
    {tabs.map(tab => (
      <button
        key={tab.id}
        onClick={() => onTabChange(tab.id)}
        className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-all duration-150 -mb-px"
        style={
          activeTab === tab.id
            ? { color: 'var(--color-primary)', borderBottom: '2px solid var(--color-primary)' }
            : { color: 'var(--color-text-muted)', borderBottom: '2px solid transparent' }
        }
      >
        {tab.label}
        {tab.count !== undefined && (
          <span
            className="text-xs px-1.5 py-0.5 rounded-full"
            style={{
              background: activeTab === tab.id ? 'rgba(59,130,246,0.2)' : 'rgba(100,116,139,0.15)',
              color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
            }}
          >
            {tab.count}
          </span>
        )}
      </button>
    ))}
  </div>
);

// ──────────────────────────────────────────
// Modal
// ──────────────────────────────────────────
export const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}> = ({ open, onClose, title, children, width = '520px' }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div
        className="rounded-xl shadow-2xl flex flex-col max-h-[90vh]"
        style={{ width, background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }}
      >
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{title}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/5" style={{ color: 'var(--color-text-muted)' }}>
            <X size={16} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-5">{children}</div>
      </div>
    </div>
  );
};

const X: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
