import { Alert, SystemEvent } from '../types';

export const alerts: Alert[] = [
  {
    id: 'ALT-2041', type: 'BORDER INTRUSION', severity: 'CRITICAL',
    camera: 'BOP North Gate Alpha', cameraId: 'CAM-001',
    location: 'BOP North – Main Gate', sector: 'NORTH',
    timestamp: '2026-08-22T21:10:34', status: 'NEW',
    description: 'Unauthorized person detected crossing the primary border fence at BOP North. Moving in eastern direction.',
  },
  {
    id: 'ALT-2040', type: 'UNKNOWN PERSON', severity: 'HIGH',
    camera: 'North Road Thermal', cameraId: 'CAM-003',
    location: 'BOP North – Border Road KM 12', sector: 'NORTH',
    timestamp: '2026-08-22T21:05:12', status: 'ACKNOWLEDGED',
    description: 'Unknown individual detected in restricted thermal zone. Face not identified in database.',
  },
  {
    id: 'ALT-2039', type: 'VEHICLE INTRUSION', severity: 'HIGH',
    camera: 'East Ridge Surveillance', cameraId: 'CAM-006',
    location: 'East Sector – Ridge Point', sector: 'EAST',
    timestamp: '2026-08-22T20:58:47', status: 'INVESTIGATING',
    description: 'Unregistered vehicle entered restricted zone without checkpoint clearance.',
  },
  {
    id: 'ALT-2038', type: 'CURFEW VIOLATION', severity: 'MEDIUM',
    camera: 'West Sector Night Cam', cameraId: 'CAM-007',
    location: 'West Sector – Bunker 3', sector: 'WEST',
    timestamp: '2026-08-22T20:45:22', status: 'ACKNOWLEDGED',
    description: 'Human movement detected in curfew zone after 20:00 hrs. Individual appears to be alone.',
  },
  {
    id: 'ALT-2037', type: 'SUSPICIOUS ACTIVITY', severity: 'MEDIUM',
    camera: 'South Thermal Overwatch', cameraId: 'CAM-012',
    location: 'South Sector – OP Delta', sector: 'SOUTH',
    timestamp: '2026-08-22T20:30:15', status: 'RESOLVED',
    description: 'Group of 3 individuals detected loitering near border marker. Dispersed after patrol approached.',
  },
  {
    id: 'ALT-2036', type: 'WATCHLIST VEHICLE', severity: 'HIGH',
    camera: 'East Checkpoint Entry', cameraId: 'CAM-004',
    location: 'East Checkpoint – Entry Lane', sector: 'EAST',
    timestamp: '2026-08-22T20:15:08', status: 'ACKNOWLEDGED',
    description: 'Vehicle plate UP32-AB-1234 matches watchlist entry associated with case CS-1982.',
  },
  {
    id: 'ALT-2035', type: 'CAMERA OFFLINE', severity: 'LOW',
    camera: 'West Bunker Cam', cameraId: 'CAM-013',
    location: 'West Sector – Bunker 1', sector: 'WEST',
    timestamp: '2026-08-22T19:45:30', status: 'ACKNOWLEDGED',
    description: 'CAM-013 has lost connection. Network timeout. Maintenance team notified.',
  },
  {
    id: 'ALT-2034', type: 'FACE DETECTION', severity: 'CRITICAL',
    camera: 'Central Gate PTZ', cameraId: 'CAM-010',
    location: 'Central – Main Entrance Gate', sector: 'CENTRAL',
    timestamp: '2026-08-22T19:32:44', status: 'RESOLVED',
    description: 'Face matched against criminal database. Confidence 94%. Subject detained at checkpoint.',
  },
  {
    id: 'ALT-2033', type: 'FENCE BREACH', severity: 'CRITICAL',
    camera: 'BOP North Perimeter East', cameraId: 'CAM-002',
    location: 'BOP North – East Perimeter', sector: 'NORTH',
    timestamp: '2026-08-22T19:10:18', status: 'RESOLVED',
    description: 'Virtual fence Zone B triggered. Two individuals crossed the virtual boundary line.',
  },
  {
    id: 'ALT-2032', type: 'ABANDONED OBJECT', severity: 'HIGH',
    camera: 'South Patrol Road', cameraId: 'CAM-011',
    location: 'South Sector – Patrol Road Alpha', sector: 'SOUTH',
    timestamp: '2026-08-22T18:55:03', status: 'RESOLVED',
    description: 'Stationary object detected near patrol road for >15 minutes. Bomb disposal team alerted.',
  },
  {
    id: 'ALT-2031', type: 'THERMAL DETECTION', severity: 'HIGH',
    camera: 'North Road Thermal', cameraId: 'CAM-003',
    location: 'BOP North – Border Road KM 12', sector: 'NORTH',
    timestamp: '2026-08-22T18:30:55', status: 'RESOLVED',
    description: 'Thermal signature detected in low-visibility area. Target moving toward border.',
  },
  {
    id: 'ALT-2030', type: 'GROUP MOVEMENT', severity: 'MEDIUM',
    camera: 'East Ridge Surveillance', cameraId: 'CAM-006',
    location: 'East Sector – Ridge Point', sector: 'EAST',
    timestamp: '2026-08-22T18:10:22', status: 'RESOLVED',
    description: 'Group of 5+ individuals detected moving in convoy formation near restricted area.',
  },
];

export const systemEvents: SystemEvent[] = [
  {
    id: 'EVT-5041', eventType: 'SYSTEM_STARTUP', timestamp: '2026-08-22T06:00:00',
    severity: 'INFO', status: 'RESOLVED', description: 'System startup complete. All engines online.',
  },
  {
    id: 'EVT-5040', eventType: 'AI_ENGINE_START', timestamp: '2026-08-22T06:01:30',
    severity: 'INFO', status: 'RESOLVED', description: 'AI Processing Engine initialized. Models loaded.',
  },
  {
    id: 'EVT-5039', eventType: 'CAMERA_OFFLINE', camera: 'CAM-013',
    location: 'West Sector', sector: 'WEST', timestamp: '2026-08-22T19:45:30',
    severity: 'LOW', status: 'ACKNOWLEDGED', description: 'CAM-013 lost connection. Network timeout.',
  },
  {
    id: 'EVT-5038', eventType: 'STORAGE_WARNING', timestamp: '2026-08-22T14:00:00',
    severity: 'MEDIUM', status: 'ACKNOWLEDGED', description: 'Storage at 78%. Archive old recordings.',
  },
  {
    id: 'EVT-5037', eventType: 'DETECTION_SURGE', camera: 'CAM-001',
    location: 'BOP North', sector: 'NORTH', timestamp: '2026-08-22T21:10:00',
    severity: 'HIGH', status: 'ACKNOWLEDGED', description: 'High detection rate at CAM-001. Manual review recommended.',
  },
];

export const getAlertsBySeverity = (severity: string) => 
  alerts.filter(a => a.severity === severity);

export const alertSeverityCount = {
  CRITICAL: alerts.filter(a => a.severity === 'CRITICAL').length,
  HIGH: alerts.filter(a => a.severity === 'HIGH').length,
  MEDIUM: alerts.filter(a => a.severity === 'MEDIUM').length,
  LOW: alerts.filter(a => a.severity === 'LOW').length,
  INFO: alerts.filter(a => a.severity === 'INFO').length,
};
