import { Episode, Transcript } from '../types/index.ts';

export const SAMPLE_SPOTIFY_URL = 'https://open.spotify.com/episode/7yZjEnpvvudpUTdI6qsaPM';
export const SAMPLE_SPOTIFY_ID = '7yZjEnpvvudpUTdI6qsaPM';

export const SAMPLE_SPOTIFY_EPISODE: Episode = {
  id: SAMPLE_SPOTIFY_ID,
  sourceType: 'spotify',
  title: 'The Psychology of Everyday Decisions & Cognitive Biases',
  showName: 'Mind & Science Conversations',
  artworkUrl: '',
  duration: 4860, // ~1h 21m
  pubDate: 'October 2026',
  sourceUrl: SAMPLE_SPOTIFY_URL,
  spotifyEmbedUrl: `https://open.spotify.com/embed/episode/${SAMPLE_SPOTIFY_ID}?utm_source=generator&theme=0`,
  description: 'A deep discussion exploring human decision-making, cognitive heuristics, and how mental frameworks shape long-term creative and technical pursuits.',
  chapters: [
    { id: 'c1', title: '01. Heuristics & Intuition', startTime: 0, summary: 'How the brain simplifies complex choices under pressure.' },
    { id: 'c2', title: '02. Information Overload & Attention', startTime: 1200, summary: 'The cognitive cost of constant notification context switching.' },
    { id: 'c3', title: '03. Mental Models for Long-Term Focus', startTime: 2800, summary: 'Frameworks used by top thinkers and practitioners.' },
  ],
};

// Break Spotify transcript sentences into words for synchronized highlighting
const spotifySentencesList = [
  { id: 'sp_1', text: 'Welcome back to the conversation. Today we are exploring the invisible forces behind how we choose, decide, and structure our lives.', start: 0, end: 12 },
  { id: 'sp_2', text: 'When we navigate complex decisions, our brains naturally rely on heuristic shortcuts that were forged across thousands of generations.', start: 12.5, end: 26 },
  { id: 'sp_3', text: 'Yet in our hyper-connected modern landscape, these same heuristics frequently lead to cognitive fatigue and decision paralysis.', start: 26.5, end: 40 },
  { id: 'sp_4', text: 'The fundamental challenge is that human attention is a strictly finite biological currency.', start: 40.5, end: 54 },
  { id: 'sp_5', text: 'Every notification, every split second of task switching incurs what cognitive researchers call an attentional residue.', start: 54.5, end: 72 },
  { id: 'sp_6', text: 'If you want to produce exceptional creative or analytical work, you must deliberately construct calm, protected spaces.', start: 72.5, end: 90 },
  { id: 'sp_7', text: 'That brings us to the craft of reading and listening simultaneously.', start: 90.5, end: 104 },
  { id: 'sp_8', text: 'When visual typography mirrors spoken cadence, comprehension rates and memory retention increase dramatically.', start: 104.5, end: 122 },
  { id: 'sp_9', text: 'It transforms passive listening into an immersive study of thought, language, and nuance.', start: 122.5, end: 140 },
];

const spotifyBuiltWords = spotifySentencesList.flatMap(s => {
  const tokens = s.text.split(/\s+/).filter(Boolean);
  const dur = (s.end - s.start) / Math.max(1, tokens.length);
  return tokens.map((t, idx) => ({
    id: `w_sp_${s.id}_${idx}`,
    text: t,
    start: Number((s.start + idx * dur).toFixed(2)),
    end: Number((s.start + (idx + 1) * dur).toFixed(2)),
    sentenceId: s.id,
  }));
});

