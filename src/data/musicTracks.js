/**
 * ============================================================================
 * ODD FREQUENCY // SOUND DECK ARCHIVE & PLAYLIST CONFIGURATION
 * ============================================================================
 * 
 * HOW TO ADD YOUR OWN SONGS OR PLAYLISTS:
 * 
 * 1. SINGLE YOUTUBE TRACK:
 *    - Paste any YouTube link (e.g. "https://www.youtube.com/watch?v=HR5zpFs7YpY"
 *      or "https://youtu.be/HR5zpFs7YpY" or just the 11-character ID "HR5zpFs7YpY").
 *    - Add an object to the `DEFAULT_TRACKS` array below:
 *      {
 *        id: 'unique-id',
 *        title: 'Song Title',
 *        artist: 'Artist Name',
 *        genre: 'void', // Choose: 'void' | 'feed' | 'drone' | 'custom'
 *        youtubeId: 'HR5zpFs7YpY',
 *        duration: '2:21', // Optional
 *      }
 * 
 * 2. FULL YOUTUBE PLAYLIST:
 *    - Provide any playlist URL (e.g. "https://www.youtube.com/playlist?list=PL...")
 *      or the playlist ID starting with "PL...":
 *      {
 *        id: 'pl-my-mix',
 *        title: 'Underground Mix Tape',
 *        artist: 'Odd Frequency Radio',
 *        genre: 'void',
 *        youtubeId: 'PL4fGSI1pDJn6jxs_m8b08B_T6Lg6M1f4_',
 *        type: 'playlist',
 *      }
 * 
 * 3. IN-APP ADDITION (ZERO CODE REQUIRED!):
 *    - Click the sound deck dock at the bottom of the site to open the drawer.
 *    - Switch to "+ ADD TRACK / PLAYLIST" tab.
 *    - Paste any YouTube link and hit "Add to Station"!
 *    - You can even click "Copy Code" to export your added tracks into this file!
 */

export const GENRES = [
  { id: 'all', label: 'ALL FREQUENCIES', tag: 'ALL', icon: '⚡' },
  { id: 'void', label: 'THE VOID', tag: 'VOID', desc: 'Darkwave / Post-Punk / Grunge / Industrial', icon: '🌑' },
  { id: 'feed', label: 'THE FEED', tag: 'FEED', desc: 'Hyperpop / Breakcore / Glitch / Cyber Underground', icon: '🌀' },
  { id: 'drone', label: 'SUBTERRANEAN RADIO', tag: 'LO-FI', desc: 'Lo-Fi Beats / Tape Loops / Dark Drone', icon: '📼' },
  { id: 'custom', label: 'MY MIXTAPE', tag: 'CUSTOM', desc: 'User-Added Songs & Playlists', icon: '💾' }
];

