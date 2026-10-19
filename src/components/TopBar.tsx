import React, { useState } from 'react';
import { 
  Search, 
  Menu, 
  ArrowRight, 
  Sparkles, 
  Loader2, 
  Check, 
  X,
  Link as LinkIcon
} from 'lucide-react';
import { SAMPLE_SPOTIFY_URL } from '../data/sampleEpisodes.ts';

interface TopBarProps {
  onImportSpotifyUrl: (url: string) => Promise<void>;
  isLoadingUrl: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchResultCount: number;
  onOpenMobileMenu: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onImportSpotifyUrl,
  isLoadingUrl,
  searchTerm,
  setSearchTerm,
  searchResultCount,
  onOpenMobileMenu,
}) => {
  const [urlInput, setUrlInput] = useState(SAMPLE_SPOTIFY_URL);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUrlError(null);
    if (!urlInput.trim()) {
      setUrlError('Please enter a Spotify episode URL');
      return;
    }
    try {
      await onImportSpotifyUrl(urlInput.trim());
    } catch (err: any) {
      setUrlError(err.message || 'Failed to load Spotify episode');
    }
  };

  const handleQuickLoadSample = () => {
    setUrlInput(SAMPLE_SPOTIFY_URL);
    setUrlError(null);
    onImportSpotifyUrl(SAMPLE_SPOTIFY_URL);
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 dark:bg-[#16161A]/95 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800/80 px-4 lg:px-6 py-3 transition-colors">
      <div className="flex items-center justify-between gap-4 md:gap-8 max-w-7xl mx-auto">
        
        {/* Zone 1: Mobile Hamburger & Brand/Breadcrumb */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 hidden sm:inline">
              SpotScript
            </span>
            <span className="text-xs text-neutral-400 hidden sm:inline">/</span>
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 hidden md:inline">
              Synchronized Transcript Reader
            </span>
          </div>
        </div>

        {/* Zone 2: Spotify URL Input Bar */}
        <form onSubmit={handleSubmit} className="flex-1 max-w-xl">
          <div className="relative flex items-center">
            <div className="absolute left-3 text-neutral-400 dark:text-neutral-500 pointer-events-none">
              <LinkIcon className="w-4 h-4" />
            </div>
            <input
              type="url"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                if (urlError) setUrlError(null);
              }}
              placeholder="Paste Spotify episode URL (e.g. open.spotify.com/episode/...)"
              className={`w-full pl-9 pr-24 py-2 text-xs md:text-sm bg-neutral-50 dark:bg-[#202026] text-neutral-900 dark:text-neutral-100 rounded-xl border transition-colors outline-hidden focus:ring-2 focus:ring-[#7958F5]/30 ${
                urlError 
                  ? 'border-red-400 dark:border-red-500/60' 
                  : 'border-neutral-200 dark:border-neutral-700/80 focus:border-[#7958F5]'
              }`}
              aria-label="Spotify Episode URL"
            />
            <div className="absolute right-1.5 flex items-center gap-1">
              <button
                type="submit"
                disabled={isLoadingUrl}
                className="px-2.5 py-1.5 rounded-lg bg-[#7958F5] hover:bg-[#6845EC] text-white text-xs font-medium flex items-center gap-1 shadow-xs transition-colors disabled:opacity-50"
              >
                {isLoadingUrl ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <span>Import</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
          {urlError && (
            <p className="text-[11px] text-red-500 dark:text-red-400 mt-1 pl-1">
              {urlError}
            </p>
          )}
        </form>

        {/* Zone 3: Search & Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            {isSearchOpen ? (
              <div className="flex items-center bg-neutral-100 dark:bg-[#202026] rounded-xl px-2.5 py-1.5 border border-neutral-200 dark:border-neutral-700">
                <Search className="w-3.5 h-3.5 text-neutral-400 shrink-0 mr-1.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search transcript..."
                  className="w-32 sm:w-44 text-xs bg-transparent text-neutral-900 dark:text-neutral-100 outline-hidden"
                  autoFocus
                />
                {searchTerm && (
                  <span className="text-[10px] text-neutral-400 font-mono mr-1.5 tabular-nums">
                    {searchResultCount} hits
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setIsSearchOpen(false);
                  }}
                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                  aria-label="Close search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1.5 text-xs font-medium"
                aria-label="Search transcript"
              >
                <Search className="w-4 h-4 text-neutral-500" />
                <span className="hidden lg:inline text-neutral-500">Search text</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};
