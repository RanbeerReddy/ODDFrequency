/**
 * ============================================================================
 * ODD FREQUENCY // MUSIC CATALOG
 * ============================================================================
 *
 * Add music by pasting a YouTube link into SOURCES below. That's the only
 * thing you ever edit. Everything else is derived at runtime:
 *
 *   playlist URL  ->  radio station  +  mixtape  +  genre filter  +  tracks
 *   video URL     ->  goes into the "My Mixtape" station
 *
 * Track lists come from YouTube itself (hidden IFrame player, no API key
 * needed). Titles / artists / thumbnails come from the oEmbed endpoint.
 * Colors, frequencies and descriptions are generated from the data.
 * Dead / private / non-embeddable videos are dropped automatically.
 *
 * Optional: set CONFIG.apiKey (YouTube Data API v3) to also get exact track
 * durations and playlist titles/authors. Without it everything still works.
 *
 * USAGE
 *   import { catalog, getEmbedUrl } from './music-catalog.js';
 *
 *   catalog.subscribe(({ status, stations, mixtapes, genres, tracks, errors }) => {
 *     render(...);                    // called on every update (progressive)
 *   });
 *   catalog.load();                   // fetch everything (cached 6h)
 *   await catalog.add(url);           // runtime add, persisted in localStorage
 *   catalog.remove(sourceKey);        // remove a runtime-added source
 *   catalog.exportSourcesCode();      // paste-ready lines for SOURCES
 * ============================================================================
 */

/* -------------------------------------------------------------------------- */
/*  1. THE ONLY THING YOU EDIT                                                */
/* -------------------------------------------------------------------------- */

export const SOURCES = [
  'https://youtube.com/playlist?list=PLX3pJ_cUqMmg',
  'https://youtube.com/playlist?list=PLgEpjxqlzb6k8wLBYqYcTspMth9XrnKHh',

  // Add more below. Any of these formats work:
  //   'https://www.youtube.com/playlist?list=PL...'
  //   'https://youtu.be/VIDEO_ID'
  //   'https://music.youtube.com/watch?v=VIDEO_ID&list=PL...'
  //   'PLxxxxxxxxxxxx'                          (raw playlist id)
  //   { url: 'https://...', name: 'Custom station name' }   (optional override)
];

export const CONFIG = {
  apiKey: (typeof import.meta !== 'undefined' && import.meta.env
    ? (import.meta.env.VITE_YOUTUBE_DATA_API || import.meta.env.YOUTUBE_DATA_API || import.meta.env.VITE_YOUTUBE_EMBEDDED_API || import.meta.env.YOUTUBE_EMBEDDED_API || '')
    : ''),
  cacheTtlMs: 6 * 60 * 60 * 1000,   // how long resolved playlists stay cached
  metaTtlMs: 7 * 24 * 60 * 60 * 1000,
  fetchTimeoutMs: 8000,
  iframeTimeoutMs: 15000,
  concurrency: 6,                   // parallel oEmbed lookups
  maxTracksPerPlaylist: 500,
  storagePrefix: 'oddfreq:',
};

/** Visual identity. Colors are generated inside these ranges. */
const THEME = {
  hueRanges: [[266, 292], [346, 358]],     // violet + blood red
  saturation: [66, 86],
  lightness: [46, 58],
  synthTypes: ['house', 'electro', 'grunge', 'metal', 'ambient'], // fallback-synth compat
  icons: ['🌑', '🌀', '📼', '⚡', '🩸', '💿', '📡', '🕯️'],
  singlesName: 'My Mixtape',
};

/* -------------------------------------------------------------------------- */
/*  2. URL / ID PARSING                                                       */
/* -------------------------------------------------------------------------- */

const VIDEO_ID_RE = /^[\w-]{11}$/;
const PLAYLIST_ID_RE = /^(?:PL|UU|FL|RD|OLAK5uy_)[\w-]{10,}$/;

/**
 * Universal YouTube parser. Returns { type: 'video'|'playlist', id, startVideoId? } or null.
 * Handles watch / youtu.be / shorts / embed / live / music.youtube.com / playlist URLs,
 * `si=` tracking params, video-inside-playlist links, and raw IDs.
 */
