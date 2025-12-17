import React from 'react';
import { Heart } from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';
import { useVoices } from '../contexts/VoiceContext';
import PlayerBar from './PlayerBar';
import { translateCategory } from '../constants';

const GlobalPlayer: React.FC = () => {
  const { 
    currentVoice, 
    isPlaying, 
    currentTime, 
    duration, 
    togglePlay, 
    seek, 
    forward, 
    rewind, 
    closePlayer 
  } = usePlayer();

  const { getVoice, toggleFavorite } = useVoices();

  if (!currentVoice) return null;

  // Get the most up-to-date voice object from context to check isFavorite
  const activeVoiceData = getVoice(currentVoice.id) || currentVoice;

  return (
    <div className="fixed bottom-6 left-80 right-8 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500">
      <PlayerBar
        avatarUrl={activeVoiceData.avatarUrl}
        title={activeVoiceData.name}
        subTitle={translateCategory(activeVoiceData.category)}
        tags={activeVoiceData.tags}
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        onClose={closePlayer}
        currentTime={currentTime}
        duration={duration}
        onSeek={seek}
        onForward={() => forward(10)}
        onRewind={() => rewind(10)}
        actionButton={
          <button 
            onClick={() => toggleFavorite(activeVoiceData.id)}
            className={`p-2 rounded-lg transition-colors ${activeVoiceData.isFavorite ? 'text-red-500 hover:bg-red-500/10' : 'text-white/30 hover:text-white hover:bg-white/10'}`}
            title="收藏"
          >
             <Heart size={18} fill={activeVoiceData.isFavorite ? "currentColor" : "none"} />
          </button>
        }
      />
    </div>
  );
};

export default GlobalPlayer;