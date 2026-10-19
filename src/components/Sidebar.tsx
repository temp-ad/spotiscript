import React from 'react';
import { 
  Headphones, 
  Sparkles, 
  Bookmark, 
  Upload, 
  Settings, 
  Sun, 
  Moon, 
  Music2, 
  X,
  Play,
  ListMusic
} from 'lucide-react';
import { Episode } from '../types/index.ts';

interface SidebarProps {
  currentEpisodeId: string;
  episodes: Episode[];
  onSelectEpisode: (episode: Episode) => void;
  openLibrary: () => void;
  openImport: () => void;
  openSettings: () => void;
  isDark: boolean;
  toggleTheme: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  savedCount: number;
  bookmarkCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentEpisodeId,
  episodes,
  onSelectEpisode,
  openLibrary,
  openImport,
  openSettings,
  isDark,
  toggleTheme,
  isOpenMobile,
  onCloseMobile,
  savedCount,
  bookmarkCount,
}) => {
  const content = (
    <div className="flex flex-col h-full bg-white dark:bg-[#16161A] border-r border-neutral-200/80 dark:border-neutral-800/80 w-64 select-none">
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-neutral-200/60 dark:border-neutral-800/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#7958F5] flex items-center justify-center text-white shadow-sm shadow-[#7958F5]/30">
            <Music2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-semibold text-base tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
              SpotScript
            </h1>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Synchronized Transcript Reader
            </p>
          </div>
        </div>
        {isOpenMobile && (
          <button 
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        
        {/* Episodes Section */}
        <div>
          <div className="px-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500 flex items-center justify-between">
            <span>Episodes</span>
            <span className="text-[10px] font-mono">{episodes.length}</span>
          </div>

          <div className="space-y-1">
            {episodes.map((ep) => {
              const isCurrent = ep.id === currentEpisodeId;
              return (
                <button
                  key={ep.id}
                  onClick={() => {
                    onSelectEpisode(ep);
                    if (isOpenMobile) onCloseMobile();
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-start gap-3 ${
                    isCurrent
                      ? 'bg-[#F0ECFF] text-[#7958F5] dark:bg-[#7958F5]/20 dark:text-[#9478FA] font-medium'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/60'
                  }`}
                >
                  <div className={`w-5 h-5 mt-0.5 rounded-lg flex items-center justify-center shrink-0 ${
                    isCurrent ? 'bg-[#7958F5] text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'
                  }`}>
                    {ep.sourceType === 'spotify' ? (
                      <Headphones className="w-3 h-3" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold leading-tight truncate">
                      {ep.title}
                    </p>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                      {ep.showName}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tools Section */}
        <div>
          <div className="px-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            Reading & Tools
          </div>

          <div className="space-y-1">
            <button
              onClick={() => {
                openLibrary();
                if (isOpenMobile) onCloseMobile();
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/60 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Bookmark className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                <span className="text-xs font-medium">Saved & Bookmarks</span>
              </div>
              {(savedCount > 0 || bookmarkCount > 0) && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                  {savedCount + bookmarkCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                openImport();
                if (isOpenMobile) onCloseMobile();
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/60 transition-all flex items-center gap-3"
            >
              <Upload className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
              <div className="min-w-0">
                <p className="text-xs font-medium">Import Audio & SRT</p>
                <p className="text-[10px] text-neutral-400 truncate">Upload your own files</p>
              </div>
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Controls */}
      <div className="p-3 border-t border-neutral-200/60 dark:border-neutral-800/60 space-y-1">
        <button
          onClick={openSettings}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/60 transition-colors"
        >
          <Settings className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
          <span>Reading & Audio Settings</span>
        </button>

        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/60 transition-colors"
        >
          <div className="flex items-center gap-3">
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : (
              <Moon className="w-4 h-4 text-neutral-500" />
            )}
            <span>{isDark ? 'Light Theme' : 'Dark Theme'}</span>
          </div>
          <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-mono">
            {isDark ? 'Dark' : 'Light'}
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex shrink-0 h-screen sticky top-0 z-40">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs" 
            onClick={onCloseMobile} 
          />
          <div className="relative z-10 w-72 h-full shadow-2xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
