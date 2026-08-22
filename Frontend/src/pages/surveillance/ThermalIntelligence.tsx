import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Thermometer, Target, Activity, Eye, Upload, Play, RefreshCw, Crosshair, Video } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { PageHeader, StatCard, StatusBadge } from '../../components/common';

// The images available in the public/res folder for simulation
const RES_IMAGES = [
  '/res/gettyimages-1297735161-612x612.jpg',
  '/res/image-thermal-imager-device-human-heat-map-blurred-unrecognizable-people-image-thermal-imager-device-248774977.webp',
  '/res/infrared-thermal-image-people-walking-city-streets-81921618.webp',
  '/res/infrared-thermal-image-people-walking-city-streets-81921640.webp',
  '/res/infrared-thermal-image-people-walking-city-streets-81921702.webp',
  '/res/thermal-camera-view-walking-human-footage-098858357_iconl.webp',
];

const RES_VIDEOS = [
  '/res/video/istockphoto-1147387858-640_adpp_is.mp4',
  '/res/video/istockphoto-1225043479-640_adpp_is.mp4',
];

interface Detection {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
  confidence: number;
  class: string;
}

// Helper to send file to API
const analyzeImage = async (fileOrBlob: Blob): Promise<Detection[]> => {
  const formData = new FormData();
  formData.append('file', fileOrBlob, 'image.jpg');

  const res = await fetch('http://127.0.0.1:8000/detect', {
    method: 'POST',
    body: formData,
  });
  
  if (!res.ok) throw new Error('API Error');
  const data = await res.json();
  return data.detections || [];
};

