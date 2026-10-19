import React from 'react';
import { X } from 'lucide-react';
import { Bookmark as BookmarkType, SavedEpisode, Episode } from '../types/index.ts';
import { formatDuration } from '../utils/spotify.ts';

interface LibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedEpisodes: SavedEpisode[];
  bookmarks: BookmarkType[];
  onSelectEpisode: (episode: Episode) => void;
  onSeekToBookmark: (timestamp: number) => void;
  onRemoveSavedEpisode: (epId: string) => void;
  onRemoveBookmark: (id: string) => void;
}

export const LibraryModal: React.FC<LibraryModalProps> = ({
  isOpen,
  onClose,
  savedEpisodes,
  bookmarks,
  onSelectEpisode,
  onSeekToBookmark,
  onRemoveSavedEpisode,
  onRemoveBookmark,
}) => {
  if (!isOpen) return null;

  const isEmpty = savedEpisodes.length === 0 && bookmarks.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white dark:bg-[#1A1A20] rounded-xl border border-neutral-200 dark:border-neutral-800 max-w-md w-full shadow-xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Saved & Bookmarks
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-3 space-y-4 text-xs">
          {isEmpty && (
            <p className="text-neutral-500 dark:text-neutral-400 text-center py-6">
              Nothing saved yet. Star sentences while reading, or save episodes
              to find them here.
            </p>
          )}

          {savedEpisodes.length > 0 && (
            <div>
              <p className="text-[11px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500 mb-1.5 px-1">
                Episodes
              </p>
              {savedEpisodes.map(({ episode }) => (
                <div
                  key={episode.id}
                  className="flex items-center gap-2 px-1 py-1.5 group"
                >
                  <button
                    onClick={() => {
                      onSelectEpisode(episode);
                      onClose();
                    }}
                    className="flex-1 text-left truncate text-neutral-800 dark:text-neutral-200 hover:underline"
                  >
                    {episode.title}
                    <span className="text-neutral-400 dark:text-neutral-500 ml-1.5">
                      {formatDuration(episode.duration)}
                    </span>
                  </button>
                  <button
                    onClick={() => onRemoveSavedEpisode(episode.id)}
                    className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 shrink-0"
                    title="Remove"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {bookmarks.length > 0 && (
            <div>
              <p className="text-[11px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500 mb-1.5 px-1">
                Bookmarked lines
              </p>
              {bookmarks.map((b) => (
                <div key={b.id} className="flex items-start gap-2 px-1 py-1.5 group">
                  <button
                    onClick={() => {
                      onSeekToBookmark(b.timestamp);
                      onClose();
                    }}
                    className="flex-1 text-left text-neutral-800 dark:text-neutral-200 hover:underline"
                  >
                    <span className="font-mono text-[10px] text-neutral-400 mr-1.5">
                      {formatDuration(b.timestamp)}
                    </span>
                    <span className="line-clamp-1">{b.text}</span>
                  </button>
                  <button
                    onClick={() => onRemoveBookmark(b.id)}
                    className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 shrink-0"
                    title="Remove bookmark"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