export function parseYouTubeInput(input) {
  const s = String(input ?? '').trim();
  if (!s) return null;

  if (PLAYLIST_ID_RE.test(s)) return { type: 'playlist', id: s };
  if (VIDEO_ID_RE.test(s)) return { type: 'video', id: s };

  let url;
  try { url = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`); } catch { return null; }

  const host = url.hostname.replace(/^(?:www\.|m\.|music\.)/, '');
  const list = url.searchParams.get('list');
  const v = url.searchParams.get('v');
  const segs = url.pathname.split('/').filter(Boolean);

  let videoId = null;
  if (host === 'youtu.be') videoId = segs[0];
  else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    if (v) videoId = v;
    else if (['shorts', 'embed', 'v', 'live'].includes(segs[0])) videoId = segs[1];
  } else return null;

  if (list && /^[\w-]{10,}$/.test(list)) {
    return {
      type: 'playlist',
      id: list,
      ...(videoId && VIDEO_ID_RE.test(videoId) ? { startVideoId: videoId } : {}),
    };
  }
  if (videoId && VIDEO_ID_RE.test(videoId)) return { type: 'video', id: videoId };
  return null;
}

export const canonicalUrl = ({ type, id }) =>
  type === 'playlist'
    ? `https://www.youtube.com/playlist?list=${id}`
    : `https://www.youtube.com/watch?v=${id}`;

export function getThumbnail(videoId, quality = 'hq') {
  const q = { max: 'maxres', sd: 'sd', hq: 'hq', mq: 'mq', default: '' }[quality] ?? 'hq';
  return `https://i.ytimg.com/vi/${videoId}/${q}default.jpg`;
}

/**
 * Embed URL for a track or station.
 *  - track from a playlist  -> plays that video and continues the playlist
 *  - station (playlist)     -> plays the whole playlist
 *  - single video           -> plays that video
 */
export function getEmbedUrl(target, { autoplay = true, loop = false, start = 0 } = {}) {
  if (!target) return '';
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
    enablejsapi: '1',
    autoplay: autoplay ? '1' : '0',
  });
  if (typeof start === 'number' && start > 0) {
    params.set('start', String(Math.floor(start)));
  }

  const rawId = String(target.youtubeId || target.id || '').trim();
  const cleanId = rawId.replace(/^(playlist-|video-|pl-)/, '');
  const playlistId = target.playlistId || (target.type === 'playlist' ? cleanId : (rawId.startsWith('PL') ? rawId : (cleanId.startsWith('PL') ? cleanId : undefined)));
  const isPlaylist = target.type === 'playlist' || cleanId.startsWith('PL') || (!target.youtubeId && !!target.playlistId);

  let path;
  if (isPlaylist && (!target.youtubeId || target.youtubeId.startsWith('PL') || target.type === 'playlist')) {
    path = 'videoseries';
    if (playlistId) params.set('list', playlistId);
  } else if (target.youtubeId && !target.youtubeId.startsWith('PL')) {
    path = target.youtubeId;
    if (playlistId) params.set('list', playlistId);
  } else if (playlistId) {
    path = 'videoseries';
    params.set('list', playlistId);
  } else if (cleanId && !cleanId.startsWith('PL')) {
    path = cleanId;
  } else {
    return '';
  }

  if (loop) {
    params.set('loop', '1');
    if (path !== 'videoseries') params.set('playlist', path);
  }

  return `https://www.youtube-nocookie.com/embed/${path}?${params.toString()}`;
}

/**
 * Resolves a target track or playlist by ID, youtubeId, URL, or tape key from an array of tracks
 */
export function resolveTargetTrack(trackOrId, tracksList = []) {
  if (!trackOrId) return tracksList[0] || null;
  if (typeof trackOrId === 'object' && (trackOrId.youtubeId || trackOrId.id)) return trackOrId;

  const idStr = String(trackOrId).trim();

  // 1. Exact ID match
  let found = tracksList.find((t) => t.id === idStr);
  if (found) return found;

  // 2. Exact youtubeId match
  found = tracksList.find((t) => t.youtubeId === idStr);
  if (found) return found;

  // 3. Stripped prefix
  const cleanId = idStr.replace(/^(playlist-|video-|pl-)/, '');
  found = tracksList.find((t) => t.youtubeId === cleanId || t.playlistId === cleanId || t.stationId === idStr || (t.id && t.id.includes(cleanId)));
  if (found) return found;

  // 4. URL string
  if (idStr.includes('youtube.com') || idStr.includes('youtu.be')) {
    const parsed = parseYouTubeInput(idStr);
    if (parsed) {
      found = tracksList.find((t) => t.youtubeId === parsed.id || t.playlistId === parsed.id);
      if (found) return found;
      return {
        id: `${parsed.type}-${parsed.id}`,
        type: parsed.type,
        youtubeId: parsed.id,
        playlistId: parsed.type === 'playlist' ? parsed.id : undefined,
        title: parsed.type === 'playlist' ? 'YouTube Playlist' : 'YouTube Sound Signal',
        artist: 'Odd Frequency Stream',
        genre: 'void',
        url: idStr,
      };
    }
  }

  // 5. Playlist ID (starts with PL)
  if (cleanId.startsWith('PL')) {
    found = tracksList.find((t) => t.playlistId === cleanId || (t.stationId && t.stationId.includes(cleanId)));
    if (found) return found;

    return {
      id: `playlist-${cleanId}`,
      type: 'playlist',
      youtubeId: cleanId,
      playlistId: cleanId,
      title: 'Odd Frequency Playlist Station',
      artist: 'Curated YouTube Stream',
      genre: 'void',
    };
  }

  return tracksList[0] || null;
}

/* -------------------------------------------------------------------------- */
/*  3. SMALL UTILITIES                                                        */
/* -------------------------------------------------------------------------- */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const abortError = () => new DOMException('Aborted', 'AbortError');

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

const inRange = ([lo, hi], h, shift = 0) => lo + ((h >>> shift) % (hi - lo + 1));

function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const hx = (x) => Math.round(255 * x).toString(16).padStart(2, '0');
  return `#${hx(f(0))}${hx(f(8))}${hx(f(4))}`;
}

function accentFor(h) {
  const hue = inRange(THEME.hueRanges[h % THEME.hueRanges.length], h, 4);
  return hslToHex(hue, inRange(THEME.saturation, h, 12), inRange(THEME.lightness, h, 20));
}

export function formatDuration(sec) {
  if (!sec || sec < 0) return '';
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = Math.floor(sec % 60);
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
}

const formatRuntime = (sec) => {
  const min = Math.round(sec / 60);
  return min >= 120 ? `${(min / 60).toFixed(1)} HR` : `${min} MIN`;
};

