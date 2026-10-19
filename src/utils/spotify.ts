/**
 * Spotify URL validation and episode ID extraction utility.
 */

export interface SpotifyUrlParseResult {
  isValid: boolean;
  episodeId: string | null;
  canonicalUrl: string | null;
  error?: string;
}

// Accepts URLs like:
// https://open.spotify.com/episode/7yZjEnpvvudpUTdI6qsaPM
// https://open.spotify.com/episode/7yZjEnpvvudpUTdI6qsaPM?si=...
// spotify:episode:7yZjEnpvvudpUTdI6qsaPM
const SPOTIFY_EPISODE_URL_REGEX = /^(?:https?:\/\/(?:open|play)\.spotify\.com\/episode\/|spotify:episode:)([a-zA-Z0-9]{22})(?:\?.*)?$/;

export function validateSpotifyEpisodeUrl(rawUrl: string): SpotifyUrlParseResult {
  const trimmed = (rawUrl || '').trim();
  if (!trimmed) {
    return {
      isValid: false,
      episodeId: null,
      canonicalUrl: null,
      error: 'Please enter a Spotify episode URL.',
    };
  }

  const match = trimmed.match(SPOTIFY_EPISODE_URL_REGEX);
  if (!match) {
    // Check if it's a Spotify show or track link instead of an episode
    if (trimmed.includes('spotify.com/show/')) {
      return {
        isValid: false,
        episodeId: null,
        canonicalUrl: null,
        error: 'This looks like a podcast show link. Please paste a specific episode link.',
      };
    }
    if (trimmed.includes('spotify.com/track/')) {
      return {
        isValid: false,
        episodeId: null,
        canonicalUrl: null,
        error: 'This looks like a music track link. Please paste a podcast episode link.',
      };
    }
    return {
      isValid: false,
      episodeId: null,
      canonicalUrl: null,
      error: 'Invalid Spotify episode link. Format should be: https://open.spotify.com/episode/[id]',
    };
  }

  const episodeId = match[1];
  return {
    isValid: true,
    episodeId,
    canonicalUrl: `https://open.spotify.com/episode/${episodeId}`,
  };
}

export function getSpotifyEmbedUrl(episodeId: string): string {
  return `https://open.spotify.com/embed/episode/${episodeId}?utm_source=generator&theme=0`;
}

export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const totalSecs = Math.floor(seconds);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hrs > 0) {
    return `${hrs}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}
