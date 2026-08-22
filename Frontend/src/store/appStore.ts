import { create } from 'zustand';
import { AIMessage } from '../types';
import { PageContext, getAIResponse, initialMessages, suggestedPrompts } from '../data/aiResponses';
import { tasks as initialTasks } from '../data/tasks';
import { alerts as initialAlerts } from '../data/alerts';
import { Task, Alert } from '../types';

interface AppState {
  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // AI Assistant
  aiDrawerOpen: boolean;
  aiMessages: AIMessage[];
  aiLoading: boolean;
  currentPage: PageContext;
  openAIDrawer: () => void;
  closeAIDrawer: () => void;
  toggleAIDrawer: () => void;
  sendAIMessage: (message: string) => void;
  clearAIMessages: () => void;
  setCurrentPage: (page: PageContext) => void;
  getSuggestedPrompts: () => typeof suggestedPrompts[PageContext];

  // Global notification count
  notificationCount: number;
  alertCount: number;

  // Interactive Data
  tasks: Task[];
  moveTask: (taskId: string, newStatus: Task['status']) => void;
  
  liveAlerts: Alert[];
  resolveAlert: (alertId: string) => void;
  
  // Simulation
  simulationActive: boolean;
  startSimulation: () => void;
}

let msgCounter = 100;

export const useAppStore = create<AppState>((set, get) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set(s => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  aiDrawerOpen: false,
  aiMessages: [...initialMessages],
  aiLoading: false,
  currentPage: 'dashboard',
  openAIDrawer: () => set({ aiDrawerOpen: true }),
  closeAIDrawer: () => set({ aiDrawerOpen: false }),
  toggleAIDrawer: () => set(s => ({ aiDrawerOpen: !s.aiDrawerOpen })),

  sendAIMessage: (message: string) => {
    const userMsg: AIMessage = {
      id: `msg-${++msgCounter}`,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };
    const loadingMsg: AIMessage = {
      id: `msg-${++msgCounter}`,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isLoading: true,
    };
    set(s => ({ aiMessages: [...s.aiMessages, userMsg, loadingMsg], aiLoading: true }));

    setTimeout(() => {
      const response = getAIResponse(message);
      set(s => ({
        aiLoading: false,
        aiMessages: s.aiMessages.map(m =>
          m.isLoading ? { ...m, content: response, isLoading: false } : m
        ),
      }));
    }, 1200 + Math.random() * 800);
  },

  clearAIMessages: () => set({ aiMessages: [...initialMessages] }),

  setCurrentPage: (page: PageContext) => set({ currentPage: page }),

  getSuggestedPrompts: () => suggestedPrompts[get().currentPage],

  notificationCount: 5,
  alertCount: 3,

  // Interactive Data
  tasks: [...initialTasks],
  moveTask: (taskId, newStatus) => set(s => ({
    tasks: s.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
  })),

  liveAlerts: [...initialAlerts],
  resolveAlert: (alertId) => set(s => ({
    liveAlerts: s.liveAlerts.map(a => a.id === alertId ? { ...a, status: 'RESOLVED' } : a)
  })),

  // Simulation
  simulationActive: false,
  startSimulation: () => {
    if (get().simulationActive) return;
    set({ simulationActive: true });
    
    // Simulate real-time alerts
    setInterval(() => {
      const newAlert: Alert = {
        id: `ALT-9${Math.floor(Math.random() * 1000)}`,
        type: Math.random() > 0.5 ? 'Perimeter Breach (Simulated)' : 'Unrecognized Vehicle (Simulated)',
        severity: Math.random() > 0.7 ? 'CRITICAL' : 'HIGH',
        camera: 'CAM-0' + Math.floor(Math.random() * 9 + 1),
        location: ['North Gate', 'East Sector Fence', 'South Bunker', 'West Patrol Road'][Math.floor(Math.random() * 4)],
        timestamp: new Date().toISOString(),
        status: 'NEW',
        description: 'AI detected anomalous activity matching threat signatures.',
      };
      
      set(s => ({
        liveAlerts: [newAlert, ...s.liveAlerts],
        alertCount: s.alertCount + 1,
        notificationCount: s.notificationCount + 1
      }));
    }, 12000); // New alert every 12 seconds
  },
}));
