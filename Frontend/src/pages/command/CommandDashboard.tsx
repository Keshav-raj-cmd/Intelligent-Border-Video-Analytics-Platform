import React, { useEffect, useRef, useState } from 'react';
import {
  Camera, AlertTriangle, Users, Car, Shield, Activity,
  TrendingUp, Wifi, WifiOff, Cpu, HardDrive, Radio,
  Bot, Send, Loader2, ChevronRight, Eye, Plus, FileText, Zap,
  Globe, ArrowUpRight,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import { StatCard, SeverityBadge, StatusBadge, ProgressBar, Btn } from '../../components/common';
import { cameras } from '../../data/cameras';
import { dailyMetrics, alertSeverityData, sectorMetrics, systemComponents } from '../../data/analytics';
import { cases } from '../../data/cases';
import { initialMessages, getAIResponse, suggestedPrompts } from '../../data/aiResponses';
import { AIMessage } from '../../types';
import { useNavigate } from 'react-router-dom';

// ──────────────────────────────────────────
// Embedded AI Chat Panel (Dashboard only)
// ──────────────────────────────────────────
let localMsgId = 200;
const DashboardAIChat: React.FC = () => {
  const [messages, setMessages] = useState<AIMessage[]>([...initialMessages]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const prompts = suggestedPrompts.dashboard;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: AIMessage = { id: `lm-${++localMsgId}`, role: 'user', content: text, timestamp: new Date().toISOString() };
    const loadMsg: AIMessage = { id: `lm-${++localMsgId}`, role: 'assistant', content: '', timestamp: new Date().toISOString(), isLoading: true };
    setMessages(m => [...m, userMsg, loadMsg]);
    setLoading(true);
    setInput('');
    setTimeout(() => {
      const resp = getAIResponse(text);
      setMessages(m => m.map(msg => msg.isLoading ? { ...msg, content: resp, isLoading: false } : msg));
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg,#1e3a8a,#0e7490)' }}>
          <Bot size={13} style={{ color: '#93c5fd' }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>IBVAP AI Assistant</div>
          <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-success)' }}>
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: 'var(--color-success)' }} />
            Online · Ready
          </div>
        </div>
        <Activity size={14} style={{ color: 'var(--color-text-muted)' }} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-1.5 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'linear-gradient(135deg,#1e3a8a,#0e7490)' }}>
                <Bot size={10} style={{ color: '#93c5fd' }} />
              </div>
            )}
            <div
              className="max-w-[90%] rounded-lg px-2.5 py-2"
              style={msg.role === 'user'
                ? { background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.3)' }
                : { background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }
              }
            >
              {msg.isLoading ? (
                <div className="typing-dots flex items-center gap-1 py-0.5"><span /><span /><span /></div>
              ) : (
                <p className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: msg.role === 'user' ? '#93c5fd' : 'var(--color-text-secondary)' }}>
                  {msg.content}
                </p>
              )}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Suggested prompts */}
      <div className="px-3 py-2 shrink-0" style={{ borderTop: '1px solid var(--color-border)' }}>
        <div className="flex flex-wrap gap-1">
          {prompts.slice(0, 3).map(p => (
            <button key={p.id} onClick={() => send(p.text)} disabled={loading}
              className="text-xs px-2 py-1 rounded transition-opacity hover:opacity-80 disabled:opacity-40"
              style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: 'var(--color-primary-light)' }}>
              {p.text}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="px-3 pb-3 shrink-0">
        <div className="flex items-center gap-2 rounded px-2.5 py-2" style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-light)' }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send(input)}
            placeholder="Ask the surveillance system..." disabled={loading}
            className="flex-1 bg-transparent text-xs outline-none" style={{ color: 'var(--color-text-primary)' }} />
          <button onClick={() => send(input)} disabled={!input.trim() || loading} style={{ color: loading ? 'var(--color-text-muted)' : 'var(--color-primary)' }} className="disabled:opacity-40">
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
          </button>
        </div>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────
