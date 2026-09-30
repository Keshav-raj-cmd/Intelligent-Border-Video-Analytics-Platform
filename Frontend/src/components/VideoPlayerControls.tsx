import React, { useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, FastForward, SkipForward, SkipBack, Settings2 } from 'lucide-react';

interface VideoPlayerControlsProps {
  videoRef: React.RefObject<HTMLVideoElement>;
}

const formatTime = (timeInSeconds: number) => {
  if (isNaN(timeInSeconds)) return "00:00";
  const m = Math.floor(timeInSeconds / 60).toString().padStart(2, '0');
  const s = Math.floor(timeInSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

export const VideoPlayerControls: React.FC<VideoPlayerControlsProps> = ({ videoRef }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setProgress((video.currentTime / video.duration) * 100);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    
    // Set initial state
    setIsPlaying(!video.paused);
    setDuration(video.duration || 0);
    setIsMuted(video.muted);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [videoRef]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (video) {
      if (video.paused) video.play();
      else video.pause();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
      setIsMuted(video.muted);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (video) {
      const newTime = (parseFloat(e.target.value) / 100) * video.duration;
      video.currentTime = newTime;
      setProgress(parseFloat(e.target.value));
    }
  };

  const handleFullscreen = () => {
    const video = videoRef.current;
    if (video && video.requestFullscreen) {
      video.requestFullscreen();
    }
  };

  const changePlaybackRate = (rate: number) => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = rate;
      setPlaybackRate(rate);
      setShowSpeedMenu(false);
    }
  };

  const stepFrame = (forward: boolean) => {
    const video = videoRef.current;
    if (video) {
      if (!video.paused) video.pause();
      // Assume ~30fps, 1 frame = ~0.0333s
      video.currentTime += forward ? 0.0333 : -0.0333;
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col gap-2 transition-opacity opacity-0 hover:opacity-100 group-hover:opacity-100 z-50">
      {/* Progress Slider */}
      <input 
        type="range" 
        min="0" 
        max="100" 
        value={isNaN(progress) ? 0 : progress} 
        onChange={handleSeek}
        className="w-full h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer accent-red-500 hover:h-2 transition-all"
        style={{
          background: `linear-gradient(to right, #ef4444 ${progress}%, rgba(255,255,255,0.3) ${progress}%)`
        }}
      />
      
      {/* Controls */}
      <div className="flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <button onClick={() => stepFrame(false)} className="p-1 hover:text-red-400 transition-colors" title="Previous Frame">
            <SkipBack size={16} />
          </button>
          <button onClick={togglePlay} className="p-1 hover:text-red-400 transition-colors">
            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
          </button>
          <button onClick={() => stepFrame(true)} className="p-1 hover:text-red-400 transition-colors" title="Next Frame">
            <SkipForward size={16} />
          </button>
          
          <button onClick={toggleMute} className="p-1 hover:text-red-400 transition-colors">
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          
          <div className="text-xs font-mono ml-2 opacity-80">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
        
        <div className="flex items-center gap-2 relative">
          <button 
            onClick={() => setShowSpeedMenu(!showSpeedMenu)} 
            className="px-2 py-1 text-xs font-bold bg-white/10 rounded hover:bg-white/20 transition-colors"
          >
            {playbackRate}x
          </button>
          
          {showSpeedMenu && (
            <div className="absolute bottom-8 right-8 bg-slate-900 border border-slate-700 rounded-lg p-1 flex flex-col gap-1 z-50 shadow-xl">
              {[0.25, 0.5, 1, 1.5, 2, 4].map(rate => (
                <button
                  key={rate}
                  onClick={() => changePlaybackRate(rate)}
                  className={`text-xs px-4 py-1.5 rounded ${playbackRate === rate ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-white/10'}`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          )}

          <button onClick={handleFullscreen} className="p-1 hover:text-red-400 transition-colors">
            <Maximize2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
