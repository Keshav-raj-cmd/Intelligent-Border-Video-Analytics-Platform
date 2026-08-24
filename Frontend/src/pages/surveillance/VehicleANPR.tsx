import React, { useState, useEffect } from 'react';
import { Car, AlertTriangle, Flag, Search, ChevronRight, Eye } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { vehicles } from '../../data/vehicles';
import { Vehicle } from '../../types';
import { SearchBar, FilterButton, SectorBadge, PageHeader, StatCard, Btn } from '../../components/common';
import { Camera, Wifi, VideoOff, UploadCloud, Plus, Database, FileVideo } from 'lucide-react';

const PlateDisplay: React.FC<{ plate: string; flagged: boolean }> = ({ plate, flagged }) => (
  <div className="relative camera-feed rounded overflow-hidden" style={{ height: '70px' }}>
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        className="px-4 py-2 rounded font-mono font-bold text-lg tracking-widest"
        style={{
          background: flagged ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)',
          border: `2px solid ${flagged ? '#ef4444' : 'rgba(255,255,255,0.15)'}`,
          color: flagged ? '#ef4444' : '#f1f5f9',
        }}
      >
        {plate}
      </div>
    </div>
    {flagged && (
      <div className="absolute top-1 right-1 text-xs flex items-center gap-1 px-1.5 py-0.5 rounded"
        style={{ background: 'rgba(239,68,68,0.85)', color: '#fff', fontSize: '9px' }}>
        <AlertTriangle size={9} /> FLAGGED
      </div>
    )}
    <div className="absolute top-1 left-1 text-xs px-1 rounded"
      style={{ background: 'rgba(0,0,0,0.7)', color: '#94a3b8', fontSize: '8px' }}>
      ANPR
    </div>
  </div>
);

