import React, { createContext, useContext, useState } from 'react';
import { Voice } from '../types';
import { MOCK_VOICES } from '../constants';

interface TTSContextType {
  text: string;
  setText: (text: string) => void;
  selectedVoice: Voice;
  setSelectedVoice: (voice: Voice) => void;
}

const TTSContext = createContext<TTSContextType | undefined>(undefined);

export const TTSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default text empty, default voice is the first Chinese voice (MOCK_VOICES[2] is Li Mei) or the first one.
  // Let's default to MOCK_VOICES[2] (Chinese) as per previous TTS page default, or consistent with Home.
  // Using MOCK_VOICES[0] (Kore) to be safe, but you can change this.
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<Voice>(MOCK_VOICES[0]);

  return (
    <TTSContext.Provider value={{ 
      text, 
      setText, 
      selectedVoice, 
      setSelectedVoice 
    }}>
      {children}
    </TTSContext.Provider>
  );
};

export const useTTS = () => {
  const context = useContext(TTSContext);
  if (!context) throw new Error("useTTS must be used within TTSProvider");
  return context;
};
