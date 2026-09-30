import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Loader2, FileText, Download, Copy, Sparkles, Clock } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { AIMessage } from '../../types';
import { getAIResponse, suggestedPrompts } from '../../data/aiResponses';
import { PageHeader } from '../../components/common';

let reportMsgId = 300;

const sampleReport = {
  title: 'IBVAP Automated Incident Report',
  date: '22 August 2026, 21:30 hrs',
  summary: 'A total of 4 intrusion attempts, 62 human detections, and 12 alerts were recorded across all sectors today. BOP North sector experienced the highest threat activity with a confirmed border crossing at 21:10 hrs.',
  incidents: [
    { id: 'INC-001', title: 'Border Intrusion – BOP North', severity: 'CRITICAL', time: '21:10:34', location: 'BOP North Gate Alpha (CAM-001)', cameras: ['CAM-001', 'CAM-002'], entities: ['1 unknown person, male, dark jacket'], action: 'Deploy QRT, track subject, establish perimeter.' },
    { id: 'INC-002', title: 'HVT Face Identification', severity: 'CRITICAL', time: '21:08:22', location: 'Central Gate PTZ (CAM-010)', cameras: ['CAM-010'], entities: ['Mohammad Farooq (CRN-0021)'], action: 'Coordinate with Central Gate security. Cross-reference case CS-2010.' },
  ],
};

