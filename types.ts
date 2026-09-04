export interface ArtStyle {
  id: string;
  name: string;
  description: string;
  promptModifier: string;
  gradient: string;
}

export interface GeneratedImage {
  id: string;
  url: string; // Base64 data URL
  prompt: string;
  styleId: string;
  aspectRatio: string;
  seed?: number;
  creativity?: number;
  timestamp: number;
  referenceImage?: string | null;
  lightSourceId?: string;
  lightDirectionId?: string;
  tags?: string[];
  folder?: string;
}

export interface GenerationPreset {
  id: string;
  name: string;
  prompt: string;
  styleId: string;
  aspectRatio: string;
  seed?: number;
  creativity: number;
  timestamp: number;
  referenceImage?: string | null;
  lightSourceId?: string;
  lightDirectionId?: string;
}

export type GenerationStatus = 'idle' | 'generating' | 'success' | 'error';

export interface RecentPromptSetting {
  id: string;
  prompt: string;
  styleId: string;
  aspectRatio: string;
  creativity: number;
  lightSourceId: string;
  lightDirectionId: string;
  filterId: string;
  timestamp: number;
}