export const DEFAULT_TRACKS = [
  // -------------------------------------------------------------
  // YOUTUBE PLAYLIST (METADATA LOADED DYNAMICALLY VIA YOUTUBE API)
  // -------------------------------------------------------------
  'https://youtube.com/playlist?list=PLX3pJ_cUqMmg&si=BFDtm7aqQvzJUHND',

  // -------------------------------------------------------------
  // THE VOID: Darkwave, Post-Punk, Grunge, Dark Alternative
  // -------------------------------------------------------------
  {
    id: 'void-01',
    title: 'Sudno (Boris Ryzhy)',
    artist: 'Molchat Doma',
    genre: 'void',
    youtubeId: 'HR5zpFs7YpY',
    duration: '2:21',
    note: 'Belarusian Post-Punk / Coldwave Anthem'
  },
  {
    id: 'void-02',
    title: 'The Perfect Girl',
    artist: 'Mareux',
    genre: 'void',
    youtubeId: 'sT13IBB4b5w',
    duration: '3:14',
    note: 'Darkwave / Cyber-Goth Essential'
  },
  {
    id: 'void-03',
    title: 'Dark Beach',
    artist: 'PASTEL GHOST',
    genre: 'void',
    youtubeId: '9bYvI7s-Jm4',
    duration: '3:42',
    note: 'Ethereal Witch House / Dark Dream Pop'
  },
  {
    id: 'void-04',
    title: 'Gallowdance',
    artist: 'Lebanon Hanover',
    genre: 'void',
    youtubeId: 'WPw7nlluRdc',
    duration: '3:50',
    note: 'Minimal Wave / Post-Punk Heavyweight'
  },
  {
    id: 'void-05',
    title: 'Pain',
    artist: 'Boy Harsher',
    genre: 'void',
    youtubeId: 'H1Zb4JmflU4',
    duration: '7:18',
    note: 'Raw Industrial EBM / Dark Electronic'
  },
  {
    id: 'void-06',
    title: 'Be Quiet and Drive (Far Away)',
    artist: 'Deftones',
    genre: 'void',
    youtubeId: 'WPpDyIUECPk',
    duration: '3:32',
    note: 'Alt-Metal Grunge Silhouette'
  },
  {
    id: 'void-07',
    title: 'Bloodhail',
    artist: 'Have A Nice Life',
    genre: 'void',
    youtubeId: 'ri5F633MVvU',
    duration: '5:40',
    note: 'Post-Punk / Shoegaze Heavy Drone'
  },

  // -------------------------------------------------------------
  // THE FEED: Hyperpop, Breakcore, Webcore, Cyber Underground
  // -------------------------------------------------------------
  {
    id: 'feed-01',
    title: 'Ghost',
    artist: 'Machine Girl',
    genre: 'feed',
    youtubeId: 'qU2m766J68Q',
    duration: '4:18',
    note: 'Digital Hardcore / Underground Breakcore'
  },
  {
    id: 'feed-02',
    title: 'Cyberia Lyr1',
    artist: 'Sewerslvt',
    genre: 'feed',
    youtubeId: 'uL5Z4d7Hek4',
    duration: '3:55',
    note: 'Atmospheric DNB / Cyber Breakcore'
  },
  {
    id: 'feed-03',
    title: "LET'S GO",
    artist: 'TOKYOPILL',
    genre: 'feed',
    youtubeId: 'u_L70-W3a78',
    duration: '2:30',
    note: 'Hyper-Glitch DNB / Web Rave'
  },
  {
    id: 'feed-04',
    title: 'Break It Off',
    artist: 'PinkPantheress',
    genre: 'feed',
    youtubeId: '0gS_gC6qj_g',
    duration: '1:36',
    note: 'Nostalgic 2000s UK Garage DNB'
  },
  {
    id: 'feed-05',
    title: 'Doritos & Fritos',
    artist: '100 gecs',
    genre: 'feed',
    youtubeId: 'U5p5d-J0C4s',
    duration: '3:04',
    note: 'Hyperpop / Glitch-Punk Anthemic'
  },

  // -------------------------------------------------------------
  // SUBTERRANEAN RADIO: Lo-Fi, Tape Beats, Ambient Drone
  // -------------------------------------------------------------
  {
    id: 'drone-01',
    title: "The Girl I Haven't Met",
    artist: 'Kudasaibeats',
    genre: 'drone',
    youtubeId: 'XFknYJ6tN4E',
    duration: '2:15',
    note: 'Dusty Cassette Tape Beat'
  },
  {
    id: 'drone-02',
    title: 'Affection',
    artist: 'jinsang',
    genre: 'drone',
    youtubeId: 'e8M6v8W1W-c',
    duration: '2:10',
    note: 'Vintage Analog Lo-Fi Tape Loop'
  },
  {
    id: 'drone-03',
    title: 'Monday Loop',
    artist: 'Tomppabeats',
    genre: 'drone',
    youtubeId: '5qap5aO4i9A',
    duration: '1:50',
    note: 'Subterranean Coffee-Shop Drone'
  },
  {
    id: 'drone-04',
    title: 'Nagashi',
    artist: 'idealism',
    genre: 'drone',
    youtubeId: 'rD6r2P4v2l0',
    duration: '2:40',
    note: 'Melancholic Late-Night Tape Drone'
  }
];

