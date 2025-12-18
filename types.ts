
export enum Page {
  // Voice Module Sub-pages
  HOME = 'HOME',
  DISCOVER = 'DISCOVER',
  PRESET = 'PRESET',
  CUSTOM = 'CUSTOM',
  FAVORITES = 'FAVORITES',
  ASR = 'ASR',
  TTS = 'TTS',
  VOICE_CLONING = 'VOICE_CLONING',
  DIARIZATION = 'DIARIZATION',
  
  // Prompt Module Sub-pages
  PROMPT_DISCOVER = 'PROMPT_DISCOVER',
  PROMPT_FAVORITES = 'PROMPT_FAVORITES',
  PROMPT_MINE = 'PROMPT_MINE',
  PROMPT_CREATE = 'PROMPT_CREATE',
}

export enum AppModule {
  DIGITAL_HUMAN = 'DIGITAL_HUMAN',
  AI_VOICE = 'AI_VOICE',
  PROMPT_LIBRARY = 'PROMPT_LIBRARY'
}

export type PromptView = 'HOME' | 'FAVORITES' | 'MINE' | 'CREATE';

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

export interface PromptItem {
  id: string;
  title: string;
  category: string;
  tags: string[];
  description: string;
  usageCount: string;
  isFavorite: boolean;
  author: string; 
  isPublic: boolean;
  createdAt: number;
  votes?: number;
  imageUrl?: string;
  model?: string; // Added model support
  notes?: string; // Added notes support
}
