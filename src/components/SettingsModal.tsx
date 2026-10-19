import React from 'react';
import { 
  Settings, 
  X, 
  Type, 
  Layout, 
  Sun, 
  Moon, 
  Eye, 
  Sliders
} from 'lucide-react';
import { ReadingFontSize, ReadingColumnWidth } from '../types/index.ts';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  fontSize: ReadingFontSize;
  setFontSize: (size: ReadingFontSize) => void;
  columnWidth: ReadingColumnWidth;
  setColumnWidth: (width: ReadingColumnWidth) => void;
  autoScrollEnabled: boolean;
  setAutoScrollEnabled: (enabled: boolean) => void;
  isDark: boolean;
  toggleTheme: () => void;
  reducedMotion: boolean;
  setReducedMotion: (rm: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  fontSize,
  setFontSize,
  columnWidth,
  setColumnWidth,
  autoScrollEnabled,
  setAutoScrollEnabled,
  isDark,
  toggleTheme,
  reducedMotion,
  setReducedMotion,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#1A1A20] rounded-2xl border border-neutral-200 dark:border-neutral-800 max-w-md w-full shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F0ECFF] dark:bg-[#7958F5]/20 flex items-center justify-center text-[#7958F5] dark:text-[#9478FA]">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Reading Preferences
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Customize typography, layout, and motion
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

        {/* Settings Options */}
        <div className="p-6 space-y-5 text-xs">
          
          {/* Typography Size */}
          <div>
            <label className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5 mb-2">
              <Type className="w-4 h-4 text-[#7958F5]" />
              <span>Transcript Font Size</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['sm', 'base', 'lg', 'xl'] as const).map((sz) => (
                <button
                  key={sz}
                  onClick={() => setFontSize(sz)}
                  className={`py-2 px-3 rounded-xl border text-center font-medium capitalize transition-all ${
                    fontSize === sz
                      ? 'bg-[#F0ECFF] dark:bg-[#7958F5]/25 border-[#7958F5] text-[#7958F5] dark:text-[#9478FA]'
                      : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300'
                  }`}
                >
                  {sz === 'sm' ? 'Small' : sz === 'base' ? 'Regular' : sz === 'lg' ? 'Large' : 'Extra'}
                </button>
              ))}
            </div>
          </div>

          {/* Reading Column Width */}
          <div>
            <label className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5 mb-2">
              <Layout className="w-4 h-4 text-[#7958F5]" />
              <span>Reading Column Width</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['compact', 'standard', 'wide'] as const).map((w) => (
                <button
                  key={w}
                  onClick={() => setColumnWidth(w)}
                  className={`py-2 px-3 rounded-xl border text-center font-medium capitalize transition-all ${
                    columnWidth === w
                      ? 'bg-[#F0ECFF] dark:bg-[#7958F5]/25 border-[#7958F5] text-[#7958F5] dark:text-[#9478FA]'
                      : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Switcher */}
          <div className="flex items-center justify-between py-2 border-t border-neutral-100 dark:border-neutral-800">
            <div>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200 block">
                Visual Appearance
              </span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Switch between warm off-white and dark slate
              </span>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 flex items-center gap-1.5 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-neutral-600" />}
              <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
          </div>

          {/* Reduced Motion Toggle */}
          <div className="flex items-center justify-between py-2 border-t border-neutral-100 dark:border-neutral-800">
            <div>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200 block">
                Reduced Motion
              </span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Disable word glow and scroll animations
              </span>
            </div>
            <button
              onClick={() => setReducedMotion(!reducedMotion)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                reducedMotion ? 'bg-[#7958F5]' : 'bg-neutral-200 dark:bg-neutral-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  reducedMotion ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-medium bg-[#7958F5] text-white hover:bg-[#6845EC] transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
