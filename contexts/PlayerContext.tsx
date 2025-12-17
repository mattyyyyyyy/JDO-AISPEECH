import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Voice } from '../types';

interface PlayerContextType {
  currentVoice: Voice | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playVoice: (voice: Voice) => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  forward: (seconds: number) => void;
  rewind: (seconds: number) => void;
  closePlayer: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentVoice, setCurrentVoice] = useState<Voice | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    const audio = audioRef.current;
    
    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const safePlay = async () => {
    if (!audioRef.current) return;
    try {
      await audioRef.current.play();
    } catch (error: any) {
      // Ignore AbortError which happens if pause() is called while playing
      if (error.name !== 'AbortError') {
        console.error("Playback failed:", error);
        setIsPlaying(false);
      }
    }
  };

  const playVoice = (voice: Voice) => {
    if (!audioRef.current) return;

    // If clicking the same voice, toggle play/pause
    if (currentVoice?.id === voice.id) {
      togglePlay();
      return;
    }

    const audio = audioRef.current;
    
    // Pause current playback to avoid interference
    audio.pause();

    // Set new voice and play
    // Fallback to a reliable MP3
    const url = voice.previewUrl || "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3";
    
    audio.src = url;
    audio.load();
    
    setCurrentVoice(voice);
    setIsPlaying(true);
    
    safePlay();
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      safePlay();
    }
  };

  const seek = (time: number) => {
    if (!audioRef.current) return;
    const newTime = Math.max(0, Math.min(time, audioRef.current.duration));
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const forward = (seconds: number) => {
    if (!audioRef.current) return;
    seek(audioRef.current.currentTime + seconds);
  };

  const rewind = (seconds: number) => {
    if (!audioRef.current) return;
    seek(audioRef.current.currentTime - seconds);
  };

  const closePlayer = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentVoice(null);
  };

  return (
    <PlayerContext.Provider value={{ 
      currentVoice, 
      isPlaying, 
      currentTime, 
      duration, 
      playVoice, 
      togglePlay, 
      seek, 
      forward, 
      rewind,
      closePlayer 
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error("usePlayer must be used within PlayerProvider");
  return context;
};
