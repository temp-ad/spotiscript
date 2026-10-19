import React from 'react';
import { 
  Sparkles, 
  Bookmark, 
  BookmarkCheck, 
  Download, 
  Calendar, 
  Clock, 
  Layers, 
  ExternalLink,
  Bot,
  Headphones,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Episode, Transcript } from '../types/index.ts';
import { formatDuration } from '../utils/spotify.ts';

interface EpisodeHeaderProps {
  episode: Episode;
  transcript: Transcript | null;
  isSaved: boolean;
  onToggleSave: () => void;
  onOpenAiSummary: () => void;
  onExport: (format: 'txt' | 'srt' | 'vtt' | 'json') => void;
  showSpotifyEmbed?: boolean;
  onToggleSpotifyEmbed?: () => void;
}

export const EpisodeHeader: React.FC<EpisodeHeaderProps> = ({
  episode,
  transcript,
  isSaved,
  onToggleSave,
  onOpenAiSummary,
  onExport,
  showSpotifyEmbed,
  onToggleSpotifyEmbed,
}) => {
  return (
    <div className="bg-white dark:bg-[#16161A] border-b border-neutral-200/80 dark:border-neutral-800/80 px-4 lg:px-8 py-5 transition-colors">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-5 items-start md:items-center justify-between">
        
        {/* Left: Artwork + Episode Info */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 shrink-0 border border-neutral-200/80 dark:border-neutral-700/80 shadow-xs">
            {episode.artworkUrl ? (
              <img
                src={episode.artworkUrl}
                alt={episode.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-gradient-to-br from-violet-100 to-indigo-50 dark:from-violet-950/40 dark:to-neutral-900">
                <Layers className="w-6 h-6 text-[#7958F5] mb-1" />
                <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 line-clamp-1">
                  SpotScript
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Show name & Sourced Badge */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mb-1">
              <span className="font-medium text-neutral-700 dark:text-neutral-300 truncate">
                {episode.showName}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-[11px] text-[#7958F5] dark:text-[#9478FA] font-medium flex items-center gap-1">
                {episode.sourceType === 'spotify' ? (
                  <>
                    <Headphones className="w-3 h-3" />
                    <span>Spotify Source</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" />
                    <span>Studio Audio</span>
                  </>
                )}
              </span>
            </div>

            {/* Episode Title */}
            <h1 className="text-lg sm:text-xl font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight leading-snug line-clamp-2">
              {episode.title}
            </h1>

            {/* Metadata strip: clean unboxed text */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 mt-2">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                <span className="font-mono tabular-nums">
                  {formatDuration(episode.duration)}
                </span>
              </div>
              {episode.pubDate && (
                <>
                  <span aria-hidden="true">·</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{episode.pubDate}</span>
                  </div>
                </>
              )}
              {transcript && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    Synchronized Transcript Ready
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0 pt-2 md:pt-0">
          
          {episode.spotifyEmbedUrl && onToggleSpotifyEmbed && (
            <button
              onClick={onToggleSpotifyEmbed}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors border ${
                showSpotifyEmbed
                  ? 'bg-neutral-900 text-white border-neutral-900 dark:bg-neutral-100 dark:text-neutral-900'
                  : 'bg-white dark:bg-[#202026] text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800'
              }`}
              title="Toggle official Spotify embedded player"
            >
              <Headphones className="w-3.5 h-3.5 text-[#7958F5]" />
              <span>{showSpotifyEmbed ? 'Hide Spotify Embed' : 'Spotify Embed'}</span>
              {showSpotifyEmbed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}

          <button
            onClick={onToggleSave}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors border ${
              isSaved
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-white dark:bg-[#202026] text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800'
            }`}
          >
            {isSaved ? (
              <>
                <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5 text-neutral-500" />
                <span>Save</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenAiSummary}
            className="px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 bg-[#F0ECFF] dark:bg-[#7958F5]/20 text-[#7958F5] dark:text-[#9478FA] hover:bg-[#e6dfff] dark:hover:bg-[#7958F5]/30 transition-colors"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI Summary</span>
          </button>

          <div className="relative group">
            <button
              className="px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-neutral-500" />
              <span>Export</span>
            </button>
            <div className="absolute right-0 top-full mt-1 hidden group-hover:flex flex-col bg-white dark:bg-[#202026] border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg py-1 min-w-[120px] z-30">
              <button
                onClick={() => onExport('txt')}
                className="px-3 py-1.5 text-left text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Text (.txt)
              </button>
              <button
                onClick={() => onExport('srt')}
                className="px-3 py-1.5 text-left text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Subtitles (.srt)
              </button>
              <button
                onClick={() => onExport('vtt')}
                className="px-3 py-1.5 text-left text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                WebVTT (.vtt)
              </button>
              <button
                onClick={() => onExport('json')}
                className="px-3 py-1.5 text-left text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                JSON Data
              </button>
            </div>
          </div>

          {episode.sourceUrl && (
            <a
              href={episode.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-xl text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Open original episode link"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

      </div>
    </div>
  );
};
