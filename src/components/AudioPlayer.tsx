import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Sparkles,
  ChevronUp
} from 'lucide-react';
import { Episode, Sentence } from '../types/index.ts';
import { formatDuration } from '../utils/spotify.ts';

interface AudioPlayerProps {
  episode: Episode;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSeek: (seconds: number) => void;
  onPrevSegment: () => void;
  onNextSegment: () => void;
  playbackRate: number;
  onRateChange: (rate: number) => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  episode,
  currentTime,
  duration,
  isPlaying,
  onTogglePlay,
  onSeek,
  onPrevSegment,
  onNextSegment,
  playbackRate,
  onRateChange,
  volume,
  onVolumeChange,
  isMuted,
  onToggleMute,
}) => {
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isHoveringProgress, setIsHoveringProgress] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number>(0);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  const speedOptions = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
  const progressRatio = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;

  // Handle scrubber click or drag
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(ratio * duration);
  };

  const handleProgressMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const hoverX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const ratio = hoverX / rect.width;
    setHoverTime(ratio * duration);
    setHoverPosition(hoverX);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        onTogglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        onSeek(currentTime - 15);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        onSeek(currentTime + 30);
      } else if (e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        onPrevSegment();
      } else if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        onNextSegment();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTime, onTogglePlay, onSeek, onPrevSegment, onNextSegment]);

  return (
    <div className="fixed bottom-0 left-0 md:left-64 right-0 z-40 bg-white/95 dark:bg-[#16161A]/95 backdrop-blur-md border-t border-neutral-200/80 dark:border-neutral-800/80 shadow-2xl transition-colors">
      
      {/* Top interactive scrub bar with hover timestamp indicator */}
      <div
        ref={progressBarRef}
        onClick={handleProgressClick}
        onMouseEnter={() => setIsHoveringProgress(true)}
        onMouseLeave={() => {
          setIsHoveringProgress(false);
          setHoverTime(null);
        }}
        onMouseMove={handleProgressMouseMove}
        className="relative w-full h-2 group cursor-pointer bg-neutral-200 dark:bg-neutral-800 transition-all hover:h-3"
      >
        {/* Filled Progress */}
        <div
          className="absolute top-0 bottom-0 left-0 bg-[#7958F5] transition-all"
          style={{ width: `${progressRatio * 100}%` }}
        />

        {/* Scrubber Knob */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-[#7958F5] rounded-full shadow-md scale-0 group-hover:scale-100 transition-transform pointer-events-none"
          style={{ left: `calc(${progressRatio * 100}% - 7px)` }}
        />

        {/* Hover Time Tooltip */}
        {isHoveringProgress && hoverTime !== null && (
          <div
            className="absolute -top-7 -translate-x-1/2 px-2 py-0.5 rounded-md bg-neutral-900 text-white text-[11px] font-mono tabular-nums pointer-events-none shadow-md"
            style={{ left: `${hoverPosition}px` }}
          >
            {formatDuration(hoverTime)}
          </div>
        )}
      </div>

      {/* Controls Container */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-2.5 flex items-center justify-between gap-4">
        
        {/* Left: Episode Thumbnail & Title */}
        <div className="flex items-center gap-3 min-w-0 w-1/4">
          <div className="w-11 h-11 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 shrink-0 border border-neutral-200 dark:border-neutral-700">
            {episode.artworkUrl ? (
              <img
                src={episode.artworkUrl}
                alt={episode.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-violet-100 dark:bg-violet-950/40 text-[#7958F5]">
                <Sparkles className="w-5 h-5" />
              </div>
            )}
          </div>
          <div className="min-w-0 hidden sm:block">
            <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
              {episode.title}
            </h4>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
              {episode.showName}
            </p>
          </div>
        </div>

        {/* Center: Playback Controls */}
        <div className="flex flex-col items-center gap-1 flex-1 max-w-lg">
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Prev Segment (J) */}
            <button
              onClick={onPrevSegment}
              className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Previous segment (J)"
              aria-label="Previous segment"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Seek -15s */}
            <button
              onClick={() => onSeek(currentTime - 15)}
              className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors relative"
              title="Seek backwards 15 seconds (Left Arrow)"
              aria-label="Seek backwards 15 seconds"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="text-[9px] absolute -bottom-1 -right-1 font-mono">15</span>
            </button>

            {/* Play / Pause Primary Button */}
            <button
              onClick={onTogglePlay}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#7958F5] hover:bg-[#6845EC] text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            {/* Seek +30s */}
            <button
              onClick={() => onSeek(currentTime + 30)}
              className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors relative"
              title="Seek forward 30 seconds (Right Arrow)"
              aria-label="Seek forward 30 seconds"
            >
              <RotateCw className="w-4 h-4" />
              <span className="text-[9px] absolute -bottom-1 -right-1 font-mono">30</span>
            </button>

            {/* Next Segment (K) */}
            <button
              onClick={onNextSegment}
              className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Next segment (K)"
              aria-label="Next segment"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Time display: MM:SS / MM:SS */}
          <div className="flex items-center gap-1.5 text-[11px] font-mono tabular-nums text-neutral-500 dark:text-neutral-400">
            <span>{formatDuration(currentTime)}</span>
            <span>/</span>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Right: Speed & Volume Controls */}
        <div className="flex items-center justify-end gap-3 w-1/4">
          
          {/* Speed Selector */}
          <div className="relative">
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="px-2 py-1 rounded-lg text-xs font-mono font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Playback speed"
            >
              {playbackRate}×
            </button>

            {showSpeedMenu && (
              <div className="absolute right-0 bottom-full mb-2 bg-white dark:bg-[#202026] border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl py-1 min-w-[80px] z-50">
                {speedOptions.map((rate) => (
                  <button
                    key={rate}
                    onClick={() => {
                      onRateChange(rate);
                      setShowSpeedMenu(false);
                    }}
                    className={`w-full px-3 py-1 text-left text-xs font-mono transition-colors ${
                      playbackRate === rate
                        ? 'text-[#7958F5] font-semibold bg-[#F0ECFF] dark:bg-[#7958F5]/20'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    {rate}×
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Volume Control */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={onToggleMute}
              className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-500" />
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
              className="w-16 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-[#7958F5]"
              aria-label="Volume slider"
            />
          </div>

        </div>

      </div>
    </div>
  );
};
