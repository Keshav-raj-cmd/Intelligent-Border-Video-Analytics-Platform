import React, { useRef, useEffect } from 'react';
import { Bot, X, Send, Trash2, Loader2, Sparkles } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import ReactMarkdown from 'react-markdown';

// Simple markdown renderer without the library dependency
const SimpleMarkdown: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      elements.push(<strong key={i} style={{ color: 'var(--color-text-primary)' }}>{trimmed.slice(2, -2)}</strong>);
      elements.push(<br key={`br-${i}`} />);
    } else if (trimmed.startsWith('- ')) {
      elements.push(
        <div key={i} className="flex gap-2 my-0.5">
          <span style={{ color: 'var(--color-primary)' }}>•</span>
          <span dangerouslySetInnerHTML={{ __html: trimmed.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
        </div>
      );
    } else if (trimmed === '') {
      elements.push(<br key={i} />);
    } else {
      elements.push(
        <span key={i} dangerouslySetInnerHTML={{ __html: trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
      );
      if (i < lines.length - 1) elements.push(<br key={`br-${i}`} />);
    }
  });

  return <div className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{elements}</div>;
};

const AIAssistantDrawer: React.FC = () => {
  const {
    aiDrawerOpen, closeAIDrawer, aiMessages, aiLoading,
    sendAIMessage, clearAIMessages, getSuggestedPrompts, currentPage,
  } = useAppStore();

  const [input, setInput] = React.useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (aiDrawerOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [aiDrawerOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages]);

  const handleSend = () => {
    const msg = input.trim();
    if (!msg || aiLoading) return;
    setInput('');
    sendAIMessage(msg);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const prompts = getSuggestedPrompts();

  return (
    <aside
      className="fixed top-0 right-0 h-full z-50 flex flex-col slide-in-right"
      style={{
        width: '340px',
        background: 'var(--color-bg-surface)',
        borderLeft: '1px solid var(--color-border)',
        transform: aiDrawerOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s ease',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 shrink-0"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, #1e3a8a, #0e7490)' }}
        >
          <Bot size={16} style={{ color: '#93c5fd' }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            IBVAP AI Assistant
          </div>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-success)' }}>
            <span className="status-dot" style={{ background: 'var(--color-success)', width: '6px', height: '6px' }} />
            Online · Ready
          </div>
        </div>
        <button
          onClick={() => clearAIMessages()}
          className="p-1 rounded hover:bg-white/5 transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
          title="Clear conversation"
        >
          <Trash2 size={14} />
        </button>
        <button
          onClick={closeAIDrawer}
          className="p-1 rounded hover:bg-white/5 transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Context indicator */}
      <div
        className="px-4 py-2 text-xs shrink-0 flex items-center gap-1.5"
        style={{ background: 'rgba(59,130,246,0.07)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-primary-light)' }}
      >
        <Sparkles size={11} />
        <span>Context: <strong>{currentPage.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</strong></span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {aiMessages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: 'linear-gradient(135deg, #1e3a8a, #0e7490)' }}
              >
                <Bot size={12} style={{ color: '#93c5fd' }} />
              </div>
            )}
            <div
              className="max-w-[85%] rounded-lg px-3 py-2"
              style={
                msg.role === 'user'
                  ? { background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.3)' }
                  : { background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }
              }
            >
              {msg.isLoading ? (
                <div className="typing-dots flex items-center gap-1 py-1">
                  <span /><span /><span />
                </div>
              ) : (
                <>
                  {msg.role === 'user' ? (
                    <p className="text-sm" style={{ color: '#93c5fd' }}>{msg.content}</p>
                  ) : (
                    <SimpleMarkdown content={msg.content} />
                  )}
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-disabled)' }}>
                    {new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </p>
                </>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts */}
      {prompts.length > 0 && (
        <div
          className="px-3 py-2 shrink-0"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>Suggested:</p>
          <div className="flex flex-wrap gap-1.5">
            {prompts.slice(0, 4).map(p => (
              <button
                key={p.id}
                onClick={() => !aiLoading && sendAIMessage(p.text)}
                className="text-xs px-2 py-1 rounded transition-all duration-150 hover:opacity-80"
                style={{
                  background: 'rgba(59,130,246,0.1)',
                  border: '1px solid rgba(59,130,246,0.25)',
                  color: 'var(--color-primary-light)',
                }}
              >
                {p.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div
        className="px-3 py-3 shrink-0"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2"
          style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-light)' }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask the surveillance system..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--color-text-primary)' }}
            disabled={aiLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || aiLoading}
            className="p-1 rounded transition-all duration-150 disabled:opacity-40"
            style={{ color: aiLoading ? 'var(--color-text-muted)' : 'var(--color-primary)' }}
          >
            {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
        <p className="text-xs mt-1.5 text-center" style={{ color: 'var(--color-text-disabled)' }}>
          Simulated AI · Local LLM pending deployment
        </p>
      </div>
    </aside>
  );
};

export default AIAssistantDrawer;
