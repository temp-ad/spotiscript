import React from 'react';
import { Episode, Transcript } from '../types/index.ts';
import { formatDuration } from '../utils/spotify.ts';

interface EpisodeHeaderProps {
  episode: Episode;
  transcript: Transcript | null;
}

export const EpisodeHeader: React.FC<EpisodeHeaderProps> = ({
  episode,
  transcript,
}) => {
  return (
    <div className="px-4 lg:px-8 pt-6 pb-4">
      <div className="max-w-3xl mx-auto">
        {episode.artworkUrl && (
          <img
            src={episode.artworkUrl}
            alt=""
            referrerPolicy="no-referrer"
            className="w-16 h-16 rounded-xl object-cover mb-4"
          />
        )}
        <h1 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 leading-snug">
          {episode.title}
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          {episode.showName}
          {episode.duration > 0 && <> · {formatDuration(episode.duration)}</>}
          {episode.pubDate && <> · {episode.pubDate}</>}
        </p>
        {transcript && transcript.sentences.length === 0 && (
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-2">
            No timed transcript is publicly available for this episode. Use
            Import to attach your own SRT/VTT file for synchronized reading.
          </p>
        )}
      </div>
    </div>
  );
};
