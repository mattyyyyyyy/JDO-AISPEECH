import React, { createContext, useContext, useState } from 'react';
import { Voice } from '../types';
import { MOCK_VOICES } from '../constants';

interface VoiceContextType {
  voices: Voice[];
  tags: string[];
  toggleFavorite: (voiceId: string) => void;
  addVoice: (voice: Voice) => void;
  deleteVoice: (voiceId: string) => void;
  getVoice: (voiceId: string) => Voice | undefined;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export const VoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [voices, setVoices] = useState<Voice[]>(MOCK_VOICES);
  // Initialize unique tags from mock voices + some defaults
  const [tags, setTags] = useState<string[]>(Array.from(new Set([
    'News', 'Narrator', 'Social Media', 'Character', 'ASMR', 'Sorrow', 'Happy'
  ])));

  const toggleFavorite = (voiceId: string) => {
    setVoices(prevVoices => 
      prevVoices.map(voice => 
        voice.id === voiceId ? { ...voice, isFavorite: !voice.isFavorite } : voice
      )
    );
  };

  const addVoice = (voice: Voice) => {
    setVoices(prev => [voice, ...prev]);
  };

  const deleteVoice = (voiceId: string) => {
    setVoices(prev => prev.filter(v => v.id !== voiceId));
  };

  const getVoice = (voiceId: string) => voices.find(v => v.id === voiceId);

  const addTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags(prev => [...prev, tag]);
    }
  };

  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  return (
    <VoiceContext.Provider value={{ 
      voices, 
      tags,
      toggleFavorite, 
      addVoice, 
      deleteVoice,
      getVoice,
      addTag,
      removeTag
    }}>
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoices = () => {
  const context = useContext(VoiceContext);
  if (!context) throw new Error("useVoices must be used within VoiceProvider");
  return context;
};