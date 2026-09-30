import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, Filter, Clock, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import { Task } from '../../types';
import { PriorityBadge, SearchBar, FilterButton, PageHeader, StatCard, Btn } from '../../components/common';

const TaskFollowups: React.FC = () => {
  const { setCurrentPage, tasks, moveTask } = useAppStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [selected, setSelected] = useState<Task | null>(tasks[0] || null);

  useEffect(() => { setCurrentPage('tasks-followups'); }, [setCurrentPage]);

  const filtered = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.assignedOfficer.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const complete = (id: string) => moveTask(id, 'COMPLETED');
  const startTask = (id: string) => moveTask(id, 'IN_PROGRESS');

  const statusStyles: Record<string, { bg: string; text: string }> = {
    PENDING: { bg: 'rgba(100,116,139,0.15)', text: '#94a3b8' },
    IN_PROGRESS: { bg: 'rgba(59,130,246,0.15)', text: '#60a5fa' },
    COMPLETED: { bg: 'rgba(16,185,129,0.15)', text: '#10b981' },
    OVERDUE: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444' },
    CANCELLED: { bg: 'rgba(100,116,139,0.15)', text: '#475569' },
  };

  return (
    <div className="flex flex-col h-full" style={{ height: 'calc(100vh - 56px)' }}>
      <PageHeader
        title="Tasks & Follow-ups"
        subtitle="Case activities and operational tasks"
        icon={<CheckSquare size={16} />}
        actions={
          <div className="flex items-center gap-2">
            <SearchBar value={search} onChange={setSearch} placeholder="Search tasks..." className="w-48" />
            <Btn variant="primary" size="sm" icon={<Plus size={13} />}>New Task</Btn>
          </div>
        }
      />
      <div className="grid grid-cols-4 gap-3 px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <StatCard icon={<CheckSquare size={16} />} label="Total Tasks" value={tasks.length} accent="var(--color-primary)" />
        <StatCard icon={<Clock size={16} />} label="Pending" value={tasks.filter(t => t.status === 'PENDING').length} accent="var(--color-warning)" />
        <StatCard icon={<Filter size={16} />} label="Overdue" value={tasks.filter(t => t.status === 'OVERDUE').length} accent="var(--color-danger)" />
        <StatCard icon={<CheckSquare size={16} />} label="Completed" value={tasks.filter(t => t.status === 'COMPLETED').length} accent="var(--color-success)" />
      </div>
      <div className="flex flex-wrap items-center gap-2 px-4 py-2 shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Status:</span>
        {['ALL', 'PENDING', 'IN_PROGRESS', 'OVERDUE', 'COMPLETED'].map(s => (
          <FilterButton key={s} label={s.replace(/_/g, ' ')} active={statusFilter === s} onClick={() => setStatusFilter(s)} />
        ))}
        <span className="text-xs ml-2" style={{ color: 'var(--color-text-muted)' }}>Priority:</span>
        {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(p => (
          <FilterButton key={p} label={p} active={priorityFilter === p} onClick={() => setPriorityFilter(p)} />
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <AnimatePresence>
            {filtered.map(task => {
              const statusStyle = statusStyles[task.status] || statusStyles.PENDING;
              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  key={task.id} 
                  onClick={() => setSelected(task)}
                  className="card p-4 cursor-pointer transition-colors hover:border-blue-500/50"
                  style={{ border: selected?.id === task.id ? '1px solid var(--color-primary)' : '1px solid var(--color-border)' }}>
                  <div className="flex items-start gap-3">
                    <button
                      onClick={e => { e.stopPropagation(); complete(task.id); }}
                      className="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors"
                      style={{
                        borderColor: task.status === 'COMPLETED' ? '#10b981' : 'var(--color-border)',
                        background: task.status === 'COMPLETED' ? '#10b981' : 'transparent',
                      }}
                    >
                      {task.status === 'COMPLETED' && <span style={{ color: '#fff', fontSize: '10px' }}>✓</span>}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>{task.id}</span>
                        <PriorityBadge priority={task.priority} size="sm" />
                        <span className="text-xs px-1.5 py-0.5 rounded"
                          style={{ background: statusStyle.bg, color: statusStyle.text }}>
                          {task.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className={`text-sm font-medium mb-1 ${task.status === 'COMPLETED' ? 'line-through opacity-50' : ''}`}
                        style={{ color: 'var(--color-text-primary)' }}>{task.title}</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{task.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs flex-wrap">
                        <span style={{ color: 'var(--color-text-muted)' }}>👤 {task.assignedOfficer}</span>
                        <span style={{ color: task.status === 'OVERDUE' ? 'var(--color-danger)' : 'var(--color-text-muted)' }}>
                          <Clock size={11} className="inline mr-1" />Due: {task.dueDate}
                        </span>
                        {task.relatedCase && <span style={{ color: 'var(--color-primary)' }}>→ {task.relatedCase}</span>}
                        <span className="text-xs px-1 rounded" style={{ background: 'rgba(100,116,139,0.12)', color: '#94a3b8' }}>
                          {task.category || 'TASK'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      {task.status === 'PENDING' && (
                        <button onClick={e => { e.stopPropagation(); startTask(task.id); }}
                          className="px-2 py-1 rounded text-xs hover:opacity-80 flex items-center gap-1"
                          style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)', whiteSpace: 'nowrap' }}>
                          <Play size={10} /> Start
                        </button>
                      )}
                      {task.status !== 'COMPLETED' && (
                        <button onClick={e => { e.stopPropagation(); complete(task.id); }}
                          className="px-2 py-1 rounded text-xs hover:opacity-80 flex items-center gap-1"
                          style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)', whiteSpace: 'nowrap' }}>
                          <CheckSquare size={10} /> Complete
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {selected && (
          <div className="hidden xl:flex flex-col w-72 shrink-0 overflow-y-auto p-4"
            style={{ borderLeft: '1px solid var(--color-border)', background: 'var(--color-bg-surface)' }}>
            <h3 className="text-xs font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>TASK DETAIL</h3>
            <div className="card p-4 space-y-2 text-xs">
              {[
                { label: 'Task ID', value: selected.id },
                { label: 'Type', value: selected.taskType?.replace(/_/g, ' ') || 'TASK' },
                { label: 'Status', value: selected.status.replace(/_/g, ' ') },
                { label: 'Priority', value: selected.priority },
                { label: 'Officer', value: selected.assignedOfficer },
                { label: 'Due Date', value: selected.dueDate },
                { label: 'Due Time', value: selected.dueTime || 'N/A' },
                { label: 'Related Case', value: selected.relatedCase || 'None' },
                { label: 'Created By', value: selected.createdBy || 'System' },
                { label: 'Notes', value: selected.notes || 'None' },
              ].map(item => (
                <div key={item.label} className="flex justify-between gap-2">
                  <span style={{ color: 'var(--color-text-muted)' }}>{item.label}</span>
                  <span className="font-medium text-right" style={{ color: 'var(--color-text-secondary)' }}>{item.value}</span>
                </div>
              ))}
            </div>
            {selected.status !== 'COMPLETED' && (
              <div className="mt-3 flex flex-col gap-2">
                <Btn variant="success" size="sm" className="w-full justify-center" onClick={() => complete(selected.id)}>
                  Mark Complete
                </Btn>
                <Btn variant="secondary" size="sm" className="w-full justify-center">Edit Task</Btn>
                <Btn variant="danger" size="sm" className="w-full justify-center">Cancel Task</Btn>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskFollowups;