// Reusable Camera Feed Component
const ThermalCameraFeed: React.FC<{ 
  title: string; 
  subtitle: string; 
  mediaUrl: string | null; 
  mediaType: 'image' | 'video';
  detections: Detection[]; 
  isAnalyzing: boolean;
  onAction?: () => void;
  actionLabel?: React.ReactNode;
  children?: React.ReactNode;
  onFrameCapture?: (blob: Blob) => void;
}> = ({ title, subtitle, mediaUrl, mediaType, detections, isAnalyzing, onAction, actionLabel, children, onFrameCapture }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLImageElement | HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState({ x: 1, y: 1 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const updateScale = useCallback(() => {
    if (mediaRef.current && containerRef.current) {
      const media = mediaRef.current;
      const container = containerRef.current;
      
      const isVideo = media instanceof HTMLVideoElement;
      const intrinsicWidth = isVideo ? (media as HTMLVideoElement).videoWidth : (media as HTMLImageElement).naturalWidth;
      const intrinsicHeight = isVideo ? (media as HTMLVideoElement).videoHeight : (media as HTMLImageElement).naturalHeight;
      
      if (!intrinsicWidth || !intrinsicHeight) return;

      const containerRatio = container.clientWidth / container.clientHeight;
      const mediaRatio = intrinsicWidth / intrinsicHeight;
      
      let renderedWidth, renderedHeight, offsetX = 0, offsetY = 0;

      if (containerRatio > mediaRatio) {
        renderedHeight = container.clientHeight;
        renderedWidth = intrinsicWidth * (renderedHeight / intrinsicHeight);
        offsetX = (container.clientWidth - renderedWidth) / 2;
      } else {
        renderedWidth = container.clientWidth;
        renderedHeight = intrinsicHeight * (renderedWidth / intrinsicWidth);
        offsetY = (container.clientHeight - renderedHeight) / 2;
      }

      setScale({
        x: renderedWidth / intrinsicWidth,
        y: renderedHeight / intrinsicHeight
      });
      setOffset({ x: offsetX, y: offsetY });
    }
  }, []);

  useEffect(() => {
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [updateScale]);

  // Video Frame Extraction Loop
  useEffect(() => {
    let intervalId: number;
    if (mediaType === 'video' && mediaUrl && onFrameCapture) {
      intervalId = window.setInterval(() => {
        const video = mediaRef.current as HTMLVideoElement;
        const canvas = canvasRef.current;
        if (video && canvas && video.readyState >= 2 && !video.paused) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
              if (blob) onFrameCapture(blob);
            }, 'image/jpeg', 0.8);
          }
        }
      }, 1000); // 1 frame per second
    }
    return () => {
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [mediaType, mediaUrl, onFrameCapture]);

  return (
    <div className="card overflow-hidden flex flex-col h-full">
      <div className="p-3 shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
              {title}
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            {actionLabel && onAction && (
              <button 
                onClick={onAction}
                disabled={mediaType === 'image' && isAnalyzing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all hover:brightness-110 active:scale-95"
                style={{ 
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  opacity: (mediaType === 'image' && isAnalyzing) ? 0.5 : 1
                }}
              >
                {actionLabel}
              </button>
            )}
            <StatusBadge status={isAnalyzing ? 'ANALYZING' : (mediaUrl ? (mediaType === 'video' ? 'LIVE' : 'ONLINE') : 'STANDBY')} size="sm" />
          </div>
        </div>
      </div>
      
      <div ref={containerRef} className="relative flex-1 bg-black overflow-hidden flex items-center justify-center min-h-[300px]">
        {mediaUrl ? (
          <>
            {mediaType === 'video' ? (
              <video 
                ref={mediaRef as any}
                src={mediaUrl} 
                className="w-full h-full object-contain"
                autoPlay 
                loop 
                muted 
                playsInline
                onLoadedMetadata={updateScale}
              />
            ) : (
              <img 
                ref={mediaRef as any}
                src={mediaUrl} 
                alt="Thermal Feed" 
                className="w-full h-full object-contain"
                onLoad={updateScale}
              />
            )}
            <canvas ref={canvasRef} className="hidden" />

            {/* Draw Bounding Boxes */}
            {detections.map((d, i) => {
              const left = offset.x + (d.xmin * scale.x);
              const top = offset.y + (d.ymin * scale.y);
              const width = (d.xmax - d.xmin) * scale.x;
              const height = (d.ymax - d.ymin) * scale.y;
              
              return (
                <div 
                  key={i} 
                  className="absolute border-2 pointer-events-none transition-all duration-300"
                  style={{
                    left: `${left}px`,
                    top: `${top}px`,
                    width: `${width}px`,
                    height: `${height}px`,
                    borderColor: 'rgba(255, 60, 60, 0.9)',
                    backgroundColor: 'rgba(255, 60, 60, 0.15)',
                    boxShadow: '0 0 12px rgba(255, 60, 60, 0.6), inset 0 0 8px rgba(255, 60, 60, 0.3)'
                  }}
                >
                  <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-white opacity-80" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-white opacity-80" />
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-white opacity-80" />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-white opacity-80" />
                  
                  <div 
                    className="absolute -top-6 left-[-2px] px-2 py-0.5 text-[10px] font-bold whitespace-nowrap rounded-t-sm transition-all duration-300"
                    style={{
                      backgroundColor: 'rgba(255, 60, 60, 0.95)',
                      color: '#fff',
                      letterSpacing: '0.5px'
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <Target size={10} />
                      {d.class.toUpperCase()} {(d.confidence * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}

            {mediaType === 'image' && isAnalyzing && (
              <div className="absolute inset-0 flex items-center justify-center backdrop-blur-[1px]" style={{ background: 'rgba(0,0,0,0.4)' }}>
                <div className="flex flex-col items-center gap-3">
                  <RefreshCw className="animate-spin" size={28} color="#ef4444" />
                  <span className="text-xs font-bold tracking-[0.2em]" style={{ color: '#ef4444' }}>ANALYZING...</span>
                </div>
              </div>
            )}
            
            {mediaType === 'video' && isAnalyzing && (
              <div className="absolute top-4 left-4 flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                 <span className="text-[10px] font-bold text-red-500 tracking-wider bg-black/50 px-2 py-0.5 rounded">LIVE INFERENCE</span>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4 w-full px-8">
             {children}
          </div>
        )}

        {/* Scan line overlay effect */}
        <div className="pointer-events-none absolute inset-0 opacity-10" style={{
            background: 'linear-gradient(to bottom, transparent 50%, rgba(255, 60, 60, 0.1) 51%, transparent 51%)',
            backgroundSize: '100% 4px'
        }} />
      </div>
    </div>
  );
};

const ThermalIntelligence: React.FC = () => {
  const { setCurrentPage } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for Simulated Feed
  const [simUrl, setSimUrl] = useState<string | null>(null);
  const [simType, setSimType] = useState<'image' | 'video'>('image');
  const [simDetections, setSimDetections] = useState<Detection[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  // State for Upload Feed
  const [upUrl, setUpUrl] = useState<string | null>(null);
  const [upType, setUpType] = useState<'image' | 'video'>('image');
  const [upDetections, setUpDetections] = useState<Detection[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Frame processing ref so we don't overlap fetch calls for video
  const isProcessingSimFrame = useRef(false);
  const isProcessingUpFrame = useRef(false);

  // Combined targets for the grid below
  const activeTargets = [...simDetections, ...upDetections];

  useEffect(() => { setCurrentPage('thermal-intelligence'); }, [setCurrentPage]);

  const handleSimulateRandom = async () => {
    setIsSimulating(true);
    setSimDetections([]);
    
    // Pick randomly between image and video for simulation
    const useVideo = Math.random() > 0.5;
    
    if (useVideo) {
      const randomVid = RES_VIDEOS[Math.floor(Math.random() * RES_VIDEOS.length)];
      setSimUrl(randomVid);
      setSimType('video');
      setIsSimulating(true); // Always "analyzing" for video since it's continuous
    } else {
      const randomImg = RES_IMAGES[Math.floor(Math.random() * RES_IMAGES.length)];
      setSimUrl(randomImg);
      setSimType('image');
      try {
        const response = await fetch(randomImg);
        const blob = await response.blob();
        const det = await analyzeImage(blob);
        setSimDetections(det);
      } catch (err) {
        console.error("Simulation failed:", err);
      } finally {
        setIsSimulating(false);
      }
    }
  };

  const handleSimulateVideoFrame = async (blob: Blob) => {
    if (isProcessingSimFrame.current) return;
    isProcessingSimFrame.current = true;
    try {
      const det = await analyzeImage(blob);
      setSimDetections(det);
    } catch (err) {
      console.error(err);
    } finally {
      isProcessingSimFrame.current = false;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const objUrl = URL.createObjectURL(file);
    setUpUrl(objUrl);
    setUpType(isVideo ? 'video' : 'image');
    setUpDetections([]);
    setIsUploading(true);

    if (isVideo) {
      // For video, the frame extractor loop takes over.
    } else {
      try {
        const det = await analyzeImage(file);
        setUpDetections(det);
      } catch (err) {
        console.error("Upload analysis failed:", err);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleUploadVideoFrame = async (blob: Blob) => {
    if (isProcessingUpFrame.current) return;
    isProcessingUpFrame.current = true;
    try {
      const det = await analyzeImage(blob);
      setUpDetections(det);
    } catch (err) {
      console.error(err);
    } finally {
      isProcessingUpFrame.current = false;
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ height: 'calc(100vh - 56px)' }}>
      <PageHeader
        title="Thermal Intelligence AI"
        subtitle="Live YOLOv8 thermal model inference & object detection"
        icon={<Thermometer size={16} />}
        accent="#ef4444"
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-surface)' }}>
        <StatCard icon={<Crosshair size={16} />} label="Total Detections" value={activeTargets.length} sub="Current feeds" accent="#ef4444" />
        <StatCard icon={<Activity size={16} />} label="Human Signatures" value={activeTargets.filter(t => t.class.toLowerCase() === 'human').length} sub="Identified" accent="var(--color-warning)" />
        <StatCard icon={<Eye size={16} />} label="Highest Confidence" value={activeTargets.length ? `${Math.round(Math.max(...activeTargets.map(t => t.confidence)) * 100)}%` : '--'} sub="Accuracy" accent="var(--color-success)" />
        <StatCard icon={<Thermometer size={16} />} label="API Status" value="ONLINE" sub="FastAPI Backend" accent="#3b82f6" />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Top Feeds Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[400px]">
            {/* Feed 1: Simulation */}
            <ThermalCameraFeed
              title="Simulation Feed"
              subtitle="Random Thermal Snippets (Images/Videos)"
              mediaUrl={simUrl}
              mediaType={simType}
              detections={simDetections}
              isAnalyzing={isSimulating}
              onAction={handleSimulateRandom}
              actionLabel={<><Play size={14} /> PLAY RANDOM</>}
              onFrameCapture={handleSimulateVideoFrame}
            >
              <div className="text-center p-6 border-2 border-dashed rounded-xl" style={{ borderColor: 'var(--color-border)' }}>
                <Video size={32} className="mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>Simulated Camera Source</p>
                <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>Click PLAY RANDOM to fetch a test image or video and run YOLO detection.</p>
                <button onClick={handleSimulateRandom} className="btn-primary flex items-center gap-2 mx-auto px-6 py-2 text-sm">
                  <Play size={16} /> Run Simulation
                </button>
              </div>
            </ThermalCameraFeed>

            {/* Feed 2: Upload */}
            <ThermalCameraFeed
              title="Interactive Analysis"
              subtitle="Upload manual thermal imagery or video"
              mediaUrl={upUrl}
              mediaType={upType}
              detections={upDetections}
              isAnalyzing={isUploading}
              onAction={() => fileInputRef.current?.click()}
              actionLabel={<><Upload size={14} /> UPLOAD FILE</>}
              onFrameCapture={handleUploadVideoFrame}
            >
              <div 
                className="text-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all hover:bg-white/5" 
                style={{ borderColor: 'var(--color-border)' }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={32} className="mx-auto mb-3" style={{ color: 'var(--color-primary)' }} />
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>Upload Thermal Image or Video</p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Select any file (.webp, .jpg, .mp4) to run against the backend API.</p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="image/*,video/*" 
                className="hidden" 
              />
            </ThermalCameraFeed>
          </div>

          {/* Detections List */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Live Detection Signatures</h3>
              <span className="px-2 py-0.5 text-[10px] rounded-full font-bold" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                {activeTargets.length} DETECTED
              </span>
            </div>
            
            {activeTargets.length === 0 ? (
              <div className="card p-8 text-center border-dashed">
                <Target size={24} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>No targets detected currently.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {activeTargets.map((t, idx) => (
                  <div key={idx} className="card p-3 border-l-4" style={{ borderLeftColor: '#ef4444' }}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-1.5">
                        <Target size={14} color="#ef4444" />
                        <span className="text-xs font-bold uppercase" style={{ color: 'var(--color-text-primary)' }}>
                          {t.class}
                        </span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-black/30 text-green-400">
                        {(t.confidence * 100).toFixed(1)}% CONF
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] font-mono mt-2 p-2 rounded bg-black/20" style={{ color: 'var(--color-text-muted)' }}>
                      <div>X: {Math.round(t.xmin)}</div>
                      <div>Y: {Math.round(t.ymin)}</div>
                      <div>W: {Math.round(t.xmax - t.xmin)}</div>
                      <div>H: {Math.round(t.ymax - t.ymin)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ThermalIntelligence;