function parseIsoDuration(iso = '') {
  const m = iso.match(/^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!m) return 0;
  const [d, h, mi, s] = m.slice(1).map((x) => Number(x || 0));
  return d * 86400 + h * 3600 + mi * 60 + s;
}

async function pool(items, limit, worker) {
  const out = new Array(items.length).fill(null);
  let next = 0;
  const run = async () => {
    while (next < items.length) {
      const i = next++;
      try { out[i] = await worker(items[i], i); } catch { out[i] = null; }
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return out;
}

let serialChain = Promise.resolve();
function serial(fn) {
  const run = serialChain.then(fn, fn);
  serialChain = run.catch(() => { });
  return run;
}

/** localStorage wrapper that never throws (private mode, quota, SSR). */
const store = {
  get(k) {
    try { const r = localStorage.getItem(CONFIG.storagePrefix + k); return r ? JSON.parse(r) : null; } catch { return null; }
  },
  set(k, v) { try { localStorage.setItem(CONFIG.storagePrefix + k, JSON.stringify(v)); } catch { /* quota */ } },
  del(k) { try { localStorage.removeItem(CONFIG.storagePrefix + k); } catch { /* noop */ } },
};

async function fetchJson(url, { signal, retries = 1 } = {}) {
  for (let attempt = 0; ; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), CONFIG.fetchTimeoutMs);
    const onAbort = () => ctrl.abort();
    signal?.addEventListener('abort', onAbort, { once: true });
    try {
      const res = await fetch(url, { signal: ctrl.signal });
      if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status}`), { status: res.status });
      return await res.json();
    } catch (err) {
      const clientError = err.status >= 400 && err.status < 500;
      if (signal?.aborted || clientError || attempt >= retries) throw err;
      await sleep(400 * (attempt + 1));
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
    }
  }
}

/* -------------------------------------------------------------------------- */
/*  4. METADATA (oEmbed) + TITLE CLEANING                                     */
/* -------------------------------------------------------------------------- */

const NOISE_RE = /\s*[([【][^)\]】]*(official|lyrics?|video|audio|visuali[sz]er|\bhd\b|\bhq\b|4k|remaster(?:ed)?)[^)\]】]*[)\]】]/gi;

function cleanChannel(name = '') {
  return name.replace(/\s*-\s*Topic$/i, '').replace(/VEVO$/i, '').trim() || 'YouTube';
}

/** "Artist - Song (Official Video)" -> { artist, title }. Falls back to the channel name. */
export function parseTrackTitle(rawTitle = '', channel = '') {
  const t = rawTitle.replace(NOISE_RE, '').replace(/\s{2,}/g, ' ').trim() || rawTitle;
  const m = t.match(/^(.{1,60}?)\s+[-–—]\s+(.+)$/);
  return m
    ? { artist: m[1].trim(), title: m[2].trim() }
    : { artist: cleanChannel(channel), title: t };
}

/**
 * oEmbed lookup. Returns:
 *   { title, author, thumbnail }  on success
 *   { unavailable: true }         if the video/playlist is private, deleted or non-embeddable
 *   null                          on network failure (not cached)
 */
export async function fetchYouTubeMetadata(type, id, { signal } = {}) {
  const cacheKey = `meta:${type}:${id}`;
  const cached = store.get(cacheKey);
  if (cached && Date.now() - cached.at < CONFIG.metaTtlMs) return cached.data;

  try {
    const oembed = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(canonicalUrl({ type, id }))}`;
    const d = await fetchJson(oembed, { signal });
    const data = { title: d.title || '', author: d.author_name || '', thumbnail: d.thumbnail_url || '' };
    store.set(cacheKey, { at: Date.now(), data });
    return data;
  } catch (err) {
    if ([401, 403, 404].includes(err.status)) {
      const data = { unavailable: true };
      store.set(cacheKey, { at: Date.now(), data });
      return data;
    }
    return null;
  }
}

async function trackFromVideo(videoId, { signal } = {}) {
  const meta = await fetchYouTubeMetadata('video', videoId, { signal });
  if (meta?.unavailable) return null;                       // dead / private / not embeddable
  if (!meta) return { youtubeId: videoId, title: 'Unknown Signal', artist: 'YouTube', durationSec: 0, thumbnail: getThumbnail(videoId) };
  const { artist, title } = parseTrackTitle(meta.title, meta.author);
  return { youtubeId: videoId, title, artist, durationSec: 0, thumbnail: meta.thumbnail || getThumbnail(videoId, 'mq') };
}

/* -------------------------------------------------------------------------- */
/*  5. PLAYLIST RESOLUTION                                                    */
/* -------------------------------------------------------------------------- */

let iframeApiPromise = null;
function loadIframeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!iframeApiPromise) {
    iframeApiPromise = new Promise((resolve, reject) => {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(window.YT); };
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.onerror = () => { iframeApiPromise = null; reject(new Error('YouTube IFrame API failed to load')); };
      document.head.appendChild(script);
      setTimeout(() => reject(new Error('YouTube IFrame API timed out')), CONFIG.iframeTimeoutMs);
    });
  }
  return iframeApiPromise;
}

