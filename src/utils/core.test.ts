import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSpotifyEpisodeUrl, getSpotifyEmbedUrl, formatDuration } from './spotify.ts';
import { findActiveWordIndex, findActiveSentenceIndex, getWordProgress } from './syncEngine.ts';
import { parseTimestamp, formatSRTTimestamp, parseSRT, parsePlainText, exportTranscript } from './transcriptParser.ts';
import type { Word, Sentence } from '../types/index.ts';

test('validateSpotifyEpisodeUrl correctly parses valid Spotify URLs', () => {
  const sampleUrl = 'https://open.spotify.com/episode/7yZjEnpvvudpUTdI6qsaPM';
  const result = validateSpotifyEpisodeUrl(sampleUrl);
  assert.equal(result.isValid, true);
  assert.equal(result.episodeId, '7yZjEnpvvudpUTdI6qsaPM');
  assert.equal(result.canonicalUrl, 'https://open.spotify.com/episode/7yZjEnpvvudpUTdI6qsaPM');
});

test('validateSpotifyEpisodeUrl handles query parameters and spotify: URI format', () => {
  const withQuery = 'https://open.spotify.com/episode/7yZjEnpvvudpUTdI6qsaPM?si=abc123xyz';
  const resultQuery = validateSpotifyEpisodeUrl(withQuery);
  assert.equal(resultQuery.isValid, true);
  assert.equal(resultQuery.episodeId, '7yZjEnpvvudpUTdI6qsaPM');

  const uri = 'spotify:episode:7yZjEnpvvudpUTdI6qsaPM';
  const resultUri = validateSpotifyEpisodeUrl(uri);
  assert.equal(resultUri.isValid, true);
  assert.equal(resultUri.episodeId, '7yZjEnpvvudpUTdI6qsaPM');
});

test('validateSpotifyEpisodeUrl rejects invalid URLs with helpful explanations', () => {
  const empty = validateSpotifyEpisodeUrl('');
  assert.equal(empty.isValid, false);

  const showUrl = validateSpotifyEpisodeUrl('https://open.spotify.com/show/4rOoJ6Egrf8K2IrywzwOMk');
  assert.equal(showUrl.isValid, false);
  assert.match(showUrl.error || '', /show link/i);

  const trackUrl = validateSpotifyEpisodeUrl('https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT');
  assert.equal(trackUrl.isValid, false);
  assert.match(trackUrl.error || '', /track link/i);

  const garbage = validateSpotifyEpisodeUrl('https://example.com/podcast');
  assert.equal(garbage.isValid, false);
});

test('getSpotifyEmbedUrl builds official embed URL', () => {
  const embed = getSpotifyEmbedUrl('7yZjEnpvvudpUTdI6qsaPM');
  assert.equal(embed, 'https://open.spotify.com/embed/episode/7yZjEnpvvudpUTdI6qsaPM?utm_source=generator&theme=0');
});

test('formatDuration formats seconds to MM:SS and HH:MM:SS', () => {
  assert.equal(formatDuration(65), '01:05');
  assert.equal(formatDuration(3665), '1:01:05');
  assert.equal(formatDuration(0), '00:00');
});

test('findActiveWordIndex uses binary search to pinpoint active word', () => {
  const words: Word[] = [
    { id: 'w1', text: 'Welcome', start: 0.5, end: 1.0, sentenceId: 's1' },
    { id: 'w2', text: 'to', start: 1.1, end: 1.3, sentenceId: 's1' },
    { id: 'w3', text: 'SpotScript.', start: 1.35, end: 2.0, sentenceId: 's1' },
    { id: 'w4', text: 'This', start: 2.5, end: 2.8, sentenceId: 's2' },
    { id: 'w5', text: 'is', start: 2.85, end: 3.1, sentenceId: 's2' },
  ];

  assert.equal(findActiveWordIndex(words, 0.2), -1); // before
  assert.equal(findActiveWordIndex(words, 0.7), 0); // w1
  assert.equal(findActiveWordIndex(words, 1.2), 1); // w2
  assert.equal(findActiveWordIndex(words, 1.5), 2); // w3
  assert.equal(findActiveWordIndex(words, 3.0), 4); // w5
  assert.equal(findActiveWordIndex(words, 10.0), -1); // after
});

test('findActiveSentenceIndex locates correct active sentence', () => {
  const sentences: Sentence[] = [
    { id: 's1', text: 'Welcome to SpotScript.', start: 0.5, end: 2.0 },
    { id: 's2', text: 'This is the synchronized reader.', start: 2.5, end: 4.5 },
    { id: 's3', text: 'It highlights every word in real time.', start: 5.0, end: 7.5 },
  ];

  assert.equal(findActiveSentenceIndex(sentences, 1.0), 0);
  assert.equal(findActiveSentenceIndex(sentences, 3.0), 1);
  assert.equal(findActiveSentenceIndex(sentences, 6.0), 2);
});

test('getWordProgress computes ratio between 0 and 1', () => {
  const word: Word = { id: 'w1', text: 'Hello', start: 10.0, end: 12.0, sentenceId: 's1' };
  assert.equal(getWordProgress(word, 9.0), 0);
  assert.equal(getWordProgress(word, 11.0), 0.5);
  assert.equal(getWordProgress(word, 12.5), 1);
});

test('parseSRT parses subtitle text into words and sentences', () => {
  const srtSample = `1
00:00:01,000 --> 00:00:04,000
Designing products requires deep attention.

2
00:00:04,500 --> 00:00:08,000
True focus emerges in quiet environments.
`;

  const transcript = parseSRT(srtSample, 'test_ep');
  assert.equal(transcript.sentences.length, 2);
  assert.equal(transcript.sentences[0].text, 'Designing products requires deep attention.');
  assert.equal(transcript.sentences[0].start, 1.0);
  assert.equal(transcript.sentences[0].end, 4.0);
  assert.equal(transcript.sentences[0].words?.length, 5);
  assert.ok(transcript.words.length > 0);
});

test('exportTranscript exports correctly to TXT and SRT', () => {
  const srtSample = `1
00:00:01,000 --> 00:00:03,000
First line of audio.
`;
  const transcript = parseSRT(srtSample, 'test_ep');
  const txt = exportTranscript(transcript, 'txt');
  assert.equal(txt, 'First line of audio.');

  const srt = exportTranscript(transcript, 'srt');
  assert.match(srt, /00:00:01,000 --> 00:00:03,000/);
});