export const SAMPLE_SPOTIFY_TRANSCRIPT: Transcript = {
  episodeId: SAMPLE_SPOTIFY_ID,
  language: 'en',
  source: 'third-party',
  granularity: 'word',
  paragraphs: [
    {
      id: 'p1',
      startTime: 0,
      endTime: 40,
      speakerId: 'Host',
      sentences: spotifySentencesList.slice(0, 3).map(s => ({
        ...s,
        words: spotifyBuiltWords.filter(w => w.sentenceId === s.id),
      })),
    },
    {
      id: 'p2',
      startTime: 40.5,
      endTime: 90,
      speakerId: 'Guest',
      sentences: spotifySentencesList.slice(3, 6).map(s => ({
        ...s,
        words: spotifyBuiltWords.filter(w => w.sentenceId === s.id),
      })),
    },
    {
      id: 'p3',
      startTime: 90.5,
      endTime: 140,
      speakerId: 'Host',
      sentences: spotifySentencesList.slice(6, 9).map(s => ({
        ...s,
        words: spotifyBuiltWords.filter(w => w.sentenceId === s.id),
      })),
    },
  ],
  sentences: [],
  words: spotifyBuiltWords,
  speakerLabels: {
    Host: 'Host',
    Guest: 'Dr. Elena Vance',
  },
  title: 'Synchronized Episode Transcript',
  sourceLicense: 'Episode transcript synchronized with audio timeline for study and note-taking.',
};

// Flatten sentences for Spotify transcript
SAMPLE_SPOTIFY_TRANSCRIPT.sentences = SAMPLE_SPOTIFY_TRANSCRIPT.paragraphs.flatMap(p => p.sentences);

// ==========================================
// SAMPLE AUTHORIZED SYNCHRONIZED EPISODE (MODE B)
// ==========================================

export const SAMPLE_AUTHORIZED_EPISODE: Episode = {
  id: 'auth_design_mind_01',
  sourceType: 'authorized_audio',
  title: 'The Architecture of Deep Focus & Mindful Design',
  showName: 'Design & Mind Podcast',
  artworkUrl: '/src/assets/images/spotscript_show_cover_1792402297599.jpg',
  duration: 125, // 2 minutes 5 seconds
  pubDate: 'October 19, 2026',
  sourceUrl: 'https://spotscript.internal/episodes/design-mind-01',
  audioUrl: 'SYNTHETIC_SPEECH_STREAM',
  description: 'An exploration of how intentional typography, sensory pacing, and calm software design help listeners achieve sustained states of deep focus.',
  chapters: [
    { id: 'c_b1', title: '01. The Nature of Attention', startTime: 0, endTime: 32, summary: 'Understanding how audio and typography intersect.' },
    { id: 'c_b2', title: '02. Reducing Interface Friction', startTime: 32, endTime: 65, summary: 'Designing digital tools that respect human calm.' },
    { id: 'c_b3', title: '03. Synchronized Pacing', startTime: 65, endTime: 95, summary: 'The cognitive mechanics of karaoke-style reading.' },
    { id: 'c_b4', title: '04. The Architecture of Craft', startTime: 95, endTime: 125, summary: 'Final takeaways for creators, thinkers, and builders.' },
  ],
};

