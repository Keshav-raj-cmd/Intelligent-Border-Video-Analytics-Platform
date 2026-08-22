import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Bell, Camera, Shield, Monitor, User, Save, RefreshCw } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { PageHeader, Tabs } from '../../components/common';

const Toggle: React.FC<{ enabled: boolean; onChange: (v: boolean) => void; id: string }> = ({ enabled, onChange, id }) => (
  <button
    id={id}
    onClick={() => onChange(!enabled)}
    className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none"
    style={{ background: enabled ? 'var(--color-primary)' : 'var(--color-border)' }}
  >
    <span
      className="inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200"
      style={{ transform: enabled ? 'translateX(20px)' : 'translateX(2px)' }}
    />
  </button>
);

const SettingsRow: React.FC<{ label: string; description?: string; children: React.ReactNode }> = ({ label, description, children }) => (
  <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
    <div>
      <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{label}</p>
      {description && <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{description}</p>}
    </div>
    {children}
  </div>
);

const Settings: React.FC = () => {
  const { setCurrentPage } = useAppStore();
  const [tab, setTab] = useState('alerts');
  const [settings, setSettings] = useState({
    criticalAlerts: true, highAlerts: true, mediumAlerts: true, lowAlerts: false,
    soundEnabled: true, desktopNotif: true, emailNotif: false, smsNotif: false,
    faceDetectionEnabled: true, anprEnabled: true, thermalEnabled: true, nightVisionEnabled: true,
    aiMonitoring: true, autoCapture: true, motionAlert: true,
    recordingEnabled: true, autoArchive: true, retentionDays: 30,
    aiEngine: true, localLLM: false, cloudBackup: false, autoReports: true,
  });

  const update = (key: string, value: boolean) => {
    setSettings(s => ({ ...s, [key]: value }));
  };

  useEffect(() => { setCurrentPage('settings'); }, [setCurrentPage]);

  const tabs = [
    { id: 'alerts', label: 'Alerts & Notifications' },
    { id: 'ai', label: 'AI & Detection' },
    { id: 'recording', label: 'Recording' },
    { id: 'system', label: 'System' },
    { id: 'profile', label: 'Profile' },
  ];

  return (
    <div className="flex flex-col h-full" style={{ height: 'calc(100vh - 56px)' }}>
      <PageHeader
        title="Settings"
        subtitle="System configuration and preferences"
        icon={<SettingsIcon size={16} />}
        actions={
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs hover:opacity-80"
              style={{ background: 'rgba(100,116,139,0.12)', color: '#94a3b8', border: '1px solid var(--color-border)' }}>
              <RefreshCw size={13} /> Reset to Defaults
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium hover:opacity-80"
              style={{ background: 'var(--color-primary)', color: '#fff' }}>
              <Save size={13} /> Save Changes
            </button>
          </div>
        }
      />

      <div className="px-6 shrink-0">
        <Tabs tabs={tabs} activeTab={tab} onTabChange={setTab} />
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl">
          {tab === 'alerts' && (
            <div>
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text-secondary)' }}>ALERT SEVERITY THRESHOLDS</h3>
              <div className="card p-4 mb-4">
                <SettingsRow label="Critical Alerts" description="Border intrusions, weapon detection, HVT identification">
                  <Toggle id="crit-alerts" enabled={settings.criticalAlerts} onChange={v => update('criticalAlerts', v)} />
                </SettingsRow>
                <SettingsRow label="High Priority Alerts" description="Face matches, watchlisted vehicles, suspicious activity">
                  <Toggle id="high-alerts" enabled={settings.highAlerts} onChange={v => update('highAlerts', v)} />
                </SettingsRow>
                <SettingsRow label="Medium Priority Alerts" description="Unusual movement, virtual fence breaches">
                  <Toggle id="med-alerts" enabled={settings.mediumAlerts} onChange={v => update('mediumAlerts', v)} />
                </SettingsRow>
                <SettingsRow label="Low Priority Alerts" description="Informational events, routine detections">
                  <Toggle id="low-alerts" enabled={settings.lowAlerts} onChange={v => update('lowAlerts', v)} />
                </SettingsRow>
              </div>
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text-secondary)' }}>NOTIFICATION CHANNELS</h3>
              <div className="card p-4">
                <SettingsRow label="Sound Notifications" description="Play alert sound on new critical events">
                  <Toggle id="sound-notif" enabled={settings.soundEnabled} onChange={v => update('soundEnabled', v)} />
                </SettingsRow>
                <SettingsRow label="Desktop Notifications" description="Browser push notifications">
                  <Toggle id="desktop-notif" enabled={settings.desktopNotif} onChange={v => update('desktopNotif', v)} />
                </SettingsRow>
                <SettingsRow label="Email Notifications" description="Send daily digest and critical alerts via email">
                  <Toggle id="email-notif" enabled={settings.emailNotif} onChange={v => update('emailNotif', v)} />
                </SettingsRow>
                <SettingsRow label="SMS Notifications" description="Critical alerts via SMS to duty officer">
                  <Toggle id="sms-notif" enabled={settings.smsNotif} onChange={v => update('smsNotif', v)} />
                </SettingsRow>
              </div>
            </div>
          )}
          {tab === 'ai' && (
            <div>
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text-secondary)' }}>AI DETECTION MODULES</h3>
              <div className="card p-4 mb-4">
                <SettingsRow label="Face Detection" description="Enable AI face recognition and matching against criminal database">
                  <Toggle id="face-det" enabled={settings.faceDetectionEnabled} onChange={v => update('faceDetectionEnabled', v)} />
                </SettingsRow>
                <SettingsRow label="ANPR (License Plate Recognition)" description="Automated vehicle plate reading at all checkpoints">
                  <Toggle id="anpr-det" enabled={settings.anprEnabled} onChange={v => update('anprEnabled', v)} />
                </SettingsRow>
                <SettingsRow label="Thermal Target Detection" description="Human and vehicle heat signature analysis">
                  <Toggle id="thermal-det" enabled={settings.thermalEnabled} onChange={v => update('thermalEnabled', v)} />
                </SettingsRow>
                <SettingsRow label="Night Vision Enhancement" description="Low-light AI enhancement for night cameras">
                  <Toggle id="night-det" enabled={settings.nightVisionEnabled} onChange={v => update('nightVisionEnabled', v)} />
                </SettingsRow>
                <SettingsRow label="Global AI Monitoring" description="Enable AI processing on all connected cameras">
                  <Toggle id="global-ai" enabled={settings.aiMonitoring} onChange={v => update('aiMonitoring', v)} />
                </SettingsRow>
              </div>
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text-secondary)' }}>AI FEATURES</h3>
              <div className="card p-4">
                <SettingsRow label="Local LLM (AI Assistant)" description="Enable on-premises LLM for AI query interface (requires separate deployment)">
                  <Toggle id="local-llm" enabled={settings.localLLM} onChange={v => update('localLLM', v)} />
                </SettingsRow>
                <SettingsRow label="Auto-capture Events" description="Automatically capture snapshots on detection events">
                  <Toggle id="auto-capture" enabled={settings.autoCapture} onChange={v => update('autoCapture', v)} />
                </SettingsRow>
                <SettingsRow label="Automated AI Reports" description="Generate automated incident reports at end of shift">
                  <Toggle id="auto-reports" enabled={settings.autoReports} onChange={v => update('autoReports', v)} />
                </SettingsRow>
              </div>
            </div>
          )}
          {tab === 'recording' && (
            <div className="card p-4">
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text-secondary)' }}>RECORDING SETTINGS</h3>
              <SettingsRow label="Continuous Recording" description="Record all camera feeds 24/7">
                <Toggle id="rec-enabled" enabled={settings.recordingEnabled} onChange={v => update('recordingEnabled', v)} />
              </SettingsRow>
              <SettingsRow label="Auto-Archive Old Footage" description="Automatically archive footage older than retention period">
                <Toggle id="auto-archive" enabled={settings.autoArchive} onChange={v => update('autoArchive', v)} />
              </SettingsRow>
              <SettingsRow label="Motion-triggered Recording" description="Higher resolution recording on motion events">
                <Toggle id="motion-alert" enabled={settings.motionAlert} onChange={v => update('motionAlert', v)} />
              </SettingsRow>
              <SettingsRow label="Retention Period" description="Days to keep footage before auto-delete">
                <select className="text-sm rounded px-2 py-1 outline-none"
                  style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                  value={settings.retentionDays}
                  onChange={e => setSettings(s => ({ ...s, retentionDays: parseInt(e.target.value) }))}>
                  {[7, 14, 30, 60, 90, 180, 365].map(d => (
                    <option key={d} value={d}>{d} days</option>
                  ))}
                </select>
              </SettingsRow>
            </div>
          )}
          {tab === 'system' && (
            <div className="card p-4">
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text-secondary)' }}>SYSTEM PREFERENCES</h3>
              <SettingsRow label="Cloud Backup" description="Backup configuration and critical data to secure cloud">
                <Toggle id="cloud-backup" enabled={settings.cloudBackup} onChange={v => update('cloudBackup', v)} />
              </SettingsRow>
              <SettingsRow label="AI Engine" description="IBVAP core AI inference engine">
                <Toggle id="ai-engine" enabled={settings.aiEngine} onChange={v => update('aiEngine', v)} />
              </SettingsRow>
              <SettingsRow label="UI Theme">
                <select className="text-sm rounded px-2 py-1 outline-none"
                  style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}>
                  <option>Dark Mode (Default)</option>
                  <option>Extra Dark</option>
                  <option>Navy Blue</option>
                </select>
              </SettingsRow>
              <SettingsRow label="Language">
                <select className="text-sm rounded px-2 py-1 outline-none"
                  style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}>
                  <option>English</option>
                  <option>Hindi</option>
                </select>
              </SettingsRow>
              <SettingsRow label="Time Zone">
                <select className="text-sm rounded px-2 py-1 outline-none"
                  style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}>
                  <option>IST (UTC +5:30)</option>
                  <option>UTC</option>
                </select>
              </SettingsRow>
            </div>
          )}
          {tab === 'profile' && (
            <div className="card p-4">
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text-secondary)' }}>OPERATOR PROFILE</h3>
              <div className="flex items-center gap-4 mb-4 pb-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg"
                  style={{ background: 'linear-gradient(135deg, #1e40af, #0e7490)', color: '#fff' }}>VS</div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Inspector V. Singh</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Security Operations Center · SOC Operator</p>
                  <p className="text-xs" style={{ color: 'var(--color-primary)' }}>Role: Surveillance Operator (Level 3)</p>
                </div>
              </div>
              {[
                { label: 'Full Name', placeholder: 'Inspector V. Singh', type: 'text' },
                { label: 'Badge Number', placeholder: 'BSF/SOC/3921', type: 'text' },
                { label: 'Email', placeholder: 'v.singh@bsf.nic.in', type: 'email' },
                { label: 'Phone', placeholder: '+91-XXXXX-XXXXX', type: 'tel' },
              ].map(f => (
                <div key={f.label} className="mb-4">
                  <label className="text-xs font-medium block mb-1" style={{ color: 'var(--color-text-muted)' }}>{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder}
                    className="w-full px-3 py-2 text-sm rounded outline-none"
                    style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} />
                </div>
              ))}
              <button className="px-4 py-2 rounded text-sm font-medium hover:opacity-80 flex items-center gap-2"
                style={{ background: 'var(--color-primary)', color: '#fff' }}>
                <Save size={14} /> Update Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
