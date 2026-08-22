import { DailyMetric, SectorMetric, SystemComponent, StorageMetric } from '../types';

export const dailyMetrics: DailyMetric[] = [
  { date: 'Aug 16', humans: 34, vehicles: 87, intrusions: 1, suspicious: 4, alerts: 6 },
  { date: 'Aug 17', humans: 41, vehicles: 102, intrusions: 2, suspicious: 7, alerts: 11 },
  { date: 'Aug 18', humans: 28, vehicles: 94, intrusions: 0, suspicious: 3, alerts: 4 },
  { date: 'Aug 19', humans: 55, vehicles: 118, intrusions: 3, suspicious: 9, alerts: 14 },
  { date: 'Aug 20', humans: 47, vehicles: 109, intrusions: 1, suspicious: 6, alerts: 9 },
  { date: 'Aug 21', humans: 39, vehicles: 96, intrusions: 2, suspicious: 5, alerts: 8 },
  { date: 'Aug 22', humans: 62, vehicles: 134, intrusions: 4, suspicious: 8, alerts: 12 },
];

export const weeklyStats = {
  totalDetections: 703,
  totalAlerts: 64,
  totalIntrusions: 13,
  avgDaily: 100,
};

export const sectorMetrics: SectorMetric[] = [
  { sector: 'NORTH', cameras: 4, detections: 78, alerts: 5, status: 'CRITICAL', intrusions: 3, vehicles: 12, trend: 'up' },
  { sector: 'EAST', cameras: 4, detections: 256, alerts: 2, status: 'ELEVATED', intrusions: 0, vehicles: 98, trend: 'up' },
  { sector: 'WEST', cameras: 3, detections: 25, alerts: 1, status: 'NORMAL', intrusions: 0, vehicles: 8, trend: 'stable' },
  { sector: 'CENTRAL', cameras: 2, detections: 299, alerts: 1, status: 'NORMAL', intrusions: 1, vehicles: 16, trend: 'stable' },
  { sector: 'SOUTH', cameras: 2, detections: 45, alerts: 1, status: 'ELEVATED', intrusions: 0, vehicles: 10, trend: 'down' },
];

export const storageMetrics: StorageMetric[] = [
  { id: 'STG-001', name: 'Primary NAS (Footage Archive)', type: 'NAS RAID-6', total: '48 TB', used: '37.4 TB', usagePercent: 78 },
  { id: 'STG-002', name: 'Secondary NAS (Intelligence Data)', type: 'NAS RAID-1', total: '12 TB', used: '5.8 TB', usagePercent: 48 },
  { id: 'STG-003', name: 'SSD Hot Storage (Active Events)', type: 'NVMe SSD', total: '4 TB', used: '2.3 TB', usagePercent: 57 },
  { id: 'STG-004', name: 'Backup Cold Storage', type: 'HDD Archive', total: '100 TB', used: '91.2 TB', usagePercent: 91 },
];

export const hourlyActivity = [
  { hour: '00:00', detections: 2 },
  { hour: '02:00', detections: 5 },
  { hour: '04:00', detections: 8 },
  { hour: '06:00', detections: 14 },
  { hour: '08:00', detections: 31 },
  { hour: '10:00', detections: 28 },
  { hour: '12:00', detections: 22 },
  { hour: '14:00', detections: 19 },
  { hour: '16:00', detections: 26 },
  { hour: '18:00', detections: 35 },
  { hour: '20:00', detections: 42 },
  { hour: '21:30', detections: 18 },
];

export const alertSeverityData = [
  { name: 'Critical', value: 3, color: '#ff2020' },
  { name: 'High', value: 5, color: '#ef4444' },
  { name: 'Medium', value: 4, color: '#f59e0b' },
  { name: 'Low', value: 2, color: '#3b82f6' },
  { name: 'Info', value: 1, color: '#64748b' },
];

export const cameraUptimeData = [
  { name: 'Online', value: 11, color: '#10b981' },
  { name: 'Degraded', value: 1, color: '#f59e0b' },
  { name: 'Offline', value: 2, color: '#ef4444' },
  { name: 'Maintenance', value: 1, color: '#64748b' },
];

