/**
 * Universal YouTube URL & ID Parser
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/playlist?list=PLAYLIST_ID
 * - Raw 11-char ID or raw PL playlist ID
 * 
 * @param {string} input - YouTube URL or ID string
 * @returns {{ type: 'video' | 'playlist', id: string } | null}
 */
export function parseYouTubeInput(input) {
  if (!input || typeof input !== 'string') return null;
  const cleanInput = input.trim();

  // 1. Check for playlist URL or ID
  const playlistMatch = cleanInput.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  if (playlistMatch && playlistMatch[1]) {
    return { type: 'playlist', id: playlistMatch[1] };
  }
  if (cleanInput.startsWith('PL') && cleanInput.length >= 12 && !cleanInput.includes('/')) {
    return { type: 'playlist', id: cleanInput };
  }

  // 2. Check for standard YouTube Video URL
  const videoIdRegex = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|watch\?.+&v=))([\w-]{11})/;
  const match = cleanInput.match(videoIdRegex);
  if (match && match[1]) {
    return { type: 'video', id: match[1] };
  }

  // 3. Raw 11-character video ID
  if (/^[\w-]{11}$/.test(cleanInput)) {
    return { type: 'video', id: cleanInput };
  }

  return null;
}

/**
 * Generates an HQ thumbnail preview URL from a YouTube ID or playlist placeholder
 * 
 * @param {string} youtubeId - Video or playlist identifier
 * @param {'video' | 'playlist'} [type='video'] - Type of media
 * @returns {string} Thumbnail image URL
 */
export function getYouTubeThumbnail(youtubeId, type = 'video', customThumbnail = null) {
  if (customThumbnail) return customThumbnail;
  if (type === 'playlist') {
    return 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80';
  }
  return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
}

/**
 * Formats time in seconds to mm:ss
 * 
 * @param {number} seconds - Elapsed duration in seconds
 * @returns {string} Formatted mm:ss string
 */
export function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}
