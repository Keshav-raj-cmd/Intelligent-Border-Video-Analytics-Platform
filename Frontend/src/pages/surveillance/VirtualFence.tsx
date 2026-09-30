import React, { useState, useEffect } from 'react';
import { Shield, Plus, Edit2, Trash2, Power, PowerOff, AlertTriangle, CheckCircle, Upload, Play, Loader } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { FenceZone } from '../../types';
import { PageHeader, SeverityBadge, Btn } from '../../components/common';

const initialZones: FenceZone[] = [];

const mockIntrusions: any[] = [];

const FenceSurveillancePreview: React.FC<{ zones: FenceZone[], activeVideo?: any, isPlaying?: boolean }> = ({ zones, activeVideo, isPlaying }) => {
  return (
    <div className="relative w-full rounded-lg overflow-hidden camera-feed bg-black" style={{ height: '400px' }}>
      {isPlaying && activeVideo ? (
          <video 
              src={`http://localhost:8000/api/virtual-fence/videos/${activeVideo.video_id}/play`}
              autoPlay 
              loop
              muted
              className="absolute inset-0 w-full h-full object-cover"
          />
      ) : (
          <div className="scan-line" />
      )}
      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)',
        backgroundSize: '30px 30px',
      }} />

      {/* Zone overlays */}
      {zones.filter(z => z.enabled).map((zone) => {
        const zoneStyle: Record<FenceZone['type'], { left: string; top: string; width: string; height: string }> = {
          BOUNDARY: { left: '10%', top: '10%', width: '80%', height: '80%' },
          RESTRICTED: { left: '30%', top: '25%', width: '40%', height: '40%' },
          WARNING: { left: '20%', top: '18%', width: '60%', height: '60%' },
          ENTRY: { left: '5%', top: '40%', width: '12%', height: '20%' },
          EXIT: { left: '83%', top: '40%', width: '12%', height: '20%' },
        };
        const pos = zoneStyle[zone.type];
        return (
          <div
            key={zone.id}
            className="absolute fence-zone"
            style={{
              ...pos,
              borderColor: zone.color,
              background: `${zone.color}08`,
              borderStyle: zone.type === 'BOUNDARY' ? 'solid' : 'dashed',
              borderWidth: zone.type === 'BOUNDARY' ? '2px' : '1.5px',
            }}
          >
            <div className="absolute -top-5 left-1 text-xs px-1 rounded"
              style={{ background: `${zone.color}cc`, color: '#fff', fontSize: '9px', whiteSpace: 'nowrap' }}>
              {zone.name}
            </div>
            {zone.alertCount > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: 'var(--color-danger)', color: '#fff', fontSize: '9px' }}>
                {zone.alertCount}
              </div>
            )}
          </div>
        );
      })}

      {/* LIVE badge */}
      <div className="absolute top-3 left-3">
        <span className="live-indicator text-xs font-bold px-1.5 py-0.5 rounded"
          style={{ background: 'rgba(239,68,68,0.85)', color: '#fff', fontSize: '9px' }}>LIVE</span>
      </div>

      {/* Camera label */}
      <div className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded font-mono"
        style={{ background: 'rgba(0,0,0,0.7)', color: '#94a3b8', fontSize: '9px' }}>BOP NORTH – VIRTUAL FENCE VIEW</div>

      {/* Simulated intrusion person ONLY if not playing a real video */}
      {!isPlaying && (
          <div className="absolute" style={{ left: '35%', top: '38%', width: '4%', height: '10%' }}>
            <div className="w-full h-full" style={{
              background: 'rgba(239,68,68,0.4)',
              boxShadow: '0 0 8px rgba(239,68,68,0.6)',
              borderRadius: '2px',
            }} />
            <div className="absolute -top-4 -left-2 text-xs px-1 rounded"
              style={{ background: 'rgba(239,68,68,0.85)', color: '#fff', fontSize: '8px', whiteSpace: 'nowrap' }}>
              INTRUDER
            </div>
          </div>
      )}
    </div>
  );
};

