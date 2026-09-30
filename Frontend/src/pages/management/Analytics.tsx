import React, { useEffect } from 'react';
import { TrendingUp, Activity, BarChart2 } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid, Legend,
} from 'recharts';
import { dailyMetrics, sectorMetrics, weeklyStats, alertSeverityData } from '../../data/analytics';
import { PageHeader, StatCard, SectorBadge } from '../../components/common';

const CustomTooltip: React.FC<{ active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded px-3 py-2 text-xs shadow-xl" style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }}>
      <p className="font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

const Analytics: React.FC = () => {
  const { setCurrentPage } = useAppStore();
  useEffect(() => { setCurrentPage('analytics'); }, [setCurrentPage]);

  const sectorColors: Record<string, string> = {
    NORTH: '#60a5fa', EAST: '#a78bfa', CENTRAL: '#f59e0b', WEST: '#34d399', SOUTH: '#fb923c',
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ height: 'calc(100vh - 56px)' }}>
      <PageHeader
        title="Analytics"
        subtitle="Surveillance performance and detection trends"
        icon={<TrendingUp size={16} />}
      />

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-4 py-4 shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <StatCard icon={<Activity size={16} />} label="Total Detections" value={703} sub="This week" accent="var(--color-primary)" trend="up" trendValue="+18%" />
        <StatCard icon={<Activity size={16} />} label="Avg Daily Detections" value={100} sub="7-day avg" accent="var(--color-success)" />
        <StatCard icon={<BarChart2 size={16} />} label="Peak Activity" value="09:00–10:00" sub="Busiest window" accent="var(--color-warning)" />
        <StatCard icon={<TrendingUp size={16} />} label="Alert Resolution Rate" value="83%" sub="Last 7 days" accent="var(--color-success)" trend="up" trendValue="+5%" />
      </div>

      <div className="flex-1 p-4 space-y-4">

        {/* Detection trend */}
        <div className="card p-4">
          <div className="mb-3">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Weekly Detection Trend</h3>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Human & vehicle detections — last 7 days</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={dailyMetrics}>
              <defs>
                <linearGradient id="g-humans" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g-vehicles" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g-alerts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <CartesianGrid stroke="rgba(100,116,139,0.08)" vertical={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
              <Area type="monotone" dataKey="humans" name="Humans" stroke="#3b82f6" fill="url(#g-humans)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="vehicles" name="Vehicles" stroke="#a78bfa" fill="url(#g-vehicles)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="alerts" name="Alerts" stroke="#ef4444" fill="url(#g-alerts)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Sector detections bar */}
          <div className="col-span-12 lg:col-span-7 card p-4">
            <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>Detections by Sector</h3>
            <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>Total activity per sector</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={sectorMetrics}>
                <XAxis dataKey="sector" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="detections" name="Detections" radius={[4, 4, 0, 0]}>
                  {sectorMetrics.map(s => (
                    <Cell key={s.sector} fill={sectorColors[s.sector] || '#60a5fa'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Alert severity donut */}
          <div className="col-span-12 lg:col-span-5 card p-4">
            <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>Alert Severity Distribution</h3>
            <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>Today's alerts</p>
            <div className="flex items-center gap-3">
              <ResponsiveContainer width="55%" height={180}>
                <PieChart>
                  <Pie data={alertSeverityData} innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {alertSeverityData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {alertSeverityData.map(d => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm" style={{ background: d.color }} />
                      <span style={{ color: 'var(--color-text-secondary)' }}>{d.name}</span>
                    </div>
                    <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sector table */}
          <div className="col-span-12 card p-4">
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>Sector Performance Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    {['Sector', 'Status', 'Cameras', 'Detections', 'Intrusions', 'Vehicles', 'Alerts', 'Trend'].map(h => (
                      <th key={h} className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sectorMetrics.map(s => {
                    const statusC = { CRITICAL: '#ff2020', ELEVATED: '#f59e0b', HIGH: '#ef4444', NORMAL: '#10b981' };
                    const c = sectorColors[s.sector] || '#60a5fa';
                    return (
                      <tr key={s.sector} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td className="px-4 py-3"><SectorBadge sector={s.sector} /></td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-semibold" style={{ color: (statusC as any)[s.status] || '#94a3b8' }}>{s.status}</span>
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-text-secondary)' }}>{s.cameras}</td>
                        <td className="px-4 py-3 text-xs font-bold" style={{ color: c }}>{s.detections}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-text-secondary)' }}>{s.intrusions}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-text-secondary)' }}>{s.vehicles}</td>
                        <td className="px-4 py-3 text-xs font-semibold" style={{ color: s.alerts > 3 ? '#ef4444' : '#94a3b8' }}>{s.alerts}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs" style={{ color: s.trend === 'up' ? '#10b981' : s.trend === 'down' ? '#ef4444' : '#94a3b8' }}>
                            {s.trend === 'up' ? '↑ Rising' : s.trend === 'down' ? '↓ Falling' : '→ Stable'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Analytics;