// Generate comprehensive word-level synchronized transcript for Mode B
const rawAuthorizedSegments = [
  {
    paraId: 'p_auth_1',
    speakerId: 'Narrator',
    sentences: [
      {
        id: 's_1',
        text: 'Welcome to SpotScript.',
        words: [
          { text: 'Welcome', start: 0.3, end: 0.9 },
          { text: 'to', start: 1.0, end: 1.2 },
          { text: 'SpotScript.', start: 1.25, end: 2.2 },
        ],
      },
      {
        id: 's_2',
        text: 'This is the synchronized reading experience, designed specifically for long-form podcasts, lectures, and life lessons.',
        words: [
          { text: 'This', start: 2.6, end: 2.9 },
          { text: 'is', start: 2.95, end: 3.15 },
          { text: 'the', start: 3.2, end: 3.35 },
          { text: 'synchronized', start: 3.4, end: 4.1 },
          { text: 'reading', start: 4.15, end: 4.55 },
          { text: 'experience,', start: 4.6, end: 5.4 },
          { text: 'designed', start: 5.7, end: 6.2 },
          { text: 'specifically', start: 6.25, end: 6.95 },
          { text: 'for', start: 7.0, end: 7.2 },
          { text: 'long-form', start: 7.25, end: 7.9 },
          { text: 'podcasts,', start: 7.95, end: 8.7 },
          { text: 'lectures,', start: 8.9, end: 9.6 },
          { text: 'and', start: 9.7, end: 9.9 },
          { text: 'life', start: 9.95, end: 10.3 },
          { text: 'lessons.', start: 10.35, end: 11.2 },
        ],
      },
      {
        id: 's_3',
        text: 'As audio plays, notice how each sentence flows seamlessly into view, illuminating word by word in real time.',
        words: [
          { text: 'As', start: 11.8, end: 12.0 },
          { text: 'audio', start: 12.05, end: 12.5 },
          { text: 'plays,', start: 12.55, end: 13.1 },
          { text: 'notice', start: 13.4, end: 13.8 },
          { text: 'how', start: 13.85, end: 14.05 },
          { text: 'each', start: 14.1, end: 14.35 },
          { text: 'sentence', start: 14.4, end: 14.95 },
          { text: 'flows', start: 15.0, end: 15.45 },
          { text: 'seamlessly', start: 15.5, end: 16.2 },
          { text: 'into', start: 16.25, end: 16.55 },
          { text: 'view,', start: 16.6, end: 17.2 },
          { text: 'illuminating', start: 17.5, end: 18.35 },
          { text: 'word', start: 18.4, end: 18.7 },
          { text: 'by', start: 18.75, end: 18.95 },
          { text: 'word', start: 19.0, end: 19.3 },
          { text: 'in', start: 19.35, end: 19.5 },
          { text: 'real', start: 19.55, end: 19.9 },
          { text: 'time.', start: 19.95, end: 20.7 },
        ],
      },
    ],
  },
  {
    paraId: 'p_auth_2',
    speakerId: 'Narrator',
    sentences: [
      {
        id: 's_4',
        text: 'In our fast-paced world, human attention is pulled in a thousand competing directions every hour.',
        words: [
          { text: 'In', start: 21.5, end: 21.7 },
          { text: 'our', start: 21.75, end: 21.95 },
          { text: 'fast-paced', start: 22.0, end: 22.7 },
          { text: 'world,', start: 22.75, end: 23.3 },
          { text: 'human', start: 23.6, end: 24.0 },
          { text: 'attention', start: 24.05, end: 24.6 },
          { text: 'is', start: 24.65, end: 24.8 },
          { text: 'pulled', start: 24.85, end: 25.25 },
          { text: 'in', start: 25.3, end: 25.45 },
          { text: 'a', start: 25.5, end: 25.6 },
          { text: 'thousand', start: 25.65, end: 26.2 },
          { text: 'competing', start: 26.25, end: 26.85 },
          { text: 'directions', start: 26.9, end: 27.5 },
          { text: 'every', start: 27.55, end: 27.9 },
          { text: 'hour.', start: 27.95, end: 28.7 },
        ],
      },
      {
        id: 's_5',
        text: 'When listening alone, your mind can easily wander, missing critical insights and nuanced arguments.',
        words: [
          { text: 'When', start: 29.2, end: 29.5 },
          { text: 'listening', start: 29.55, end: 30.1 },
          { text: 'alone,', start: 30.15, end: 30.7 },
          { text: 'your', start: 31.0, end: 31.2 },
          { text: 'mind', start: 31.25, end: 31.6 },
          { text: 'can', start: 31.65, end: 31.85 },
          { text: 'easily', start: 31.9, end: 32.35 },
          { text: 'wander,', start: 32.4, end: 33.1 },
          { text: 'missing', start: 33.4, end: 33.9 },
          { text: 'critical', start: 33.95, end: 34.45 },
          { text: 'insights', start: 34.5, end: 35.1 },
          { text: 'and', start: 35.15, end: 35.35 },
          { text: 'nuanced', start: 35.4, end: 35.95 },
          { text: 'arguments.', start: 36.0, end: 37.0 },
        ],
      },
      {
        id: 's_6',
        text: 'By coupling precise auditory timing with calm typography, your focus locks into a state of effortless flow.',
        words: [
          { text: 'By', start: 37.6, end: 37.85 },
          { text: 'coupling', start: 37.9, end: 38.4 },
          { text: 'precise', start: 38.45, end: 39.0 },
          { text: 'auditory', start: 39.05, end: 39.6 },
          { text: 'timing', start: 39.65, end: 40.15 },
          { text: 'with', start: 40.2, end: 40.4 },
          { text: 'calm', start: 40.45, end: 40.85 },
          { text: 'typography,', start: 40.9, end: 41.75 },
          { text: 'your', start: 42.0, end: 42.2 },
          { text: 'focus', start: 42.25, end: 42.7 },
          { text: 'locks', start: 42.75, end: 43.15 },
          { text: 'into', start: 43.2, end: 43.5 },
          { text: 'a', start: 43.55, end: 43.65 },
          { text: 'state', start: 43.7, end: 44.1 },
          { text: 'of', start: 44.15, end: 44.3 },
          { text: 'effortless', start: 44.35, end: 45.05 },
          { text: 'flow.', start: 45.1, end: 45.9 },
        ],
      },
    ],
  },
  {
    paraId: 'p_auth_3',
    speakerId: 'Narrator',
    sentences: [
      {
        id: 's_7',
        text: 'Notice that you can click any word or sentence in this transcript to instantly jump playback to that moment.',
        words: [
          { text: 'Notice', start: 46.8, end: 47.3 },
          { text: 'that', start: 47.35, end: 47.55 },
          { text: 'you', start: 47.6, end: 47.75 },
          { text: 'can', start: 47.8, end: 48.0 },
          { text: 'click', start: 48.05, end: 48.45 },
          { text: 'any', start: 48.5, end: 48.75 },
          { text: 'word', start: 48.8, end: 49.15 },
          { text: 'or', start: 49.2, end: 49.35 },
          { text: 'sentence', start: 49.4, end: 49.95 },
          { text: 'in', start: 50.0, end: 50.15 },
          { text: 'this', start: 50.2, end: 50.45 },
          { text: 'transcript', start: 50.5, end: 51.2 },
          { text: 'to', start: 51.25, end: 51.4 },
          { text: 'instantly', start: 51.45, end: 52.05 },
          { text: 'jump', start: 52.1, end: 52.45 },
          { text: 'playback', start: 52.5, end: 53.05 },
          { text: 'to', start: 53.1, end: 53.25 },
          { text: 'that', start: 53.3, end: 53.55 },
          { text: 'moment.', start: 53.6, end: 54.4 },
        ],
      },
      {
        id: 's_8',
        text: 'Try pausing, seeking backward fifteen seconds, or adjusting playback speed from zero point seventy-five up to two times.',
        words: [
          { text: 'Try', start: 55.0, end: 55.4 },
          { text: 'pausing,', start: 55.45, end: 56.1 },
          { text: 'seeking', start: 56.4, end: 56.85 },
          { text: 'backward', start: 56.9, end: 57.45 },
          { text: 'fifteen', start: 57.5, end: 58.0 },
          { text: 'seconds,', start: 58.05, end: 58.7 },
          { text: 'or', start: 59.0, end: 59.2 },
          { text: 'adjusting', start: 59.25, end: 59.85 },
          { text: 'playback', start: 59.9, end: 60.45 },
          { text: 'speed', start: 60.5, end: 60.95 },
          { text: 'from', start: 61.0, end: 61.25 },
          { text: 'zero', start: 61.3, end: 61.65 },
          { text: 'point', start: 61.7, end: 62.0 },
          { text: 'seventy-five', start: 62.05, end: 62.8 },
          { text: 'up', start: 62.85, end: 63.05 },
          { text: 'to', start: 63.1, end: 63.25 },
          { text: 'two', start: 63.3, end: 63.6 },
          { text: 'times.', start: 63.65, end: 64.5 },
        ],
      },
    ],
  },
  {
    paraId: 'p_auth_4',
    speakerId: 'Narrator',
    sentences: [
      {
        id: 's_9',
        text: 'If you scroll through the transcript manually, auto-scroll will gently pause so you can explore freely.',
        words: [
          { text: 'If', start: 65.5, end: 65.7 },
          { text: 'you', start: 65.75, end: 65.9 },
          { text: 'scroll', start: 65.95, end: 66.45 },
          { text: 'through', start: 66.5, end: 66.85 },
          { text: 'the', start: 66.9, end: 67.05 },
          { text: 'transcript', start: 67.1, end: 67.75 },
          { text: 'manually,', start: 67.8, end: 68.6 },
          { text: 'auto-scroll', start: 68.9, end: 69.65 },
          { text: 'will', start: 69.7, end: 69.9 },
          { text: 'gently', start: 69.95, end: 70.45 },
          { text: 'pause', start: 70.5, end: 71.0 },
          { text: 'so', start: 71.1, end: 71.3 },
          { text: 'you', start: 71.35, end: 71.5 },
          { text: 'can', start: 71.55, end: 71.75 },
          { text: 'explore', start: 71.8, end: 72.35 },
          { text: 'freely.', start: 72.4, end: 73.2 },
        ],
      },
      {
        id: 's_10',
        text: 'A clean return indicator allows you to snap straight back to the active thought whenever you are ready.',
        words: [
          { text: 'A', start: 73.8, end: 74.0 },
          { text: 'clean', start: 74.05, end: 74.45 },
          { text: 'return', start: 74.5, end: 74.95 },
          { text: 'indicator', start: 75.0, end: 75.7 },
          { text: 'allows', start: 75.75, end: 76.2 },
          { text: 'you', start: 76.25, end: 76.4 },
          { text: 'to', start: 76.45, end: 76.6 },
          { text: 'snap', start: 76.65, end: 77.05 },
          { text: 'straight', start: 77.1, end: 77.55 },
          { text: 'back', start: 77.6, end: 77.95 },
          { text: 'to', start: 78.0, end: 78.15 },
          { text: 'the', start: 78.2, end: 78.35 },
          { text: 'active', start: 78.4, end: 78.85 },
          { text: 'thought', start: 78.9, end: 79.4 },
          { text: 'whenever', start: 79.5, end: 80.05 },
          { text: 'you', start: 80.1, end: 80.25 },
          { text: 'are', start: 80.3, end: 80.45 },
          { text: 'ready.', start: 80.5, end: 81.3 },
        ],
      },
    ],
  },
  {
    paraId: 'p_auth_5',
    speakerId: 'Narrator',
    sentences: [
      {
        id: 's_11',
        text: 'You can also bookmark meaningful sentences, attach personal reflections, and export the entire session in clean SRT or markdown format.',
        words: [
          { text: 'You', start: 82.2, end: 82.4 },
          { text: 'can', start: 82.45, end: 82.65 },
          { text: 'also', start: 82.7, end: 83.1 },
          { text: 'bookmark', start: 83.15, end: 83.75 },
          { text: 'meaningful', start: 83.8, end: 84.45 },
          { text: 'sentences,', start: 84.5, end: 85.35 },
          { text: 'attach', start: 85.6, end: 86.05 },
          { text: 'personal', start: 86.1, end: 86.65 },
          { text: 'reflections,', start: 86.7, end: 87.6 },
          { text: 'and', start: 87.85, end: 88.05 },
          { text: 'export', start: 88.1, end: 88.6 },
          { text: 'the', start: 88.65, end: 88.8 },
          { text: 'entire', start: 88.85, end: 89.35 },
          { text: 'session', start: 89.4, end: 89.9 },
          { text: 'in', start: 89.95, end: 90.15 },
          { text: 'clean', start: 90.2, end: 90.6 },
          { text: 'SRT', start: 90.65, end: 91.2 },
          { text: 'or', start: 91.25, end: 91.45 },
          { text: 'markdown', start: 91.5, end: 92.15 },
          { text: 'format.', start: 92.2, end: 93.0 },
        ],
      },
      {
        id: 's_12',
        text: 'SpotScript is built to make long-form audio thoughtful, permanent, and endlessly searchable.',
        words: [
          { text: 'SpotScript', start: 93.8, end: 94.6 },
          { text: 'is', start: 94.65, end: 94.8 },
          { text: 'built', start: 94.85, end: 95.2 },
          { text: 'to', start: 95.25, end: 95.4 },
          { text: 'make', start: 95.45, end: 95.75 },
          { text: 'long-form', start: 95.8, end: 96.4 },
          { text: 'audio', start: 96.45, end: 96.9 },
          { text: 'thoughtful,', start: 96.95, end: 97.75 },
          { text: 'permanent,', start: 98.0, end: 98.8 },
          { text: 'and', start: 99.0, end: 99.2 },
          { text: 'endlessly', start: 99.25, end: 99.95 },
          { text: 'searchable.', start: 100.0, end: 101.0 },
        ],
      },
    ],
  },
  {
    paraId: 'p_auth_6',
    speakerId: 'Narrator',
    sentences: [
      {
        id: 's_13',
        text: 'Thank you for listening and reading with us. Enjoy your exploration.',
        words: [
          { text: 'Thank', start: 102.0, end: 102.3 },
          { text: 'you', start: 102.35, end: 102.55 },
          { text: 'for', start: 102.6, end: 102.8 },
          { text: 'listening', start: 102.85, end: 103.45 },
          { text: 'and', start: 103.5, end: 103.7 },
          { text: 'reading', start: 103.75, end: 104.2 },
          { text: 'with', start: 104.25, end: 104.45 },
          { text: 'us.', start: 104.5, end: 105.1 },
          { text: 'Enjoy', start: 105.6, end: 106.1 },
          { text: 'your', start: 106.15, end: 106.35 },
          { text: 'exploration.', start: 106.4, end: 107.5 },
        ],
      },
    ],
  },
];

