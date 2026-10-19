import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Episode, Transcript } from '../types/index.ts';
import { parseSRT, parseVTT, parsePlainText } from '../utils/transcriptParser.ts';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportCustom: (episode: Episode, transcript: Transcript) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportCustom,
}) => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcriptFile, setTranscriptFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImport = async () => {
    setError(null);
    if (!audioFile) {
      setError('Choose an audio file first.');
      return;
    }
    const epId = `custom_${Date.now()}`;
    let transcript: Transcript;
    if (transcriptFile) {
      const text = await transcriptFile.text();
      const name = transcriptFile.name.toLowerCase();
      transcript = name.endsWith('.vtt')
        ? parseVTT(text, epId)
        : name.endsWith('.txt')
          ? parsePlainText(text, epId)
          : parseSRT(text, epId);
    } else {
      transcript = {
        episodeId: epId,
        language: 'en',
        source: 'third-party',
        granularity: 'text-only',
        paragraphs: [],
        sentences: [],
        words: [],
      };
    }

    const url = URL.createObjectURL(audioFile);
    // Get real duration from the audio element
    const duration = await new Promise<number>((resolve) => {
      const el = new Audio(url);
      el.addEventListener('loadedmetadata', () => resolve(el.duration || 0));
      el.addEventListener('error', () => resolve(0));
    });

    const episode: Episode = {
      id: epId,
      sourceType: 'custom_upload',
      title: title.trim() || audioFile.name.replace(/\.[^.]+$/, ''),
      showName: 'My Imports',
      artworkUrl: '',
      duration,
      pubDate: new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      sourceUrl: '',
      audioUrl: url,
      chapters: [],
    };

    onImportCustom(episode, transcript);
    // Reset form
    setAudioFile(null);
    setTranscriptFile(null);
    setTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white dark:bg-[#1A1A20] rounded-xl border border-neutral-200 dark:border-neutral-800 max-w-sm w-full shadow-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Import audio & transcript
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <label className="block text-xs text-neutral-600 dark:text-neutral-400">
          Title (optional)
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My episode"
            className="mt-1 w-full px-2.5 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg outline-none text-neutral-900 dark:text-neutral-100"
          />
        </label>

        <label className="block text-xs text-neutral-600 dark:text-neutral-400">
          Audio file (MP3/WAV/M4A)
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
            className="mt-1 w-full text-xs text-neutral-600 dark:text-neutral-400 file:mr-2 file:px-2.5 file:py-1 file:rounded-md file:border file:border-neutral-200 dark:file:border-neutral-800 file:bg-neutral-50 dark:file:bg-neutral-900 file:text-xs"
          />
        </label>

        <label className="block text-xs text-neutral-600 dark:text-neutral-400">
          Transcript (SRT/VTT/TXT — optional)
          <input
            type="file"
            accept=".srt,.vtt,.txt"
            onChange={(e) => setTranscriptFile(e.target.files?.[0] || null)}
            className="mt-1 w-full text-xs text-neutral-600 dark:text-neutral-400 file:mr-2 file:px-2.5 file:py-1 file:rounded-md file:border file:border-neutral-200 dark:file:border-neutral-800 file:bg-neutral-50 dark:file:bg-neutral-900 file:text-xs"
          />
        </label>

        {error && <p className="text-[11px] text-red-500">{error}</p>}

        <button
          onClick={handleImport}
          className="w-full px-3 py-2 rounded-lg text-xs font-medium bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-80 transition-opacity"
        >
          Import
        </button>
      </div>
    </div>
  );
};
