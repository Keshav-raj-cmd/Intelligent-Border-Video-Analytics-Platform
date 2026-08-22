import { Detection, SuspiciousActivity, ThermalTarget } from '../types';

export const detections: Detection[] = [
  {
    id: 'DET-3041', type: 'HUMAN', camera: 'BOP North Gate Alpha', cameraId: 'CAM-001',
    location: 'BOP North – Main Gate', sector: 'NORTH', timestamp: '2026-08-22T21:12:05',
    confidence: 97, trackingStatus: 'TRACKING', faceDetected: true,
    personId: 'P-UNKNOWN', attributes: { clothing: 'Dark jacket, trousers', height: '~5\'8"', gender: 'MALE', age: '30-40' },
  },
  {
    id: 'DET-3040', type: 'FACE', camera: 'Central Gate PTZ', cameraId: 'CAM-010',
    location: 'Central – Main Entrance Gate', sector: 'CENTRAL', timestamp: '2026-08-22T21:08:22',
    confidence: 94, trackingStatus: 'IDENTIFIED', faceDetected: true,
    personId: 'CRN-0021', attributes: { gender: 'MALE', age: '40-50' },
  },
  {
    id: 'DET-3039', type: 'HUMAN', camera: 'North Road Thermal', cameraId: 'CAM-003',
    location: 'BOP North – Border Road KM 12', sector: 'NORTH', timestamp: '2026-08-22T21:05:44',
    confidence: 89, trackingStatus: 'TRACKING', faceDetected: false,
    personId: 'P-UNKNOWN', attributes: { clothing: 'Light shirt', height: '~5\'6"', gender: 'UNKNOWN', age: 'Unknown' },
  },
  {
    id: 'DET-3038', type: 'HUMAN', camera: 'West Sector Night Cam', cameraId: 'CAM-007',
    location: 'West Sector – Bunker 3', sector: 'WEST', timestamp: '2026-08-22T20:48:33',
    confidence: 82, trackingStatus: 'LOST', faceDetected: false,
    personId: 'P-UNKNOWN', attributes: { clothing: 'Unknown', gender: 'UNKNOWN', age: 'Unknown' },
  },
  {
    id: 'DET-3037', type: 'HUMAN', camera: 'East Ridge Surveillance', cameraId: 'CAM-006',
    location: 'East Sector – Ridge Point', sector: 'EAST', timestamp: '2026-08-22T20:31:19',
    confidence: 91, trackingStatus: 'TRACKING', faceDetected: true,
    personId: 'P-UNKNOWN', attributes: { clothing: 'Military-style clothing', height: '~6\'0"', gender: 'MALE', age: '20-30' },
  },
  {
    id: 'DET-3036', type: 'FACE', camera: 'BOP North Gate Alpha', cameraId: 'CAM-001',
    location: 'BOP North – Main Gate', sector: 'NORTH', timestamp: '2026-08-22T20:15:07',
    confidence: 96, trackingStatus: 'IDENTIFIED', faceDetected: true,
    personId: 'CRN-0034', attributes: { gender: 'MALE', age: '25-35' },
  },
  {
    id: 'DET-3035', type: 'HUMAN', camera: 'South Patrol Road', cameraId: 'CAM-011',
    location: 'South Sector – Patrol Road Alpha', sector: 'SOUTH', timestamp: '2026-08-22T19:58:44',
    confidence: 78, trackingStatus: 'TRACKING', faceDetected: false,
    personId: 'P-UNKNOWN', attributes: { clothing: 'Light-coloured clothing', gender: 'UNKNOWN', age: 'Unknown' },
  },
  {
    id: 'DET-3034', type: 'HUMAN', camera: 'South Thermal Overwatch', cameraId: 'CAM-012',
    location: 'South Sector – OP Delta', sector: 'SOUTH', timestamp: '2026-08-22T19:45:11',
    confidence: 88, trackingStatus: 'TRACKING', faceDetected: false,
    personId: 'P-UNKNOWN', attributes: { clothing: 'Unknown – thermal view only', gender: 'UNKNOWN', age: 'Unknown' },
  },
];

