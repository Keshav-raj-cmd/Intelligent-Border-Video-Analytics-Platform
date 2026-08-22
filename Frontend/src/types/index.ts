// ============================================================
// IBVAP — Core TypeScript Types
// ============================================================

// Severity levels
export type Severity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type Status = 'ACTIVE' | 'INACTIVE' | 'OFFLINE' | 'ONLINE' | 'STANDBY' | 'MAINTENANCE';

// ──────────────────────────────────────────
// Camera Types
// ──────────────────────────────────────────
export interface Camera {
  id: string;
  name: string;
  location: string;
  sector: Sector;
  status: 'ONLINE' | 'OFFLINE' | 'DEGRADED' | 'MAINTENANCE';
  streamStatus: 'LIVE' | 'PAUSED' | 'RECORDING' | 'OFFLINE';
  type: 'PTZ' | 'FIXED' | 'THERMAL' | 'NIGHT_VISION' | 'ANPR';
  ipAddress: string;
  lastActivity: string;
  aiMonitoring: boolean;
  detectionCount: number;
  alerts: number;
  lat?: number;
  lng?: number;
  resolution: string;
  fps: number;
  coverage: string;
  installer?: string;
  installedDate?: string;
}

export type Sector = 'NORTH' | 'EAST' | 'WEST' | 'CENTRAL' | 'SOUTH';

// ──────────────────────────────────────────
// Alert & Event Types
// ──────────────────────────────────────────
export interface Alert {
  id: string;
  type: string;
  severity: Severity;
  camera: string;
  cameraId: string;
  location: string;
  sector: Sector;
  timestamp: string;
  status: 'NEW' | 'ACKNOWLEDGED' | 'INVESTIGATING' | 'RESOLVED';
  description: string;
  thumbnail?: string;
}

export interface SystemEvent {
  id: string;
  eventType: string;
  camera?: string;
  location?: string;
  sector?: Sector;
  timestamp: string;
  severity: Severity;
  status: 'NEW' | 'ACKNOWLEDGED' | 'RESOLVED';
  description: string;
}

// ──────────────────────────────────────────
// Detection Types
// ──────────────────────────────────────────
export interface Detection {
  id: string;
  type: 'HUMAN' | 'FACE' | 'VEHICLE';
  camera: string;
  cameraId: string;
  location: string;
  sector: Sector;
  timestamp: string;
  confidence: number;
  personId?: string;
  trackingStatus: 'TRACKING' | 'LOST' | 'IDENTIFIED' | 'UNKNOWN';
  faceDetected?: boolean;
  attributes?: {
    age?: string;
    gender?: string;
    clothing?: string;
    height?: string;
  };
}

// ──────────────────────────────────────────
// Vehicle Types
// ──────────────────────────────────────────
export interface Vehicle {
  id: string;
  plateNumber: string;
  type: 'SUV' | 'SEDAN' | 'TRUCK' | 'MOTORCYCLE' | 'BUS' | 'TEMPO' | 'JEEP' | 'UNKNOWN';
  color: string;
  camera: string;
  cameraId: string;
  location: string;
  sector: Sector;
  timestamp: string;
  confidence: number;
  direction: 'INBOUND' | 'OUTBOUND' | 'CROSSING' | 'UNKNOWN';
  flagged: boolean;
  flagReason?: string;
  ownerName?: string;
  registrationState?: string;
  watchlisted: boolean;
}

// ──────────────────────────────────────────
// Criminal / Intelligence Profile Types
// ──────────────────────────────────────────
export interface CriminalProfile {
  id: string;
  name: string;
  alias: string[];
  age: number;
  gender: 'MALE' | 'FEMALE' | 'UNKNOWN';
  nationality: string;
  region: string;
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  status: 'WANTED' | 'MONITORING' | 'DETAINED' | 'RELEASED' | 'DECEASED';
  lastKnownLocation: string;
  lastSeen: string;
  associatedCases: string[];
  associatedVehicles: string[];
  identificationStatus: 'IDENTIFIED' | 'PARTIAL' | 'UNIDENTIFIED';
  category: string;
  description: string;
  assignedOfficer: string;
  connections: string[];
}

// ──────────────────────────────────────────
// Case Types
// ──────────────────────────────────────────
export interface Case {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: 'NEW' | 'OPEN' | 'INVESTIGATING' | 'MONITORING' | 'ESCALATED' | 'RESOLVED' | 'CLOSED';
  caseType: string;
  region: string;
  sector: Sector;
  assignedOfficer: string;
  assignedUnit: string;
  openedDate: string;
  lastUpdated: string;
  closedDate?: string;
  linkedPersons: string[];
  linkedVehicles: string[];
  linkedCameras: string[];
  incidents: number;
  intelligenceInputs: number;
  tags: string[];
}

// ──────────────────────────────────────────
// Intelligence Contact Types
// ──────────────────────────────────────────
export interface IntelligenceContact {
  id: string;
  name: string;
  alias?: string;
  region: string;
  sector: Sector;
  priority: Priority;
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  lastKnownLocation: string;
  relatedCases: string[];
  relatedVehicles: string[];
  recentActivity: string;
  assignedOfficer: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DETAINED' | 'RELEASED';
  category: string;
  nationality: string;
  age?: number;
  addedDate: string;
  lastUpdated: string;
}

// ──────────────────────────────────────────
// Organization / Unit Types
// ──────────────────────────────────────────
export interface Organization {
  id: string;
  name: string;
  type: 'BOP' | 'CHECKPOINT' | 'SECURITY_UNIT' | 'REGIONAL_OFFICE' | 'PARTNER_AGENCY';
  region: string;
  sector: Sector;
  contactOfficer: string;
  contactPhone: string;
  activeCases: number;
  connectedCameras: number;
  operationalStatus: 'OPERATIONAL' | 'STANDBY' | 'LIMITED' | 'OFFLINE';
  personnel: number;
  established: string;
  jurisdiction: string;
}

