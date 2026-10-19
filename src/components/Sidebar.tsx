import React from 'react';
import { X, Bookmark, Upload, Sun, Moon } from 'lucide-react';
import { Episode } from '../types/index.ts';

interface SidebarProps {
  currentEpisodeId: string;
  episodes: Episode[];
  onSelectEpisode: (episode: Episode) => void;
  openLibrary: () => void;
  openImport: () => void;
  isDark: boolean;
  toggleTheme: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentEpisodeId,
  episodes,
  onSelectEpisode,
  openLibrary,
  openImport,
  isDark,
  toggleTheme,
  isOpenMobile,
  onCloseMobile,
}) => {
  const content = (
    <div className="flex flex-col h-full bg-white dark:bg-[#16161A] border-r border-neutral-200 dark:border-neutral-800 w-60 select-none">
      {/* Brand */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <h1 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          SpotScript
        </h1>
        {isOpenMobile && (
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Episodes */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {episodes.map((ep) => {
          const isCurrent = ep.id === currentEpisodeId;
          return (
            <button
              key={ep.id}
              onClick={() => {
                onSelectEpisode(ep);
                if (isOpenMobile) onCloseMobile();
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                isCurrent
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-medium'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
              }`}
            >
              <p className="truncate">{ep.title}</p>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500 truncate mt-0.5">
                {ep.showName}
              </p>
            </button>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="p-2 border-t border-neutral-200 dark:border-neutral-800 space-y-0.5">
        <button
          onClick={() => { openLibrary(); if (isOpenMobile) onCloseMobile(); }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved & Bookmarks</span>
        </button>
        <button
          onClick={() => { openImport(); if (isOpenMobile) onCloseMobile(); }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
        >
          <Upload className="w-4 h-4" />
          <span>Import Files</span>
        </button>
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:flex shrink-0 h-screen sticky top-0 z-40">
        {content}
      </aside>

      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 w-64 h-full shadow-xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
