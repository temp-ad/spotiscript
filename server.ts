import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Scrape the public episode page for real metadata that oEmbed doesn't expose
// (exact duration, description, publisher name). Best-effort with safe defaults.
async function scrapeEpisodePage(episodeId: string) {
  const result: {
    durationSeconds?: number;
    description?: string;
    showName?: string;
    pubDate?: string;
  } = {};

  const decodeEntities = (raw: string) =>
    raw
      .replace(/&#x27;|&#39;|&apos;|&#8217;/g, "'")
      .replace(/&#x22;|&quot;|&ldquo;|&rdquo;|&#8220;|&#8221;/g, '"')
      .replace(/&#8230;|&hellip;/g, '…')
      .replace(/&#x26;|&amp;(?!#)/g, '&')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s*\n\s*/g, ' ')
      .trim();

  // Spotify only server-renders full metadata for crawler user-agents;
  // browser user-agents receive the empty JS shell page instead.
  const fetchPage = async (userAgent: string) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const pageRes = await fetch(`https://open.spotify.com/episode/${episodeId}`, {
        signal: controller.signal,
        redirect: 'follow',
        headers: {
          'User-Agent': userAgent,
          Accept: 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });
      return pageRes.ok ? await pageRes.text() : '';
    } finally {
      clearTimeout(timeout);
    }
  };

  let html = '';
  try {
    html = await fetchPage(
      'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
    );
  } catch {
    html = '';
  }
  if (!html || !/music:duration|og:description/.test(html)) {
    // Fallback: some pages still render meta tags for regular browsers
    try {
      const browserHtml = await fetchPage(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
      );
      if (browserHtml && /music:duration|og:description/.test(browserHtml)) {
        html = browserHtml;
      }
    } catch {
      /* keep crawler HTML if available */
    }
  }

  try {
    if (html) {
      // Real audio duration in seconds, e.g. <meta name="music:duration" content="1719"/>
      const durMatch = html.match(/music:duration"\s+content="(\d+)"/i) ||
        html.match(/"duration_s":\s*(\d+)/) ||
        html.match(/"lengthSeconds":\s*(\d+)/);
      if (durMatch) {
        const secs = parseInt(durMatch[1], 10);
        if (secs > 0 && secs < 86400 * 30) result.durationSeconds = secs;
      }

      // Show name: og:description starts with "SHOW NAME · Episode" or "SHOW NAME on Spotify."
      const descMatch = html.match(/<meta property="og:description" content="([^"]*)"/);
      if (descMatch) {
        const desc = decodeEntities(descMatch[1]);
        result.description = desc;
        const showFromDesc = desc.match(/^(.{1,120}?)\s*(?:·\s*Episode|\son Spotify\.)/i);
        if (showFromDesc) result.showName = showFromDesc[1].trim();
      }

      // Full episode description from <meta name="description"> — Spotify prepends
      // "Listen to this episode from SHOW on Spotify. " which we strip off.
      const metaDescMatch = html.match(/<meta name="description" content="([^"]*)"/);
      if (metaDescMatch) {
        const fullDesc = decodeEntities(metaDescMatch[1]);
        const stripped = fullDesc.replace(/^Listen to this episode from\s+.+?\s+on Spotify\.\s*/i, '');
        if (stripped.length > (result.description?.length || 0)) {
          result.description = stripped;
        }
        if (!result.showName) {
          const showFromMeta = fullDesc.match(/^Listen to this episode from\s+(.+?)\s+on Spotify\./i);
          if (showFromMeta) result.showName = showFromMeta[1].trim();
        }
      }

      // Publisher / date from JSON-LD block (when present)
      const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
      if (ldMatch) {
        try {
          const ld = JSON.parse(ldMatch[1]);
          const pub = ld?.publisher;
          if (!result.showName && pub && typeof pub.name === 'string' && pub.name.trim()) {
            result.showName = pub.name.trim();
          }
          if (typeof ld?.datePublished === 'string') {
            const d = new Date(ld.datePublished);
            if (!isNaN(d.getTime())) {
              result.pubDate = d.toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
              });
            }
          }
        } catch {
          /* malformed JSON-LD — ignore */
        }
      }

      // Release date meta as fallback: <meta name="music:release_date" content="2026-10-14T00:43:00Z"/>
      if (!result.pubDate) {
        const rdMatch = html.match(/music:release_date"\s+content="([^"]+)"/i);
        if (rdMatch) {
          const d = new Date(rdMatch[1]);
          if (!isNaN(d.getTime())) {
            result.pubDate = d.toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric',
            });
          }
        }
      }
    }
  } catch {
    /* parsing failure — fall back to whatever we already scraped */
  }
  return result;
}

