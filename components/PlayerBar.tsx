import React from 'react';
import { Play, Pause, Rewind, FastForward, X, Volume2 } from 'lucide-react';

interface PlayerBarProps {
  avatarUrl: string;
  title: string;
  subTitle?: string;
  tags?: string[];
  isPlaying: boolean;
  onTogglePlay: () => void;
  onClose: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  onForward?: () => void;
  onRewind?: () => void;
  actionButton?: React.ReactNode; // Download or Heart
  className?: string;
}

const PlayerBar: React.FC<PlayerBarProps> = ({
  avatarUrl,
  title,
  subTitle,
  tags,
  isPlaying,
  onTogglePlay,
  onClose,
  currentTime,
  duration,
  onSeek,
  onForward,
  onRewind,
  actionButton,
  className = ''
}) => {
  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`bg-[#0f0f11]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.3)] flex items-center gap-6 relative overflow-hidden group w-full transition-all duration-300 hover:bg-[#0f0f11]/90 ${className}`}>
      
      {/* Progress Bar Background (Bottom Line) */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5">
         <div 
           className="h-full bg-gradient-to-r from-spark-accent to-spark-dark transition-all duration-100 ease-linear"
           style={{ width: `${progress}%` }}
         />
      </div>

      {/* Info Section */}
      <div className="flex items-center gap-4 min-w-[200px] max-w-[30%]">
        <div className="relative shrink-0">
           <img 
             src={avatarUrl} 
             alt="avatar" 
             className={`w-12 h-12 rounded-lg border border-white/10 object-cover ${isPlaying ? 'shadow-[0_0_15px_rgba(59,130,246,0.3)]' : ''}`} 
           />
           {isPlaying && (
             <div className="absolute -bottom-1 -right-1 bg-[#12141a] rounded-full p-0.5 border border-white/10">
               <div className="w-2 h-2 rounded-full bg-spark-accent animate-pulse"></div>
             </div>
           )}
        </div>
        <div className="overflow-hidden flex flex-col gap-0.5">
          <h3 className="font-bold text-white text-sm truncate pr-2">{title}</h3>
          
          <div className="flex items-center gap-2 overflow-hidden">
             {subTitle && <span className="text-[10px] text-spark-muted truncate shrink-0">{subTitle}</span>}
             
             {tags && tags.length > 0 && (
                <div className="flex gap-1 overflow-hidden">
                  {tags.slice(0, 2).map((tag, i) => (
                    <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-sm bg-white/5 text-white/50 border border-white/5 whitespace-nowrap">
                       {tag}
                    </span>
                  ))}
                </div>
             )}
          </div>
        </div>
      </div>

      {/* Controls Section - Centered & Expanded */}
      <div className="flex-1 flex flex-col items-center justify-center gap-2">
         <div className="flex items-center gap-6">
            {onRewind && (
              <button 
                onClick={onRewind}
                className="text-white/30 hover:text-white transition-colors hover:scale-110 active:scale-95"
                title="-5s"
              >
                <Rewind size={18} />
              </button>
            )}

            <button 
              onClick={onTogglePlay}
              className="w-8 h-8 rounded-full bg-white text-spark-bg flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-white/20"
            >
              {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
            </button>

            {onForward && (
              <button 
                onClick={onForward}
                className="text-white/30 hover:text-white transition-colors hover:scale-110 active:scale-95"
                title="+5s"
              >
                <FastForward size={18} />
              </button>
            )}
         </div>
         
         {/* Scrubber */}
         <div className="w-full flex items-center gap-3 text-[10px] font-mono text-white/30">
            <span className="w-9 text-right tabular-nums">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={(e) => onSeek(parseFloat(e.target.value))}
              className="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white hover:[&::-webkit-slider-thumb]:bg-spark-accent [&::-webkit-slider-thumb]:transition-colors"
            />
            <span className="w-9 tabular-nums">{formatTime(duration)}</span>
         </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pl-4 border-l border-white/5">
        {actionButton}
        
        <button 
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-white/10 text-white/30 hover:text-white transition-colors"
        >
           <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default PlayerBar;