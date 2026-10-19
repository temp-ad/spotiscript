import React, { useState } from 'react';
import { 
  Upload, 
  FileAudio, 
  FileText, 
  Check, 
  X, 
  Loader2, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
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
  const [audioDuration, setAudioDuration] = useState<number>(120);
  const [episodeTitle, setEpisodeTitle] = useState('My Custom Episode');
  const [showName, setShowName] = useState('Personal Library');
  const [transcriptContent, setTranscriptContent] = useState('');
  const [transcriptFormat, setTranscriptFormat] = useState<'srt' | 'vtt' | 'txt' | 'json'>('srt');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/') && !/\.(mp3|wav|ogg|m4a|aac)$/i.test(file.name)) {
      setError('Please select a valid audio file (.mp3, .wav, .m4a, .ogg)');
      return;
    }

    setAudioFile(file);
    setEpisodeTitle(file.name.replace(/\.[^/.]+$/, ''));
    setError(null);

    // Read audio duration
    const tempAudio = new Audio();
    tempAudio.src = URL.createObjectURL(file);
    tempAudio.onloadedmetadata = () => {
      if (tempAudio.duration && !isNaN(tempAudio.duration)) {
        setAudioDuration(Math.round(tempAudio.duration));
      }
    };
  };

  const handleTranscriptFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'srt') setTranscriptFormat('srt');
    else if (ext === 'vtt') setTranscriptFormat('vtt');
    else if (ext === 'json') setTranscriptFormat('json');
    else setTranscriptFormat('txt');

    const reader = new FileReader();
    reader.onload = (event) => {
      setTranscriptContent((event.target?.result as string) || '');
    };
    reader.readAsText(file);
  };

  const handleSubmit = () => {
    setError(null);

    if (!transcriptContent.trim()) {
      setError('Please provide transcript text or upload an SRT / VTT file.');
      return;
    }

    setIsProcessing(true);

    try {
      const episodeId = `user_${Date.now()}`;
      let parsedTranscript: Transcript;

      if (transcriptFormat === 'srt') {
        parsedTranscript = parseSRT(transcriptContent, episodeId);
      } else if (transcriptFormat === 'vtt') {
        parsedTranscript = parseVTT(transcriptContent, episodeId);
      } else if (transcriptFormat === 'json') {
        parsedTranscript = JSON.parse(transcriptContent);
      } else {
        parsedTranscript = parsePlainText(transcriptContent, episodeId);
      }

      const audioUrl = audioFile ? URL.createObjectURL(audioFile) : 'SYNTHETIC_SPEECH_STREAM';

      const customEpisode: Episode = {
        id: episodeId,
        sourceType: 'custom_upload',
        title: episodeTitle.trim() || 'Custom Episode',
        showName: showName.trim() || 'Personal Audio',
        artworkUrl: '',
        duration: audioDuration || 120,
        pubDate: 'Today',
        sourceUrl: '',
        audioUrl,
        description: 'User-provided audio and transcript loaded into SpotScript.',
      };

      onImportCustom(customEpisode, parsedTranscript);
      onClose();
    } catch (err: any) {
      setError(`Failed to parse transcript: ${err.message || 'Check file format'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#1A1A20] rounded-2xl border border-neutral-200 dark:border-neutral-800 max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F0ECFF] dark:bg-[#7958F5]/20 flex items-center justify-center text-[#7958F5] dark:text-[#9478FA]">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Import Audio & Transcript
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Load authorized audio and timestamped transcripts
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

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Episode Info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                Episode Title
              </label>
              <input
                type="text"
                value={episodeTitle}
                onChange={(e) => setEpisodeTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 outline-hidden"
              />
            </div>
            <div>
              <label className="font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                Show / Channel Name
              </label>
              <input
                type="text"
                value={showName}
                onChange={(e) => setShowName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 outline-hidden"
              />
            </div>
          </div>

          {/* Step 1: Upload Audio */}
          <div>
            <label className="font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
              1. Audio File (Optional — MP3, WAV, M4A)
            </label>
            <label className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-neutral-200 dark:border-neutral-700 hover:border-[#7958F5] cursor-pointer bg-neutral-50 dark:bg-neutral-900/40 transition-colors">
              <FileAudio className="w-6 h-6 text-neutral-400 mb-1" />
              <span className="text-neutral-600 dark:text-neutral-300 font-medium">
                {audioFile ? audioFile.name : 'Click to choose audio file'}
              </span>
              <span className="text-[10px] text-neutral-400 mt-0.5">
                {audioFile ? `${(audioFile.size / (1024 * 1024)).toFixed(1)} MB` : 'Leave empty to use built-in audio synthesizer'}
              </span>
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Step 2: Upload or Paste Transcript */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-medium text-neutral-700 dark:text-neutral-300">
                2. Transcript Content (SRT, VTT, or Plain text)
              </label>
              <div className="flex items-center gap-1">
                {(['srt', 'vtt', 'txt'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setTranscriptFormat(fmt)}
                    className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono ${
                      transcriptFormat === fmt
                        ? 'bg-[#7958F5] text-white'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={transcriptContent}
              onChange={(e) => setTranscriptContent(e.target.value)}
              placeholder="Paste SRT subtitles (with timestamps) or plain transcript text here..."
              rows={6}
              className="w-full p-2.5 font-mono text-[11px] rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 outline-hidden"
            />

            <div className="mt-1 flex items-center justify-between text-[11px] text-neutral-400">
              <label className="hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                <span>Upload .srt or .vtt file</span>
                <input
                  type="file"
                  accept=".srt,.vtt,.txt,.json"
                  onChange={handleTranscriptFileUpload}
                  className="hidden"
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  setTranscriptFormat('srt');
                  setTranscriptContent(`1\n00:00:01,000 --> 00:00:05,000\nWelcome to your custom episode.\n\n2\n00:00:05,500 --> 00:00:10,000\nEnjoy synchronized reading with SpotScript.\n`);
                }}
                className="hover:text-[#7958F5] transition-colors"
              >
                Insert sample SRT
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/30 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isProcessing}
            className="px-4 py-1.5 rounded-xl text-xs font-medium bg-[#7958F5] hover:bg-[#6845EC] text-white shadow-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            {isProcessing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            <span>Load into Player</span>
          </button>
        </div>

      </div>
    </div>
  );
};