/** Ask a hidden player for the playlist's video IDs. No API key required. */
async function resolveViaIframe(playlistId, signal) {
  const YT = await loadIframeApi();
  return new Promise((resolve, reject) => {
    const host = document.createElement('div');
    host.setAttribute('aria-hidden', 'true');
    host.style.cssText = 'position:fixed;left:-9999px;top:0;width:1px;height:1px;opacity:0;pointer-events:none';
    const mount = document.createElement('div');
    host.appendChild(mount);
    document.body.appendChild(host);

    let player, done = false, poll;
    const finish = (err, ids) => {
      if (done) return;
      done = true;
      clearInterval(poll); clearTimeout(timer);
      try { player?.destroy(); } catch { /* noop */ }
      host.remove();
      if (err) {
        reject(err);
      } else {
        resolve(ids);
      }
    };
    const timer = setTimeout(() => finish(new Error('Timed out reading playlist')), CONFIG.iframeTimeoutMs);
    signal?.addEventListener('abort', () => finish(abortError()), { once: true });

    const playerVars = { listType: 'playlist', list: playlistId, autoplay: 0, controls: 0 };
    if (location.protocol.startsWith('http')) playerVars.origin = location.origin;

    player = new YT.Player(mount, {
      width: '1', height: '1', playerVars,
      events: {
        onReady: () => {
          poll = setInterval(() => {
            const ids = player.getPlaylist?.();
            if (ids?.length) finish(null, ids);
          }, 250);
        },
        onError: (e) => finish(new Error(`Player error ${e.data} (private or unavailable playlist?)`)),
      },
    });
  });
}

/** Full metadata incl. durations via the Data API (only used when CONFIG.apiKey is set). */
async function resolveViaDataApi(playlistId, signal) {
  const api = (path, params) =>
    fetchJson(`https://www.googleapis.com/youtube/v3/${path}?${new URLSearchParams({ ...params, key: CONFIG.apiKey })}`, { signal });

  const info = await api('playlists', { part: 'snippet', id: playlistId });
  const snip = info.items?.[0]?.snippet;

  const items = [];
  let pageToken;
  do {
    const page = await api('playlistItems', {
      part: 'snippet,status', maxResults: 50, playlistId, ...(pageToken && { pageToken }),
    });
    for (const it of page.items || []) {
      const vid = it.snippet?.resourceId?.videoId;
      const t = it.snippet?.title;
      if (!vid || t === 'Private video' || t === 'Deleted video' || it.status?.privacyStatus === 'private') continue;
      items.push({ vid, title: t, channel: it.snippet.videoOwnerChannelTitle, thumb: it.snippet.thumbnails?.medium?.url });
    }
    pageToken = page.nextPageToken;
  } while (pageToken && items.length < CONFIG.maxTracksPerPlaylist);

  const durations = new Map();
  for (let i = 0; i < items.length; i += 50) {
    const chunk = items.slice(i, i + 50).map((x) => x.vid).join(',');
    const vids = await api('videos', { part: 'contentDetails,status', id: chunk, maxResults: 50 });
    for (const v of vids.items || []) {
      if (v.status?.embeddable === false) durations.set(v.id, -1);
      else durations.set(v.id, parseIsoDuration(v.contentDetails?.duration));
    }
  }

  return {
    title: snip?.title, author: snip?.channelTitle,
    thumbnail: snip?.thumbnails?.medium?.url,
    tracks: items
      .filter((x) => durations.get(x.vid) !== -1)
      .map((x) => ({
        youtubeId: x.vid, durationSec: durations.get(x.vid) || 0,
        thumbnail: x.thumb || getThumbnail(x.vid, 'mq'),
        ...parseTrackTitle(x.title, x.channel),
      })),
  };
}

async function resolvePlaylist(playlistId, { signal } = {}) {
  if (CONFIG.apiKey) {
    try { return await resolveViaDataApi(playlistId, signal); }
    catch (err) { if (signal?.aborted) throw err; console.warn('[catalog] Data API failed, using IFrame fallback:', err.message); }
  }

  const [meta, ids] = await Promise.all([
    fetchYouTubeMetadata('playlist', playlistId, { signal }),
    serial(() => resolveViaIframe(playlistId, signal)),
  ]);
  const unique = [...new Set(ids)].slice(0, CONFIG.maxTracksPerPlaylist);
  const tracks = (await pool(unique, CONFIG.concurrency, (id) => trackFromVideo(id, { signal }))).filter(Boolean);

  return {
    title: meta?.title || '', author: meta?.author ? cleanChannel(meta.author) : '',
    thumbnail: meta?.thumbnail || '', tracks,
  };
}

/* -------------------------------------------------------------------------- */
/*  6. DERIVING STATIONS / MIXTAPES / GENRES FROM RAW DATA                    */
/* -------------------------------------------------------------------------- */