// Sector Activity Map (visual mock)
// ──────────────────────────────────────────
const SectorMap: React.FC = () => {
  const sectorData = [
    { label: 'NORTH', x: 50, y: 10, status: 'CRITICAL', detections: 78, cameras: 4 },
    { label: 'EAST', x: 80, y: 40, status: 'ELEVATED', detections: 256, cameras: 4 },
    { label: 'CENTRAL', x: 50, y: 45, status: 'NORMAL', detections: 299, cameras: 2 },
    { label: 'WEST', x: 20, y: 40, status: 'NORMAL', detections: 25, cameras: 3 },
    { label: 'SOUTH', x: 50, y: 78, status: 'ELEVATED', detections: 45, cameras: 2 },
  ];
  const statusColor: Record<string, string> = {
    CRITICAL: '#ff2020', ELEVATED: '#f59e0b', NORMAL: '#10b981',
  };

  return (
    <div className="relative w-full" style={{ height: '220px' }}>
      {/* Background grid */}
      <div className="absolute inset-0 rounded-lg overflow-hidden" style={{ background: 'var(--color-bg-elevated)' }}>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }} />
        {/* Scan line */}
        <div className="scan-line" />
      </div>
      {/* Border outline */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polygon
          points="50,5 90,30 90,70 50,95 10,70 10,30"
          fill="none" stroke="rgba(59,130,246,0.15)" strokeWidth="0.5" strokeDasharray="2,2"
        />
      </svg>
      {/* Sector nodes */}
      {sectorData.map(s => (
        <div key={s.label} className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${s.x}%`, top: `${s.y}%` }}>
          <div className="flex flex-col items-center gap-1">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer hover:scale-110 transition-transform"
              style={{
                background: `${statusColor[s.status]}22`,
                border: `2px solid ${statusColor[s.status]}66`,
                color: statusColor[s.status],
                boxShadow: s.status === 'CRITICAL' ? `0 0 12px ${statusColor[s.status]}44` : 'none',
              }}
            >
              <Globe size={14} />
            </div>
            <div className="text-center">
              <div className="text-xs font-bold whitespace-nowrap" style={{ color: statusColor[s.status], fontSize: '9px' }}>{s.label}</div>
              <div className="text-xs whitespace-nowrap" style={{ color: 'var(--color-text-muted)', fontSize: '8px' }}>
                {s.detections} det
              </div>
            </div>
          </div>
        </div>
      ))}
      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        <line x1="50" y1="10" x2="50" y2="45" stroke="rgba(59,130,246,0.2)" strokeWidth="0.5" />
        <line x1="80" y1="40" x2="50" y2="45" stroke="rgba(59,130,246,0.2)" strokeWidth="0.5" />
        <line x1="20" y1="40" x2="50" y2="45" stroke="rgba(59,130,246,0.2)" strokeWidth="0.5" />
        <line x1="50" y1="78" x2="50" y2="45" stroke="rgba(59,130,246,0.2)" strokeWidth="0.5" />
      </svg>
    </div>
  );
};

// ──────────────────────────────────────────
// Custom Tooltip for Charts
// ──────────────────────────────────────────
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

// ──────────────────────────────────────────
// Main Command Dashboard
// ──────────────────────────────────────────
const CommandDashboard: React.FC = () => {
  const { setCurrentPage, liveAlerts } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentPage('dashboard');
  }, [setCurrentPage]);

  const onlineCams = cameras.filter(c => c.status === 'ONLINE').length;
  const offlineCams = cameras.filter(c => c.status === 'OFFLINE').length;
  const criticalAlerts = liveAlerts.filter(a => a.severity === 'CRITICAL' && a.status !== 'RESOLVED').length;
  const recentAlerts = liveAlerts.slice(0, 6);
  const activeCases = cases.filter(c => c.status !== 'CLOSED').length;

  return (
    <div className="flex h-full" style={{ maxHeight: 'calc(100vh - 56px)' }}>
      {/* ── Main Dashboard Content ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
      
        {/* ── Priority Mode Toggle ── */}
        <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
          <div className="flex items-center gap-3">
            <Zap size={20} style={{ color: useAppStore(s => s.priorityMode) ? '#3b82f6' : 'var(--color-text-muted)' }} />
            <div>
              <h3 className="text-sm font-bold text-blue-400">AI Priority Mode</h3>
              <p className="text-xs text-blue-200 opacity-80">
                Disable background analytic modules to focus maximum compute resources on <strong>Face, ANPR, Night, and Thermal</strong>.
              </p>
            </div>
          </div>
          <button 
            onClick={() => useAppStore.getState().togglePriorityMode()}
            className="px-4 py-1.5 rounded text-xs font-bold transition-colors"
            style={{ 
              background: useAppStore(s => s.priorityMode) ? '#3b82f6' : 'var(--color-bg-elevated)',
              color: useAppStore(s => s.priorityMode) ? '#fff' : 'var(--color-text-primary)',
              border: '1px solid',
              borderColor: useAppStore(s => s.priorityMode) ? '#3b82f6' : 'var(--color-border)'
            }}
          >
            {useAppStore(s => s.priorityMode) ? 'ENABLED' : 'DISABLED'}
          </button>
        </div>

        {/* ── Stat Cards Row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            icon={<Camera size={18} />} label="Total Cameras" value={cameras.length}
            sub={`${onlineCams} online · ${offlineCams} offline`}
            accent="var(--color-primary)" trend="neutral" trendValue="15 total"
          />
          <StatCard
            icon={<Wifi size={18} />} label="Online Cameras" value={onlineCams}
            sub="Live AI monitoring" accent="var(--color-success)" trend="up" trendValue="+2"
          />
          <StatCard
            icon={<WifiOff size={18} />} label="Offline Cameras" value={offlineCams}
            sub="Maintenance required" accent="var(--color-danger)" trend="down" trendValue="2 offline"
          />
          <StatCard
            icon={<Users size={18} />} label="Humans Detected" value={62}
            sub="Today · All sectors" accent="var(--color-warning)" trend="up" trendValue="+23"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            icon={<Car size={18} />} label="Vehicles Today" value={134}
            sub="All checkpoints" accent="var(--color-accent-purple)" trend="up" trendValue="+38"
          />
          <StatCard
            icon={<Shield size={18} />} label="Intrusion Attempts" value={4}
            sub="Today – all sectors" accent="var(--color-danger)" trend="up" trendValue="↑ Today"
          />
          <StatCard
            icon={<AlertTriangle size={18} />} label="Critical Alerts" value={criticalAlerts}
            sub="Require immediate attention" accent="var(--color-critical)" trend="neutral" trendValue="Active"
          />
          <StatCard
            icon={<Radio size={18} />} label="Active Tracking" value={3}
            sub="Persons being tracked" accent="var(--color-info)" trend="neutral" trendValue="Live"
          />
        </div>

        {/* ── Main content grid ── */}
        <div className="grid grid-cols-12 gap-4">

          {/* Detection Trend Chart */}
          <div className="col-span-12 lg:col-span-7 card p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Detection Trend</h3>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Last 7 days — all sectors</p>
              </div>
              <TrendingUp size={16} style={{ color: 'var(--color-text-muted)' }} />
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={dailyMetrics}>
                <defs>
                  <linearGradient id="humans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="vehicles" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="humans" name="Humans" stroke="#3b82f6" fill="url(#humans)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="vehicles" name="Vehicles" stroke="#a78bfa" fill="url(#vehicles)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Alerts by Severity (donut) */}
          <div className="col-span-12 lg:col-span-5 card p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Alert Severity</h3>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Current distribution</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ResponsiveContainer width="50%" height={130}>
                <PieChart>
                  <Pie data={alertSeverityData} innerRadius={35} outerRadius={55} paddingAngle={3} dataKey="value">
                    {alertSeverityData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5">
                {alertSeverityData.map(d => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                      <span style={{ color: 'var(--color-text-secondary)' }}>{d.name}</span>
                    </div>
                    <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sector Activity */}
          <div className="col-span-12 lg:col-span-5 card p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Border Activity</h3>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Sector overview</p>
              </div>
            </div>
            <SectorMap />
            <div className="grid grid-cols-5 gap-1 mt-2">
              {sectorMetrics.map(s => {
                const c = { NORMAL: '#10b981', ELEVATED: '#f59e0b', HIGH: '#ef4444', CRITICAL: '#ff2020' }[s.status] || '#94a3b8';
                return (
                  <div key={s.sector} className="text-center">
                    <div className="text-xs font-bold" style={{ color: c, fontSize: '9px' }}>{s.sector}</div>
                    <div className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>{s.detections}</div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '9px' }}>{s.cameras} cams</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Critical Alerts */}
          <div className="col-span-12 lg:col-span-7 card p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Recent Alerts</h3>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Latest security events</p>
              </div>
              <button onClick={() => navigate('/intelligence/alerts')} className="text-xs flex items-center gap-1 hover:opacity-80" style={{ color: 'var(--color-primary)' }}>
                View all <ChevronRight size={12} />
              </button>
            </div>
            <div className="space-y-2">
              <AnimatePresence>
                {recentAlerts.map(alert => (
                  <motion.div 
                    key={alert.id}
                    layout
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="flex items-start gap-3 px-3 py-2 rounded-lg transition-colors"
                    style={{
                      background: alert.severity === 'CRITICAL' ? 'rgba(255,32,32,0.06)' : 'var(--color-bg-elevated)',
                      border: `1px solid ${alert.severity === 'CRITICAL' ? 'rgba(255,32,32,0.2)' : 'var(--color-border)'}`,
                    }}>
                    <SeverityBadge severity={alert.severity} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{alert.type}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{alert.camera} · {alert.location}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <StatusBadge status={alert.status} size="sm" />
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)', fontSize: '10px' }}>
                        {new Date(alert.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Active Cases */}
          <div className="col-span-12 lg:col-span-6 card p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Active Incidents</h3>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{activeCases} open cases</p>
              </div>
              <button onClick={() => navigate('/crm/cases')} className="text-xs flex items-center gap-1 hover:opacity-80" style={{ color: 'var(--color-primary)' }}>
                View all <ChevronRight size={12} />
              </button>
            </div>
            <div className="space-y-2">
              {cases.filter(c => c.status !== 'CLOSED').slice(0, 5).map(c => (
                <div key={c.id} className="flex items-center gap-3 px-3 py-2 rounded"
                  style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>{c.id}</span>
                      <span className="text-xs font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{c.title}</span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{c.assignedOfficer}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{
                      background: c.priority === 'CRITICAL' ? 'rgba(255,32,32,0.12)' : c.priority === 'HIGH' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
                      color: c.priority === 'CRITICAL' ? '#ff4444' : c.priority === 'HIGH' ? '#ef4444' : '#f59e0b',
                    }}>{c.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Health */}
          <div className="col-span-12 lg:col-span-6 card p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>System Health</h3>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>AI engines & infrastructure</p>
              </div>
              <button onClick={() => navigate('/management/system')} className="text-xs flex items-center gap-1 hover:opacity-80" style={{ color: 'var(--color-primary)' }}>
                Details <ChevronRight size={12} />
              </button>
            </div>
            <div className="space-y-2.5">
              {systemComponents.slice(0, 5).map(sys => (
                <div key={sys.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{sys.name}</span>
                      <span className="text-xs font-medium" style={{
                        color: sys.status === 'OPERATIONAL' ? 'var(--color-success)' : sys.status === 'DEGRADED' ? 'var(--color-warning)' : 'var(--color-danger)',
                      }}>{sys.status}</span>
                    </div>
                    <ProgressBar
                      value={sys.cpuUsage ?? 0}
                      color={sys.status === 'OPERATIONAL' ? 'var(--color-success)' : sys.status === 'DEGRADED' ? 'var(--color-warning)' : 'var(--color-danger)'}
                      height={3}
                    />
                  </div>
                  <span className="text-xs shrink-0 font-mono" style={{ color: 'var(--color-text-muted)' }}>
                    {sys.cpuUsage ?? 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Active Cameras */}
          <div className="col-span-12 lg:col-span-6 card p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Top Active Cameras</h3>
              </div>
              <button onClick={() => navigate('/surveillance/live')} className="text-xs flex items-center gap-1 hover:opacity-80" style={{ color: 'var(--color-primary)' }}>
                Live view <ArrowUpRight size={12} />
              </button>
            </div>
            <div className="space-y-2">
              {cameras.filter(c => c.status === 'ONLINE').sort((a, b) => b.detectionCount - a.detectionCount).slice(0, 5).map(cam => (
                <div key={cam.id} className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-white/3 transition-colors"
                  style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: 'var(--color-success)' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{cam.name}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{cam.location}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold" style={{ color: 'var(--color-primary-light)' }}>{cam.detectionCount}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)', fontSize: '10px' }}>detections</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="col-span-12 lg:col-span-6 card p-4">
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'View Live Surveillance', icon: <Eye size={16} />, path: '/surveillance/live', color: 'var(--color-primary)' },
                { label: 'Add New Camera', icon: <Plus size={16} />, path: '/management/cameras', color: 'var(--color-success)' },
                { label: 'Create Alert Rule', icon: <AlertTriangle size={16} />, path: '/intelligence/alerts', color: 'var(--color-warning)' },
                { label: 'Generate AI Report', icon: <FileText size={16} />, path: '/intelligence/ai-reports', color: 'var(--color-accent-purple)' },
              ].map(action => (
                <button key={action.label} onClick={() => navigate(action.path)}
                  className="flex items-center gap-2 p-3 rounded-lg text-left transition-all duration-150 hover:opacity-90"
                  style={{ background: `${action.color}12`, border: `1px solid ${action.color}25`, color: action.color }}>
                  {action.icon}
                  <span className="text-xs font-medium">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── AI Assistant Panel (right, always visible on dashboard) ── */}
      <div
        className="hidden lg:flex flex-col shrink-0"
        style={{
          width: '280px',
          background: 'var(--color-bg-surface)',
          borderLeft: '1px solid var(--color-border)',
        }}
      >
        <DashboardAIChat />
      </div>
    </div>
  );
};

export default CommandDashboard;
