import React, { useState } from 'react';
import { 
  Bookmark, 
  Trash2, 
  X, 
  Clock, 
  ExternalLink, 
  FileText, 
  PlayCircle,
  Headphones
} from 'lucide-react';
import { Bookmark as BookmarkType, SavedEpisode, Episode } from '../types/index.ts';
import { formatDuration } from '../utils/spotify.ts';

interface LibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedEpisodes: SavedEpisode[];
  bookmarks: BookmarkType[];
  onSelectEpisode: (episode: Episode) => void;
  onSeekToBookmark: (timestamp: number) => void;
  onRemoveSavedEpisode: (episodeId: string) => void;
  onRemoveBookmark: (bookmarkId: string) => void;
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
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'episodes'>('bookmarks');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#1A1A20] rounded-2xl border border-neutral-200 dark:border-neutral-800 max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F0ECFF] dark:bg-[#7958F5]/20 flex items-center justify-center text-[#7958F5] dark:text-[#9478FA]">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Personal Library & Bookmarks
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Saved passages, reflections, and episodes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 pt-3 flex items-center gap-4 border-b border-neutral-200/60 dark:border-neutral-800/60 text-xs">
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`pb-2.5 font-medium transition-colors border-b-2 ${
              activeTab === 'bookmarks'
                ? 'border-[#7958F5] text-[#7958F5] dark:text-[#9478FA]'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            Passage Bookmarks ({bookmarks.length})
          </button>
          <button
            onClick={() => setActiveTab('episodes')}
            className={`pb-2.5 font-medium transition-colors border-b-2 ${
              activeTab === 'episodes'
                ? 'border-[#7958F5] text-[#7958F5] dark:text-[#9478FA]'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            Saved Episodes ({savedEpisodes.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {activeTab === 'bookmarks' && (
            <>
              {bookmarks.length === 0 ? (
                <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
                  <Bookmark className="w-8 h-8 text-neutral-300 dark:text-neutral-700 mx-auto mb-2" />
                  <p className="text-xs">No bookmarks saved yet.</p>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Hover over any sentence in the transcript reader and click the bookmark icon to save thoughts.
                  </p>
                </div>
              ) : (
                bookmarks.map((bm) => (
                  <div
                    key={bm.id}
                    className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 hover:border-[#7958F5]/40 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <button
                            onClick={() => {
                              onSeekToBookmark(bm.timestamp);
                              onClose();
                            }}
                            className="font-mono text-xs tabular-nums px-2 py-0.5 rounded-md bg-[#F0ECFF] dark:bg-[#7958F5]/20 text-[#7958F5] dark:text-[#9478FA] hover:bg-[#e4ddff] flex items-center gap-1 font-medium transition-colors"
                          >
                            <PlayCircle className="w-3 h-3" />
                            <span>{formatDuration(bm.timestamp)}</span>
                          </button>
                        </div>
                        <p className="text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed font-medium">
                          "{bm.text}"
                        </p>
                        {bm.note && (
                          <div className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 italic bg-white dark:bg-[#16161A] p-2 rounded-lg border border-neutral-200/60 dark:border-neutral-800">
                            <span className="font-semibold not-italic text-[#7958F5] text-[10px] block">Note:</span>
                            {bm.note}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => onRemoveBookmark(bm.id)}
                        className="text-neutral-400 hover:text-red-500 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove bookmark"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === 'episodes' && (
            <>
              {savedEpisodes.length === 0 ? (
                <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
                  <Headphones className="w-8 h-8 text-neutral-300 dark:text-neutral-700 mx-auto mb-2" />
                  <p className="text-xs">No saved episodes in your library.</p>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Click "Save" on the top right of any episode header to keep it in your collection.
                  </p>
                </div>
              ) : (
                savedEpisodes.map((item) => (
                  <div
                    key={item.episode.id}
                    className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 hover:border-[#7958F5]/40 transition-colors flex items-center justify-between gap-3 group"
                  >
                    <div 
                      className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                      onClick={() => {
                        onSelectEpisode(item.episode);
                        onClose();
                      }}
                    >
                      <div className="w-10 h-10 rounded-lg bg-neutral-200 dark:bg-neutral-800 overflow-hidden shrink-0">
                        {item.episode.artworkUrl ? (
                          <img
                            src={item.episode.artworkUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-400">
                            <FileText className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                          {item.episode.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-neutral-500 mt-0.5">
                          <span>{item.episode.showName}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{formatDuration(item.episode.duration)}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveSavedEpisode(item.episode.id)}
                      className="text-neutral-400 hover:text-red-500 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove from saved library"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