/**
 * Universal YouTube URL Parser
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/playlist?list=PLAYLIST_ID
 * - Raw 11-char ID or raw PL playlist ID
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
 * Generates an HQ thumbnail preview URL from a YouTube ID
 */
export function getYouTubeThumbnail(youtubeId, type = 'video', customThumbnail = null) {
  if (customThumbnail) return customThumbnail;
  if (type === 'playlist') {
    return 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80';
  }
  return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
}

/**
 * Normalizes any track input (URL string or object) into a standardized track structure.
 * Allows passing just a YouTube link; metadata is populated dynamically via YouTube API.
 */
export function normalizeTrack(item, index = 0) {
  if (!item) return null;

  if (typeof item === 'string') {
    const cleanUrl = item.trim();
    const parsed = parseYouTubeInput(cleanUrl);
    const id = parsed?.id || `yt-${index}`;
    const type = parsed?.type || 'video';
    return {
      id: `${type}-${id}`,
      url: cleanUrl,
      youtubeId: id,
      type,
      title: type === 'playlist' ? 'YouTube Playlist' : 'YouTube Audio',
      artist: 'YouTube Signal',
      genre: 'void',
      duration: '',
      autoFetch: true
    };
  }

  if (typeof item === 'object') {
    const rawUrl = item.url || (item.youtubeId ? (item.type === 'playlist' ? `https://www.youtube.com/playlist?list=${item.youtubeId}` : `https://www.youtube.com/watch?v=${item.youtubeId}`) : '');
    const parsed = rawUrl ? parseYouTubeInput(rawUrl) : null;
    const type = item.type || parsed?.type || (item.youtubeId?.startsWith('PL') ? 'playlist' : 'video');
    const youtubeId = item.youtubeId || parsed?.id || (item.id ? item.id.replace(/^(void|feed|drone|custom|pl|video|of1)-/, '') : `yt-${index}`);
    
    return {
      id: item.id || `${type}-${youtubeId}`,
      url: rawUrl,
      youtubeId,
      type,
      title: item.title || (type === 'playlist' ? 'YouTube Playlist' : 'YouTube Audio'),
      artist: item.artist || 'YouTube Signal',
      genre: item.genre || 'void',
      duration: item.duration || '',
      thumbnail: item.thumbnail,
      note: item.note,
      autoFetch: !item.title || item.title === 'YouTube Playlist' || item.title === 'YouTube Audio'
    };
  }

  return item;
}

/**
 * Normalizes an array of tracks or raw URL strings
 */
export function normalizeTracks(tracks) {
  if (!Array.isArray(tracks)) return [];
  return tracks.map((t, idx) => normalizeTrack(t, idx)).filter(Boolean);
}

const metadataCache = new Map();

/**
 * Dynamically fetches title, channel/artist, and thumbnail from YouTube oEmbed API
 */
export async function fetchYouTubeMetadata(urlOrId, type = 'video') {
  if (!urlOrId) return null;
  const cacheKey = `${type}:${urlOrId}`;
  if (metadataCache.has(cacheKey)) return metadataCache.get(cacheKey);

  try {
    let targetUrl = urlOrId;
    if (!targetUrl.startsWith('http')) {
      targetUrl = type === 'playlist'
        ? `https://www.youtube.com/playlist?list=${urlOrId}`
        : `https://www.youtube.com/watch?v=${urlOrId}`;
    }
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(targetUrl)}&format=json`;
    const res = await fetch(oembedUrl);
    if (!res.ok) return null;
    const data = await res.json();
    const result = {
      title: data.title || '',
      artist: data.author_name || 'YouTube',
      thumbnail: data.thumbnail_url || ''
    };
    metadataCache.set(cacheKey, result);
    return result;
  } catch {
    return null;
  }
}

