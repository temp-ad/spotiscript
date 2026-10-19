import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Transcript, Sentence, Bookmark as BookmarkType } from '../types/index.ts';
import { formatDuration } from '../utils/spotify.ts';
import { findActiveSentenceIndex, findActiveWordIndex } from '../utils/syncEngine.ts';

interface TranscriptReaderProps {
  transcript: Transcript | null;
  currentTime: number;
  onSeek: (seconds: number) => void;
  searchTerm: string;
  bookmarks: BookmarkType[];
  onAddBookmark: (sentence: Sentence) => void;
  autoScrollEnabled: boolean;
}

export const TranscriptReader: React.FC<TranscriptReaderProps> = ({
  transcript,
  currentTime,
  onSeek,
  searchTerm,
  bookmarks,
  onAddBookmark,
  autoScrollEnabled,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeSentenceRef = useRef<HTMLDivElement>(null);
  const [isUserScrolled, setIsUserScrolled] = useState(false);

  const activeSentenceIndex = useMemo(() => {
    if (!transcript || transcript.sentences.length === 0) return -1;
    return findActiveSentenceIndex(transcript.sentences, currentTime);
  }, [transcript, currentTime]);

  const activeWordIndex = useMemo(() => {
    if (!transcript || transcript.words.length === 0) return -1;
    return findActiveWordIndex(transcript.words, currentTime);
  }, [transcript, currentTime]);

  const activeSentenceId = transcript?.sentences[activeSentenceIndex]?.id;
  const activeWordId = transcript?.words[activeWordIndex]?.id;

  // Auto-scroll to the active sentence unless the user scrolled away
  useEffect(() => {
    if (!autoScrollEnabled || isUserScrolled || !activeSentenceRef.current || !containerRef.current) return;
    const container = containerRef.current;
    const element = activeSentenceRef.current;
    const targetOffset =
      element.offsetTop - container.offsetTop - container.clientHeight / 2 + element.clientHeight / 2;
    container.scrollTo({ top: Math.max(0, targetOffset), behavior: 'smooth' });
  }, [activeSentenceIndex, autoScrollEnabled, isUserScrolled]);

  const handleScroll = () => {
    if (!containerRef.current || !activeSentenceRef.current) return;
    const container = containerRef.current;
    const element = activeSentenceRef.current;
    const elementCenter = element.offsetTop + element.clientHeight / 2;
    const containerCenter = container.scrollTop + container.clientHeight / 2;
    setIsUserScrolled(Math.abs(elementCenter - containerCenter) > 220);
  };

  const resumeAutoScroll = () => {
    setIsUserScrolled(false);
  };

  if (!transcript || transcript.sentences.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          No transcript available
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm">
          Load a Spotify episode or import an audio file with a synced SRT/VTT
          transcript to start reading.
        </p>
      </div>
    );
  }

  const bookmarkMap = new Map(bookmarks.map((b) => [b.sentenceId, b]));
  const lowerSearch = searchTerm.trim().toLowerCase();

  return (
    <div className="relative flex-1 flex flex-col h-full overflow-hidden">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <div className="max-w-2xl mx-auto space-y-6 pb-32">
          {transcript.paragraphs.map((paragraph) => (
            <div key={paragraph.id} className="space-y-1">
              {paragraph.sentences.map((sentence) => {
                const isActive = sentence.id === activeSentenceId;
                const hasBookmark = bookmarkMap.has(sentence.id);
                const isMatch =
                  lowerSearch && sentence.text.toLowerCase().includes(lowerSearch);

                return (
                  <div
                    key={sentence.id}
                    ref={isActive ? activeSentenceRef : null}
                    className={`group relative rounded-md transition-colors ${
                      isActive
                        ? 'bg-neutral-200/60 dark:bg-neutral-800'
                        : isMatch
                          ? 'bg-amber-100/60 dark:bg-amber-950/40'
                          : ''
                    }`}
                  >
                    <div
                      className="flex items-baseline gap-3 px-2 py-1 cursor-pointer"
                      onClick={() => onSeek(sentence.start)}
                    >
                      <span className="shrink-0 font-mono text-[10px] tabular-nums text-neutral-400 dark:text-neutral-500 w-10">
                        {formatDuration(sentence.start)}
                      </span>
                      <p className="flex-1 text-sm leading-relaxed text-neutral-800 dark:text-neutral-200">
                        {sentence.words && sentence.words.length > 0
                          ? sentence.words.map((word) => (
                              <span
                                key={word.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSeek(word.start);
                                }}
                                className={
                                  word.id === activeWordId
                                    ? 'text-neutral-900 dark:text-white font-semibold'
                                    : currentTime > word.end
                                      ? 'text-neutral-800 dark:text-neutral-200'
                                      : 'text-neutral-500 dark:text-neutral-400'
                                }
                              >
                                {word.text}{' '}
                              </span>
                            ))
                          : sentence.text}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!hasBookmark) onAddBookmark(sentence);
                        }}
                        className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded transition-opacity ${
                          hasBookmark
                            ? 'opacity-100 text-neutral-900 dark:text-white bg-neutral-200 dark:bg-neutral-700'
                            : 'opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                        }`}
                        title={hasBookmark ? 'Bookmarked' : 'Bookmark sentence'}
                      >
                        {hasBookmark ? '★' : '☆'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {isUserScrolled && autoScrollEnabled && (
        <button
          onClick={resumeAutoScroll}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 px-3 py-1.5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-medium shadow-md"
        >
          Follow audio
        </button>
      )}
    </div>
  );
};
