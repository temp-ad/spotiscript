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
    <header className="flex items-center gap-3 px-4 lg:px-8 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#16161A]">
      <button
        onClick={onOpenMobileMenu}
        className="md:hidden p-1.5 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        aria-label="Open menu"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* URL import */}
      <form onSubmit={handleSubmit} className="flex-1 max-w-md flex items-center gap-2">
        <input
          type="url"
          value={urlInput}
          onChange={(e) => {
            setUrlInput(e.target.value);
            if (urlError) setUrlError(null);
          }}
          placeholder="Paste Spotify episode URL…"
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
      {urlError && (
        <span className="text-[11px] text-red-500 shrink-0">{urlError}</span>
      )}

      {/* Transcript search */}
      <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
        <Search className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search…"
          className="w-24 sm:w-36 text-xs bg-transparent text-neutral-900 dark:text-neutral-100 outline-none"
          aria-label="Search transcript"
        />
      </div>
    </header>
  );
};
