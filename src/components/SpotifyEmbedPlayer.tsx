import React from 'react';
import { Episode } from '../types/index.ts';

interface SpotifyEmbedPlayerProps {
  episode: Episode;
}

export const SpotifyEmbedPlayer: React.FC<SpotifyEmbedPlayerProps> = ({
  episode,
}) => {
  const embedUrl =
    episode.spotifyEmbedUrl ||
    `https://open.spotify.com/embed/episode/${episode.id}?utm_source=generator&theme=0`;

  return (
    <div className="px-4 lg:px-8 pb-4">
      <div className="max-w-3xl mx-auto">
        <iframe
          src={embedUrl}
          width="100%"
          height="152"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title={`Spotify Player: ${episode.title}`}
          className="rounded-xl"
        />
      </div>
    </div>
  );
};