function decorate(rec, index, usedSlots) {
  const h = hash(rec.key);
  const isSingles = rec.key === 'singles';
  const id = isSingles ? 'custom' : `pl-${rec.playlistId}`;

  // Unique, stable fake "frequency" 88.0 - 107.9 FM
  let slot = h % 200;
  while (usedSlots.has(slot)) slot = (slot + 1) % 200;
  usedSlots.add(slot);

  const tracks = rec.tracks.map((t, i) => ({
    id: `${id}:${t.youtubeId}`,
    youtubeId: t.youtubeId,
    playlistId: isSingles ? undefined : rec.playlistId,
    stationId: id,
    genre: id,
    index: i,
    title: t.title,
    artist: t.artist,
    duration: formatDuration(t.durationSec),
    durationSec: t.durationSec || 0,
    thumbnail: t.thumbnail || getThumbnail(t.youtubeId, 'mq'),
    url: canonicalUrl({ type: 'video', id: t.youtubeId }),
  }));

  const knownSec = tracks.reduce((a, t) => a + t.durationSec, 0);
  const runtime = knownSec ? formatRuntime(knownSec) : `${tracks.length} TRACKS`;
  const name = rec.nameOverride || rec.title || (isSingles ? THEME.singlesName : `Playlist ${rec.playlistId.slice(-6)}`);
  const author = rec.author || 'YouTube';

  const topArtists = [...new Set(tracks.map((t) => t.artist))].slice(0, 3);
  const more = tracks.length - topArtists.length;
  const description = topArtists.length
    ? `${tracks.length} tracks featuring ${topArtists.join(', ')}${more > 0 ? ` and ${more} more` : ''}.`
    : `${tracks.length} tracks.`;

  const station = {
    id, key: rec.key, playlistId: isSingles ? undefined : rec.playlistId,
    name,
    subtitle: `${author} // YouTube`,
    genre: isSingles ? 'User Added' : 'YouTube Playlist',
    frequency: `${(88 + slot / 10).toFixed(1)} FM // ${tracks.length} TRACKS`,
    description,
    color: accentFor(h),
    synthType: THEME.synthTypes[h % THEME.synthTypes.length],
    length: runtime,
    trackCount: tracks.length,
    cover: rec.thumbnail || tracks[0]?.thumbnail || '',
    custom: !!rec.custom,
    tracks,
  };

  const mixtape = {
    id: `TAPE-${String(index + 1).padStart(2, '0')}`,
    stationId: id,
    title: name.toUpperCase(),
    curator: author,
    runtime,
    tracks: tracks.map((t, i) => `${String(i + 1).padStart(2, '0')}. ${t.title}`),
    trackList: tracks,
    cover: station.cover,
  };

  const genre = {
    id,
    label: name.toUpperCase(),
    tag: (name.split(/\s+/)[0] || 'MIX').replace(/[^\w]/g, '').slice(0, 6).toUpperCase() || 'MIX',
    desc: `${author} · ${tracks.length} tracks`,
    icon: THEME.icons[h % THEME.icons.length],
    color: station.color,
  };

  return { station, mixtape, genre };
}

/* -------------------------------------------------------------------------- */
/*  7. THE CATALOG STORE                                                      */
/* -------------------------------------------------------------------------- */

