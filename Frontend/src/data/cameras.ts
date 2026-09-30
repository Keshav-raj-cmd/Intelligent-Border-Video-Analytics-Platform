import { Camera } from '../types';

export const cameras: Camera[] = [
  {
    id: 'CAM-001', name: 'BOP North Gate Alpha', location: 'BOP North – Main Gate',
    sector: 'NORTH', status: 'ONLINE', streamStatus: 'LIVE', type: 'PTZ',
    ipAddress: '192.168.10.101', lastActivity: '2 min ago', aiMonitoring: true,
    detectionCount: 47, alerts: 3, resolution: '4K', fps: 30, coverage: '180°',
  },
  {
    id: 'CAM-002', name: 'BOP North Perimeter East', location: 'BOP North – East Perimeter',
    sector: 'NORTH', status: 'ONLINE', streamStatus: 'LIVE', type: 'FIXED',
    ipAddress: '192.168.10.102', lastActivity: '1 min ago', aiMonitoring: true,
    detectionCount: 23, alerts: 1, resolution: '1080p', fps: 25, coverage: '90°',
  },
  {
    id: 'CAM-003', name: 'North Road Thermal', location: 'BOP North – Border Road KM 12',
    sector: 'NORTH', status: 'ONLINE', streamStatus: 'LIVE', type: 'THERMAL',
    ipAddress: '192.168.10.103', lastActivity: '30 sec ago', aiMonitoring: true,
    detectionCount: 8, alerts: 2, resolution: '640×480', fps: 15, coverage: '120°',
  },
  {
    id: 'CAM-004', name: 'East Checkpoint Entry', location: 'East Checkpoint – Entry Lane',
    sector: 'EAST', status: 'ONLINE', streamStatus: 'LIVE', type: 'ANPR',
    ipAddress: '192.168.10.104', lastActivity: '45 sec ago', aiMonitoring: true,
    detectionCount: 134, alerts: 0, resolution: '4K', fps: 30, coverage: '60°',
  },
  {
    id: 'CAM-005', name: 'East Checkpoint Exit', location: 'East Checkpoint – Exit Lane',
    sector: 'EAST', status: 'ONLINE', streamStatus: 'LIVE', type: 'ANPR',
    ipAddress: '192.168.10.105', lastActivity: '1 min ago', aiMonitoring: true,
    detectionCount: 121, alerts: 0, resolution: '4K', fps: 30, coverage: '60°',
  },
  {
    id: 'CAM-006', name: 'East Ridge Surveillance', location: 'East Sector – Ridge Point',
    sector: 'EAST', status: 'ONLINE', streamStatus: 'LIVE', type: 'PTZ',
    ipAddress: '192.168.10.106', lastActivity: '5 min ago', aiMonitoring: true,
    detectionCount: 12, alerts: 1, resolution: '4K', fps: 30, coverage: '360°',
  },
  {
    id: 'CAM-007', name: 'West Sector Night Cam', location: 'West Sector – Bunker 3',
    sector: 'WEST', status: 'ONLINE', streamStatus: 'LIVE', type: 'NIGHT_VISION',
    ipAddress: '192.168.10.107', lastActivity: '2 min ago', aiMonitoring: true,
    detectionCount: 19, alerts: 2, resolution: '1080p', fps: 25, coverage: '110°',
  },
  {
    id: 'CAM-008', name: 'West Border Road', location: 'West Border Road KM 7',
    sector: 'WEST', status: 'DEGRADED', streamStatus: 'LIVE', type: 'FIXED',
    ipAddress: '192.168.10.108', lastActivity: '10 min ago', aiMonitoring: false,
    detectionCount: 6, alerts: 0, resolution: '720p', fps: 15, coverage: '90°',
  },
  {
    id: 'CAM-009', name: 'Central Command View', location: 'Central Sector – HQ Perimeter',
    sector: 'CENTRAL', status: 'ONLINE', streamStatus: 'LIVE', type: 'PTZ',
    ipAddress: '192.168.10.109', lastActivity: '1 min ago', aiMonitoring: true,
    detectionCount: 88, alerts: 0, resolution: '4K', fps: 30, coverage: '360°',
  },
  {
    id: 'CAM-010', name: 'Central Gate PTZ', location: 'Central – Main Entrance Gate',
    sector: 'CENTRAL', status: 'ONLINE', streamStatus: 'LIVE', type: 'PTZ',
    ipAddress: '192.168.10.110', lastActivity: '30 sec ago', aiMonitoring: true,
    detectionCount: 211, alerts: 1, resolution: '4K', fps: 30, coverage: '270°',
  },
  {
    id: 'CAM-011', name: 'South Patrol Road', location: 'South Sector – Patrol Road Alpha',
    sector: 'SOUTH', status: 'ONLINE', streamStatus: 'LIVE', type: 'FIXED',
    ipAddress: '192.168.10.111', lastActivity: '3 min ago', aiMonitoring: true,
    detectionCount: 31, alerts: 0, resolution: '1080p', fps: 25, coverage: '120°',
  },
  {
    id: 'CAM-012', name: 'South Thermal Overwatch', location: 'South Sector – OP Delta',
    sector: 'SOUTH', status: 'ONLINE', streamStatus: 'LIVE', type: 'THERMAL',
    ipAddress: '192.168.10.112', lastActivity: '1 min ago', aiMonitoring: true,
    detectionCount: 14, alerts: 1, resolution: '640×480', fps: 15, coverage: '180°',
  },
  {
    id: 'CAM-013', name: 'West Bunker Cam', location: 'West Sector – Bunker 1',
    sector: 'WEST', status: 'OFFLINE', streamStatus: 'OFFLINE', type: 'FIXED',
    ipAddress: '192.168.10.113', lastActivity: '2 hrs ago', aiMonitoring: false,
    detectionCount: 0, alerts: 0, resolution: '1080p', fps: 25, coverage: '90°',
  },
  {
    id: 'CAM-014', name: 'North Gate Night Vision', location: 'BOP North – Side Gate',
    sector: 'NORTH', status: 'OFFLINE', streamStatus: 'OFFLINE', type: 'NIGHT_VISION',
    ipAddress: '192.168.10.114', lastActivity: '45 min ago', aiMonitoring: false,
    detectionCount: 0, alerts: 0, resolution: '1080p', fps: 25, coverage: '90°',
  },
  {
    id: 'CAM-015', name: 'East Perimeter Watch', location: 'East Sector – Perimeter B',
    sector: 'EAST', status: 'MAINTENANCE', streamStatus: 'PAUSED', type: 'PTZ',
    ipAddress: '192.168.10.115', lastActivity: '1 hr ago', aiMonitoring: false,
    detectionCount: 0, alerts: 0, resolution: '4K', fps: 30, coverage: '180°',
  },
];

export const onlineCameras = cameras.filter(c => c.status === 'ONLINE');
export const offlineCameras = cameras.filter(c => c.status === 'OFFLINE');
export const getCameraById = (id: string) => cameras.find(c => c.id === id);
export const getCamerasBySector = (sector: string) => cameras.filter(c => c.sector === sector);
