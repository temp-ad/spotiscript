import type { Word, Sentence } from '../types/index.ts';

/**
 * Finds the index of the word currently spoken at `currentTime` (in seconds).
 * Uses binary search over ordered word intervals [start, end].
 * Returns -1 if no word is active at this timestamp.
 */
export function findActiveWordIndex(words: Word[], currentTime: number): number {
  if (!words || words.length === 0) return -1;

  let low = 0;
  let high = words.length - 1;

  // Quick bounds check
  if (currentTime < words[0].start) return -1;
  const lastWord = words[words.length - 1];
  if (currentTime > lastWord.end + 0.3) return -1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const word = words[mid];

    // Slight tolerance window (50ms) to ensure smooth transitions between adjacent words
    if (currentTime >= word.start && currentTime <= word.end + 0.05) {
      return mid;
    }

    if (currentTime < word.start) {
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  return -1;
}

/**
 * Finds the index of the sentence currently active at `currentTime` (in seconds).
 * Uses binary search over ordered sentence intervals [start, end].
 * If current time is between sentences, returns the closest previous sentence.
 */
export function findActiveSentenceIndex(sentences: Sentence[], currentTime: number): number {
  if (!sentences || sentences.length === 0) return -1;

  // Before first sentence
  if (currentTime < sentences[0].start) {
    return 0;
  }

  let low = 0;
  let high = sentences.length - 1;
  let candidate = -1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const sentence = sentences[mid];

    if (currentTime >= sentence.start && currentTime <= sentence.end) {
      return mid;
    }

    if (currentTime > sentence.end) {
      candidate = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return candidate !== -1 ? candidate : 0;
}

/**
 * Calculates completion ratio (0.0 to 1.0) of a word at currentTime.
 */
export function getWordProgress(word: Word, currentTime: number): number {
  if (currentTime < word.start) return 0;
  if (currentTime >= word.end) return 1;
  const duration = word.end - word.start;
  if (duration <= 0) return 1;
  return Math.min(1, Math.max(0, (currentTime - word.start) / duration));
}