const VehicleANPR: React.FC = () => {
  const { setCurrentPage } = useAppStore();
  const [search, setSearch] = useState('');
  const [dirFilter, setDirFilter] = useState('ALL');
  const [selected, setSelected] = useState<Vehicle | null>(vehicles[0]);
  const [showFlagged, setShowFlagged] = useState(false);
  
  // Real-time Detection States
  const [isLive, setIsLive] = useState(false);
  const [cameraMode, setCameraMode] = useState<'webcam' | 'ipcam' | 'file' | null>(null);
  const [activeDetections, setActiveDetections] = useState<any[]>([]);
  const [ipCamFrameBase64, setIpCamFrameBase64] = useState<string | null>(null);
  const [frameSize, setFrameSize] = useState({ width: 640, height: 480 });
  
  // Database States
  const [dbVehicles, setDbVehicles] = useState<any[]>([]);
  const [showDbModal, setShowDbModal] = useState(false);
  const [dbUploadFile, setDbUploadFile] = useState<File | null>(null);
  
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const isProcessingFrame = React.useRef(false);

  useEffect(() => { 
    setCurrentPage('vehicle-anpr'); 
    fetchDbVehicles();
  }, [setCurrentPage]);

  const fetchDbVehicles = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/anpr/registry');
      if (res.ok) {
        const data = await res.json();
        setDbVehicles(data.vehicles || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsLive(true);
        setCameraMode('webcam');
      }
    } catch (err) {
      console.error(err);
      alert("Could not access camera.");
    }
  };

  const startIpCam = async () => {
    const url = prompt("Enter IP Camera URL (e.g., http://192.168.1.117:8080/video):", "http://192.168.1.117:8080/video");
    if (!url) return;
    try {
      const res = await fetch('http://localhost:8000/api/face/ipcam/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      if (res.ok) {
        setIsLive(true);
        setCameraMode('ipcam');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleVideoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && videoRef.current) {
      const url = URL.createObjectURL(file);
      videoRef.current.src = url;
      videoRef.current.play();
      setIsLive(true);
      setCameraMode('file');
    }
  };

  const stopFeed = async () => {
    if (cameraMode === 'ipcam') {
      try {
        await fetch('http://localhost:8000/api/face/ipcam/stop', { method: 'POST' });
      } catch (e) {}
    } else {
      if (videoRef.current) {
        if (videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        } else {
            videoRef.current.pause();
            videoRef.current.src = "";
            videoRef.current.load();
        }
      }
    }
    setIsLive(false);
    setCameraMode(null);
    setActiveDetections([]);
    setIpCamFrameBase64(null);
  };

  const captureAndDetect = async () => {
    if (!videoRef.current || !canvasRef.current || isProcessingFrame.current) return;
    isProcessingFrame.current = true;
    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(videoRef.current, 0, 0);
    
    canvas.toBlob(async (blob) => {
      if (!blob) { isProcessingFrame.current = false; return; }
      const formData = new FormData();
      formData.append('file', blob, 'frame.jpg');
      try {
        const res = await fetch('http://localhost:8000/api/anpr/recognize', { method: 'POST', body: formData });
        if (res.ok) {
          const data = await res.json();
          setActiveDetections(data.detections || []);
          if (data.frame_width && data.frame_height) {
            setFrameSize({ width: data.frame_width, height: data.frame_height });
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        isProcessingFrame.current = false;
      }
    }, 'image/jpeg', 0.6);
  };

  const pollIpCam = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/anpr/ipcam/poll');
      if (res.ok) {
        const data = await res.json();
        setActiveDetections(data.detections || []);
        if (data.frame_width && data.frame_height) {
          setFrameSize({ width: data.frame_width, height: data.frame_height });
        }
        if (data.frame_base64) {
          setIpCamFrameBase64(data.frame_base64);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    let interval: any;
    if (isLive) {
      if (cameraMode === 'webcam' || cameraMode === 'file') {
        interval = setInterval(captureAndDetect, 300); // 300ms interval for faster scanning!
      } else if (cameraMode === 'ipcam') {
        interval = setInterval(pollIpCam, 300);
      }
    }
    return () => clearInterval(interval);
  }, [isLive, cameraMode]);

  const handleExcelUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbUploadFile) return alert("Select an Excel or CSV file");
    const formData = new FormData();
    formData.append('file', dbUploadFile);
    try {
      const res = await fetch('http://localhost:8000/api/anpr/upload', { method: 'POST', body: formData });
      if (res.ok) {
        alert("Database updated!");
        fetchDbVehicles();
      }
    } catch (e) {
      alert("Upload failed.");
    }
  };

  const filtered = vehicles.filter(v => {
    const matchSearch =
      v.plateNumber.toLowerCase().includes(search.toLowerCase()) ||
      v.type.toLowerCase().includes(search.toLowerCase()) ||
      v.color.toLowerCase().includes(search.toLowerCase());
    const matchDir = dirFilter === 'ALL' || v.direction === dirFilter;
    const matchFlagged = !showFlagged || v.flagged;
    return matchSearch && matchDir && matchFlagged;
  });

  const flagged = vehicles.filter(v => v.flagged).length;
  const watchlisted = vehicles.filter(v => v.watchlisted).length;

  return (
    <div className="flex flex-col h-full" style={{ height: 'calc(100vh - 56px)' }}>
      <PageHeader
        title="Vehicle & ANPR Intelligence"
        subtitle={`${vehicles.length} vehicles detected today`}
        icon={<Car size={16} />}
        actions={
          <div className="flex items-center gap-2">
            {!isLive ? (
              <>
                <input type="file" accept="video/*" ref={fileInputRef} className="hidden" onChange={handleVideoFile} />
                <button onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded flex items-center gap-2">
                  <FileVideo size={14} /> LOCAL VIDEO
                </button>
                <button onClick={startWebcam} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded flex items-center gap-2">
                  <Camera size={14} /> WEBCAM
                </button>
                <button onClick={startIpCam} className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded flex items-center gap-2">
                  <Wifi size={14} /> IP CAM
                </button>
              </>
            ) : (
              <button onClick={stopFeed} className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded flex items-center gap-2">
                <VideoOff size={14} /> STOP
              </button>
            )}
            <button onClick={() => setShowDbModal(true)} className="px-3 py-1.5 bg-gray-800 border border-border text-white text-xs font-bold rounded flex items-center gap-2">
              <Database size={14} /> DB REGISTRY
            </button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <StatCard icon={<Car size={16} />} label="Total Vehicles" value={dbVehicles.length} sub="In Database" accent="var(--color-primary)" />
        <StatCard icon={<AlertTriangle size={16} />} label="Flagged" value={dbVehicles.filter(v => v.flagged).length} sub="Need review" accent="var(--color-danger)" />
        <StatCard icon={<Eye size={16} />} label="Live Detections" value={activeDetections.length} sub="In Frame" accent="var(--color-success)" />
        <StatCard icon={<Flag size={16} />} label="Matches" value={activeDetections.filter(d => d.database_info).length} sub="DB Hits" accent="var(--color-warning)" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 px-4 py-2 shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Direction:</span>
        {['ALL', 'INBOUND', 'OUTBOUND', 'CROSSING', 'UNKNOWN'].map(d => (
          <FilterButton key={d} label={d} active={dirFilter === d} onClick={() => setDirFilter(d)} />
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
          <div className="card overflow-hidden flex flex-col w-full max-w-5xl mx-auto border-2 relative" style={{ borderColor: 'var(--color-border)', height: '500px' }}>
            {!isLive && (
                <div className="absolute inset-0 flex items-center justify-center z-10" style={{ background: 'rgba(0,0,0,0.7)' }}>
                    <div className="text-center">
                        <Eye size={48} className="mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
                        <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-secondary)' }}>ANPR OFFLINE</h2>
                        <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>Start a feed to initialize Optical Character Recognition</p>
                    </div>
                </div>
            )}
            
            {cameraMode === 'ipcam' && ipCamFrameBase64 && (
                <img src={`data:image/jpeg;base64,${ipCamFrameBase64}`} className="w-full h-full object-contain bg-black" alt="IP Cam" />
            )}
            <video 
                ref={videoRef}
                className={`w-full h-full object-contain bg-black ${cameraMode === 'ipcam' ? 'hidden' : ''}`}
                playsInline
                controls
                muted
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* SVG OVERLAY FOR BOXES */}
            {isLive && (
              <svg 
                viewBox={`0 0 ${frameSize.width} ${frameSize.height}`}
                className="absolute inset-0 w-full h-full pointer-events-none"
                preserveAspectRatio="xMidYMid meet"
              >
                {activeDetections.map((det, idx) => {
                  const isMatch = !!det.database_info;
                  const isFlagged = isMatch && det.database_info.flagged;
                  
                  const boxColor = isFlagged ? '#ef4444' : (isMatch ? '#10b981' : '#3b82f6');
                  const fillColor = isFlagged ? 'rgba(239, 68, 68, 0.1)' : (isMatch ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)');
                  
                  return (
                    <g key={idx}>
                      <rect 
                        x={det.xmin} y={det.ymin} 
                        width={det.xmax - det.xmin} height={det.ymax - det.ymin} 
                        fill={fillColor} stroke={boxColor} strokeWidth="3"
                      />
                      {/* Text background */}
                      <rect 
                        x={det.xmin} y={det.ymin - 24} 
                        width={Math.max(120, det.xmax - det.xmin)} height="24" 
                        fill={boxColor}
                      />
                      <text 
                        x={det.xmin + 4} y={det.ymin - 8} 
                        fill="#fff" fontSize="14" fontWeight="bold" fontFamily="monospace"
                      >
                        {det.plate_text || det.class.toUpperCase()}
                      </text>
                    </g>
                  )
                })}
              </svg>
            )}
          </div>
        </div>

        {/* Selected vehicle detail */}
        {/* DB Matches panel */}
        <div className="hidden xl:flex xl:flex-col xl:w-80 shrink-0 p-4 overflow-y-auto border-l-2 gap-4"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-surface)' }}>
          <h3 className="text-xs font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>DATABASE MATCHES</h3>
          
          <div className="space-y-4">
            {activeDetections.filter(d => d.database_info).length === 0 ? (
              <div className="text-center py-6 text-xs text-muted border border-dashed border-border rounded-lg">
                No registered vehicles currently in frame.
              </div>
            ) : (
              activeDetections.filter(d => d.database_info).map((det, i) => (
                <div key={i} className={`p-3 rounded-lg border ${det.database_info.flagged ? 'border-red-500/30' : 'border-green-500/30'} flex flex-col gap-3`}
                  style={{ background: 'var(--color-bg-elevated)' }}>
                  <PlateDisplay plate={det.database_info.plate_number} flagged={det.database_info.flagged} />
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Model:</span>
                      <div className="font-bold text-white">{det.database_info.model}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Color:</span>
                      <div className="font-bold text-white">{det.database_info.color}</div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">Owner:</span>
                      <div className="font-bold text-white">{det.database_info.owner_name}</div>
                    </div>
                    {det.database_info.flagged && (
                      <div className="col-span-2 mt-1 p-2 bg-red-500/10 border border-red-500/20 rounded">
                        <span className="text-red-500 font-bold">WARRANTS:</span>
                        <p className="text-red-400 mt-0.5">{det.database_info.warrants}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Database Management Modal */}
      {showDbModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
            <div className="card w-full max-w-2xl p-6 border border-border max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2"><Database size={20} /> Registry</h2>
                    <button onClick={() => setShowDbModal(false)} className="text-muted hover:text-white">✕</button>
                </div>
                
                <div className="mb-6 p-4 border border-dashed border-border rounded-lg bg-black/50">
                  <h3 className="text-sm font-bold mb-2">Upload Database (Excel/CSV)</h3>
                  <form onSubmit={handleExcelUpload} className="flex gap-2">
                    <input type="file" accept=".xlsx,.csv" onChange={e => setDbUploadFile(e.target.files?.[0] || null)} className="flex-1 bg-black border border-border rounded px-3 py-1.5 text-sm" />
                    <button type="submit" className="px-4 py-1.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded text-sm flex items-center gap-2">
                      <UploadCloud size={14} /> UPLOAD
                    </button>
                  </form>
                </div>

                <div>
                  <h3 className="text-sm font-bold mb-3">Currently Registered ({dbVehicles.length})</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {dbVehicles.map((v: any) => (
                      <div key={v.plate_number} className={`p-2 text-xs border rounded ${v.flagged ? 'border-red-500/50 bg-red-500/10' : 'border-border bg-black/30'}`}>
                        <div className="font-bold font-mono">{v.plate_number}</div>
                        <div className="text-gray-400">{v.model} - {v.color}</div>
                      </div>
                    ))}
                  </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default VehicleANPR;