export const systemComponents: SystemComponent[] = [
  {
    id: 'SYS-001', name: 'CCTV Network', category: 'Infrastructure',
    status: 'OPERATIONAL', uptime: '99.2%', cpuUsage: 18, memoryUsage: 31,
    lastChecked: '2026-08-22T21:30:00', version: 'IBVAP-NET v2.1',
    description: 'Primary CCTV network infrastructure. Managing 15 cameras across 5 sectors.',
  },
  {
    id: 'SYS-002', name: 'AI Processing Engine', category: 'AI/ML',
    status: 'OPERATIONAL', uptime: '99.8%', cpuUsage: 67, memoryUsage: 78,
    lastChecked: '2026-08-22T21:30:00', version: 'IBVAP-AI v1.4.2',
    description: 'Core AI processing engine handling detection, classification, and alert generation.',
  },
  {
    id: 'SYS-003', name: 'Face Detection Engine', category: 'AI/ML',
    status: 'OPERATIONAL', uptime: '98.5%', cpuUsage: 72, memoryUsage: 65,
    lastChecked: '2026-08-22T21:30:00', version: 'FaceNet v3.1',
    description: 'Facial recognition and matching engine integrated with criminal database.',
  },
  {
    id: 'SYS-004', name: 'ANPR Engine', category: 'AI/ML',
    status: 'OPERATIONAL', uptime: '99.1%', cpuUsage: 44, memoryUsage: 52,
    lastChecked: '2026-08-22T21:30:00', version: 'ANPR v2.0.1',
    description: 'Automatic Number Plate Recognition engine for vehicle detection.',
  },
  {
    id: 'SYS-005', name: 'Thermal Intelligence', category: 'Specialized',
    status: 'OPERATIONAL', uptime: '97.3%', cpuUsage: 29, memoryUsage: 41,
    lastChecked: '2026-08-22T21:30:00', version: 'ThermalAI v1.0',
    description: 'Thermal camera analysis and heat signature detection system.',
  },
  {
    id: 'SYS-006', name: 'Local LLM System', category: 'AI/ML',
    status: 'STANDBY', uptime: 'N/A', cpuUsage: 5, memoryUsage: 12,
    lastChecked: '2026-08-22T21:30:00', version: 'Pending Integration',
    description: 'Air-gapped local LLM for intelligence queries and report generation. In pre-deployment phase.',
  },
  {
    id: 'SYS-007', name: 'Storage System', category: 'Infrastructure',
    status: 'DEGRADED', uptime: '99.0%', cpuUsage: 12, memoryUsage: 78,
    lastChecked: '2026-08-22T21:30:00', version: 'NAS v4.2',
    description: 'Primary storage for footage archive and intelligence data. At 78% capacity – archiving required.',
  },
  {
    id: 'SYS-008', name: 'Alert System', category: 'Operations',
    status: 'OPERATIONAL', uptime: '99.9%', cpuUsage: 8, memoryUsage: 22,
    lastChecked: '2026-08-22T21:30:00', version: 'AlertMgr v3.0',
    description: 'Real-time alert generation, routing, and notification management system.',
  },
  {
    id: 'SYS-009', name: 'Virtual Fence Engine', category: 'AI/ML',
    status: 'OPERATIONAL', uptime: '99.5%', cpuUsage: 38, memoryUsage: 45,
    lastChecked: '2026-08-22T21:30:00', version: 'VirtualFence v1.2',
    description: 'Virtual boundary detection and zone intrusion alert system.',
  },
  {
    id: 'SYS-010', name: 'Network Infrastructure', category: 'Infrastructure',
    status: 'OPERATIONAL', uptime: '99.7%', cpuUsage: 22, memoryUsage: 38,
    lastChecked: '2026-08-22T21:30:00', version: 'Network Core v5.1',
    description: 'Secure internal network connecting all cameras, servers, and endpoints.',
  },
];

export const systemRecentEvents = [
  { timestamp: '2026-08-22T21:30:00', event: 'Scheduled health check completed – all systems nominal', level: 'INFO' },
  { timestamp: '2026-08-22T21:10:34', event: 'High detection rate on CAM-001 – AI Engine load spike to 84%', level: 'WARNING' },
  { timestamp: '2026-08-22T19:45:30', event: 'CAM-013 network connection lost – offline status recorded', level: 'WARNING' },
  { timestamp: '2026-08-22T18:00:00', event: 'Storage system warning: capacity at 78% – auto-archive triggered', level: 'WARNING' },
  { timestamp: '2026-08-22T14:00:00', event: 'Face Detection Engine model refresh completed successfully', level: 'INFO' },
  { timestamp: '2026-08-22T10:00:00', event: 'Backup completed for all intelligence database records', level: 'INFO' },
  { timestamp: '2026-08-22T06:01:30', event: 'System boot sequence complete – all primary engines online', level: 'INFO' },
];
