import { AIMessage, AISuggestedPrompt } from '../types';

export type PageContext = 
  | 'dashboard'
  | 'live-surveillance'
  | 'human-face-detection'
  | 'vehicle-anpr'
  | 'virtual-fence'
  | 'suspicious-activity'
  | 'night-surveillance'
  | 'thermal-intelligence'
  | 'criminal-network'
  | 'ai-reports'
  | 'alerts-events'
  | 'crm-overview'
  | 'intelligence-contacts'
  | 'organizations'
  | 'cases-investigations'
  | 'intelligence-leads'
  | 'tasks-followups'
  | 'activity-timeline'
  | 'team-operations'
  | 'camera-management'
  | 'analytics'
  | 'system-status'
  | 'settings';

export const suggestedPrompts: Record<PageContext, AISuggestedPrompt[]> = {
  dashboard: [
    { id: 'dp1', text: 'Show critical alerts' },
    { id: 'dp2', text: 'Cameras in North Sector' },
    { id: 'dp3', text: 'Human detections today' },
    { id: 'dp4', text: 'Summarize active incidents' },
    { id: 'dp5', text: 'Generate situation report' },
    { id: 'dp6', text: 'Show offline cameras' },
  ],
  'live-surveillance': [
    { id: 'ls1', text: 'Show cameras in North Sector' },
    { id: 'ls2', text: 'Which cameras are offline?' },
    { id: 'ls3', text: 'Show recent detections' },
    { id: 'ls4', text: 'Focus on critical incidents' },
  ],
  'human-face-detection': [
    { id: 'hf1', text: 'Show recent face detections' },
    { id: 'hf2', text: 'Identified suspects today' },
    { id: 'hf3', text: 'Unknown persons in North Sector' },
    { id: 'hf4', text: 'Active tracking targets' },
  ],
  'vehicle-anpr': [
    { id: 'va1', text: 'Show watchlisted vehicles' },
    { id: 'va2', text: 'Vehicles at East Checkpoint today' },
    { id: 'va3', text: 'Flagged vehicles this hour' },
    { id: 'va4', text: 'High-confidence plate reads' },
  ],
  'virtual-fence': [
    { id: 'vf1', text: 'Show fence breach alerts' },
    { id: 'vf2', text: 'Active zone configurations' },
    { id: 'vf3', text: 'Most triggered zones today' },
    { id: 'vf4', text: 'Summarize fence intrusions' },
  ],
  'suspicious-activity': [
    { id: 'sa1', text: 'Show critical activity events' },
    { id: 'sa2', text: 'Loitering incidents today' },
    { id: 'sa3', text: 'High confidence detections' },
    { id: 'sa4', text: 'Unreviewed suspicious events' },
  ],
  'night-surveillance': [
    { id: 'ns1', text: 'Night detections last 6 hours' },
    { id: 'ns2', text: 'Motion events after midnight' },
    { id: 'ns3', text: 'Night cameras status' },
    { id: 'ns4', text: 'Alert me on new night movements' },
  ],
  'thermal-intelligence': [
    { id: 'ti1', text: 'Active thermal targets' },
    { id: 'ti2', text: 'Human heat signatures detected' },
    { id: 'ti3', text: 'Thermal targets at BOP North' },
    { id: 'ti4', text: 'Target movement summary' },
  ],
  'criminal-network': [
    { id: 'cn1', text: 'Show extreme threat profiles' },
    { id: 'cn2', text: 'Wanted persons in database' },
    { id: 'cn3', text: 'Recent identifications' },
    { id: 'cn4', text: 'Network connections for CRN-0021' },
  ],
  'ai-reports': [
    { id: 'ar1', text: 'Generate incident summary report' },
    { id: 'ar2', text: 'Show suspicious activities near BOP North' },
    { id: 'ar3', text: 'Detection trends this week' },
    { id: 'ar4', text: 'Summarize active case status' },
  ],
  'alerts-events': [
    { id: 'ae1', text: 'Unacknowledged critical alerts' },
    { id: 'ae2', text: 'Events in last 2 hours' },
    { id: 'ae3', text: 'North Sector alert summary' },
    { id: 'ae4', text: 'Filter by high severity' },
  ],
  'crm-overview': [
    { id: 'co1', text: 'Show high-priority cases' },
    { id: 'co2', text: 'Tasks due today' },
    { id: 'co3', text: 'Overdue follow-ups' },
    { id: 'co4', text: "Today's intelligence inputs" },
  ],
  'intelligence-contacts': [
    { id: 'ic1', text: 'Show extreme threat contacts' },
    { id: 'ic2', text: 'Contacts in North Sector' },
    { id: 'ic3', text: 'Recently updated profiles' },
    { id: 'ic4', text: 'Contacts linked to active cases' },
  ],
  organizations: [
    { id: 'og1', text: 'Operational units summary' },
    { id: 'og2', text: 'Units with most active cases' },
    { id: 'og3', text: 'Offline or limited units' },
    { id: 'og4', text: 'Camera coverage by unit' },
  ],
  'cases-investigations': [
    { id: 'ci1', text: 'Critical priority cases' },
    { id: 'ci2', text: 'Cases opened this month' },
    { id: 'ci3', text: 'Escalated investigations' },
    { id: 'ci4', text: 'Summary of CS-2041' },
  ],
  'intelligence-leads': [
    { id: 'il1', text: 'Unreviewed leads today' },
    { id: 'il2', text: 'Verified leads this week' },
    { id: 'il3', text: 'Top secret intelligence inputs' },
    { id: 'il4', text: 'Leads linked to BOP North' },
  ],
  'tasks-followups': [
    { id: 'tf1', text: 'Overdue tasks' },
    { id: 'tf2', text: 'Tasks assigned to Insp. Tomar' },
    { id: 'tf3', text: "Critical tasks due today" },
    { id: 'tf4', text: 'Completed tasks this week' },
  ],
  'activity-timeline': [
    { id: 'at1', text: 'Events in last hour' },
    { id: 'at2', text: 'Activity from North Sector' },
    { id: 'at3', text: 'Alert events today' },
    { id: 'at4', text: 'Case updates this shift' },
  ],
  'team-operations': [
    { id: 'to1', text: 'Available officers now' },
    { id: 'to2', text: 'Officers with high workload' },
    { id: 'to3', text: 'Active assignments summary' },
    { id: 'to4', text: 'North Sector team status' },
  ],
  'camera-management': [
    { id: 'cm1', text: 'Offline camera status' },
    { id: 'cm2', text: 'Cameras needing maintenance' },
    { id: 'cm3', text: 'AI monitoring disabled cameras' },
    { id: 'cm4', text: 'East Sector camera list' },
  ],
  analytics: [
    { id: 'an1', text: 'Summarize detection trends' },
    { id: 'an2', text: 'Compare this week with last week' },
    { id: 'an3', text: 'Sectors with highest activity' },
    { id: 'an4', text: 'Intrusion trend analysis' },
  ],
  'system-status': [
    { id: 'ss1', text: 'System health summary' },
    { id: 'ss2', text: 'Show degraded components' },
    { id: 'ss3', text: 'Storage utilization status' },
    { id: 'ss4', text: 'AI engine performance' },
  ],
  settings: [
    { id: 'st1', text: 'Alert configuration help' },
    { id: 'st2', text: 'Notification preferences guide' },
    { id: 'st3', text: 'Camera settings overview' },
    { id: 'st4', text: 'System preferences summary' },
  ],
};

