
import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
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

  const safePlay = useCallback(async () => {
    if (!audioRef.current) return;
    try {
      await audioRef.current.play();
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error("Playback failed:", error);
        setIsPlaying(false);
      }
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      safePlay();
    }
  }, [isPlaying, safePlay]);

  const playVoice = useCallback((voice: Voice) => {
    if (!audioRef.current) return;

    if (currentVoice?.id === voice.id) {
      togglePlay();
      return;
    }

    const audio = audioRef.current;
    audio.pause();

    const url = voice.previewUrl || "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3";
    
    audio.src = url;
    audio.load();
    
    setCurrentVoice(voice);
    setIsPlaying(true);
    safePlay();
  }, [currentVoice, togglePlay, safePlay]);

  const seek = useCallback((time: number) => {
    if (!audioRef.current) return;
    const newTime = Math.max(0, Math.min(time, audioRef.current.duration));
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, []);

  const forward = useCallback((seconds: number) => {
    if (!audioRef.current) return;
    seek(audioRef.current.currentTime + seconds);
  }, [seek]);

  const rewind = useCallback((seconds: number) => {
    if (!audioRef.current) return;
    seek(audioRef.current.currentTime - seconds);
  }, [seek]);

  const closePlayer = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentVoice(null);
  }, []);

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