const AIReports: React.FC = () => {
  const { setCurrentPage } = useAppStore();
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'rm-001', role: 'assistant', timestamp: new Date().toISOString(),
      content: '📋 **AI Reports & Queries Interface**\n\nThis interface is connected to the IBVAP intelligence database. You can:\n\n- Query surveillance data using natural language\n- Request automated incident reports\n- Analyze trends and patterns\n\n**Note:** Local LLM integration pending. Using simulated responses.\n\nType a query or select a suggested prompt to begin.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setCurrentPage('ai-reports'); }, [setCurrentPage]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: AIMessage = { id: `rm-${++reportMsgId}`, role: 'user', content: text, timestamp: new Date().toISOString() };
    const loadMsg: AIMessage = { id: `rm-${++reportMsgId}`, role: 'assistant', content: '', timestamp: new Date().toISOString(), isLoading: true };
    setMessages(m => [...m, userMsg, loadMsg]);
    setLoading(true);
    setInput('');
    setTimeout(() => {
      const resp = getAIResponse(text);
      setMessages(m => m.map(msg => msg.isLoading ? { ...msg, content: resp, isLoading: false } : msg));
      setLoading(false);
    }, 1400);
  };

  const prompts = suggestedPrompts['ai-reports'];

  return (
    <div className="flex flex-col h-full" style={{ height: 'calc(100vh - 56px)' }}>
      <PageHeader
        title="AI Reports & Queries"
        subtitle="Surveillance intelligence query interface"
        icon={<Bot size={16} />}
        accent="var(--color-primary)"
        actions={
          <button
            onClick={() => setShowReport(!showReport)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium hover:opacity-80 transition-opacity"
            style={{ background: 'rgba(59,130,246,0.12)', color: 'var(--color-primary)', border: '1px solid rgba(59,130,246,0.25)' }}
          >
            <FileText size={14} />
            {showReport ? 'Hide Report' : 'Generate Report'}
          </button>
        }
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Chat Interface */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: 'linear-gradient(135deg,#1e3a8a,#0e7490)' }}>
                    <Bot size={16} style={{ color: '#93c5fd' }} />
                  </div>
                )}
                <div
                  className="max-w-[70%] rounded-xl px-4 py-3"
                  style={msg.role === 'user'
                    ? { background: 'rgba(59,130,246,0.18)', border: '1px solid rgba(59,130,246,0.3)' }
                    : { background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }
                  }
                >
                  {msg.isLoading ? (
                    <div className="flex items-center gap-2 py-1">
                      <Loader2 size={14} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
                      <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Analyzing surveillance data...</span>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap"
                        style={{ color: msg.role === 'user' ? '#93c5fd' : 'var(--color-text-secondary)' }}>
                        {msg.content}
                      </p>
                      <p className="text-xs mt-2" style={{ color: 'var(--color-text-disabled)' }}>
                        {new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </p>
                    </>
                  )}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {/* Suggested prompts */}
          <div className="px-6 py-3" style={{ borderTop: '1px solid var(--color-border)' }}>
            <p className="text-xs mb-2 flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
              <Sparkles size={12} /> Suggested queries:
            </p>
            <div className="flex flex-wrap gap-2">
              {prompts.map(p => (
                <button key={p.id} onClick={() => !loading && send(p.text)}
                  className="text-xs px-3 py-1.5 rounded-full transition-all hover:opacity-80"
                  style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: 'var(--color-primary-light)' }}>
                  {p.text}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="px-6 pb-6">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-light)' }}>
              <Bot size={18} style={{ color: 'var(--color-primary)', opacity: 0.7 }} />
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send(input)}
                placeholder="Ask the surveillance system... e.g. Show suspicious activities near BOP North in the last 6 hours."
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: 'var(--color-text-primary)' }}
                disabled={loading}
              />
              <button onClick={() => send(input)} disabled={!input.trim() || loading}
                className="p-2 rounded-lg transition-all disabled:opacity-40"
                style={{ background: loading ? 'transparent' : 'var(--color-primary)', color: '#fff' }}>
                {loading ? <Loader2 size={16} className="animate-spin" style={{ color: 'var(--color-primary)' }} /> : <Send size={16} />}
              </button>
            </div>
            <p className="text-xs mt-2 text-center" style={{ color: 'var(--color-text-disabled)' }}>
              Simulated AI responses · Air-gapped Local LLM pending deployment
            </p>
          </div>
        </div>

        {/* Incident Report Panel */}
        {showReport && (
          <div className="w-96 shrink-0 overflow-y-auto p-4 border-l" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-surface)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Automated Report</h3>
              <div className="flex gap-1">
                <button className="p-1.5 rounded hover:bg-white/5" style={{ color: 'var(--color-text-muted)' }} title="Copy">
                  <Copy size={14} />
                </button>
                <button className="p-1.5 rounded hover:bg-white/5" style={{ color: 'var(--color-text-muted)' }} title="Export PDF">
                  <Download size={14} />
                </button>
              </div>
            </div>

            <div className="card p-4 space-y-4">
              {/* Report header */}
              <div className="text-center pb-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <div className="text-xs font-bold mb-1" style={{ color: 'var(--color-primary)', letterSpacing: '0.1em' }}>
                  IBVAP INTELLIGENCE REPORT
                </div>
                <h2 className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{sampleReport.title}</h2>
                <p className="text-xs mt-1 flex items-center justify-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                  <Clock size={11} /> {sampleReport.date}
                </p>
              </div>

              {/* Summary */}
              <div>
                <h4 className="text-xs font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>INCIDENT SUMMARY</h4>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{sampleReport.summary}</p>
              </div>

              {/* Incidents */}
              {sampleReport.incidents.map(inc => (
                <div key={inc.id} className="rounded p-3" style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded"
                      style={{ background: 'rgba(255,32,32,0.12)', color: '#ff4444', border: '1px solid rgba(255,32,32,0.25)' }}>
                      {inc.severity}
                    </span>
                    <span className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>{inc.title}</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div><span style={{ color: 'var(--color-text-muted)' }}>Time: </span><span style={{ color: 'var(--color-text-secondary)' }}>{inc.time}</span></div>
                    <div><span style={{ color: 'var(--color-text-muted)' }}>Location: </span><span style={{ color: 'var(--color-text-secondary)' }}>{inc.location}</span></div>
                    <div><span style={{ color: 'var(--color-text-muted)' }}>Cameras: </span><span style={{ color: 'var(--color-text-secondary)' }}>{inc.cameras.join(', ')}</span></div>
                    <div><span style={{ color: 'var(--color-text-muted)' }}>Entities: </span><span style={{ color: 'var(--color-text-secondary)' }}>{inc.entities.join(', ')}</span></div>
                    <div className="pt-1 border-t" style={{ borderColor: 'var(--color-border)' }}>
                      <span style={{ color: 'var(--color-warning)' }}>⚡ Action: </span>
                      <span style={{ color: 'var(--color-text-secondary)' }}>{inc.action}</span>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex gap-2 pt-2">
                <button className="flex-1 py-2 rounded text-xs font-medium hover:opacity-80"
                  style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}>
                  <Download size={12} className="inline mr-1" /> Export PDF
                </button>
                <button className="flex-1 py-2 rounded text-xs font-medium hover:opacity-80"
                  style={{ background: 'rgba(100,116,139,0.12)', color: '#94a3b8', border: '1px solid var(--color-border)' }}>
                  <Copy size={12} className="inline mr-1" /> Copy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIReports;
