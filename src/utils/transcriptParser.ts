import type { Transcript, Sentence, Word, Paragraph } from '../types/index.ts';

/**
 * Parses time string like "00:01:23,456" (SRT) or "00:01:23.456" / "01:23.456" (VTT) into seconds.
 */
export function parseTimestamp(timeStr: string): number {
  const normalized = timeStr.trim().replace(',', '.');
  const parts = normalized.split(':');

  if (parts.length === 3) {
    const hours = parseFloat(parts[0]);
    const minutes = parseFloat(parts[1]);
    const seconds = parseFloat(parts[2]);
    return hours * 3600 + minutes * 60 + seconds;
  } else if (parts.length === 2) {
    const minutes = parseFloat(parts[0]);
    const seconds = parseFloat(parts[1]);
    return minutes * 60 + seconds;
  }
  return 0;
}

/**
 * Formats seconds into SRT timestamp string "HH:MM:SS,mmm".
 */
export function formatSRTTimestamp(seconds: number): string {
  const pad = (n: number, w = 2) => Math.floor(n).toString().padStart(w, '0');
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(ms, 3)}`;
}

/**
 * Formats seconds into VTT timestamp string "HH:MM:SS.mmm".
 */
export function formatVTTTimestamp(seconds: number): string {
  const pad = (n: number, w = 2) => Math.floor(n).toString().padStart(w, '0');
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(ms, 3)}`;
}

/**
 * Parses SRT format text into a structured Transcript.
 */
export function parseSRT(content: string, episodeId: string): Transcript {
  const clean = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = clean.split(/\n\n+/).filter(b => b.trim().length > 0);

  const sentences: Sentence[] = [];
  const allWords: Word[] = [];

  let wordIndexCounter = 0;

  for (let i = 0; i < blocks.length; i++) {
    const lines = blocks[i].trim().split('\n');
    if (lines.length < 2) continue;

    // Line 0 is often numeric index
    let timeLineIdx = 0;
    if (/^\d+$/.test(lines[0].trim())) {
      timeLineIdx = 1;
    }
    const timeLine = lines[timeLineIdx];
    if (!timeLine || !timeLine.includes('-->')) continue;

    const [startStr, endStr] = timeLine.split('-->');
    const start = parseTimestamp(startStr);
    const end = parseTimestamp(endStr);

    const textLines = lines.slice(timeLineIdx + 1);
    const text = textLines.join(' ').replace(/<[^>]*>/g, '').trim();

    if (!text) continue;

    const sentenceId = `s_${i + 1}`;

    // Generate estimated word timings within the subtitle slice if word timings aren't embedded
    const rawTokens = text.split(/\s+/).filter(Boolean);
    const sliceWords: Word[] = [];
    const duration = Math.max(0.2, end - start);
    const tokenDuration = duration / Math.max(1, rawTokens.length);

    rawTokens.forEach((tok, tokIdx) => {
      wordIndexCounter++;
      const wStart = Number((start + tokIdx * tokenDuration).toFixed(3));
      const wEnd = Number((start + (tokIdx + 1) * tokenDuration).toFixed(3));
      const wordObj: Word = {
        id: `w_${wordIndexCounter}`,
        text: tok,
        start: wStart,
        end: wEnd,
        sentenceId,
      };
      sliceWords.push(wordObj);
      allWords.push(wordObj);
    });

    sentences.push({
      id: sentenceId,
      text,
      start,
      end,
      words: sliceWords,
    });
  }

  // Group sentences into logical paragraphs (3-4 sentences per paragraph)
  const paragraphs: Paragraph[] = [];
  const chunkSize = 3;
  for (let p = 0; p < sentences.length; p += chunkSize) {
    const group = sentences.slice(p, p + chunkSize);
    paragraphs.push({
      id: `p_${Math.floor(p / chunkSize) + 1}`,
      sentences: group,
      startTime: group[0].start,
      endTime: group[group.length - 1].end,
    });
  }

  return {
    episodeId,
    language: 'en',
    source: 'user-upload',
    granularity: 'word',
    paragraphs,
    sentences,
    words: allWords,
  };
}

/**
 * Parses WebVTT format text into a structured Transcript.
 */
export function parseVTT(content: string, episodeId: string): Transcript {
  const clean = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = clean.split('\n');

  // Strip WEBVTT header
  let startIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('WEBVTT')) {
      startIndex = i + 1;
      break;
    }
  }

  const remaining = lines.slice(startIndex).join('\n');
  return parseSRT(remaining, episodeId);
}

/**
 * Parses plain text into sentences without timestamp synchronization.
 */
export function parsePlainText(text: string, episodeId: string): Transcript {
  const rawParagraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
  const sentences: Sentence[] = [];
  const paragraphs: Paragraph[] = [];

  let sentenceCount = 0;

  rawParagraphs.forEach((pText, pIdx) => {
    // Split paragraph into sentences by punctuation (.!?)
    const rawSentences = pText.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [pText];
    const paraSentences: Sentence[] = [];

    rawSentences.forEach(sText => {
      const trimmed = sText.trim();
      if (!trimmed) return;
      sentenceCount++;
      const sObj: Sentence = {
        id: `s_${sentenceCount}`,
        text: trimmed,
        start: 0,
        end: 0,
        words: [],
      };
      sentences.push(sObj);
      paraSentences.push(sObj);
    });

    if (paraSentences.length > 0) {
      paragraphs.push({
        id: `p_${pIdx + 1}`,
        sentences: paraSentences,
        startTime: 0,
        endTime: 0,
      });
    }
  });

  return {
    episodeId,
    language: 'en',
    source: 'user-upload',
    granularity: 'text-only',
    paragraphs,
    sentences,
    words: [],
  };
}

/**
 * Export transcript to multiple standard formats.
 */
export function exportTranscript(transcript: Transcript, format: 'txt' | 'srt' | 'vtt' | 'json'): string {
  if (format === 'json') {
    return JSON.stringify(transcript, null, 2);
  }

  if (format === 'txt') {
    return transcript.paragraphs
      .map(p => p.sentences.map(s => s.text).join(' '))
      .join('\n\n');
  }

  if (format === 'srt') {
    return transcript.sentences
      .map((s, idx) => {
        return `${idx + 1}\n${formatSRTTimestamp(s.start)} --> ${formatSRTTimestamp(s.end)}\n${s.text}\n`;
      })
      .join('\n');
  }

  if (format === 'vtt') {
    const cues = transcript.sentences
      .map((s, idx) => {
        return `${idx + 1}\n${formatVTTTimestamp(s.start)} --> ${formatVTTTimestamp(s.end)}\n${s.text}\n`;
      })
      .join('\n');
    return `WEBVTT\n\n${cues}`;
  }

  return '';
}