// Build complete structure
const builtSentences = rawAuthorizedSegments.flatMap(p => p.sentences);
const builtWords = builtSentences.flatMap(s => s.words.map((w, idx) => ({
  id: `w_auth_${s.id}_${idx}`,
  text: w.text,
  start: w.start,
  end: w.end,
  sentenceId: s.id,
})));

export const SAMPLE_AUTHORIZED_TRANSCRIPT: Transcript = {
  episodeId: SAMPLE_AUTHORIZED_EPISODE.id,
  language: 'en',
  source: 'speech-to-text',
  granularity: 'word',
  paragraphs: rawAuthorizedSegments.map(p => {
    const sents = p.sentences.map(s => {
      const wordsForSentence = builtWords.filter(bw => bw.sentenceId === s.id);
      return {
        id: s.id,
        text: s.text,
        start: s.words[0].start,
        end: s.words[s.words.length - 1].end,
        words: wordsForSentence,
        paragraphId: p.paraId,
        speakerId: p.speakerId,
      };
    });
    return {
      id: p.paraId,
      sentences: sents,
      speakerId: p.speakerId,
      startTime: sents[0].start,
      endTime: sents[sents.length - 1].end,
    };
  }),
  sentences: [],
  words: builtWords,
  speakerLabels: {
    Narrator: 'Host (Design & Mind)',
  },
  title: 'Full Word-Level Synchronized Transcript',
  sourceLicense: 'Authorized creative commons podcast recording licensed for SpotScript live playback demonstration.',
};

SAMPLE_AUTHORIZED_TRANSCRIPT.sentences = SAMPLE_AUTHORIZED_TRANSCRIPT.paragraphs.flatMap(p => p.sentences);

export const SAMPLE_EPISODES: Episode[] = [
  SAMPLE_AUTHORIZED_EPISODE,
  SAMPLE_SPOTIFY_EPISODE,
];

export function getTranscriptForEpisode(episodeId: string): Transcript {
  if (episodeId === SAMPLE_SPOTIFY_ID || episodeId.includes('7yZjEnpvvudpUTdI6qsaPM')) {
    return SAMPLE_SPOTIFY_TRANSCRIPT;
  }
  return SAMPLE_AUTHORIZED_TRANSCRIPT;
}
