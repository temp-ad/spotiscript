import React from 'react';
import { Headphones, X } from 'lucide-react';
import { Episode } from '../types/index.ts';

interface SpotifyEmbedPlayerProps {
  episode: Episode;
  onClose?: () => void;
}

export const SpotifyEmbedPlayer: React.FC<SpotifyEmbedPlayerProps> = ({
  episode,
  onClose,
}) => {
  const embedUrl = episode.spotifyEmbedUrl || `https://open.spotify.com/embed/episode/${episode.id}?utm_source=generator&theme=0`;

  return (
    <div className="bg-neutral-50 dark:bg-[#121215] border-b border-neutral-200/80 dark:border-neutral-800/80 px-4 lg:px-8 py-4 transition-colors animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="max-w-4xl mx-auto space-y-3">
        
        {/* Header bar */}
        <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center gap-2">
            <Headphones className="w-4 h-4 text-[#7958F5]" />
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              Official Spotify Player
            </span>
            <span className="text-neutral-400">·</span>
            <span className="text-[11px] text-neutral-500">
              Listen directly via Spotify's official player
            </span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              aria-label="Hide Spotify player"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Official Spotify Embed iFrame */}
        <div className="w-full rounded-2xl overflow-hidden shadow-xs border border-neutral-200/80 dark:border-neutral-800 bg-black">
          <iframe
            style={{ borderRadius: '12px' }}
            src={embedUrl}
            width="100%"
            height="152"
            frameBorder="0"
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title={`Spotify Player: ${episode.title}`}
          />
        </div>

      </div>
    </div>
  );
};