const VirtualFence: React.FC = () => {
  const { setCurrentPage } = useAppStore();
  const [zones, setZones] = useState<FenceZone[]>(initialZones);
  const [events, setEvents] = useState<any[]>(mockIntrusions);
  const [liveIntruder, setLiveIntruder] = useState<any | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [activeVideo, setActiveVideo] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => { 
    setCurrentPage('virtual-fence'); 
    
    // Fetch initial state
    fetch('http://localhost:8000/api/virtual-fence/zones')
      .then(res => res.json())
      .then(data => {
        if (data.zones) setZones(data.zones);
      })
      .catch(err => console.error(err));
      
    fetch('http://localhost:8000/api/virtual-fence/events')
      .then(res => res.json())
      .then(data => {
        if (data.events) {
          setEvents(data.events.map((e: any) => ({
            id: e.id,
            zone: e.zone_name,
            severity: e.severity,
            time: new Date(e.timestamp).toLocaleTimeString(),
            camera: e.camera_id,
            description: e.reason
          })));
        }
      })
      .catch(err => console.error(err));
      
    // Subscribe to live events
    const evtSource = new EventSource("http://localhost:8000/api/virtual-fence/stream");
    evtSource.onmessage = (e) => {
        const event = JSON.parse(e.data);
        if (event.type === "VIDEO_ANALYSIS_PROGRESS") {
            setAnalyzing(true);
            setProgress(event.progress);
        } else if (event.type === "ZONE_SUGGESTIONS_READY") {
            setAnalyzing(false);
            setProgress(100);
            fetchSuggestions(event.video_id);
        } else if (event.type === "message" || !event.type) {
            const newAlert = {
                id: event.id,
                zone: event.zone_name,
                severity: event.severity,
                time: new Date().toLocaleTimeString(),
                camera: event.camera_id,
                description: event.reason
            };
            
            setEvents(prev => [newAlert, ...prev].slice(0, 50));
            
            // Show live intruder blip
            setLiveIntruder({ zoneId: event.zone_id, text: event.person_name || 'INTRUDER' });
            setTimeout(() => setLiveIntruder(null), 3000); // clear after 3s
        }
    };
    
    return () => {
        evtSource.close();
    };
  }, [setCurrentPage]);

  const fetchSuggestions = (videoId: string) => {
      fetch(`http://localhost:8000/api/virtual-fence/videos/${videoId}/suggested-zones`)
          .then(res => res.json())
          .then(data => {
              if (data.suggestions) setSuggestions(data.suggestions);
          })
          .catch(err => console.error(err));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      
      try {
          const res = await fetch('http://localhost:8000/api/virtual-fence/videos/upload', {
              method: 'POST',
              body: formData
          });
          const data = await res.json();
          if (data.status === 'success') {
              setActiveVideo(data.video);
          }
      } catch (err) {
          console.error(err);
      } finally {
          setUploading(false);
      }
  };

  const triggerAnalysis = () => {
      if (!activeVideo) return;
      setAnalyzing(true);
      setProgress(0);
      fetch(`http://localhost:8000/api/virtual-fence/videos/${activeVideo.video_id}/analyze`, { method: 'POST' })
          .catch(err => { console.error(err); setAnalyzing(false); });
  };

  const setSource = (source: string) => {
      fetch('http://localhost:8000/api/virtual-fence/source', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ source })
      });
      setIsPlaying(true);
  };

  const handleAcceptSuggestion = (zoneId: string) => {
      if (!activeVideo) return;
      fetch(`http://localhost:8000/api/virtual-fence/videos/${activeVideo.video_id}/suggested-zones/${zoneId}/accept`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
      })
      .then(res => res.json())
      .then(data => {
          if (data.status === 'success') {
              setZones([...zones, data.zone]);
              setSuggestions(s => s.filter(x => x.id !== zoneId));
          }
      });
  };

  const handleRejectSuggestion = (zoneId: string) => {
      if (!activeVideo) return;
      fetch(`http://localhost:8000/api/virtual-fence/videos/${activeVideo.video_id}/suggested-zones/${zoneId}/reject`, { method: 'POST' })
          .then(() => {
              setSuggestions(s => s.filter(x => x.id !== zoneId));
          });
  };

  const toggleZone = (id: string) => {
    fetch(`http://localhost:8000/api/virtual-fence/zones/${id}/toggle`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.zone) {
            setZones(z => z.map(zone => zone.id === id ? data.zone : zone));
        }
      })
      .catch(err => console.error(err));
  };

  const typeColor: Record<string, string> = {
    RESTRICTED: '#ef4444', WARNING: '#f59e0b', BOUNDARY: '#3b82f6', ENTRY: '#10b981', EXIT: '#10b981',
  };

  return (
    <div className="flex flex-col h-full" style={{ height: 'calc(100vh - 56px)' }}>
      <PageHeader
        title="Virtual Fence"
        subtitle="Zone configuration and intrusion monitoring"
        icon={<Shield size={16} />}
        actions={
          <div className="flex items-center gap-2">
            <input type="file" ref={fileInputRef} className="hidden" accept=".mp4,.avi,.mov,.mkv" onChange={handleFileUpload} />
            <Btn variant="secondary" size="sm" icon={<Upload size={13} />} onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload Video'}
            </Btn>
            {activeVideo && (
                <Btn variant={isPlaying ? "primary" : "secondary"} size="sm" icon={<Play size={13} />} onClick={() => setSource(activeVideo.video_id)}>
                    {isPlaying ? 'Playing Upload' : 'Play Upload'}
                </Btn>
            )}
            <Btn variant="primary" size="sm" icon={<Plus size={13} />}>Add Zone</Btn>
          </div>
        }
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Main surveillance preview */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {activeVideo && !analyzing && suggestions.length === 0 && (
             <div className="card p-4 flex justify-between items-center bg-blue-900/20 border-blue-500/30">
                 <div>
                     <h4 className="font-semibold text-sm">Video Ready: {activeVideo.filename}</h4>
                     <p className="text-xs text-gray-400">Run AI analysis to generate zone suggestions.</p>
                 </div>
                 <Btn variant="primary" size="sm" onClick={triggerAnalysis}>Analyze Video</Btn>
             </div>
          )}

          {analyzing && (
             <div className="card p-4 flex flex-col gap-2 bg-purple-900/20 border-purple-500/30">
                 <div className="flex justify-between text-sm font-semibold">
                     <span className="flex items-center gap-2"><Loader className="animate-spin" size={14}/> AI Analyzing Movement...</span>
                     <span>{progress}%</span>
                 </div>
                 <div className="w-full bg-gray-800 rounded-full h-1.5">
                    <div className="bg-purple-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                 </div>
             </div>
          )}

          <FenceSurveillancePreview zones={zones} activeVideo={activeVideo} isPlaying={isPlaying} />

          {/* Active Intrusion Alerts */}
          <div>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
              Recent Intrusion Alerts
            </h3>
            <div className="space-y-2">
              {events.length === 0 && <p className="text-xs text-center p-4 text-gray-500">No recent alerts.</p>}
              {events.map(alert => (
                <div key={alert.id}
                  className="flex items-start gap-3 p-3 rounded-lg"
                  style={{
                    background: alert.severity === 'CRITICAL' ? 'rgba(255,32,32,0.06)' : 'var(--color-bg-elevated)',
                    border: `1px solid ${alert.severity === 'CRITICAL' ? 'rgba(255,32,32,0.25)' : 'var(--color-border)'}`,
                  }}>
                  <AlertTriangle size={16} style={{ color: alert.severity === 'CRITICAL' ? '#ff2020' : alert.severity === 'HIGH' ? '#ef4444' : '#f59e0b', marginTop: '2px' }} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <SeverityBadge severity={alert.severity} size="sm" />
                      <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{alert.zone}</span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {alert.description}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-disabled)' }}>
                      {alert.camera} · {alert.time}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Btn variant="secondary" size="sm">Acknowledge</Btn>
                    <Btn variant="danger" size="sm">Investigate</Btn>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Zone configuration panel */}
        <div className="hidden xl:flex flex-col w-72 shrink-0 overflow-y-auto p-4"
          style={{ borderLeft: '1px solid var(--color-border)', background: 'var(--color-bg-surface)' }}>
          <h3 className="text-xs font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>ZONE CONFIGURATION</h3>
          <div className="space-y-3">
            {zones.map(zone => (
              <div key={zone.id} className="card p-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="w-2 h-2 rounded-sm" style={{ background: zone.color }} />
                      <span className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>{zone.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs px-1.5 py-0.5 rounded"
                        style={{ background: `${typeColor[zone.type] || '#64748b'}18`, color: typeColor[zone.type] || '#94a3b8', fontSize: '10px' }}>
                        {zone.type}
                      </span>
                      {zone.alertCount > 0 && (
                        <span className="text-xs" style={{ color: 'var(--color-danger)' }}>
                          {zone.alertCount} alerts
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleZone(zone.id)}
                    className="p-1.5 rounded transition-colors"
                    style={{
                      background: zone.enabled ? 'rgba(16,185,129,0.12)' : 'rgba(100,116,139,0.12)',
                      color: zone.enabled ? '#10b981' : '#64748b',
                    }}
                    title={zone.enabled ? 'Disable Zone' : 'Enable Zone'}
                  >
                    {zone.enabled ? <Power size={13} /> : <PowerOff size={13} />}
                  </button>
                </div>
                <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  <span>Camera: {zone.camera}</span>
                </div>
                {zone.lastTriggered && (
                  <div className="text-xs mt-1" style={{ color: 'var(--color-text-disabled)' }}>
                    Last triggered: {new Date(zone.lastTriggered).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </div>
                )}
                <div className="flex gap-1 mt-2">
                  <button className="flex-1 flex items-center justify-center gap-1 py-1 rounded text-xs hover:opacity-80"
                    style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
                    <Edit2 size={10} /> Edit
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1 py-1 rounded text-xs hover:opacity-80"
                    style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <Trash2 size={10} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* AI Suggestions */}
          {suggestions.length > 0 && (
              <div className="mt-4">
                  <h3 className="text-xs font-semibold mb-3" style={{ color: 'var(--color-primary)' }}>AI ZONE SUGGESTIONS</h3>
                  <div className="space-y-3">
                      {suggestions.map(sugg => (
                          <div key={sugg.id} className="card p-3 border-dashed border-2" style={{ borderColor: 'var(--color-primary)' }}>
                              <div className="mb-2">
                                  <div className="text-xs font-bold text-blue-400 mb-1">{sugg.name}</div>
                                  <div className="text-xs text-gray-400 mb-2">{sugg.reason}</div>
                                  <div className="text-[10px] bg-blue-900/50 text-blue-300 px-1.5 py-0.5 rounded inline-block">
                                      Suggested: {sugg.suggested_type} ({(sugg.confidence * 100).toFixed(0)}%)
                                  </div>
                              </div>
                              <div className="flex gap-1 mt-2">
                                  <button onClick={() => handleAcceptSuggestion(sugg.id)} className="flex-1 flex items-center justify-center gap-1 py-1 rounded text-xs bg-green-900/30 text-green-400 border border-green-500/30 hover:opacity-80">
                                      <CheckCircle size={10} /> Accept
                                  </button>
                                  <button onClick={() => handleRejectSuggestion(sugg.id)} className="flex-1 flex items-center justify-center gap-1 py-1 rounded text-xs bg-red-900/30 text-red-400 border border-red-500/30 hover:opacity-80">
                                      <Trash2 size={10} /> Reject
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {/* Zone legend */}
          <div className="mt-4 card p-3">
            <h4 className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>LEGEND</h4>
            {[
              { type: 'RESTRICTED', color: '#ef4444', desc: 'No entry permitted' },
              { type: 'WARNING', color: '#f59e0b', desc: 'Approach alert zone' },
              { type: 'BOUNDARY', color: '#3b82f6', desc: 'Outer perimeter' },
              { type: 'ENTRY/EXIT', color: '#10b981', desc: 'Designated gates' },
            ].map(item => (
              <div key={item.type} className="flex items-center gap-2 mb-1.5">
                <span className="w-3 h-3 rounded-sm" style={{ background: item.color, opacity: 0.8 }} />
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  <strong style={{ color: item.color }}>{item.type}</strong>: {item.desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualFence;