export function createCatalog({ sources = SOURCES, persist = true } = {}) {
  const listeners = new Set();
  const raw = new Map();             // source.key -> resolved playlist record
  let controller = new AbortController();

  const state = {
    status: 'idle',                  // idle | loading | ready | error
    stations: [], mixtapes: [], genres: [], tracks: [], errors: [],
  };

  /* ---- sources ---------------------------------------------------------- */
  const toSource = (entry, custom) => {
    const url = typeof entry === 'string' ? entry : entry?.url;
    const parsed = parseYouTubeInput(url);
    if (!parsed) return null;
    return {
      key: `${parsed.type}:${parsed.id}`, type: parsed.type, id: parsed.id,
      url: canonicalUrl(parsed), custom, name: typeof entry === 'object' ? entry.name : undefined,
    };
  };

  const getSources = () => {
    const seen = new Set();
    const stored = persist ? store.get('sources') || [] : [];
    return [...sources.map((s) => toSource(s, false)), ...stored.map((s) => toSource(s, true))]
      .filter((s) => s && !seen.has(s.key) && seen.add(s.key));
  };

  /* ---- state / events --------------------------------------------------- */
  const emit = () => {
    const snap = { ...state };
    listeners.forEach((fn) => { try { fn(snap); } catch (e) { console.error(e); } });
  };

  const setError = (key, message) => {
    state.errors = [...state.errors.filter((e) => e.key !== key), { key, message }];
  };
  const clearError = (key) => { state.errors = state.errors.filter((e) => e.key !== key); };

  function rebuild() {
    const order = getSources();
    const recs = order.filter((s) => s.type === 'playlist' && raw.has(s.key)).map((s) => {
      const r = raw.get(s.key);
      return { ...r, nameOverride: s.name, custom: s.custom };
    });
    if (raw.has('singles')) recs.push({ ...raw.get('singles'), custom: true });

    const used = new Set();
    const decorated = recs.map((r, i) => decorate(r, i, used));
    state.stations = decorated.map((d) => d.station);
    state.mixtapes = decorated.map((d) => d.mixtape);
    state.tracks = state.stations.flatMap((s) => s.tracks);
    state.genres = [
      { id: 'all', label: 'ALL FREQUENCIES', tag: 'ALL', desc: `${state.tracks.length} tracks`, icon: '⚡' },
      ...decorated.map((d) => d.genre),
    ];
    emit();
  }

  /* ---- loading ---------------------------------------------------------- */
  async function loadPlaylist(src, { force, signal }) {
    const cacheKey = `pl:${src.id}`;
    const cached = store.get(cacheKey);
    if (cached && !force) {
      raw.set(src.key, cached);
      rebuild();
      if (Date.now() - cached.fetchedAt < CONFIG.cacheTtlMs) return;   // fresh: done
    }
    try {
      const data = await resolvePlaylist(src.id, { signal });
      if (signal.aborted) return;
      if (!data.tracks.length) throw new Error('No playable tracks found (private, empty, or embedding disabled)');
      const rec = { ...data, key: src.key, playlistId: src.id, fetchedAt: Date.now() };
      raw.set(src.key, rec);
      if (persist) store.set(cacheKey, rec);
      clearError(src.key);
    } catch (err) {
      if (signal.aborted) return;
      console.warn(`[catalog] ${src.url}:`, err.message);
      if (!raw.has(src.key)) setError(src.key, err.message);          // keep stale data if we have it
    }
    rebuild();
  }

  async function loadSingles(videos, { signal }) {
    const tracks = (await pool(videos, CONFIG.concurrency, (v) => trackFromVideo(v.id, { signal }))).filter(Boolean);
    if (signal.aborted) return;
    if (tracks.length) raw.set('singles', { key: 'singles', title: THEME.singlesName, author: 'You', tracks, fetchedAt: Date.now() });
    else raw.delete('singles');
    rebuild();
  }

  async function load({ force = false } = {}) {
    controller.abort();
    controller = new AbortController();
    const { signal } = controller;
    state.status = 'loading';
    emit();

    const all = getSources();
    const playlists = all.filter((s) => s.type === 'playlist');
    const videos = all.filter((s) => s.type === 'video');

    await Promise.all([
      pool(playlists, 3, (p) => loadPlaylist(p, { force, signal })),
      videos.length ? loadSingles(videos, { signal }) : (raw.delete('singles'), Promise.resolve()),
    ]);
    if (signal.aborted) return;

    state.status = state.stations.length || !state.errors.length ? 'ready' : 'error';
    rebuild();
  }

  /* ---- public API ------------------------------------------------------- */
  return {
    getState: () => ({ ...state }),

    subscribe(fn) {
      listeners.add(fn);
      fn({ ...state });
      return () => listeners.delete(fn);
    },

    load,
    refresh: () => load({ force: true }),

    /** Add any YouTube link at runtime. Persisted, deduped, loaded immediately. */
    async add(input) {
      const parsed = parseYouTubeInput(input);
      if (!parsed) return { ok: false, error: 'That does not look like a YouTube video or playlist link.' };

      const key = `${parsed.type}:${parsed.id}`;
      if (getSources().some((s) => s.key === key)) return { ok: false, error: 'Already in your catalog.' };

      if (persist) store.set('sources', [...(store.get('sources') || []), canonicalUrl(parsed)]);
      const { signal } = controller;
      const src = getSources().find((s) => s.key === key);

      if (parsed.type === 'playlist') await loadPlaylist(src, { force: true, signal });
      else await loadSingles(getSources().filter((s) => s.type === 'video'), { signal });

      const error = state.errors.find((e) => e.key === key)?.message;
      if (error) { this.remove(key); return { ok: false, error }; }
      return { ok: true, key };
    },

    /** Remove a runtime-added source (SOURCES entries are removed by editing the file). */
    remove(key) {
      if (persist) store.set('sources', (store.get('sources') || []).filter((u) => {
        const p = parseYouTubeInput(u);
        return !p || `${p.type}:${p.id}` !== key;
      }));
      raw.delete(key);
      clearError(key);
      if (key.startsWith('video:')) {
        const vids = getSources().filter((s) => s.type === 'video');
        if (vids.length) {
          loadSingles(vids, { signal: controller.signal });
        } else {
          raw.delete('singles');
          rebuild();
        }
      } else {
        rebuild();
      }
    },

    /** Paste-ready lines to move runtime additions into SOURCES permanently. */
    exportSourcesCode() {
      return getSources().filter((s) => s.custom).map((s) => `  '${s.url}',`).join('\n');
    },

    destroy() { controller.abort(); listeners.clear(); },
  };
}

/** Ready-to-use singleton. */
export const catalog = createCatalog();

/**
 * Convenience helper to return current API key
 */
export function getYouTubeApiKey() {
  return CONFIG.apiKey;
}

/**
 * Returns a thumbnail URL with quality and custom fallback
 */
export function getYouTubeThumbnail(videoId, quality = 'hq', customThumbnail = null) {
  if (customThumbnail) return customThumbnail;
  return getThumbnail(videoId, quality);
}

/**
 * Converts a duration string (e.g. "3:14", "1:02:15") or seconds into numeric seconds
 */
export function parseDurationSec(str) {
  if (typeof str === 'number') return Math.max(0, Math.floor(str));
  if (!str || typeof str !== 'string') return 0;
  const parts = str.trim().split(':').map(Number);
  if (parts.some(isNaN)) return 0;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 1) return parts[0];
  return 0;
}

/**
 * Normalizes an array of tracks or raw URL strings
 */
export function normalizeTracks(tracks) {
  if (!Array.isArray(tracks)) return [];
  return tracks.map((t, idx) => {
    if (typeof t === 'string') {
      const parsed = parseYouTubeInput(t);
      const id = parsed?.id || `yt-${idx}`;
      const type = parsed?.type || 'video';
      return {
        id: `${type}-${id}`,
        url: t,
        youtubeId: id,
        type,
        title: type === 'playlist' ? 'YouTube Playlist' : 'YouTube Audio',
        artist: 'YouTube Signal',
        genre: 'void',
        duration: '',
        durationSec: 0,
        thumbnail: getThumbnail(id, 'mq')
      };
    }
    const durSec = t.durationSec || parseDurationSec(t.duration) || 0;
    return {
      id: t.id || `${t.type || 'video'}-${t.youtubeId || idx}`,
      url: t.url || (t.youtubeId ? `https://www.youtube.com/watch?v=${t.youtubeId}` : ''),
      youtubeId: t.youtubeId,
      playlistId: t.playlistId,
      stationId: t.stationId,
      type: t.type || (t.playlistId ? 'playlist' : 'video'),
      title: t.title || 'YouTube Audio',
      artist: t.artist || 'YouTube Signal',
      genre: t.genre || 'void',
      duration: t.duration || formatDuration(durSec),
      durationSec: durSec,
      thumbnail: t.thumbnail || getThumbnail(t.youtubeId, 'mq'),
      note: t.note
    };
  }).filter(Boolean);
}