export const suspiciousActivities: SuspiciousActivity[] = [
  {
    id: 'SA-1021', activityType: 'LOITERING', camera: 'East Ridge Surveillance', cameraId: 'CAM-006',
    location: 'East Sector – Ridge Point', sector: 'EAST', timestamp: '2026-08-22T20:58:10',
    severity: 'HIGH', confidence: 87, status: 'UNDER_REVIEW', duration: '18 min', personsInvolved: 1,
  },
  {
    id: 'SA-1020', activityType: 'GROUP_GATHERING', camera: 'South Thermal Overwatch', cameraId: 'CAM-012',
    location: 'South Sector – OP Delta', sector: 'SOUTH', timestamp: '2026-08-22T20:32:44',
    severity: 'MEDIUM', confidence: 74, status: 'CONFIRMED', duration: '25 min', personsInvolved: 4,
  },
  {
    id: 'SA-1019', activityType: 'REPEATED_CROSSING', camera: 'East Checkpoint Entry', cameraId: 'CAM-004',
    location: 'East Checkpoint – Entry Lane', sector: 'EAST', timestamp: '2026-08-22T19:45:22',
    severity: 'HIGH', confidence: 93, status: 'UNDER_REVIEW', personsInvolved: 1,
  },
  {
    id: 'SA-1018', activityType: 'OBJECT_ABANDONMENT', camera: 'South Patrol Road', cameraId: 'CAM-011',
    location: 'South Sector – Patrol Road Alpha', sector: 'SOUTH', timestamp: '2026-08-22T18:55:03',
    severity: 'CRITICAL', confidence: 91, status: 'CONFIRMED', duration: '22 min',
  },
  {
    id: 'SA-1017', activityType: 'RUNNING', camera: 'BOP North Gate Alpha', cameraId: 'CAM-001',
    location: 'BOP North – Main Gate', sector: 'NORTH', timestamp: '2026-08-22T18:30:15',
    severity: 'HIGH', confidence: 85, status: 'FALSE_ALARM', personsInvolved: 1,
  },
  {
    id: 'SA-1016', activityType: 'UNUSUAL_MOVEMENT', camera: 'West Sector Night Cam', cameraId: 'CAM-007',
    location: 'West Sector – Bunker 3', sector: 'WEST', timestamp: '2026-08-22T17:15:33',
    severity: 'MEDIUM', confidence: 72, status: 'CONFIRMED', personsInvolved: 2,
  },
  {
    id: 'SA-1015', activityType: 'RESTRICTED_AREA', camera: 'Central Gate PTZ', cameraId: 'CAM-010',
    location: 'Central – Main Entrance Gate', sector: 'CENTRAL', timestamp: '2026-08-22T16:42:08',
    severity: 'CRITICAL', confidence: 96, status: 'CONFIRMED', personsInvolved: 1,
  },
  {
    id: 'SA-1014', activityType: 'LOITERING', camera: 'North Road Thermal', cameraId: 'CAM-003',
    location: 'BOP North – Border Road KM 12', sector: 'NORTH', timestamp: '2026-08-22T15:30:55',
    severity: 'LOW', confidence: 62, status: 'FALSE_ALARM', duration: '8 min', personsInvolved: 1,
  },
];

export const thermalTargets: ThermalTarget[] = [
  {
    id: 'T-204', targetType: 'HUMAN', camera: 'North Road Thermal',
    location: 'BOP North KM 12', distance: 42, movement: 'DETECTED',
    confidence: 95, temperature: 36.8, timestamp: '2026-08-22T21:10:22',
  },
  {
    id: 'T-203', targetType: 'HUMAN', camera: 'South Thermal Overwatch',
    location: 'South OP Delta', distance: 87, movement: 'STATIONARY',
    confidence: 88, temperature: 37.1, timestamp: '2026-08-22T20:45:11',
  },
  {
    id: 'T-202', targetType: 'VEHICLE', camera: 'North Road Thermal',
    location: 'BOP North KM 15', distance: 210, movement: 'DETECTED',
    confidence: 91, temperature: 65.3, timestamp: '2026-08-22T20:10:33',
  },
  {
    id: 'T-201', targetType: 'HUMAN', camera: 'South Thermal Overwatch',
    location: 'South Perimeter B', distance: 130, movement: 'LOST',
    confidence: 71, temperature: 36.5, timestamp: '2026-08-22T19:55:04',
  },
  {
    id: 'T-200', targetType: 'ANIMAL', camera: 'North Road Thermal',
    location: 'BOP North KM 11', distance: 28, movement: 'DETECTED',
    confidence: 78, temperature: 38.9, timestamp: '2026-08-22T19:30:18',
  },
];
