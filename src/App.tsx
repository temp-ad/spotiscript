import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sidebar } from './components/Sidebar.tsx';
import { TopBar } from './components/TopBar.tsx';
import { EpisodeHeader } from './components/EpisodeHeader.tsx';
import { SpotifyEmbedPlayer } from './components/SpotifyEmbedPlayer.tsx';
import { TranscriptReader } from './components/TranscriptReader.tsx';
import { AudioPlayer } from './components/AudioPlayer.tsx';
import { ImportModal } from './components/ImportModal.tsx';
import { LibraryModal } from './components/LibraryModal.tsx';
import {
  Episode,
  Transcript,
  Bookmark,
  SavedEpisode,
  Sentence,
} from './types/index.ts';
import {
  SAMPLE_EPISODES,
  SAMPLE_AUTHORIZED_EPISODE,
  SAMPLE_AUTHORIZED_TRANSCRIPT,
  SAMPLE_SPOTIFY_ID,
  SAMPLE_SPOTIFY_TRANSCRIPT,
  getTranscriptForEpisode,
  registerTranscript,
} from './data/sampleEpisodes.ts';
import { audioPlayerService } from './utils/audioPlayerService.ts';
import { validateSpotifyEpisodeUrl } from './utils/spotify.ts';

export default function App() {
  // Theme
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('spotscript_theme');
      if (stored) return stored === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [episodeList, setEpisodeList] = useState<Episode[]>(SAMPLE_EPISODES);
  const [currentEpisode, setCurrentEpisode] = useState<Episode>(SAMPLE_AUTHORIZED_EPISODE);
  const [currentTranscript, setCurrentTranscript] = useState<Transcript | null>(SAMPLE_AUTHORIZED_TRANSCRIPT);
  const [showSpotifyEmbed, setShowSpotifyEmbed] = useState(false);

  // Playback
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(SAMPLE_AUTHORIZED_EPISODE.duration);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const autoScrollEnabled = true;

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

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('spotscript_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem('spotscript_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('spotscript_saved_episodes', JSON.stringify(savedEpisodes));
  }, [savedEpisodes]);

  useEffect(() => {
    const unsubTime = audioPlayerService.onTimeUpdate(setCurrentTime);
    const unsubState = audioPlayerService.onStateChange(setIsPlaying);
    return () => {
      unsubTime();
      unsubState();
    };
  }, []);

  useEffect(() => {
    audioPlayerService.loadSource(
      currentEpisode.audioUrl || 'SYNTHETIC_SPEECH_STREAM',
      currentEpisode.duration,
    );
    setDuration(currentEpisode.duration);
    setCurrentTime(0);
    if (currentEpisode.sourceType !== 'custom_upload') {
      setCurrentTranscript(getTranscriptForEpisode(currentEpisode.id));
    }
    setShowSpotifyEmbed(currentEpisode.sourceType === 'spotify');
  }, [currentEpisode]);

  const handleSelectEpisode = useCallback((ep: Episode) => {
    setCurrentEpisode(ep);
    setCurrentTranscript(getTranscriptForEpisode(ep.id));
    setShowSpotifyEmbed(ep.sourceType === 'spotify');
  }, []);

  const handleTogglePlay = useCallback(() => audioPlayerService.togglePlay(), []);
  const handleSeek = useCallback((seconds: number) => audioPlayerService.seek(seconds), []);

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

  // Spotify URL import
  const handleImportSpotifyUrl = async (rawUrl: string) => {
    setIsLoadingUrl(true);
    const parsed = validateSpotifyEpisodeUrl(rawUrl);
    if (!parsed.isValid || !parsed.episodeId) {
      setIsLoadingUrl(false);
      throw new Error(parsed.error || 'Invalid Spotify URL');
    }

    try {
      const response = await fetch(
        `/api/spotify/episode-info?url=${encodeURIComponent(parsed.canonicalUrl!)}`,
      );
      const epData: any = response.ok ? await response.json() : {};
      const episodeId = epData.id || parsed.episodeId;

      const newEpisode: Episode = {
        id: episodeId,
        sourceType: 'spotify',
        title: epData.title || `Spotify Episode (${parsed.episodeId.slice(0, 8)})`,
        showName: epData.showName || 'Spotify Podcast',
        artworkUrl: epData.artworkUrl || '',
        duration: typeof epData.durationSeconds === 'number' ? epData.durationSeconds : 0,
        pubDate: epData.pubDate || '',
        sourceUrl: parsed.canonicalUrl!,
        spotifyEmbedUrl:
          epData.spotifyEmbedUrl ||
          `https://open.spotify.com/embed/episode/${parsed.episodeId}?utm_source=generator&theme=0`,
        audioUrl: 'SPOTIFY_EMBED_STREAM',
        description: epData.description || '',
        chapters: [],
      };

      // Real imports have no public timed transcript; only the demo episode
      // ships with sample synced text. Never show mismatched transcript text.
      const isDemoEpisode = episodeId === SAMPLE_SPOTIFY_ID;
      const importedTranscript: Transcript = isDemoEpisode
        ? SAMPLE_SPOTIFY_TRANSCRIPT
        : {
            episodeId,
            language: 'en',
            source: 'official',
            granularity: 'text-only',
            paragraphs: [],
            sentences: [],
            words: [],
          };

      setEpisodeList((prev) => [newEpisode, ...prev.filter((e) => e.id !== newEpisode.id)]);
      setCurrentEpisode(newEpisode);
      setCurrentTranscript(importedTranscript);
      setShowSpotifyEmbed(true);
    } finally {
      setIsLoadingUrl(false);
    }
  };

  // Custom file import
  const handleImportCustom = (ep: Episode, tr: Transcript) => {
    registerTranscript(tr);
    setEpisodeList((prev) => [ep, ...prev]);
    setCurrentEpisode(ep);
    setCurrentTranscript(tr);
    setShowSpotifyEmbed(false);
  };

  // Bookmarks
  const handleAddBookmark = (sentence: Sentence) => {
    const newBm: Bookmark = {
      id: `bm_${Date.now()}`,
      episodeId: currentEpisode.id,
      sentenceId: sentence.id,
      timestamp: sentence.start,
      text: sentence.text,
      createdAt: Date.now(),
    };
    setBookmarks((prev) => [newBm, ...prev.filter((b) => b.sentenceId !== sentence.id)]);
  };

  const handleRemoveBookmark = (idOrSentenceId: string) => {
    setBookmarks((prev) =>
      prev.filter((b) => b.id !== idOrSentenceId && b.sentenceId !== idOrSentenceId),
    );
  };

  // Save current episode
  const isCurrentSaved = useMemo(
    () => savedEpisodes.some((s) => s.episode.id === currentEpisode.id),
    [savedEpisodes, currentEpisode],
  );

  const handleToggleSaveEpisode = () => {
    if (isCurrentSaved) {
      setSavedEpisodes((prev) => prev.filter((s) => s.episode.id !== currentEpisode.id));
    } else {
      setSavedEpisodes((prev) => [
        {
          episode: currentEpisode,
          transcript: currentTranscript || undefined,
          lastPosition: currentTime,
          savedAt: Date.now(),
        },
        ...prev,
      ]);
    }
  };

  const handleRemoveSavedEpisode = (epId: string) => {
    setSavedEpisodes((prev) => prev.filter((s) => s.episode.id !== epId));
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-[#121214] text-neutral-900 dark:text-neutral-100">
      <Sidebar
        currentEpisodeId={currentEpisode.id}
        episodes={episodeList}
        onSelectEpisode={handleSelectEpisode}
        openLibrary={() => setIsLibraryOpen(true)}
        openImport={() => setIsImportOpen(true)}
        isDark={isDark}
        toggleTheme={() => setIsDark(!isDark)}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <TopBar
          onImportSpotifyUrl={handleImportSpotifyUrl}
          isLoadingUrl={isLoadingUrl}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        {/* Compact header row: episode info + save */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <EpisodeHeader episode={currentEpisode} transcript={currentTranscript} />
          </div>
          <button
            onClick={handleToggleSaveEpisode}
            className={`mt-6 mr-4 lg:mr-8 shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
              isCurrentSaved
                ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-transparent'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white border-neutral-200 dark:border-neutral-800'
            }`}
            title={isCurrentSaved ? 'Unsave episode' : 'Save episode'}
          >
            {isCurrentSaved ? 'Saved' : 'Save'}
          </button>
        </div>

        {showSpotifyEmbed && currentEpisode.spotifyEmbedUrl && (
          <SpotifyEmbedPlayer episode={currentEpisode} />
        )}

        <TranscriptReader
          transcript={currentTranscript}
          currentTime={currentTime}
          onSeek={handleSeek}
          searchTerm={searchTerm}
          bookmarks={bookmarks.filter((b) => b.episodeId === currentEpisode.id)}
          onAddBookmark={handleAddBookmark}
          autoScrollEnabled={autoScrollEnabled}
        />
      </div>

      <AudioPlayer
        currentTime={currentTime}
        duration={duration}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onSeek={handleSeek}
        playbackRate={playbackRate}
        onRateChange={handleRateChange}
        volume={volume}
        onVolumeChange={handleVolumeChange}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
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
        onSeekToBookmark={handleSeek}
        onRemoveSavedEpisode={handleRemoveSavedEpisode}
        onRemoveBookmark={handleRemoveBookmark}
      />
    </div>
  );
}