/**
 * Initial curated seed tracks (available immediately before network resolve)
 */
export const DEFAULT_TRACKS = [
  'https://youtube.com/playlist?list=PLX3pJ_cUqMmg',
  'https://youtube.com/playlist?list=PLgEpjxqlzb6k8wLBYqYcTspMth9XrnKHh',
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
  }
];

export const GENRES = [
  { id: 'all', label: 'ALL FREQUENCIES', tag: 'ALL', icon: '⚡' },
  { id: 'void', label: 'THE VOID', tag: 'VOID', desc: 'Darkwave / Romantic Goth / Post-Punk', icon: '🌑' },
  { id: 'feed', label: 'THE FEED', tag: 'FEED', desc: 'Hyperpop / Breakcore / Glitch / Cyber Rave', icon: '🌀' },
  { id: 'drone', label: 'SUBTERRANEAN RADIO', tag: 'LO-FI', desc: 'Lo-Fi Tape Beats / Ambient Drone', icon: '📼' },
  { id: 'custom', label: 'MY MIXTAPE', tag: 'CUSTOM', desc: 'User-Added Songs & Playlists', icon: '💾' }
];

export function playTrack(trackId, options = {}) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('odd-play-track', {
      detail: { trackId, autoPlay: true, ...options }
    }));
  }
}

export function playGenre(genre) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('odd-play-track', {
      detail: { genre, autoPlay: true }
    }));
  }
}

/**
 * ============================================================================
 * SYNCHRONIZED GLOBAL RADIO BROADCAST ENGINE
 * ============================================================================
 * Live continuous 24/7 subterranean audio stream.
 * All listeners around the world hear the exact same track at the exact same
 * second, synchronized to a deterministic UTC epoch clock.
 */
export const BROADCAST_PLAYLIST = [
  {
    id: 'void-01',
    title: 'Sudno (Boris Ryzhy)',
    artist: 'Molchat Doma',
    genre: 'void',
    youtubeId: 'HR5zpFs7YpY',
    duration: '2:21',
    durationSec: 141,
    note: 'Belarusian Post-Punk / Coldwave Anthem'
  },
  {
    id: 'void-02',
    title: 'The Perfect Girl',
    artist: 'Mareux',
    genre: 'void',
    youtubeId: 'sT13IBB4b5w',
    duration: '3:14',
    durationSec: 194,
    note: 'Darkwave / Cyber-Goth Essential'
  },
  {
    id: 'void-03',
    title: 'Dark Beach',
    artist: 'PASTEL GHOST',
    genre: 'void',
    youtubeId: '9bYvI7s-Jm4',
    duration: '3:42',
    durationSec: 222,
    note: 'Ethereal Witch House / Dark Dream Pop'
  },
  {
    id: 'void-04',
    title: 'Gallowdance',
    artist: 'Lebanon Hanover',
    genre: 'void',
    youtubeId: 'WPw7nlluRdc',
    duration: '3:50',
    durationSec: 230,
    note: 'Minimal Wave / Post-Punk Heavyweight'
  },
  {
    id: 'void-05',
    title: 'Pain',
    artist: 'Boy Harsher',
    genre: 'void',
    youtubeId: 'H1Zb4JmflU4',
    duration: '7:18',
    durationSec: 438,
    note: 'Raw Industrial EBM / Dark Electronic'
  },
  {
    id: 'feed-01',
    title: 'Ghost',
    artist: 'Machine Girl',
    genre: 'feed',
    youtubeId: 'qU2m766J68Q',
    duration: '4:18',
    durationSec: 258,
    note: 'Digital Hardcore / Underground Breakcore'
  },
  {
    id: 'feed-02',
    title: 'Cyberia Lyr1',
    artist: 'Sewerslvt',
    genre: 'feed',
    youtubeId: 'uL5Z4d7Hek4',
    duration: '3:55',
    durationSec: 235,
    note: 'Atmospheric DNB / Cyber Breakcore'
  },
  {
    id: 'feed-03',
    title: "LET'S GO",
    artist: 'TOKYOPILL',
    genre: 'feed',
    youtubeId: 'u_L70-W3a78',
    duration: '2:30',
    durationSec: 150,
    note: 'Hyper-Glitch DNB / Web Rave'
  },
  {
    id: 'drone-01',
    title: "The Girl I Haven't Met",
    artist: 'Kudasaibeats',
    genre: 'drone',
    youtubeId: 'XFknYJ6tN4E',
    duration: '2:15',
    durationSec: 135,
    note: 'Dusty Cassette Tape Beat'
  },
  {
    id: 'drone-02',
    title: 'Affection',
    artist: 'jinsang',
    genre: 'drone',
    youtubeId: 'e8M6v8W1W-c',
    duration: '2:10',
    durationSec: 130,
    note: 'Vintage Analog Lo-Fi Tape Loop'
  }
];

