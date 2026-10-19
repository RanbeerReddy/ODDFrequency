import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  DEFAULT_TRACKS, 
  GENRES, 
  parseYouTubeInput, 
  getYouTubeThumbnail,
  normalizeTracks,
  fetchYouTubeMetadata,
  getEmbedUrl,
  resolveTargetTrack,
  catalog
} from '../data/musicTracks.js';
import { audioPlayerService } from '../utils/audioEngine.js';

const PLAYER_ELEMENT_ID = 'odd-frequency-yt-embed';

export default function YouTubePlayer() {
  // --- Persistent Storage State ---
  const [customTracks, setCustomTracks] = useState(() => {
    try {
      const stored = localStorage.getItem('of_custom_music_tracks');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Reactive dynamic catalog loaded via YouTube API
  const [catalogTracks, setCatalogTracks] = useState([]);

  useEffect(() => {
    const unsub = catalog.subscribe(snap => {
      if (snap.tracks && snap.tracks.length > 0) {
        setCatalogTracks(snap.tracks);
      }
    });
    catalog.load();
    return unsub;
  }, []);

  // Combine dynamic catalog (or default fallback) and user-added tracks
  const allTracks = useMemo(() => {
    const defaults = normalizeTracks(DEFAULT_TRACKS);
    const combined = [...(catalogTracks.length > 0 ? catalogTracks : []), ...defaults, ...customTracks];
    const seen = new Set();
    const unique = [];
    for (const t of combined) {
      if (t && t.id && !seen.has(t.id)) {
        seen.add(t.id);
        unique.push(t);
      }
    }
    return unique;
  }, [catalogTracks, customTracks]);

  // Dynamic live metadata state populated by YouTube API
  const [liveMetadata, setLiveMetadata] = useState({});

  // --- Player State ---
  const [activeGenre, setActiveGenre] = useState('all');
  const [currentTrackId, setCurrentTrackId] = useState(() => {
    const list = normalizeTracks(DEFAULT_TRACKS);
    return list[0]?.id || 'void-01';
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isShuffle, setIsShuffle] = useState(true); // Default to shuffle/random for dynamic radio experience
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [embedAutoplay, setEmbedAutoplay] = useState(false);
  const [isTheatre, setIsTheatre] = useState(false);
  const [showScanlines, setShowScanlines] = useState(true);
  
  // Synth Drone Mode (original procedural tape drone fallback)
  const [isSynthDroneMode, setIsSynthDroneMode] = useState(false);

  // UI Panels - unified cyber-hardware deck
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDeckVisible, setIsDeckVisible] = useState(true);
  const [drawerTab, setDrawerTab] = useState('tracklist'); // 'tracklist', 'genres', 'add'
  const [feedbackToast, setFeedbackToast] = useState(null);

  // Form State for Adding Custom Tracks
  const [inputUrl, setInputUrl] = useState('');
  const [inputTitle, setInputTitle] = useState('');
  const [inputArtist, setInputArtist] = useState('');
  const [inputGenre, setInputGenre] = useState('void');
  const [copiedCode, setCopiedCode] = useState(false);

  // --- Refs ---
  const iframeRef = useRef(null);
  const playerRef = useRef(null);
  const progressTimerRef = useRef(null);
  const handlePlayNextRef = useRef(null);

  // Filtered tracks based on selected genre
  const genreTracks = useMemo(() => {
    if (activeGenre === 'all') return allTracks;
    return allTracks.filter(t => t.genre === activeGenre || t.stationId === activeGenre);
  }, [allTracks, activeGenre]);

  // Active track object resolved with fallback support
  const currentTrack = useMemo(() => {
    return resolveTargetTrack(currentTrackId, allTracks) || genreTracks[0] || allTracks[0];
  }, [allTracks, currentTrackId, genreTracks]);

  // Computed embed URL for active track
  const embedUrl = useMemo(() => {
    if (!currentTrack) return '';
    return getEmbedUrl(currentTrack, { autoplay: embedAutoplay });
  }, [currentTrack, embedAutoplay]);

  // Toast Helper
  const showPlayerToast = useCallback((msg) => {
    setFeedbackToast(msg);
    setTimeout(() => {
      setFeedbackToast(null);
    }, 3200);
  }, []);

  // Format seconds to mm:ss
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Sync live metadata (title, artist, duration) dynamically from YouTube player instance
  const syncLivePlayerInfo = useCallback((player) => {
    if (!player || typeof player.getVideoData !== 'function') return;
    try {
      const data = player.getVideoData();
      const dur = player.getDuration?.();
      if (data && (data.title || data.author)) {
        setLiveMetadata(prev => {
          const currentEntry = prev[currentTrackId] || {};
          if (currentEntry.title === data.title && currentEntry.artist === data.author && (!dur || currentEntry.rawDuration === dur)) {
            return prev;
          }
          return {
            ...prev,
            [currentTrackId]: {
              ...currentEntry,
              title: data.title || currentEntry.title,
              artist: data.author || currentEntry.artist,
              rawDuration: dur,
              duration: dur && dur > 0 ? formatTime(dur) : currentEntry.duration,
              thumbnail: data.video_id ? `https://img.youtube.com/vi/${data.video_id}/mqdefault.jpg` : currentEntry.thumbnail
            }
          };
        });
      }
    } catch {
      // player not ready
    }
  }, [currentTrackId]);

  // Dynamically fetch metadata via YouTube Data API / oEmbed for any track without hardcoded details
  useEffect(() => {
    allTracks.forEach(track => {
      if (track.autoFetch && !liveMetadata[track.id]) {
        fetchYouTubeMetadata(track.url || track.youtubeId, track.type).then(meta => {
          if (meta) {
            setLiveMetadata(prev => ({
              ...prev,
              [track.id]: {
                ...prev[track.id],
                title: meta.title || prev[track.id]?.title,
                artist: meta.artist || prev[track.id]?.artist,
                thumbnail: meta.thumbnail || prev[track.id]?.thumbnail,
                duration: meta.duration || prev[track.id]?.duration
              }
            }));
          }
        });
      }
    });
  }, [allTracks, liveMetadata]);

  // Direct command dispatcher to YouTube iframe and YT.Player API
  const sendPlayerCommand = useCallback((func, args = []) => {
    const argsArray = Array.isArray(args) ? args : [args];

    // Priority 1: YT.Player API if mounted
    if (playerRef.current && typeof playerRef.current[func] === 'function') {
      try {
        playerRef.current[func](...argsArray);
        return true;
      } catch {
        // Fallback to postMessage
      }
    }

    // Priority 2: Standard YouTube postMessage to iframe window
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func: func,
            args: argsArray
          }),
          '*'
        );
        return true;
      } catch (err) {
        console.warn('postMessage to YouTube iframe failed:', err);
      }
    }
    return false;
  }, []);

  // Playback of a specific Track ID
  const playTrackById = useCallback((trackId, autoPlay = true) => {
    const targetTrack = resolveTargetTrack(trackId, allTracks);
    if (!targetTrack) return;

    if (isSynthDroneMode) {
      audioPlayerService.stop();
      setIsSynthDroneMode(false);
    }

    setCurrentTrackId(targetTrack.id);
    setCurrentTime(0);
    setIsDeckVisible(true);
    setIsMinimized(false);

    if (autoPlay) {
      setEmbedAutoplay(true);
      setIsPlaying(true);
      if (targetTrack.type === 'playlist') {
        sendPlayerCommand('loadPlaylist', [{ list: targetTrack.youtubeId || targetTrack.playlistId, listType: 'playlist' }]);
      } else {
        sendPlayerCommand('loadVideoById', [targetTrack.youtubeId]);
      }
      sendPlayerCommand('playVideo');
      sendPlayerCommand('unMute');
      sendPlayerCommand('setVolume', [Math.round(volume * 100)]);
    } else {
      if (targetTrack.type === 'playlist') {
        sendPlayerCommand('cuePlaylist', [{ list: targetTrack.youtubeId || targetTrack.playlistId, listType: 'playlist' }]);
      } else {
        sendPlayerCommand('cueVideoById', [targetTrack.youtubeId]);
      }
    }
  }, [allTracks, isSynthDroneMode, sendPlayerCommand, volume]);

  // Navigation: Next & Previous
  const handlePlayNext = useCallback(() => {
    if (currentTrack?.type === 'playlist') {
      sendPlayerCommand('nextVideo');
    }

    if (genreTracks.length === 0) return;

    if (isShuffle) {
      let candidates = genreTracks.filter(t => t.id !== currentTrackId);
      if (candidates.length === 0) candidates = genreTracks;
      const chosen = candidates[Math.floor(Math.random() * candidates.length)];
      if (chosen) playTrackById(chosen.id, true);
    } else {
      const currentIndex = genreTracks.findIndex(t => t.id === currentTrackId);
      const nextIndex = (currentIndex + 1) % genreTracks.length;
      const nextTrack = genreTracks[nextIndex];
      if (nextTrack) playTrackById(nextTrack.id, true);
    }
  }, [currentTrack?.type, genreTracks, isShuffle, currentTrackId, playTrackById, sendPlayerCommand]);

  const handlePlayPrev = useCallback(() => {
    if (currentTime > 4) {
      sendPlayerCommand('seekTo', [0, true]);
      setCurrentTime(0);
      return;
    }

    if (currentTrack?.type === 'playlist') {
      sendPlayerCommand('previousVideo');
    }

    if (genreTracks.length === 0) return;

    const currentIndex = genreTracks.findIndex(t => t.id === currentTrackId);
    const prevIndex = (currentIndex - 1 + genreTracks.length) % genreTracks.length;
    const prevTrack = genreTracks[prevIndex];
    if (prevTrack) playTrackById(prevTrack.id, true);
  }, [currentTime, currentTrack?.type, genreTracks, currentTrackId, playTrackById, sendPlayerCommand]);

  useEffect(() => {
    handlePlayNextRef.current = handlePlayNext;
  }, [handlePlayNext]);

  // -------------------------------------------------------------
  // YouTube postMessage Listener (Real-time sync)
  // -------------------------------------------------------------
  useEffect(() => {
    const handleMessage = (e) => {
      if (!e.data) return;
      let data = e.data;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch {
          return;
        }
      }
      if (!data || typeof data !== 'object') return;

      if (data.event === 'onStateChange') {
        const state = data.info;
        if (state === 1) { // PLAYING
          setIsPlaying(true);
          setIsBuffering(false);
        } else if (state === 2) { // PAUSED
          setIsPlaying(false);
          setIsBuffering(false);
        } else if (state === 3) { // BUFFERING
          setIsBuffering(true);
        } else if (state === 0) { // ENDED
          setIsPlaying(false);
          setIsBuffering(false);
          handlePlayNextRef.current?.();
        }
      }

      if (data.event === 'infoDelivery' && data.info) {
        const info = data.info;
        if (typeof info.currentTime === 'number') {
          setCurrentTime(info.currentTime);
        }
        if (typeof info.duration === 'number' && info.duration > 0) {
          setDuration(info.duration);
        }
        if (info.playerState === 1) {
          setIsPlaying(true);
          setIsBuffering(false);
        } else if (info.playerState === 2) {
          setIsPlaying(false);
          setIsBuffering(false);
        }
        if (info.videoData && currentTrackId) {
          const { title, author, video_id } = info.videoData;
          if (title || author) {
            setLiveMetadata(prev => {
              const curr = prev[currentTrackId] || {};
              if (curr.title === title && curr.artist === author) return prev;
              return {
                ...prev,
                [currentTrackId]: {
                  ...curr,
                  title: title || curr.title,
                  artist: author || curr.artist,
                  thumbnail: video_id ? `https://img.youtube.com/vi/${video_id}/mqdefault.jpg` : curr.thumbnail
                }
              };
            });
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [currentTrackId]);

  // -------------------------------------------------------------
  // YouTube IFrame API Loader & Background Instance Attachment
  // -------------------------------------------------------------
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      if (playerRef.current || !window.YT || !window.YT.Player) return;
      const iframe = iframeRef.current;
      if (!iframe) return;

      try {
        playerRef.current = new window.YT.Player(iframe, {
          events: {
            onReady: (event) => {
              event.target.setVolume(Math.round(volume * 100));
              if (isMuted) event.target.mute();
            },
            onStateChange: (event) => {
              if (!window.YT) return;
              const state = event.data;
              if (state === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true);
                setIsBuffering(false);
                const dur = event.target.getDuration?.();
                if (dur) setDuration(dur);
                syncLivePlayerInfo(event.target);
              } else if (state === window.YT.PlayerState.PAUSED) {
                setIsPlaying(false);
                setIsBuffering(false);
                syncLivePlayerInfo(event.target);
              } else if (state === window.YT.PlayerState.BUFFERING) {
                setIsBuffering(true);
              } else if (state === window.YT.PlayerState.ENDED) {
                setIsPlaying(false);
                handlePlayNextRef.current?.();
              }
            },
            onError: () => {
              showPlayerToast('Track unavailable for embed. Rolling next track...');
              setTimeout(() => {
                handlePlayNextRef.current?.();
              }, 1200);
            }
          }
        });
      } catch (err) {
        console.warn('Could not initialize YT.Player instance on iframe:', err);
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        initPlayer();
      };
    }
  }, [isMuted, showPlayerToast, syncLivePlayerInfo, volume]);

  // Track progress updater
  useEffect(() => {
    if (isPlaying) {
      progressTimerRef.current = setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          try {
            const cur = playerRef.current.getCurrentTime();
            const dur = playerRef.current.getDuration?.();
            if (typeof cur === 'number') setCurrentTime(cur);
            if (dur && dur > 0) setDuration(dur);
            syncLivePlayerInfo(playerRef.current);
          } catch {
            // Re-buffering
          }
        }
      }, 500);
    } else {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    }

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [isPlaying, syncLivePlayerInfo]);

  // Roll a Random Song in current or chosen genre immediately
  const handleRollRandomGenreTrack = useCallback((genre = activeGenre) => {
    const list = genre === 'all' 
      ? allTracks 
      : allTracks.filter(t => t.genre === genre || t.stationId === genre);

    if (list.length === 0) {
      showPlayerToast('No tracks found in this frequency.');
      return;
    }

    let candidates = list.filter(t => t.id !== currentTrackId);
    if (candidates.length === 0) candidates = list;

    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    if (chosen) {
      if (activeGenre !== genre && genre !== 'all') {
        setActiveGenre(genre);
      }
      playTrackById(chosen.id, true);
      showPlayerToast(`🎲 Tuned into: ${chosen.title}`);
    }
  }, [activeGenre, allTracks, currentTrackId, playTrackById, showPlayerToast]);

  // Listen for global play requests from external pages (e.g. MusicPage)
  useEffect(() => {
    const handleGlobalPlay = (e) => {
      const { trackId, genre, autoPlay = true } = e.detail || {};
      if (trackId) {
        playTrackById(trackId, autoPlay);
      } else if (genre) {
        handleRollRandomGenreTrack(genre);
      }
    };

    window.addEventListener('odd-play-track', handleGlobalPlay);
    return () => {
      window.removeEventListener('odd-play-track', handleGlobalPlay);
    };
  }, [playTrackById, handleRollRandomGenreTrack]);

  // Toggle Play / Pause
  const handleTogglePlay = () => {
    if (isSynthDroneMode) {
      if (isPlaying) {
        audioPlayerService.stop();
        setIsPlaying(false);
      } else {
        audioPlayerService.start();
        setIsPlaying(true);
      }
      return;
    }

    if (isPlaying) {
      sendPlayerCommand('pauseVideo');
      setIsPlaying(false);
    } else {
      setEmbedAutoplay(true);
      setIsDeckVisible(true);
      sendPlayerCommand('playVideo');
      sendPlayerCommand('unMute');
      sendPlayerCommand('setVolume', [Math.round(volume * 100)]);
      setIsPlaying(true);
    }
  };

  // Toggle Volume & Mute
  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (isMuted && val > 0) setIsMuted(false);

    if (isSynthDroneMode) {
      audioPlayerService.setVolume(val);
    } else {
      sendPlayerCommand('setVolume', [Math.round(val * 100)]);
      if (isMuted && val > 0) sendPlayerCommand('unMute');
    }
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    if (isSynthDroneMode) {
      audioPlayerService.toggleMute();
    } else {
      if (nextMuted) {
        sendPlayerCommand('mute');
      } else {
        sendPlayerCommand('unMute');
        sendPlayerCommand('setVolume', [Math.round(volume * 100)]);
      }
    }
  };

  // Seek bar
  const handleSeek = (e) => {
    const seekSec = parseFloat(e.target.value);
    setCurrentTime(seekSec);
    sendPlayerCommand('seekTo', [seekSec, true]);
  };

  // Genre Change Handler
  const handleSelectGenre = useCallback((genreId) => {
    setActiveGenre(genreId);
    const newGenreTracks = genreId === 'all' 
      ? allTracks 
      : allTracks.filter(t => t.genre === genreId);

    const exists = newGenreTracks.some(t => t.id === currentTrackId);
    if (!exists && newGenreTracks.length > 0) {
      const idx = isShuffle ? Math.floor(Math.random() * newGenreTracks.length) : 0;
      const target = newGenreTracks[idx];
      playTrackById(target.id, isPlaying);
    }
  }, [allTracks, currentTrackId, isPlaying, isShuffle, playTrackById]);

  // Switch to / from Synth Drone mode
  const handleToggleSynthDrone = () => {
    if (!isSynthDroneMode) {
      if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
        playerRef.current.pauseVideo();
      }
      setIsSynthDroneMode(true);
      audioPlayerService.setVolume(isMuted ? 0 : volume);
      audioPlayerService.start();
      setIsPlaying(true);
      showPlayerToast('Switched to Analog Lo-Fi Tape Synth');
    } else {
      audioPlayerService.stop();
      setIsSynthDroneMode(false);
      setIsPlaying(false);
      showPlayerToast('Switched to YouTube Sound Deck');
    }
  };

  // -------------------------------------------------------------
  // Add Custom YouTube Track or Playlist Form
  // -------------------------------------------------------------
  const handleAddCustomTrack = (e) => {
    e.preventDefault();
    const parsed = parseYouTubeInput(inputUrl);

    if (!parsed) {
      showPlayerToast('Invalid YouTube URL or ID. Check the link.');
      return;
    }

    const newTrack = {
      id: `custom-${Date.now()}`,
      title: inputTitle.trim() || (parsed.type === 'playlist' ? 'Custom YouTube Playlist' : 'YouTube Sound Signal'),
      artist: inputArtist.trim() || 'User Frequency Curation',
      genre: inputGenre,
      youtubeId: parsed.id,
      type: parsed.type,
      duration: parsed.type === 'playlist' ? 'PLAYLIST' : 'USER',
      note: 'User Added via Sound Deck'
    };

    const updated = [newTrack, ...customTracks];
    setCustomTracks(updated);
    try {
      localStorage.setItem('of_custom_music_tracks', JSON.stringify(updated));
    } catch {
      // ignore
    }

    setInputUrl('');
    setInputTitle('');
    setInputArtist('');

    setActiveGenre(inputGenre);
    playTrackById(newTrack.id, true);
    showPlayerToast(`Added & tuned into: "${newTrack.title}"!`);
  };

  const handleDeleteCustomTrack = (id, e) => {
    e.stopPropagation();
    const updated = customTracks.filter(t => t.id !== id);
    setCustomTracks(updated);
    try {
      localStorage.setItem('of_custom_music_tracks', JSON.stringify(updated));
    } catch {
      // ignore
    }
    showPlayerToast('Custom track removed.');
  };

  // Copy code helper for user to easily paste into src/data/musicTracks.js
  const handleCopyCodeSnippet = () => {
    const codeString = JSON.stringify(customTracks, null, 2);
    navigator.clipboard?.writeText(codeString);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
    showPlayerToast('Copied JSON configuration to clipboard!');
  };

  // Active genre info
  const activeGenreMeta = GENRES.find(g => g.id === activeGenre) || GENRES[0];

  return (
    <>
      {/* ---------------------------------------------------------
          CORNER LAUNCHER CHIP (When deck is closed / hidden)
          --------------------------------------------------------- */}
      {!isDeckVisible && (
        <button 
          type="button"
          className="yt-deck-launcher-chip"
          onClick={() => { setIsDeckVisible(true); setIsMinimized(false); }}
          title="Open ODD FREQUENCY Cyber Deck"
        >
          <span className={`yt-deck-led ${isPlaying ? 'is-playing' : ''}`}></span>
          <span className="font-mono">ODD FREQUENCY // SOUND DECK</span>
          <span>{isPlaying ? '▶' : '❚❚'}</span>
        </button>
      )}

      {/* ---------------------------------------------------------
          UNIFIED CYBER-HARDWARE SOUND DECK & VIDEO PLAYER
          (Matching user's reference hardware deck layout)
          --------------------------------------------------------- */}
      {isDeckVisible && (
        <aside 
          className={`yt-cyber-deck ${isTheatre ? 'is-theatre' : ''} ${isMinimized ? 'is-minimized' : ''}`}
          aria-label="Odd Frequency Sound Deck"
        >
          {/* Top Titanium Beveled Header Rim */}
          <div className="yt-deck-header">
            <div className="yt-deck-header-title">
              <span className={`yt-deck-led ${isPlaying ? 'is-playing' : ''}`}></span>
              <span>ODD FREQUENCY // {activeGenreMeta.label || 'SOUND DECK'}</span>
            </div>

            <div className="yt-deck-header-actions">
              <button 
                type="button"
                className="yt-deck-action-btn"
                onClick={() => setShowScanlines(prev => !prev)}
                title={showScanlines ? 'Disable CRT Scanlines' : 'Enable CRT Scanlines'}
              >
                {showScanlines ? 'CRT' : 'CLEAR'}
              </button>

              <button 
                type="button"
                className="yt-deck-action-btn"
                onClick={() => setIsTheatre(prev => !prev)}
                title={isTheatre ? 'Standard Deck Size' : 'Widescreen Theatre Mode'}
              >
                {isTheatre ? 'STD' : 'THEATRE'}
              </button>

              <button 
                type="button"
                className="yt-deck-action-btn"
                onClick={() => setIsMinimized(prev => !prev)}
                title={isMinimized ? 'Expand Deck' : 'Minimize to Titlebar'}
                aria-label="Toggle deck expansion"
              >
                {isMinimized ? '▲' : '—'}
              </button>

              <button 
                type="button"
                className="yt-deck-action-btn yt-deck-close-btn"
                onClick={() => setIsDeckVisible(false)}
                title="Hide to Corner Chip"
                aria-label="Hide sound deck"
              >
                &times;
              </button>
            </div>
          </div>

          {/* Minimized Compact Bar */}
          {isMinimized && (
            <div className="yt-deck-minimized-row" onClick={() => setIsMinimized(false)}>
              <span className="yt-minimized-title font-mono">
                {isPlaying ? '▶' : '❚❚'} {(liveMetadata[currentTrack?.id]?.title || currentTrack?.title)}
              </span>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <button 
                  type="button" 
                  className="yt-deck-action-btn"
                  onClick={(e) => { e.stopPropagation(); handleTogglePlay(); }}
                >
                  {isPlaying ? 'PAUSE' : 'PLAY'}
                </button>
                <button 
                  type="button" 
                  className="yt-deck-action-btn"
                  onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }}
                >
                  EXPAND ▲
                </button>
              </div>
            </div>
          )}

          {/* Main Deck Body: Left Video Screen, Right Controls & Scrubber */}
          <div className="yt-deck-body">
            {/* Left Column: Framed Inset Video Screen */}
            <div className="yt-deck-screen-box">
              {showScanlines && <div className="yt-crt-scanlines" aria-hidden="true"></div>}
              {isSynthDroneMode ? (
                <div className="yt-deck-synth-visual">
                  <div className="yt-synth-tape-anim">📼</div>
                  <div className="font-mono yt-synth-text">432Hz ANALOG TAPE DRONE</div>
                  <div className="yt-synth-eq-bars">
                    <span></span><span></span><span></span><span></span><span></span>
                  </div>
                </div>
              ) : (
                <iframe
                  ref={iframeRef}
                  id={PLAYER_ELEMENT_ID}
                  className="yt-iframe-embed"
                  src={embedUrl}
                  title="Odd Frequency Visual Signal"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="eager"
                />
              )}
            </div>

            {/* Right Column: Track Title, Artist, Time + Square Handle Scrubber, Square Hardware Buttons */}
            <div className="yt-deck-info-col">
              {/* Meta: Title & Artist */}
              <div className="yt-deck-meta-block">
                <div className="yt-deck-title" title={liveMetadata[currentTrack?.id]?.title || currentTrack?.title}>
                  {isSynthDroneMode ? 'Analog Tape Drone // 432Hz' : (liveMetadata[currentTrack?.id]?.title || currentTrack?.title)}
                </div>
                <div className="yt-deck-artist-row">
                  <span className="yt-deck-artist">
                    {isSynthDroneMode ? 'Odd Frequency Procedural Audio' : (liveMetadata[currentTrack?.id]?.artist || currentTrack?.artist)}
                  </span>
                  <span className="yt-deck-genre-tag">
                    {isSynthDroneMode ? 'SYNTH' : activeGenreMeta.tag}
                  </span>
                </div>
              </div>

              {/* Scrubber & Time Display with Silver Metallic Square Knob */}
              <div className="yt-deck-timeline-row">
                <span className="yt-deck-time-display font-mono">
                  {formatTime(currentTime)}
                </span>
                <div className="yt-deck-slider-rail">
                  <input 
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="yt-deck-scrubber"
                    aria-label="Track playback position"
                  />
                </div>
                <span className="yt-deck-dur-display font-mono">
                  {formatTime(duration)}
                </span>
              </div>

              {/* Hardware Button Row: [ 🔀 ] [ |◀ ] [ ▶ ] [ ▶| ] + Volume + Tracks */}
              <div className="yt-deck-controls-row">
                <div className="yt-hardware-button-group">
                  {/* Shuffle Button */}
                  <button 
                    type="button"
                    className={`yt-hardware-btn ${isShuffle ? 'is-active' : ''}`}
                    onClick={() => {
                      const next = !isShuffle;
                      setIsShuffle(next);
                      showPlayerToast(next ? 'Shuffle Mode: ON' : 'Shuffle Mode: OFF');
                    }}
                    title={isShuffle ? 'Shuffle Active (Random songs)' : 'Shuffle Disabled'}
                    aria-label="Toggle shuffle"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="16 3 21 3 21 8"></polyline>
                      <line x1="4" y1="20" x2="21" y2="3"></line>
                      <polyline points="21 16 21 21 16 21"></polyline>
                      <line x1="15" y1="15" x2="21" y2="21"></line>
                      <line x1="4" y1="4" x2="9" y2="9"></line>
                    </svg>
                  </button>

                  {/* Previous Track */}
                  <button 
                    type="button"
                    className="yt-hardware-btn"
                    onClick={handlePlayPrev}
                    title="Previous Track"
                    aria-label="Previous track"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="19 20 9 12 19 4 19 20"></polygon>
                      <line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2.5"></line>
                    </svg>
                  </button>

                  {/* Main Play / Pause Button */}
                  <button 
                    type="button"
                    className={`yt-hardware-btn play-main ${isPlaying ? 'is-playing' : ''}`}
                    onClick={handleTogglePlay}
                    title={isPlaying ? 'Pause' : 'Play'}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isBuffering ? (
                      <div className="yt-spinner-sm"></div>
                    ) : isPlaying ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="4" width="4" height="16" rx="1" />
                        <rect x="14" y="4" width="4" height="16" rx="1" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: 2 }}>
                        <polygon points="6 3 20 12 6 21 6 3" />
                      </svg>
                    )}
                  </button>

                  {/* Next Track */}
                  <button 
                    type="button"
                    className="yt-hardware-btn"
                    onClick={handlePlayNext}
                    title="Next Track"
                    aria-label="Next track"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 4 15 12 5 20 5 4"></polygon>
                      <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2.5"></line>
                    </svg>
                  </button>
                </div>

                {/* Auxiliary Controls: Volume, Dice & Tracks Drawer */}
                <div className="yt-aux-controls-group">
                  <div className="yt-aux-vol-wrapper">
                    <button 
                      type="button"
                      className="yt-hardware-btn yt-vol-btn"
                      onClick={handleToggleMute}
                      title={isMuted ? 'Unmute' : 'Mute'}
                      aria-label={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted || volume === 0 ? (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                          <line x1="23" y1="9" x2="17" y2="15"></line>
                          <line x1="17" y1="9" x2="23" y2="15"></line>
                        </svg>
                      ) : (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        </svg>
                      )}
                    </button>
                    <input 
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="yt-aux-vol-slider"
                      title={`Volume: ${Math.round(volume * 100)}%`}
                      aria-label="Volume slider"
                    />
                  </div>

                  {/* Dice Roll for Random Song */}
                  <button 
                    type="button"
                    className="yt-hardware-btn yt-dice-btn"
                    onClick={() => handleRollRandomGenreTrack(activeGenre)}
                    title={`Roll Random Song in ${activeGenreMeta.label}`}
                    aria-label="Roll random song"
                  >
                    🎲
                  </button>

                  {/* Drawer Button */}
                  <button 
                    type="button"
                    className={`yt-tracks-btn ${isDrawerOpen ? 'is-active' : ''}`}
                    onClick={() => setIsDrawerOpen(prev => !prev)}
                    title="Tracklist, Stations & Mixtapes"
                    aria-label="Open tracklist and playlist manager"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="8" y1="6" x2="21" y2="6"></line>
                      <line x1="8" y1="12" x2="21" y2="12"></line>
                      <line x1="8" y1="18" x2="21" y2="18"></line>
                      <line x1="3" y1="6" x2="3.01" y2="6"></line>
                      <line x1="3" y1="12" x2="3.01" y2="12"></line>
                      <line x1="3" y1="18" x2="3.01" y2="18"></line>
                    </svg>
                    <span>TRACKS</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* ---------------------------------------------------------
          EXPANDED SOUND DECK DRAWER / MIXTAPE MODAL
          --------------------------------------------------------- */}
      {isDrawerOpen && (
        <div className="yt-drawer-overlay" onClick={() => setIsDrawerOpen(false)}>
          <div 
            className="yt-drawer-panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Sound Deck & Frequency Playlist"
          >
            {/* Drawer Header */}
            <div className="yt-drawer-header">
              <div className="yt-drawer-brand">
                <span className="yt-drawer-logo">ODD FREQUENCY // SOUND DECK</span>
                <span className="yt-active-station-pill">
                  STATION: {activeGenreMeta.label} ({genreTracks.length} TRACKS)
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button 
                  className="yt-drawer-action-btn yt-roll-cta"
                  onClick={() => handleRollRandomGenreTrack(activeGenre)}
                  title="Pick a random song from this genre"
                >
                  🎲 ROLL RANDOM SONG
                </button>
                <button 
                  className="yt-drawer-close-btn"
                  onClick={() => setIsDrawerOpen(false)}
                  aria-label="Close sound deck drawer"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="yt-drawer-tabs">
              <button 
                className={`yt-tab-btn ${drawerTab === 'tracklist' ? 'is-active' : ''}`}
                onClick={() => setDrawerTab('tracklist')}
              >
                [01] TRACKLIST & QUEUE ({genreTracks.length})
              </button>
              <button 
                className={`yt-tab-btn ${drawerTab === 'genres' ? 'is-active' : ''}`}
                onClick={() => setDrawerTab('genres')}
              >
                [02] GENRE CHANNELS
              </button>
              <button 
                className={`yt-tab-btn ${drawerTab === 'add' ? 'is-active' : ''}`}
                onClick={() => setDrawerTab('add')}
              >
                [03] + ADD YOUTUBE SONG / PLAYLIST
              </button>
            </div>

            {/* Drawer Content */}
            <div className="yt-drawer-body">
              {/* TAB 1: TRACKLIST */}
              {drawerTab === 'tracklist' && (
                <div className="yt-tracklist-view">
                  {/* Genre Quick Filters */}
                  <div className="yt-genre-pill-row">
                    {GENRES.map(g => (
                      <button
                        key={g.id}
                        className={`yt-genre-filter-pill ${activeGenre === g.id ? 'active' : ''}`}
                        onClick={() => handleSelectGenre(g.id)}
                      >
                        <span>{g.icon}</span> {g.label}
                      </button>
                    ))}
                  </div>

                  {/* List of Tracks in Active Genre */}
                  <div className="yt-tracks-scroll-list">
                    {genreTracks.map((track, idx) => {
                      const isCurrent = track.id === currentTrackId && !isSynthDroneMode;
                      return (
                        <div 
                          key={track.id}
                          className={`yt-track-card ${isCurrent ? 'is-playing' : ''}`}
                          onClick={() => playTrackById(track.id, true)}
                        >
                          <div className="yt-card-index">
                            {isCurrent && isPlaying ? (
                              <div className="yt-card-bars" aria-hidden="true">
                                <span></span><span></span><span></span>
                              </div>
                            ) : (
                              <span>{(idx + 1).toString().padStart(2, '0')}</span>
                            )}
                          </div>

                          <div className="yt-card-thumb">
                            <img 
                              src={getYouTubeThumbnail(track.youtubeId, track.type, liveMetadata[track.id]?.thumbnail || track.thumbnail)} 
                              alt={liveMetadata[track.id]?.title || track.title}
                              loading="lazy"
                            />
                            {track.type === 'playlist' && (
                              <span className="yt-card-playlist-tag">PLAYLIST</span>
                            )}
                          </div>

                          <div className="yt-card-details">
                            <div className="yt-card-title">{liveMetadata[track.id]?.title || track.title}</div>
                            <div className="yt-card-sub">
                              <span className="yt-card-artist">{liveMetadata[track.id]?.artist || track.artist}</span>
                              {track.note && <span className="yt-card-note">• {track.note}</span>}
                            </div>
                          </div>

                          <div className="yt-card-right">
                            <span className="yt-card-genre-tag">{track.genre.toUpperCase()}</span>
                            <span className="yt-card-dur">{liveMetadata[track.id]?.duration || track.duration || (track.type === 'playlist' ? 'PLAYLIST' : '3:00')}</span>

                            {track.id.startsWith('custom-') && (
                              <button 
                                className="yt-card-del-btn"
                                onClick={(e) => handleDeleteCustomTrack(track.id, e)}
                                title="Remove track"
                              >
                                &times;
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {genreTracks.length === 0 && (
                      <div className="yt-empty-state">
                        <p>No tracks added in this frequency channel yet.</p>
                        <button 
                          className="yt-btn-primary"
                          onClick={() => setDrawerTab('add')}
                        >
                          + Add a YouTube Song or Playlist
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: GENRES / FREQUENCIES */}
              {drawerTab === 'genres' && (
                <div className="yt-genres-grid-view">
                  <div className="yt-genres-grid">
                    {GENRES.map(genre => {
                      const count = allTracks.filter(t => genre.id === 'all' || t.genre === genre.id).length;
                      const isSelected = activeGenre === genre.id;
                      return (
                        <div 
                          key={genre.id}
                          className={`yt-genre-card ${isSelected ? 'is-selected' : ''}`}
                        >
                          <div className="yt-genre-card-head">
                            <span className="yt-genre-icon">{genre.icon}</span>
                            <span className="yt-genre-count">{count} SONGS</span>
                          </div>
                          <h4 className="yt-genre-card-title">{genre.label}</h4>
                          <p className="yt-genre-card-desc">{genre.desc || 'Curated frequency tracklist'}</p>
                          
                          <div className="yt-genre-card-actions">
                            <button 
                              className={`yt-genre-tune-btn ${isSelected ? 'active' : ''}`}
                              onClick={() => {
                                handleSelectGenre(genre.id);
                                setDrawerTab('tracklist');
                              }}
                            >
                              {isSelected ? '✓ TUNED IN' : 'TUNE IN STATION'}
                            </button>
                            <button 
                              className="yt-genre-shuffle-btn"
                              onClick={() => handleRollRandomGenreTrack(genre.id)}
                              title="Play a random song from this genre"
                            >
                              🎲 RANDOM
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Alternative Synth Mode Card */}
                  <div className="yt-synth-mode-banner">
                    <div>
                      <h4 className="font-headline" style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>
                        📼 EXPERIMENTAL SYNTHESIZER DRONE
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Procedural subterranean lo-fi drone generated in real-time via Web Audio API. Zero network requests.
                      </p>
                    </div>
                    <button 
                      className={`yt-genre-tune-btn ${isSynthDroneMode ? 'active' : ''}`}
                      onClick={handleToggleSynthDrone}
                    >
                      {isSynthDroneMode ? '✓ SYNTH PLAYING' : 'ACTIVATE SYNTH DRONE'}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: ADD YOUTUBE TRACK / PLAYLIST */}
              {drawerTab === 'add' && (
                <div className="yt-add-view">
                  <div className="yt-add-intro">
                    <h4 className="font-headline" style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>
                      INPUT CUSTOM YOUTUBE TRACK OR PLAYLIST
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      Paste any YouTube video link, shorts link, or entire playlist URL. It will instantly join your frequency playlist, saved locally, and can also be exported to code.
                    </p>
                  </div>

                  <form className="yt-add-form" onSubmit={handleAddCustomTrack}>
                    <div className="yt-form-group">
                      <label htmlFor="yt-url-input">YouTube Video or Playlist Link / ID *</label>
                      <input 
                        id="yt-url-input"
                        type="text"
                        placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/... or PL..."
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                        required
                        className="yt-form-input"
                      />
                      <span className="yt-form-hint">
                        Accepts any standard YouTube link, mobile youtu.be link, or Playlist link (list=PL...).
                      </span>
                    </div>

                    <div className="yt-form-row">
                      <div className="yt-form-group">
                        <label htmlFor="yt-title-input">Track / Playlist Title (Optional)</label>
                        <input 
                          id="yt-title-input"
                          type="text"
                          placeholder="e.g. Mareux - The Perfect Girl"
                          value={inputTitle}
                          onChange={(e) => setInputTitle(e.target.value)}
                          className="yt-form-input"
                        />
                      </div>

                      <div className="yt-form-group">
                        <label htmlFor="yt-artist-input">Artist / Channel Name (Optional)</label>
                        <input 
                          id="yt-artist-input"
                          type="text"
                          placeholder="e.g. Mareux"
                          value={inputArtist}
                          onChange={(e) => setInputArtist(e.target.value)}
                          className="yt-form-input"
                        />
                      </div>
                    </div>

                    <div className="yt-form-group">
                      <label htmlFor="yt-genre-select">Assign Frequency Genre</label>
                      <select 
                        id="yt-genre-select"
                        value={inputGenre}
                        onChange={(e) => setInputGenre(e.target.value)}
                        className="yt-form-select"
                      >
                        <option value="void">THE VOID (Darkwave / Post-Punk / Grunge)</option>
                        <option value="feed">THE FEED (Hyperpop / Breakcore / Webcore)</option>
                        <option value="drone">SUBTERRANEAN RADIO (Lo-Fi / Tape Beats / Drone)</option>
                        <option value="custom">MY MIXTAPE (Personal Favorites)</option>
                      </select>
                    </div>

                    <div className="yt-form-actions">
                      <button type="submit" className="yt-btn-primary">
                        + ADD TO STATION & PLAY NOW
                      </button>
                    </div>
                  </form>

                  {/* Export to codebase helper */}
                  {customTracks.length > 0 && (
                    <div className="yt-export-box">
                      <div className="yt-export-info">
                        <strong>Developer Export:</strong> You have {customTracks.length} custom track(s) saved in local session. You can copy the code snippet to permanently paste into <code>src/data/musicTracks.js</code>!
                      </div>
                      <button 
                        type="button" 
                        className="yt-btn-secondary"
                        onClick={handleCopyCodeSnippet}
                      >
                        {copiedCode ? '✓ COPIED JSON CODE!' : 'COPY CODE SNIPPET'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating feedback notification toast */}
      {feedbackToast && (
        <div className="yt-feedback-toast" role="status">
          {feedbackToast}
        </div>
      )}
    </>
  );
}
