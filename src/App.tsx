import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sidebar } from './components/Sidebar.tsx';
import { TopBar } from './components/TopBar.tsx';
import { EpisodeHeader } from './components/EpisodeHeader.tsx';
import { SpotifyEmbedPlayer } from './components/SpotifyEmbedPlayer.tsx';
import { TranscriptReader } from './components/TranscriptReader.tsx';
import { AudioPlayer } from './components/AudioPlayer.tsx';
import { AiSummaryModal } from './components/AiSummaryModal.tsx';
import { ImportModal } from './components/ImportModal.tsx';
import { LibraryModal } from './components/LibraryModal.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { 
  Episode, 
  Transcript, 
  Bookmark, 
  SavedEpisode, 
  ReadingFontSize, 
  ReadingColumnWidth,
  Sentence 
} from './types/index.ts';
import { 
  SAMPLE_EPISODES,
  SAMPLE_AUTHORIZED_EPISODE, 
  SAMPLE_AUTHORIZED_TRANSCRIPT,
  SAMPLE_SPOTIFY_EPISODE,
  SAMPLE_SPOTIFY_ID,
  SAMPLE_SPOTIFY_TRANSCRIPT,
  SAMPLE_SPOTIFY_URL,
  getTranscriptForEpisode,
  registerTranscript
} from './data/sampleEpisodes.ts';
import { audioPlayerService } from './utils/audioPlayerService.ts';
import { validateSpotifyEpisodeUrl } from './utils/spotify.ts';
import { exportTranscript } from './utils/transcriptParser.ts';

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('spotscript_theme');
      if (stored) return stored === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Reading & Display preferences
  const [fontSize, setFontSize] = useState<ReadingFontSize>('base');
  const [columnWidth, setColumnWidth] = useState<ReadingColumnWidth>('standard');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);

  // Available episodes list (default samples + user imports)
  const [episodeList, setEpisodeList] = useState<Episode[]>(SAMPLE_EPISODES);
  
  // Current active episode and transcript
  const [currentEpisode, setCurrentEpisode] = useState<Episode>(SAMPLE_AUTHORIZED_EPISODE);
  const [currentTranscript, setCurrentTranscript] = useState<Transcript | null>(SAMPLE_AUTHORIZED_TRANSCRIPT);
  const [showSpotifyEmbed, setShowSpotifyEmbed] = useState<boolean>(false);

  // Audio playback state
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(SAMPLE_AUTHORIZED_EPISODE.duration);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Search in transcript
  const [searchTerm, setSearchTerm] = useState('');

  // Modals & Drawers
  const [isAiSummaryOpen, setIsAiSummaryOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);

  // Saved Episodes & Bookmarks
  const [savedEpisodes, setSavedEpisodes] = useState<SavedEpisode[]>(() => {
    try {
      const stored = localStorage.getItem('spotscript_saved_episodes');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    try {
      const stored = localStorage.getItem('spotscript_bookmarks');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Sync theme to root DOM
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('spotscript_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('spotscript_theme', 'light');
    }
  }, [isDark]);

  // Persist bookmarks & saved episodes
  useEffect(() => {
    localStorage.setItem('spotscript_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('spotscript_saved_episodes', JSON.stringify(savedEpisodes));
  }, [savedEpisodes]);

  // Audio service listeners
  useEffect(() => {
    const unsubTime = audioPlayerService.onTimeUpdate((t) => {
      setCurrentTime(t);
    });
    const unsubState = audioPlayerService.onStateChange((playing) => {
      setIsPlaying(playing);
    });

    return () => {
      unsubTime();
      unsubState();
    };
  }, []);

  // When active episode changes, reload audio source and transcript
  useEffect(() => {
    audioPlayerService.loadSource(currentEpisode.audioUrl || 'SYNTHETIC_SPEECH_STREAM', currentEpisode.duration);
    setDuration(currentEpisode.duration);
    setCurrentTime(0);
    // Reset transcript for episodes whose synced text lives in the library map
    // (custom imports keep their own transcript via handleImportCustom).
    if (currentEpisode.sourceType !== 'custom_upload') {
      const tr = getTranscriptForEpisode(currentEpisode.id);
      setCurrentTranscript(tr);
    }
    setShowSpotifyEmbed(currentEpisode.sourceType === 'spotify');
  }, [currentEpisode]);

  // Select an episode from sidebar or library
  const handleSelectEpisode = useCallback((ep: Episode) => {
    setCurrentEpisode(ep);
    const tr = getTranscriptForEpisode(ep.id);
    setCurrentTranscript(tr);
    setShowSpotifyEmbed(false);
  }, []);

  // Playback handlers
  const handleTogglePlay = useCallback(() => {
    audioPlayerService.togglePlay();
  }, []);

  const handleSeek = useCallback((seconds: number) => {
    audioPlayerService.seek(seconds);
  }, []);

  const handleRateChange = useCallback((rate: number) => {
    setPlaybackRate(rate);
    audioPlayerService.setPlaybackRate(rate);
  }, []);

  const handleVolumeChange = useCallback((vol: number) => {
    setVolume(vol);
    setIsMuted(vol === 0);
    audioPlayerService.setVolume(vol);
  }, []);

  const handleToggleMute = useCallback(() => {
    if (isMuted) {
      setIsMuted(false);
      audioPlayerService.setVolume(volume > 0 ? volume : 0.85);
    } else {
      setIsMuted(true);
      audioPlayerService.setVolume(0);
    }
  }, [isMuted, volume]);

  // Next / Prev segment jump
  const handlePrevSegment = useCallback(() => {
    if (!currentTranscript || currentTranscript.sentences.length === 0) return;
    const sentences = currentTranscript.sentences;
    for (let i = sentences.length - 1; i >= 0; i--) {
      if (sentences[i].start < currentTime - 1.5) {
        handleSeek(sentences[i].start);
        return;
      }
    }
    handleSeek(0);
  }, [currentTranscript, currentTime, handleSeek]);

  const handleNextSegment = useCallback(() => {
    if (!currentTranscript || currentTranscript.sentences.length === 0) return;
    const sentences = currentTranscript.sentences;
    for (let i = 0; i < sentences.length; i++) {
      if (sentences[i].start > currentTime + 0.5) {
        handleSeek(sentences[i].start);
        return;
      }
    }
  }, [currentTranscript, currentTime, handleSeek]);

  // Import Spotify URL handler
  const handleImportSpotifyUrl = async (rawUrl: string) => {
    setIsLoadingUrl(true);
    const parsed = validateSpotifyEpisodeUrl(rawUrl);
    if (!parsed.isValid || !parsed.episodeId) {
      setIsLoadingUrl(false);
      throw new Error(parsed.error || 'Invalid Spotify URL');
    }

    try {
      const response = await fetch(`/api/spotify/episode-info?url=${encodeURIComponent(parsed.canonicalUrl!)}`);
      let epData: any = {};
      if (response.ok) {
        epData = await response.json();
      }

      const episodeId = epData.id || parsed.episodeId;

      const newEpisode: Episode = {
        id: episodeId,
        sourceType: 'spotify',
        title: epData.title || `Spotify Episode (${parsed.episodeId.slice(0, 8)})`,
        showName: epData.showName || 'Spotify Podcast',
        artworkUrl: epData.artworkUrl || '',
        duration: typeof epData.durationSeconds === 'number' ? epData.durationSeconds : 0,
        pubDate: epData.pubDate || 'Published on Spotify',
        sourceUrl: parsed.canonicalUrl!,
        spotifyEmbedUrl: epData.spotifyEmbedUrl || `https://open.spotify.com/embed/episode/${parsed.episodeId}?utm_source=generator&theme=0`,
        audioUrl: 'SPOTIFY_EMBED_STREAM',
        description: epData.description || 'Loaded via SpotScript Spotify Episode Importer.',
        chapters: [],
      };

      // Only the built-in demo episode ships with a synced sample transcript.
      // Real imports have no official timed transcript (Spotify's public
      // transcripts endpoint returns 410 Gone), so show an honest empty state
      // instead of misleading sample text that doesn't match the audio.
      const isDemoEpisode = episodeId === SAMPLE_SPOTIFY_ID;
      const importedTranscript: Transcript | null = isDemoEpisode
        ? SAMPLE_SPOTIFY_TRANSCRIPT
        : {
            episodeId,
            language: 'en',
            source: 'official',
            granularity: 'text-only',
            paragraphs: [],
            sentences: [],
            words: [],
            title: newEpisode.title,
          };

      setEpisodeList(prev => [newEpisode, ...prev.filter(e => e.id !== newEpisode.id)]);
      setCurrentEpisode(newEpisode);
      setCurrentTranscript(importedTranscript);
      setShowSpotifyEmbed(true);
      if (!isDemoEpisode && epData.notice) {
        console.info('[SpotScript]', epData.notice);
      }
    } catch {
      // Fallback (network error hitting the metadata proxy)
      const fallbackEpisode: Episode = {
        id: parsed.episodeId,
        sourceType: 'spotify',
        title: `Spotify Episode (${parsed.episodeId.slice(0, 8)}...)`,
        showName: 'Spotify Podcast',
        artworkUrl: '',
        duration: 0,
        pubDate: 'Published on Spotify',
        sourceUrl: parsed.canonicalUrl!,
        spotifyEmbedUrl: `https://open.spotify.com/embed/episode/${parsed.episodeId}?utm_source=generator&theme=0`,
        audioUrl: 'SPOTIFY_EMBED_STREAM',
        chapters: [],
      };
      setEpisodeList(prev => [fallbackEpisode, ...prev.filter(e => e.id !== fallbackEpisode.id)]);
      setCurrentEpisode(fallbackEpisode);
      setCurrentTranscript({
        episodeId: fallbackEpisode.id,
        language: 'en',
        source: 'official',
        granularity: 'text-only',
        paragraphs: [],
        sentences: [],
        words: [],
      });
      setShowSpotifyEmbed(true);
    } finally {
      setIsLoadingUrl(false);
    }
  };

  // Import custom audio/transcript
  const handleImportCustom = (ep: Episode, tr: Transcript) => {
    registerTranscript(tr);
    setEpisodeList(prev => [ep, ...prev]);
    setCurrentEpisode(ep);
    setCurrentTranscript(tr);
    setShowSpotifyEmbed(false);
  };

  // Bookmarks management
  const handleAddBookmark = (sentence: Sentence, note?: string) => {
    const newBm: Bookmark = {
      id: `bm_${Date.now()}`,
      episodeId: currentEpisode.id,
      sentenceId: sentence.id,
      timestamp: sentence.start,
      text: sentence.text,
      note,
      createdAt: Date.now(),
    };
    setBookmarks((prev) => [newBm, ...prev.filter(b => b.sentenceId !== sentence.id)]);
  };

  const handleRemoveBookmark = (idOrSentenceId: string) => {
    setBookmarks((prev) => prev.filter(b => b.id !== idOrSentenceId && b.sentenceId !== idOrSentenceId));
  };

  // Saved episodes management
  const isCurrentSaved = useMemo(() => {
    return savedEpisodes.some(s => s.episode.id === currentEpisode.id);
  }, [savedEpisodes, currentEpisode]);

  const handleToggleSaveEpisode = () => {
    if (isCurrentSaved) {
      setSavedEpisodes(prev => prev.filter(s => s.episode.id !== currentEpisode.id));
    } else {
      const entry: SavedEpisode = {
        episode: currentEpisode,
        transcript: currentTranscript || undefined,
        lastPosition: currentTime,
        savedAt: Date.now(),
      };
      setSavedEpisodes(prev => [entry, ...prev]);
    }
  };

  const handleRemoveSavedEpisode = (epId: string) => {
    setSavedEpisodes(prev => prev.filter(s => s.episode.id !== epId));
  };

  // Export transcript
  const handleExport = (format: 'txt' | 'srt' | 'vtt' | 'json') => {
    if (!currentTranscript) return;
    const content = exportTranscript(currentTranscript, format);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentEpisode.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_transcript.${format}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Search match count
  const searchResultCount = useMemo(() => {
    if (!searchTerm || !currentTranscript) return 0;
    const lower = searchTerm.toLowerCase();
    return currentTranscript.sentences.filter(s => s.text.toLowerCase().includes(lower)).length;
  }, [searchTerm, currentTranscript]);

  return (
    <div className={`min-h-screen flex bg-[#F8F8F6] dark:bg-[#121214] text-neutral-900 dark:text-neutral-100 transition-colors ${reducedMotion ? 'motion-reduce' : ''}`}>
      
      {/* Sidebar: Episode browser & library navigation */}
      <Sidebar
        currentEpisodeId={currentEpisode.id}
        episodes={episodeList}
        onSelectEpisode={handleSelectEpisode}
        openLibrary={() => setIsLibraryOpen(true)}
        openImport={() => setIsImportOpen(true)}
        openSettings={() => setIsSettingsOpen(true)}
        isDark={isDark}
        toggleTheme={() => setIsDark(!isDark)}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        savedCount={savedEpisodes.length}
        bookmarkCount={bookmarks.length}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Top Bar: URL import & transcript search */}
        <TopBar
          onImportSpotifyUrl={handleImportSpotifyUrl}
          isLoadingUrl={isLoadingUrl}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchResultCount={searchResultCount}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        {/* Episode Header */}
        <EpisodeHeader
          episode={currentEpisode}
          transcript={currentTranscript}
          isSaved={isCurrentSaved}
          onToggleSave={handleToggleSaveEpisode}
          onOpenAiSummary={() => setIsAiSummaryOpen(true)}
          onExport={handleExport}
          showSpotifyEmbed={showSpotifyEmbed}
          onToggleSpotifyEmbed={currentEpisode.spotifyEmbedUrl ? () => setShowSpotifyEmbed(!showSpotifyEmbed) : undefined}
        />

        {/* Collapsible Official Spotify Embed Player (when toggled on for Spotify episodes) */}
        {showSpotifyEmbed && currentEpisode.spotifyEmbedUrl && (
          <SpotifyEmbedPlayer
            episode={currentEpisode}
            onClose={() => setShowSpotifyEmbed(false)}
          />
        )}

        {/* Synchronized Transcript Reader: Real-time word & sentence highlighting + Click-to-Seek */}
        <TranscriptReader
          transcript={currentTranscript}
          currentTime={currentTime}
          onSeek={handleSeek}
          isSyncMode={true}
          searchTerm={searchTerm}
          fontSize={fontSize}
          columnWidth={columnWidth}
          bookmarks={bookmarks.filter(b => b.episodeId === currentEpisode.id)}
          onAddBookmark={handleAddBookmark}
          onRemoveBookmark={handleRemoveBookmark}
          autoScrollEnabled={autoScrollEnabled}
          setAutoScrollEnabled={setAutoScrollEnabled}
        />

        {/* Persistent Bottom Audio Player: Play, Pause, Timeline Scrubber, Speed & Volume */}
        <AudioPlayer
          episode={currentEpisode}
          currentTime={currentTime}
          duration={duration}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          onSeek={handleSeek}
          onPrevSegment={handlePrevSegment}
          onNextSegment={handleNextSegment}
          playbackRate={playbackRate}
          onRateChange={handleRateChange}
          volume={volume}
          onVolumeChange={handleVolumeChange}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />

      </div>

      {/* Modals & Dialogs */}
      <AiSummaryModal
        isOpen={isAiSummaryOpen}
        onClose={() => setIsAiSummaryOpen(false)}
        episode={currentEpisode}
        transcript={currentTranscript}
      />

      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportCustom={handleImportCustom}
      />

      <LibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        savedEpisodes={savedEpisodes}
        bookmarks={bookmarks}
        onSelectEpisode={handleSelectEpisode}
        onSeekToBookmark={(ts) => {
          handleSeek(ts);
        }}
        onRemoveSavedEpisode={handleRemoveSavedEpisode}
        onRemoveBookmark={handleRemoveBookmark}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        fontSize={fontSize}
        setFontSize={setFontSize}
        columnWidth={columnWidth}
        setColumnWidth={setColumnWidth}
        autoScrollEnabled={autoScrollEnabled}
        setAutoScrollEnabled={setAutoScrollEnabled}
        isDark={isDark}
        toggleTheme={() => setIsDark(!isDark)}
        reducedMotion={reducedMotion}
        setReducedMotion={setReducedMotion}
      />

    </div>
  );
}
