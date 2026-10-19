import React, { useEffect, useRef, useState, useMemo } from 'react';
import { 
  Bookmark, 
  Copy, 
  Check, 
  RotateCcw, 
  Sparkles, 
  ArrowDownCircle, 
  Volume2, 
  Clock, 
  FileText,
  Search,
  Sliders,
  Type
} from 'lucide-react';
import { Transcript, Sentence, Word, Paragraph, ReadingFontSize, ReadingColumnWidth, Bookmark as BookmarkType } from '../types/index.ts';
import { formatDuration } from '../utils/spotify.ts';
import { findActiveSentenceIndex, findActiveWordIndex } from '../utils/syncEngine.ts';

interface TranscriptReaderProps {
  transcript: Transcript | null;
  currentTime: number;
  onSeek: (seconds: number) => void;
  isSyncMode?: boolean;
  searchTerm: string;
  fontSize: ReadingFontSize;
  columnWidth: ReadingColumnWidth;
  bookmarks: BookmarkType[];
  onAddBookmark: (sentence: Sentence, note?: string) => void;
  onRemoveBookmark: (sentenceId: string) => void;
  autoScrollEnabled: boolean;
  setAutoScrollEnabled: (enabled: boolean) => void;
}

export const TranscriptReader: React.FC<TranscriptReaderProps> = ({
  transcript,
  currentTime,
  onSeek,
  isSyncMode = true,
  searchTerm,
  fontSize,
  columnWidth,
  bookmarks,
  onAddBookmark,
  onRemoveBookmark,
  autoScrollEnabled,
  setAutoScrollEnabled,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeSentenceRef = useRef<HTMLDivElement>(null);
  const [isUserScrolled, setIsUserScrolled] = useState(false);
  const [copiedSentenceId, setCopiedSentenceId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [notePromptSentence, setNotePromptSentence] = useState<Sentence | null>(null);
  const [noteInput, setNoteInput] = useState('');

  // Find active sentence and active word indices
  const activeSentenceIndex = useMemo(() => {
    if (!transcript || !isSyncMode || transcript.sentences.length === 0) return -1;
    return findActiveSentenceIndex(transcript.sentences, currentTime);
  }, [transcript, isSyncMode, currentTime]);

  const activeWordIndex = useMemo(() => {
    if (!transcript || !isSyncMode || transcript.words.length === 0) return -1;
    return findActiveWordIndex(transcript.words, currentTime);
  }, [transcript, isSyncMode, currentTime]);

  const activeSentenceId = transcript?.sentences[activeSentenceIndex]?.id;
  const activeWordId = transcript?.words[activeWordIndex]?.id;

  // Handle auto-scrolling with smooth centering
  useEffect(() => {
    if (!autoScrollEnabled || isUserScrolled || !activeSentenceRef.current || !containerRef.current) {
      return;
    }

    const container = containerRef.current;
    const element = activeSentenceRef.current;

    // Check if element is outside comfortable middle zone
    const containerRect = container.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    const targetOffset = element.offsetTop - container.offsetTop - (container.clientHeight / 2) + (element.clientHeight / 2);

    container.scrollTo({
      top: Math.max(0, targetOffset),
      behavior: 'smooth',
    });
  }, [activeSentenceIndex, autoScrollEnabled, isUserScrolled]);

  // Detect manual user scrolling
  const handleScroll = () => {
    if (!containerRef.current || !activeSentenceRef.current) return;
    const container = containerRef.current;
    const element = activeSentenceRef.current;

    const elementCenter = element.offsetTop + (element.clientHeight / 2);
    const containerCenter = container.scrollTop + (container.clientHeight / 2);

    // If user scrolled > 200px away from the active sentence center, pause auto-scroll
    if (Math.abs(elementCenter - containerCenter) > 220) {
      setIsUserScrolled(true);
    } else {
      setIsUserScrolled(false);
    }
  };

  const handleResumeAutoScroll = () => {
    setIsUserScrolled(false);
    setAutoScrollEnabled(true);
    if (activeSentenceRef.current && containerRef.current) {
      const container = containerRef.current;
      const element = activeSentenceRef.current;
      const targetOffset = element.offsetTop - container.offsetTop - (container.clientHeight / 2) + (element.clientHeight / 2);
      container.scrollTo({
        top: Math.max(0, targetOffset),
        behavior: 'smooth',
      });
    }
  };

  const handleCopySentence = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSentenceId(id);
    setTimeout(() => setCopiedSentenceId(null), 2000);
  };

  const handleCopyAll = () => {
    if (!transcript) return;
    const fullText = transcript.paragraphs
      .map(p => p.sentences.map(s => s.text).join(' '))
      .join('\n\n');
    navigator.clipboard.writeText(fullText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleSaveNote = () => {
    if (notePromptSentence) {
      onAddBookmark(notePromptSentence, noteInput.trim());
      setNotePromptSentence(null);
      setNoteInput('');
    }
  };

  // Font size classes
  const fontClasses = {
    sm: 'text-sm leading-relaxed',
    base: 'text-base leading-relaxed',
    lg: 'text-lg leading-loose',
    xl: 'text-xl leading-loose',
  }[fontSize];

  // Width classes
  const widthClasses = {
    compact: 'max-w-xl',
    standard: 'max-w-3xl',
    wide: 'max-w-4xl',
  }[columnWidth];

  if (!transcript || transcript.sentences.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-neutral-500 dark:text-neutral-400">
        <FileText className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mb-3" />
        <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-200">
          No Transcript Loaded
        </h3>
        <p className="text-xs max-w-sm mt-1">
          Paste a Spotify episode URL or import an authorized audio file to read synchronized transcripts.
        </p>
      </div>
    );
  }

  // Pre-index bookmarks by sentence ID
  const bookmarkMap = new Map(bookmarks.map(b => [b.sentenceId, b]));

  return (
    <div className="relative flex-1 flex flex-col h-full overflow-hidden bg-[#F8F8F6] dark:bg-[#121214] transition-colors">
      
      {/* Top Reading Toolbar */}
      <div className="px-4 lg:px-8 py-2.5 border-b border-neutral-200/60 dark:border-neutral-800/60 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 bg-white/50 dark:bg-[#16161A]/50 backdrop-blur-xs">
        <div className="flex items-center gap-2 sm:gap-3">
          <span>{transcript.sentences.length} sentences</span>
          <span className="hidden sm:inline" aria-hidden="true">·</span>
          <span className="hidden sm:inline">{transcript.words.length > 0 ? `${transcript.words.length} words` : 'Sentence timing'}</span>
          {isSyncMode && (
            <>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1 text-[#7958F5] dark:text-[#9478FA] font-medium">
                <Volume2 className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Synchronized</span>
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoScrollEnabled(!autoScrollEnabled)}
            className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
              autoScrollEnabled
                ? 'text-[#7958F5] dark:text-[#9478FA] bg-[#F0ECFF] dark:bg-[#7958F5]/20'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
            title="Toggle automatic scrolling with audio"
          >
            Auto-follow: {autoScrollEnabled ? 'On' : 'Off'}
          </button>
          <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">|</span>
          <button
            onClick={handleCopyAll}
            className="flex items-center gap-1 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
            title="Copy full transcript"
          >
            {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedAll ? 'Copied' : 'Copy All'}</span>
          </button>
        </div>
      </div>

      {/* Main Scrollable Reading Surface */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
      >
        <div className={`mx-auto ${widthClasses} space-y-8 sm:space-y-10 pb-36`}>
          {transcript.paragraphs.map((paragraph, pIdx) => {
            return (
              <div 
                key={paragraph.id} 
                className="space-y-3 p-4 sm:p-6 rounded-2xl bg-white/70 dark:bg-[#16161A]/70 border border-neutral-200/60 dark:border-neutral-800/60 shadow-2xs transition-all"
              >
                {/* Paragraph Header: Speaker & Start Time */}
                <div className="flex items-center justify-between text-xs text-neutral-400 dark:text-neutral-500 pb-2 border-b border-neutral-100 dark:border-neutral-800/60">
                  <div className="flex items-center gap-2">
                    {paragraph.speakerId && (
                      <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                        {transcript.speakerLabels?.[paragraph.speakerId] || paragraph.speakerId}
                      </span>
                    )}
                  </div>
                  {paragraph.startTime !== undefined && (
                    <button
                      onClick={() => onSeek(paragraph.startTime)}
                      className="font-mono tabular-nums text-neutral-400 hover:text-[#7958F5] transition-colors flex items-center gap-1"
                      title="Jump to paragraph start"
                    >
                      <Clock className="w-3 h-3" />
                      <span>{formatDuration(paragraph.startTime)}</span>
                    </button>
                  )}
                </div>

                {/* Sentences in Paragraph */}
                <div className={`space-y-2.5 ${fontClasses}`}>
                  {paragraph.sentences.map((sentence) => {
                    const isActive = isSyncMode && sentence.id === activeSentenceId;
                    const isPast = isSyncMode && currentTime > sentence.end;
                    const isUpcoming = isSyncMode && currentTime < sentence.start;
                    const hasBookmark = bookmarkMap.has(sentence.id);
                    const bookmarkItem = bookmarkMap.get(sentence.id);

                    // Search matching
                    const isSearchMatch = searchTerm && 
                      sentence.text.toLowerCase().includes(searchTerm.toLowerCase());

                    return (
                      <div
                        key={sentence.id}
                        ref={isActive ? activeSentenceRef : null}
                        className={`group relative rounded-xl p-2.5 sm:p-3 transition-all duration-200 ${
                          isActive
                            ? 'bg-[#F0ECFF] dark:bg-[#7958F5]/15 text-neutral-900 dark:text-neutral-100 ring-1 ring-[#7958F5]/30 shadow-xs'
                            : isSearchMatch
                              ? 'bg-amber-100/70 dark:bg-amber-950/40 text-neutral-900 dark:text-neutral-100 ring-1 ring-amber-400/50'
                              : isPast
                                ? 'text-neutral-800 dark:text-neutral-200'
                                : isUpcoming
                                  ? 'text-neutral-600 dark:text-neutral-400'
                                  : 'text-neutral-800 dark:text-neutral-200'
                        }`}
                      >
                        {/* Sentence Text with Word-Level Karaoke Highlights */}
                        <div className="flex items-start gap-2.5">
                          {/* Timestamp Pill */}
                          {sentence.start !== undefined && sentence.start >= 0 && (
                            <button
                              onClick={() => onSeek(sentence.start)}
                              className="shrink-0 mt-0.5 font-mono text-xs tabular-nums text-neutral-400 dark:text-neutral-500 hover:text-[#7958F5] dark:hover:text-[#9478FA] transition-colors"
                              title="Click to seek audio here"
                            >
                              {formatDuration(sentence.start)}
                            </button>
                          )}

                          <div 
                            className="flex-1 cursor-pointer"
                            onClick={() => onSeek(sentence.start)}
                          >
                            {sentence.words && sentence.words.length > 0 && isSyncMode ? (
                              sentence.words.map((word) => {
                                const isWordActive = word.id === activeWordId;
                                const isWordSpoken = currentTime > word.end;

                                return (
                                  <React.Fragment key={word.id}>
                                    <span
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onSeek(word.start);
                                      }}
                                      className={`inline rounded transition-colors px-0.5 cursor-pointer ${
                                        isWordActive
                                          ? 'text-[#7958F5] dark:text-[#9478FA] font-bold bg-[#7958F5]/20 dark:bg-[#7958F5]/30'
                                          : isWordSpoken
                                            ? 'text-neutral-900 dark:text-neutral-100 font-medium'
                                            : 'text-neutral-600 dark:text-neutral-400'
                                      }`}
                                    >
                                      {word.text}
                                    </span>{' '}
                                  </React.Fragment>
                                );
                              })
                            ) : (
                              <span>{sentence.text}</span>
                            )}
                          </div>

                          {/* Hover Actions Bar */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0 ml-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (hasBookmark) {
                                  onRemoveBookmark(sentence.id);
                                } else {
                                  setNotePromptSentence(sentence);
                                  setNoteInput('');
                                }
                              }}
                              className={`p-1 rounded-lg text-xs transition-colors ${
                                hasBookmark
                                  ? 'text-[#7958F5] bg-[#F0ECFF] dark:bg-[#7958F5]/20'
                                  : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                              }`}
                              title={hasBookmark ? 'Remove bookmark' : 'Bookmark & add note'}
                            >
                              <Bookmark className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopySentence(sentence.text, sentence.id);
                              }}
                              className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 text-xs transition-colors"
                              title="Copy sentence"
                            >
                              {copiedSentenceId === sentence.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Attached Bookmark Note */}
                        {hasBookmark && bookmarkItem?.note && (
                          <div className="mt-2 pl-4 border-l-2 border-[#7958F5]/60 text-xs text-neutral-600 dark:text-neutral-300 italic bg-white/60 dark:bg-black/20 p-2 rounded-r-lg">
                            <span className="font-semibold not-italic text-[#7958F5] dark:text-[#9478FA] text-[11px] block">
                              Note:
                            </span>
                            {bookmarkItem.note}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Resume Auto-Scroll Button */}
      {isUserScrolled && autoScrollEnabled && isSyncMode && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20">
          <button
            onClick={handleResumeAutoScroll}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#7958F5] hover:bg-[#6845EC] text-white text-xs font-medium shadow-lg hover:shadow-xl transition-all animate-bounce"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Resume auto-scroll</span>
          </button>
        </div>
      )}

      {/* Bookmark Note Modal Prompt */}
      {notePromptSentence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1A1A20] rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 max-w-md w-full shadow-2xl space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                <Bookmark className="w-4 h-4 text-[#7958F5]" />
                <span>Bookmark Sentence</span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2 italic">
                "{notePromptSentence.text}"
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                Personal reflection / note (optional):
              </label>
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Why is this thought memorable? What does it teach you?"
                rows={3}
                className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 outline-hidden focus:ring-2 focus:ring-[#7958F5]/30"
                autoFocus
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setNotePromptSentence(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNote}
                className="px-4 py-1.5 rounded-xl text-xs font-medium bg-[#7958F5] hover:bg-[#6845EC] text-white shadow-xs"
              >
                Save Bookmark
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