export const TOTAL_BROADCAST_SECONDS = BROADCAST_PLAYLIST.reduce((acc, t) => acc + t.durationSec, 0); // 2183s
export const BROADCAST_START_EPOCH = 1704067200; // Jan 1 2024 00:00:00 UTC (Fixed reference anchor)

/**
 * Calculates the current live synchronized broadcast track and seek position.
 * Returns identical track and second offset for any user worldwide at any given instant.
 */
export function getLiveBroadcastStatus(nowMs = Date.now()) {
  const nowSec = Math.floor(nowMs / 1000);
  const elapsed = nowSec - BROADCAST_START_EPOCH;
  const cycleSec = ((elapsed % TOTAL_BROADCAST_SECONDS) + TOTAL_BROADCAST_SECONDS) % TOTAL_BROADCAST_SECONDS;

  let accum = 0;
  for (let i = 0; i < BROADCAST_PLAYLIST.length; i++) {
    const track = BROADCAST_PLAYLIST[i];
    if (cycleSec < accum + track.durationSec) {
      const seekOffset = cycleSec - accum;
      return {
        track,
        trackIndex: i,
        seekSeconds: Math.floor(seekOffset),
        remainingSeconds: track.durationSec - Math.floor(seekOffset),
        cycleSeconds: cycleSec,
        totalBroadcastSeconds: TOTAL_BROADCAST_SECONDS,
        isLive: true
      };
    }
    accum += track.durationSec;
  }

  return {
    track: BROADCAST_PLAYLIST[0],
    trackIndex: 0,
    seekSeconds: 0,
    remainingSeconds: BROADCAST_PLAYLIST[0].durationSec,
    cycleSeconds: 0,
    totalBroadcastSeconds: TOTAL_BROADCAST_SECONDS,
    isLive: true
  };
}

export function playLiveBroadcast() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('odd-play-live'));
  }
}

export const RADIO_STATIONS = [
  {
    id: 'void',
    name: 'The Void',
    subtitle: 'Darkwave / Romantic Goth // YouTube',
    genre: 'Darkwave / Post-Punk / Grunge',
    bpm: '124 BPM',
    frequency: '98.4 FM // LIVE STREAM',
    description: 'Coldwave synths, melancholic basslines, and subterranean industrial grit.',
    color: '#b026ff',
    synthType: 'grunge',
    length: '3:48'
  },
  {
    id: 'feed',
    name: 'The Feed',
    subtitle: 'Breakcore / Glitch Rave // YouTube',
    genre: 'Hyperpop / Glitch / Cyber Rave',
    bpm: '140 BPM',
    frequency: '104.2 FM // RAVE CELL',
    description: 'Glitch claps, high-speed breaks, and saturated digital hardcore frequencies.',
    color: '#a855f7',
    synthType: 'electro',
    length: '2:54'
  },
  {
    id: 'drone',
    name: 'Subterranean Radio',
    subtitle: 'Tape Loops // Sub Radio',
    genre: 'Lo-Fi Beats / Tape Loops / Dark Drone',
    bpm: '72 BPM',
    frequency: '91.7 FM // CASSETTE FEED',
    description: 'Dusty cassette loops, warm analog flutter, and hypnotic subterranean drift.',
    color: '#38bdf8',
    synthType: 'ambient',
    length: '4:12'
  },
  {
    id: 'custom',
    name: 'My Mixtape',
    subtitle: 'User Archive // Custom Stream',
    genre: 'Personal Underground Vault',
    bpm: '130 BPM',
    frequency: '88.9 FM // FREQUENCY VAULT',
    description: 'Personal and community curation streamed directly through the sound deck.',
    color: '#22c55e',
    synthType: 'house',
    length: '3:30'
  }
];

export const MIXTAPES = [
  {
    id: 'TAPE-01',
    title: 'ODD FREQUENCY #1 // PLAYLIST',
    curator: 'Obscure Head',
    runtime: '19 TRACKS',
    playlistId: 'PLX3pJ_cUqMmg',
    tracks: [
      '01. Cigarettes After Sex - Crush',
      '02. Summer Salt - One Last Time',
      '03. Michael Seyer - Lucky Love',
      '04. Full 19 Track Session...'
    ],
    cover: 'https://i.ytimg.com/vi/Pvv-hrcIgCI/hqdefault.jpg'
  },
  {
    id: 'TAPE-02',
    title: 'ROMANTIC GOTH // THE VOID',
    curator: 'Underground Cell',
    runtime: 'PLAYLIST',
    playlistId: 'PLgEpjxqlzb6k8wLBYqYcTspMth9XrnKHh',
    tracks: [
      '01. Molchat Doma - Sudno',
      '02. Mareux - The Perfect Girl',
      '03. PASTEL GHOST - Dark Beach',
      '04. Lebanon Hanover - Gallowdance'
    ],
    cover: 'images/brat-tee.jpg'
  },
  {
    id: 'TAPE-03',
    title: 'THE FEED // GLITCH CELL',
    curator: 'Cyber Underground',
    runtime: '36 MIN',
    tracks: [
      '01. Machine Girl - Ghost',
      '02. Sewerslvt - Cyberia Lyr1',
      '03. TOKYOPILL - LET\'S GO',
      '04. 100 gecs - Doritos & Fritos'
    ],
    cover: 'images/slipknot-tee.jpg'
  }
];