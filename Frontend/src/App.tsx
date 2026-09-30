import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAppStore } from './store/appStore';
import AppShell from './components/layout/AppShell';

// Pages
import Login from './pages/auth/Login';
import CommandDashboard from './pages/command/CommandDashboard';
import LiveSurveillance from './pages/surveillance/LiveSurveillance';
import HumanFaceDetection from './pages/surveillance/HumanFaceDetection';
import VehicleANPR from './pages/surveillance/VehicleANPR';
import VirtualFence from './pages/surveillance/VirtualFence';
import SuspiciousActivity from './pages/surveillance/SuspiciousActivity';
import NightSurveillance from './pages/surveillance/NightSurveillance';
import ThermalIntelligence from './pages/surveillance/ThermalIntelligence';
import CriminalNetwork from './pages/intelligence/CriminalNetwork';
import AIReports from './pages/intelligence/AIReports';
import AlertsEvents from './pages/intelligence/AlertsEvents';
import CRMOverview from './pages/crm/CRMOverview';
import IntelligenceContacts from './pages/crm/IntelligenceContacts';
import Organizations from './pages/crm/Organizations';
import CasesInvestigations from './pages/crm/CasesInvestigations';
import IntelligenceLeads from './pages/crm/IntelligenceLeads';
import TaskFollowups from './pages/crm/TaskFollowups';
import ActivityTimeline from './pages/crm/ActivityTimeline';
import TeamOperations from './pages/crm/TeamOperations';
import CameraManagement from './pages/management/CameraManagement';
import Analytics from './pages/management/Analytics';
import SystemStatus from './pages/management/SystemStatus';
import Settings from './pages/management/Settings';

function App() {
  const isAuthenticated = useAppStore(state => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          {/* Command */}
          <Route index element={<CommandDashboard />} />

          {/* Surveillance */}
          <Route path="surveillance/live" element={<LiveSurveillance />} />
          <Route path="surveillance/human-face" element={<HumanFaceDetection />} />
          <Route path="surveillance/vehicle-anpr" element={<VehicleANPR />} />
          <Route path="surveillance/virtual-fence" element={<VirtualFence />} />
          <Route path="surveillance/suspicious-activity" element={<SuspiciousActivity />} />
          <Route path="surveillance/night" element={<NightSurveillance />} />
          <Route path="surveillance/thermal" element={<ThermalIntelligence />} />

          {/* Intelligence */}
          <Route path="intelligence/criminal-network" element={<CriminalNetwork />} />
          <Route path="intelligence/ai-reports" element={<AIReports />} />
          <Route path="intelligence/alerts" element={<AlertsEvents />} />

          {/* CRM & Operations */}
          <Route path="crm" element={<CRMOverview />} />
          <Route path="crm/contacts" element={<IntelligenceContacts />} />
          <Route path="crm/organizations" element={<Organizations />} />
          <Route path="crm/cases" element={<CasesInvestigations />} />
          <Route path="crm/leads" element={<IntelligenceLeads />} />
          <Route path="crm/tasks" element={<TaskFollowups />} />
          <Route path="crm/timeline" element={<ActivityTimeline />} />
          <Route path="crm/team" element={<TeamOperations />} />

          {/* Management */}
          <Route path="management/cameras" element={<CameraManagement />} />
          <Route path="management/analytics" element={<Analytics />} />
          <Route path="management/system" element={<SystemStatus />} />
          <Route path="management/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