// ──────────────────────────────────────────
// Lead / Intelligence Input Types
// ──────────────────────────────────────────
export interface Lead {
  id: string;
  sourceType: 'HUMAN_INTELLIGENCE' | 'SIGNAL_INTELLIGENCE' | 'CCTV' | 'INFORMANT' | 'PATROL' | 'TIP';
  description: string;
  region: string;
  sector: Sector;
  priority: Priority;
  linkedCase?: string;
  relatedCase?: string;
  handler?: string;
  assignedOfficer: string;
  dateReceived?: string;
  receivedDate?: string;
  status: 'NEW' | 'UNDER_REVIEW' | 'VERIFIED' | 'LINKED_TO_CASE' | 'ACTIONED' | 'DISMISSED' | 'CLOSED';
  reliability: 'A' | 'B' | 'C' | 'D' | 'E';
  sensitivity?: string;
  classification?: string;
  tags?: string[];
}

// ──────────────────────────────────────────
// Task Types
// ──────────────────────────────────────────
export interface Task {
  id: string;
  title: string;
  description: string;
  relatedCase?: string;
  relatedPerson?: string;
  priority: Priority;
  assignedOfficer: string;
  dueDate: string;
  dueTime?: string;
  createdDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED';
  category?: string;
  taskType?: string;
  notes?: string;
  createdBy?: string;
}

// ──────────────────────────────────────────
// Activity / Timeline Types
// ──────────────────────────────────────────
export interface Activity {
  id: string;
  type: 'DETECTION' | 'ALERT' | 'CASE_UPDATE' | 'ASSIGNMENT' | 'INVESTIGATION' | 'SYSTEM' | 'PATROL' | 'INTELLIGENCE';
  title: string;
  description: string;
  actor: string;
  relatedPerson?: string;
  relatedCase?: string;
  relatedCamera?: string;
  sector?: Sector;
  timestamp: string;
  severity?: Severity;
}

// ──────────────────────────────────────────
// Team / Officer Types
// ──────────────────────────────────────────
export interface TeamMember {
  id: string;
  name: string;
  rank: string;
  unit: string;
  region: string;
  sector: Sector;
  availability?: 'AVAILABLE' | 'ON_DUTY' | 'OFF_DUTY' | 'LEAVE';
  status?: 'ON_DUTY' | 'AVAILABLE' | 'OFF_DUTY' | 'LEAVE';
  activeCases: number;
  pendingTasks: number;
  specialty?: string;
  specialization?: string;
  workload?: number;
  badgeNumber: string;
  contactNumber: string;
  currentAssignment?: string;
}

// ──────────────────────────────────────────
// System Status Types
// ──────────────────────────────────────────
export interface SystemComponent {
  id: string;
  name: string;
  type?: string;
  location?: string;
  category: string;
  status: 'OPERATIONAL' | 'DEGRADED' | 'OFFLINE' | 'STANDBY' | 'MAINTENANCE';
  uptime: string | number;
  cpuUsage?: number;
  memoryUsage?: number;
  networkLatency?: number;
  loadAvg?: number;
  load?: number;
  lastChecked: string;
  version?: string;
  description: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
}

// ──────────────────────────────────────────
// Analytics Types
// ──────────────────────────────────────────
export interface DailyMetric {
  date: string;
  humans: number;
  vehicles: number;
  intrusions: number;
  suspicious: number;
  alerts: number;
}

export interface SectorMetric {
  sector: string;
  cameras: number;
  detections: number;
  intrusions?: number;
  vehicles?: number;
  alerts: number;
  status: 'NORMAL' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
  trend?: 'up' | 'down' | 'stable';
}

export interface StorageMetric {
  id: string;
  name: string;
  type: string;
  total: string;
  used: string;
  usagePercent: number;
}

// ──────────────────────────────────────────
// AI Assistant Types
// ──────────────────────────────────────────
export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isLoading?: boolean;
}

export interface AISuggestedPrompt {
  id: string;
  text: string;
  context?: string;
}

// ──────────────────────────────────────────
// Suspicious Activity Types
// ──────────────────────────────────────────
export interface SuspiciousActivity {
  id: string;
  activityType: 'LOITERING' | 'UNUSUAL_MOVEMENT' | 'RUNNING' | 'GROUP_GATHERING' | 'OBJECT_ABANDONMENT' | 'REPEATED_CROSSING' | 'RESTRICTED_AREA';
  camera: string;
  cameraId: string;
  location: string;
  sector: Sector;
  timestamp: string;
  severity: Severity;
  confidence: number;
  status: 'NEW' | 'UNDER_REVIEW' | 'CONFIRMED' | 'FALSE_ALARM';
  duration?: string;
  personsInvolved?: number;
}

// ──────────────────────────────────────────
// Virtual Fence Zone
// ──────────────────────────────────────────
export interface FenceZone {
  id: string;
  name: string;
  type: 'RESTRICTED' | 'WARNING' | 'BOUNDARY' | 'ENTRY' | 'EXIT';
  enabled: boolean;
  camera: string;
  alertCount: number;
  lastTriggered?: string;
  color: string;
}

// ──────────────────────────────────────────
// Thermal Target
// ──────────────────────────────────────────
export interface ThermalTarget {
  id: string;
  targetType: 'HUMAN' | 'VEHICLE' | 'ANIMAL' | 'UNKNOWN';
  camera: string;
  location: string;
  distance: number;
  movement: 'DETECTED' | 'STATIONARY' | 'LOST';
  confidence: number;
  temperature?: number;
  timestamp: string;
}