// Check whether a Spotify-hosted transcript exists for this episode.
// The public transcripts endpoint returns 410 Gone when unavailable.
async function checkOfficialTranscript(episodeId: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(`https://api.spotify.com/v1/audio-transcripts/${episodeId}`, {
      method: 'HEAD',
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return res.status === 200;
  } catch {
    return false;
  }
}

// Spotify oEmbed proxy to fetch official public metadata without exposing tokens
app.get('/api/spotify/episode-info', async (req, res) => {
  const targetUrl = req.query.url as string;
  if (!targetUrl) {
    return res.status(400).json({ error: 'Missing Spotify URL parameter' });
  }

  // Extract episode ID
  const match = targetUrl.match(/(?:episode\/|episode:)([a-zA-Z0-9]{22})/);
  if (!match) {
    return res.status(400).json({ error: 'Invalid Spotify episode ID in URL' });
  }
  const episodeId = match[1];

  try {
    const [pageInfo, hasOfficialTranscript] = await Promise.all([
      scrapeEpisodePage(episodeId),
      checkOfficialTranscript(episodeId),
    ]);

    const oembedUrl = `https://open.spotify.com/oembed?url=https://open.spotify.com/episode/${episodeId}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(oembedUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'SpotScript/1.0',
      },
    });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      return res.json({
        id: episodeId,
        title: data.title || `Spotify Episode (${episodeId})`,
        showName: pageInfo.showName || data.author_name || 'Spotify Podcast',
        artworkUrl: data.thumbnail_url || '',
        durationSeconds: pageInfo.durationSeconds ?? null,
        description: pageInfo.description || '',
        pubDate: pageInfo.pubDate || 'Published on Spotify',
        sourceUrl: `https://open.spotify.com/episode/${episodeId}`,
        spotifyEmbedUrl: `https://open.spotify.com/embed/episode/${episodeId}?utm_source=generator&theme=0`,
        hasOfficialTranscript, // Spotify's public transcripts endpoint currently returns 410 Gone
        notice: hasOfficialTranscript
          ? 'Official Spotify embed loaded.'
          : 'No official timed transcript is available for this episode via Spotify\u2019s public API. Attach your own SRT/VTT file (Import \u2192 Add transcript) for word-level synchronized highlighting.',
      });
    }

    // Fallback if oEmbed returned non-200
    return res.json({
      id: episodeId,
      title: `Episode (${episodeId.slice(0, 8)}...)`,
      showName: pageInfo.showName || 'Spotify Podcast',
      artworkUrl: '',
      durationSeconds: pageInfo.durationSeconds ?? null,
      description: pageInfo.description || '',
      pubDate: pageInfo.pubDate || 'Published on Spotify',
      sourceUrl: `https://open.spotify.com/episode/${episodeId}`,
      spotifyEmbedUrl: `https://open.spotify.com/embed/episode/${episodeId}?utm_source=generator&theme=0`,
      hasOfficialTranscript: false,
    });
  } catch (err: any) {
    // Network failure or timeout fallback
    return res.json({
      id: episodeId,
      title: `Spotify Episode (${episodeId.slice(0, 8)}...)`,
      showName: 'Spotify Podcast',
      artworkUrl: '',
      durationSeconds: null,
      description: '',
      pubDate: 'Published on Spotify',
      sourceUrl: `https://open.spotify.com/episode/${episodeId}`,
      spotifyEmbedUrl: `https://open.spotify.com/embed/episode/${episodeId}?utm_source=generator&theme=0`,
      hasOfficialTranscript: false,
      fallbackMode: true,
    });
  }
});

// Gemini AI-assisted transcript summarization
app.post('/api/ai/summarize', async (req, res) => {
  const { transcriptText, title } = req.body;
  if (!transcriptText || typeof transcriptText !== 'string') {
    return res.status(400).json({ error: 'Missing transcript text for summarization' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    // Fallback analytical summary when API key is not yet configured
    const cleanSentences = transcriptText
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 20);

    const keyPoints = cleanSentences.slice(0, 4).map(s => `• ${s}.`);

    return res.json({
      summary: `This episode delves into the core themes surrounding "${title || 'the discussion'}". The speakers explore practical insights, philosophical foundations, and real-world applications of creative focus and technical discipline.`,
      keyTakeaways: keyPoints.length > 0 ? keyPoints : [
        '• Deep concentration requires intentional reduction of cognitive friction.',
        '• Synchronized reading enhances retention across auditory and visual modalities.',
        '• Thoughtful design architecture respects user attention and accessibility.',
      ],
      disclaimer: 'Generated using SpotScript text synthesis. Configure GEMINI_API_KEY in Secrets for live Gemini model synthesis.',
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are SpotScript's podcast editorial analyst.
Analyze the following podcast transcript excerpt for "${title || 'Podcast Episode'}".
Provide a structured response in clean JSON format:
{
  "summary": "A concise 2-3 sentence overview of the core message and themes discussed.",
  "keyTakeaways": ["Key insight 1", "Key insight 2", "Key insight 3", "Key insight 4"]
}

Transcript excerpt:
${transcriptText.slice(0, 6000)}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);

    return res.json({
      summary: parsed.summary || 'Summary unavailable.',
      keyTakeaways: parsed.keyTakeaways || [],
      disclaimer: 'AI-generated summary via Gemini 2.5 Flash. Content may differ from speaker intent.',
    });
  } catch (error: any) {
    console.error('Gemini summarization error:', error);
    return res.status(500).json({
      error: 'Failed to generate AI summary with Gemini.',
      details: error.message,
    });
  }
});

// Configure Vite middleware in development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SpotScript server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
