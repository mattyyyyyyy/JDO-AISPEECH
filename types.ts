export enum Page {
  HOME = 'HOME',
  // Libraries
  DISCOVER = 'DISCOVER',
  PRESET = 'PRESET',
  CUSTOM = 'CUSTOM',
  FAVORITES = 'FAVORITES',
  // Capabilities
  ASR = 'ASR',
  TTS = 'TTS',
  VOICE_CLONING = 'VOICE_CLONING',
  DIARIZATION = 'DIARIZATION',
}

export interface Voice {
  id: string;
  name: string;
  gender: 'Male' | 'Female';
  language: 'Chinese' | 'English';
  tags: string[];
  category: 'Social Media' | 'Character' | 'Narrator' | 'News';
  previewUrl?: string;
  avatarUrl: string;
  isCustom?: boolean;
  isFavorite?: boolean;
  flag?: string; // e.g., '🇨🇳' or '🇺🇸'
  description?: string; // Specific description from voice data
  source?: 'preset' | 'community' | 'custom'; // Data source categorization
}

export interface TranscriptionRecord {
  id: string;
  timestamp: number;
  text: string;
  duration: number;
}

export interface SpeakerSegment {
  id: string; // unique id for segment
  speakerId: string; // link to speaker identity
  text: string;
  startTime: number;
  endTime: number;
}

export interface SpeakerIdentity {
  id: string;
  name: string;
  color: string;
}

export interface CloneProject {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  status: 'draft' | 'processing' | 'completed';
  file?: File;
  createdAt: number;
  avatarUrl?: string;
}