const mockResponses: Record<string, string> = {
  'Show critical alerts': '🔴 **3 Critical Alerts Active:**\n\n1. **ALT-2041** — Border intrusion at BOP North Gate (21:10). Subject being tracked. Status: NEW\n2. **ALT-2034** — Face match confirmed: Mohammad Farooq at Central Gate (19:32). Status: RESOLVED\n3. **ALT-2033** — Virtual fence breach at BOP North Perimeter East (19:10). Status: RESOLVED\n\n*Recommend immediate review of ALT-2041.*',
  'Show cameras in North Sector': '📷 **North Sector Cameras (4 total):**\n\n✅ CAM-001 — BOP North Gate Alpha — LIVE (AI: Active)\n✅ CAM-002 — BOP North Perimeter East — LIVE (AI: Active)\n✅ CAM-003 — North Road Thermal — LIVE (AI: Active)\n❌ CAM-014 — North Gate Night Vision — OFFLINE\n\n*CAM-014 has been offline for 45 minutes. Maintenance team has been notified.*',
  'Human detections today': '👤 **Human Detections Today: 62**\n\n- North Sector: 31 detections\n- East Sector: 15 detections\n- Central Sector: 10 detections\n- South Sector: 4 detections\n- West Sector: 2 detections\n\n*Peak detection hour: 21:00–21:30 at BOP North*\n*Identified persons: 2 | Tracking: 3 | Unknown: 57*',
  'Summarize active incidents': '⚠️ **Active Incident Summary:**\n\n**CRITICAL:** CS-2041 — BOP North Intrusion (ongoing)\n**HIGH:** CS-2010 — Mohammad Farooq monitoring (active)\n**HIGH:** CS-1955 — Tariq Ahmed (escalated, at large)\n**MONITORING:** CS-2031 — Rauf Malik courier network\n\n*Total open cases: 8 | Active tracking: 3 persons | Alerts unresolved: 3*',
  'Generate situation report': '📋 **Situation Report — 22 Aug 2026, 21:30 hrs**\n\n**Security Level:** ELEVATED\n\n**Key Events:**\n- 21:10 — Intrusion at BOP North (active response)\n- 21:08 — HVT Mohammad Farooq identified at Central Gate\n- 20:58 — Watchlist vehicle at East Checkpoint\n\n**Cameras:** 11/15 online, 2 offline\n**Alerts:** 3 Critical, 4 High\n**Personnel:** 6 on-duty officers\n\n*Recommend heightened North Sector vigilance.*',
  'Show offline cameras': '📷 **Offline Cameras (2):**\n\n❌ **CAM-013** — West Bunker Cam (West Sector, Bunker 1)\n   Offline since: 19:45 — Network timeout\n   AI Status: Disabled\n\n❌ **CAM-014** — North Gate Night Vision (BOP North, Side Gate)\n   Offline since: 20:45 — Connection lost\n   AI Status: Disabled\n\n⚠️ Additionally, **CAM-008** is in degraded mode (West Border Road, 720p, 15fps).',
  default: '🤖 **IBVAP AI Assistant**\n\nI\'ve received your query. Based on current system data:\n\n- 15 cameras monitored across 5 sectors\n- 62 human detections today\n- 3 critical alerts active\n- 8 open cases\n\nThis is a simulated response. Full AI inference capabilities will be enabled when the local LLM system is deployed.\n\n*Type a specific query about cameras, alerts, detections, or cases for targeted mock responses.*',
};

export const getAIResponse = (prompt: string): string => {
  return mockResponses[prompt] || mockResponses.default;
};

export const initialMessages: AIMessage[] = [
  {
    id: 'msg-001',
    role: 'assistant',
    content: '👋 **IBVAP AI Assistant Online**\n\nI\'m monitoring the border surveillance network. I can help you with:\n\n- Camera status and alerts\n- Detection summaries\n- Case and intelligence queries\n- Situation reports\n\n*Type a query or select a suggested prompt below.*',
    timestamp: new Date().toISOString(),
  },
];
