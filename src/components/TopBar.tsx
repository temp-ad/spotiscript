import React, { useState } from 'react';
import { Search, Menu, Loader2 } from 'lucide-react';

interface TopBarProps {
  onImportSpotifyUrl: (url: string) => Promise<void>;
  isLoadingUrl: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onOpenMobileMenu: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onImportSpotifyUrl,
  isLoadingUrl,
  searchTerm,
  setSearchTerm,
  onOpenMobileMenu,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUrlError(null);
    if (!urlInput.trim()) return;
    try {
      await onImportSpotifyUrl(urlInput.trim());
    } catch (err: any) {
      setUrlError(err.message || 'Failed to load episode');
    }
  };

  return (
    <header className="relative flex items-center gap-3 px-4 lg:px-8 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#16161A]">
      <button
        onClick={onOpenMobileMenu}
        className="md:hidden p-1.5 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        aria-label="Open menu"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* URL import — centered */}
      <div className="flex-1 min-w-0 flex justify-center">
        <form onSubmit={handleSubmit} className="w-full max-w-md flex items-center gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => {
              setUrlInput(e.target.value);
              if (urlError) setUrlError(null);
            }}
            placeholder="Paste the Spotify episode URL…"
            className="flex-1 min-w-0 px-3 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg outline-none focus:border-neutral-400 dark:focus:border-neutral-600 text-neutral-900 dark:text-neutral-100"
            aria-label="Spotify Episode URL"
          />
          <button
            type="submit"
            disabled={isLoadingUrl || !urlInput.trim()}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:opacity-80 transition-opacity disabled:opacity-40 flex items-center gap-1.5"
          >
            {isLoadingUrl ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Load'}
          </button>
        </form>
      </div>

      {/* Transcript search */}
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shrink-0 w-40">
        <Search className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search…"
          className="w-full text-xs bg-transparent text-neutral-900 dark:text-neutral-100 outline-none"
          aria-label="Search transcript"
        />
      </div>

      {/* Error message floats below the bar so it never shifts layout */}
      {urlError && (
        <span className="absolute top-full mt-1 left-1/2 -translate-x-1/2 text-[11px] text-red-500 z-10 bg-white dark:bg-[#16161A] px-2 py-0.5 rounded shadow-sm whitespace-nowrap">
          {urlError}
        </span>
      )}
    </header>
  );
};
