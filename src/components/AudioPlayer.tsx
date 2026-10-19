import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX } from 'lucide-react';
import { formatDuration } from '../utils/spotify.ts';

interface AudioPlayerProps {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSeek: (seconds: number) => void;
  playbackRate: number;
  onRateChange: (rate: number) => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  currentTime,
  duration,
  isPlaying,
  onTogglePlay,
  onSeek,
  playbackRate,
  onRateChange,
  volume,
  onVolumeChange,
  isMuted,
  onToggleMute,
}) => {
  const barRef = useRef<HTMLDivElement>(null);
  const progress = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!barRef.current || duration <= 0) return;
    const rect = barRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSeek(ratio * duration);
  };

  // Keyboard: Space play/pause, arrows seek
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        onTogglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        onSeek(Math.max(0, currentTime - 15));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        onSeek(currentTime + 30);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentTime, onTogglePlay, onSeek]);

  return (
    <div className="fixed bottom-0 left-0 md:left-60 right-0 z-40 bg-white dark:bg-[#16161A] border-t border-neutral-200 dark:border-neutral-800">
      {/* Progress bar */}
      <div
        ref={barRef}
        onClick={handleClick}
        className="relative w-full h-1 cursor-pointer bg-neutral-200 dark:bg-neutral-800 hover:h-1.5 transition-all"
      >
        <div
          className="absolute top-0 bottom-0 left-0 bg-neutral-900 dark:bg-white"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div className="px-4 lg:px-8 py-2 flex items-center gap-4 max-w-3xl mx-auto">
        {/* Time */}
        <span className="font-mono text-[11px] tabular-nums text-neutral-500 dark:text-neutral-400 w-24 shrink-0">
          {formatDuration(currentTime)} / {formatDuration(duration)}
        </span>

        {/* Controls */}
        <button
          onClick={() => onSeek(Math.max(0, currentTime - 15))}
          className="p-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          title="Back 15s"
          aria-label="Back 15 seconds"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={onTogglePlay}
          className="w-9 h-9 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center"
          title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </button>

        <button
          onClick={() => onSeek(currentTime + 30)}
          className="p-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          title="Forward 30s"
          aria-label="Forward 30 seconds"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        {/* Speed */}
        <button
          onClick={() => {
            const idx = SPEEDS.indexOf(playbackRate);
            onRateChange(SPEEDS[(idx + 1) % SPEEDS.length]);
          }}
          className="ml-auto font-mono text-[11px] px-1.5 py-0.5 rounded text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          title="Playback speed"
        >
          {playbackRate}×
        </button>

        {/* Volume */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={onToggleMute}
            className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-16 accent-neutral-900 dark:accent-white"
            aria-label="Volume"
          />
        </div>
      </div>
    </div>
  );
};
