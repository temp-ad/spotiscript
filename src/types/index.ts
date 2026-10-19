export interface Word {
  id: string;
  text: string;
  start: number;
  end: number;
  sentenceId: string;
  speakerId?: string;
}

export interface Sentence {
  id: string;
  text: string;
  start: number;
  end: number;
  words?: Word[];
  paragraphId?: string;
  speakerId?: string;
}

export interface Paragraph {
  id: string;
  sentences: Sentence[];
  speakerId?: string;
  startTime: number;
  endTime: number;
}

export interface Chapter {
  id: string;
  title: string;
  startTime: number;
  endTime?: number;
  summary?: string;
}

export interface Transcript {
  episodeId: string;
  language: string;
  source: 'official' | 'third-party' | 'user-upload' | 'speech-to-text';
  granularity: 'word' | 'sentence' | 'text-only';
  paragraphs: Paragraph[];
  sentences: Sentence[];
  words: Word[];
  speakerLabels?: Record<string, string>;
  title?: string;
  sourceLicense?: string;
}

export interface Episode {
  id: string;
  sourceType: 'spotify' | 'authorized_audio' | 'custom_upload';
  title: string;
  showName: string;
  artworkUrl: string;
  duration: number; // in seconds
  pubDate?: string;
  sourceUrl: string;
  audioUrl?: string; // used for Mode B
  spotifyEmbedUrl?: string; // used for Mode A
  description?: string;
  chapters?: Chapter[];
}

export interface Bookmark {
  id: string;
  episodeId: string;
  sentenceId: string;
  timestamp: number;
  text: string;
  note?: string;
  createdAt: number;
}

export interface SavedEpisode {
  episode: Episode;
  transcript?: Transcript;
  lastPosition: number;
  savedAt: number;
}

export type PlaybackMode = 'spotify' | 'sync';

export type ReadingFontSize = 'sm' | 'base' | 'lg' | 'xl';
export type ReadingColumnWidth = 'compact' | 'standard' | 'wide';
