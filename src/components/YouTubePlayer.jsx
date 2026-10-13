import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  DEFAULT_TRACKS, 
  GENRES, 
  parseYouTubeInput, 
  getYouTubeThumbnail 
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

  // Combine default and user-added tracks
  const allTracks = useMemo(() => {
    return [...DEFAULT_TRACKS, ...customTracks];
  }, [customTracks]);

  // --- Player State ---
  const [activeGenre, setActiveGenre] = useState('all');
  const [currentTrackId, setCurrentTrackId] = useState(DEFAULT_TRACKS[0]?.id || 'void-01');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isShuffle, setIsShuffle] = useState(true); // Default to shuffle/random for dynamic radio experience
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // Synth Drone Mode (original procedural tape drone fallback)
  const [isSynthDroneMode, setIsSynthDroneMode] = useState(false);

  // UI Panels
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showVideoMonitor, setShowVideoMonitor] = useState(false);
  const [drawerTab, setDrawerTab] = useState('tracklist'); // 'tracklist', 'genres', 'add'
  const [feedbackToast, setFeedbackToast] = useState(null);

  // Form State for Adding Custom Tracks
  const [inputUrl, setInputUrl] = useState('');
  const [inputTitle, setInputTitle] = useState('');
  const [inputArtist, setInputArtist] = useState('');
  const [inputGenre, setInputGenre] = useState('void');
  const [copiedCode, setCopiedCode] = useState(false);

  // --- Refs ---
  const playerRef = useRef(null);
  const progressTimerRef = useRef(null);

  // Filtered tracks based on selected genre
  const genreTracks = useMemo(() => {
    if (activeGenre === 'all') return allTracks;
    return allTracks.filter(t => t.genre === activeGenre);
  }, [allTracks, activeGenre]);

  // Active track object
  const currentTrack = useMemo(() => {
    return allTracks.find(t => t.id === currentTrackId) || genreTracks[0] || allTracks[0];
  }, [allTracks, currentTrackId, genreTracks]);

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

  // Playback of a specific Track ID
  const playTrackById = useCallback((trackId, autoPlay = true) => {
    const targetTrack = allTracks.find(t => t.id === trackId);
    if (!targetTrack) return;

    if (isSynthDroneMode) {
      audioPlayerService.stop();
      setIsSynthDroneMode(false);
    }

    setCurrentTrackId(trackId);
    setCurrentTime(0);

    if (playerRef.current) {
      try {
        if (targetTrack.type === 'playlist') {
          if (autoPlay) {
            playerRef.current.loadPlaylist({ list: targetTrack.youtubeId });
          } else {
            playerRef.current.cuePlaylist({ list: targetTrack.youtubeId });
          }
        } else {
          if (autoPlay) {
            playerRef.current.loadVideoById(targetTrack.youtubeId);
            setIsPlaying(true);
          } else {
            playerRef.current.cueVideoById(targetTrack.youtubeId);
          }
        }
      } catch (err) {
        console.error('Failed to load track in YouTube player:', err);
      }
    }
  }, [allTracks, isSynthDroneMode]);

  // Navigation: Next & Previous
  const handlePlayNext = useCallback(() => {
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
  }, [genreTracks, isShuffle, currentTrackId, playTrackById]);

  const handlePlayPrev = useCallback(() => {
    if (genreTracks.length === 0) return;

    if (currentTime > 4 && playerRef.current?.seekTo) {
      playerRef.current.seekTo(0);
      return;
    }

    const currentIndex = genreTracks.findIndex(t => t.id === currentTrackId);
    const prevIndex = (currentIndex - 1 + genreTracks.length) % genreTracks.length;
    const prevTrack = genreTracks[prevIndex];
    if (prevTrack) playTrackById(prevTrack.id, true);
  }, [genreTracks, currentTime, currentTrackId, playTrackById]);

  // Stable callback ref for next track
  const handlePlayNextRef = useRef(handlePlayNext);
  useEffect(() => {
    handlePlayNextRef.current = handlePlayNext;
  }, [handlePlayNext]);

  // -------------------------------------------------------------
  // YouTube IFrame API Loader & Initialization
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

      const element = document.getElementById(PLAYER_ELEMENT_ID);
      if (!element) return;

      playerRef.current = new window.YT.Player(PLAYER_ELEMENT_ID, {
        height: '100%',
        width: '100%',
        videoId: currentTrack?.type === 'playlist' ? undefined : currentTrack?.youtubeId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          disablekb: 0,
          enablejsapi: 1,
          fs: 1,
          iv_load_policy: 3,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          origin: window.location.origin
        },
        events: {
          onReady: (event) => {
            event.target.setVolume(volume * 100);
            if (isMuted) event.target.mute();
            if (currentTrack?.type === 'playlist') {
              event.target.cuePlaylist({ list: currentTrack.youtubeId });
            }
          },
          onStateChange: (event) => {
            if (!window.YT) return;
            const state = event.data;
            if (state === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              setIsBuffering(false);
              const dur = event.target.getDuration();
              if (dur) setDuration(dur);
            } else if (state === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
              setIsBuffering(false);
            } else if (state === window.YT.PlayerState.BUFFERING) {
              setIsBuffering(true);
            } else if (state === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
              handlePlayNextRef.current();
            }
          },
          onError: () => {
            showPlayerToast('Track unavailable for embed. Rolling next track...');
            setTimeout(() => {
              handlePlayNextRef.current();
            }, 800);
          }
        }
      });
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

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [currentTrack?.type, currentTrack?.youtubeId, isMuted, showPlayerToast, volume]);

  // Track progress updater
  useEffect(() => {
    if (isPlaying) {
      progressTimerRef.current = setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          try {
            const cur = playerRef.current.getCurrentTime();
            const dur = playerRef.current.getDuration();
            setCurrentTime(cur || 0);
            if (dur && dur > 0) setDuration(dur);
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
  }, [isPlaying]);

  // Roll a Random Song in current or chosen genre immediately
  const handleRollRandomGenreTrack = useCallback((genre = activeGenre) => {
    const list = genre === 'all' 
      ? allTracks 
      : allTracks.filter(t => t.genre === genre);

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

    if (!playerRef.current || typeof playerRef.current.playVideo !== 'function') {
      showPlayerToast('Connecting to YouTube signal...');
      return;
    }

    if (isPlaying) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      playerRef.current.playVideo();
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
    } else if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
      playerRef.current.setVolume(val * 100);
      if (isMuted && val > 0) playerRef.current.unMute();
    }
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    if (isSynthDroneMode) {
      audioPlayerService.toggleMute();
    } else if (playerRef.current) {
      if (nextMuted) {
        playerRef.current.mute?.();
      } else {
        playerRef.current.unMute?.();
        playerRef.current.setVolume?.(volume * 100);
      }
    }
  };

  // Seek bar
  const handleSeek = (e) => {
    const seekSec = parseFloat(e.target.value);
    setCurrentTime(seekSec);
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(seekSec, true);
    }
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
          FLOATING RETRO-CYBER VIDEO MONITOR (Toggleable)
          --------------------------------------------------------- */}
      <div 
        className={`yt-video-monitor ${showVideoMonitor ? 'is-visible' : 'is-hidden'}`}
        aria-hidden={!showVideoMonitor}
      >
        <div className="yt-monitor-header">
          <div className="yt-monitor-title">
            <span className="yt-blinking-dot"></span>
            ODD FREQUENCY // CRT VISUAL MONITOR [CH: {activeGenreMeta.tag}]
          </div>
          <button 
            className="yt-monitor-close"
            onClick={() => setShowVideoMonitor(false)}
            title="Minimize Video Monitor"
            aria-label="Close video monitor"
          >
            &times;
          </button>
        </div>

        {/* The YouTube Iframe container stays mounted here */}
        <div className="yt-monitor-screen">
          <div className="yt-crt-scanlines" aria-hidden="true"></div>
          <div id={PLAYER_ELEMENT_ID} className="yt-iframe-embed"></div>
        </div>

        <div className="yt-monitor-footer">
          <span className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
            {currentTrack?.title} — {currentTrack?.artist}
          </span>
          <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--accent-lime)' }}>
            {isPlaying ? '● BROADCASTING' : '○ PAUSED'}
          </span>
        </div>
      </div>

      {/* ---------------------------------------------------------
          MAIN PERSISTENT BOTTOM SOUND DOCK
          --------------------------------------------------------- */}
      <aside 
        className="yt-player-dock"
        aria-label="Odd Frequency Sound Deck"
      >
        {/* Progress Bar (Scrubber) on top of the dock */}
        {!isSynthDroneMode && duration > 0 && (
          <div className="yt-dock-progress-wrapper">
            <input 
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="yt-dock-progress-bar"
              aria-label="Track playback position"
            />
          </div>
        )}

        <div className="yt-dock-main-row">
          {/* Left: Thumbnail & Track Info */}
          <div 
            className="yt-track-capsule"
            onClick={() => setIsDrawerOpen(prev => !prev)}
            title="Click to view full playlist and genres"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setIsDrawerOpen(prev => !prev)}
          >
            <div className="yt-thumbnail-box">
              {isSynthDroneMode ? (
                <div className="yt-synth-tape-icon">📼</div>
              ) : (
                <img 
                  src={getYouTubeThumbnail(currentTrack?.youtubeId, currentTrack?.type)} 
                  alt={currentTrack?.title || 'Odd Frequency'}
                  className="yt-track-thumb-img"
                  loading="lazy"
                />
              )}
              {isPlaying && (
                <div className="yt-mini-eq" aria-hidden="true">
                  <span></span><span></span><span></span>
                </div>
              )}
            </div>

            <div className="yt-track-info-col">
              <div className="yt-dock-title-marquee">
                <span className="yt-dock-title-text">
                  {isSynthDroneMode ? 'ANALOG TAPE DRONE // 432Hz' : currentTrack?.title}
                </span>
              </div>
              <div className="yt-dock-meta-row">
                <span className="yt-genre-badge">
                  {isSynthDroneMode ? 'SYNTH' : activeGenreMeta.tag}
                </span>
                <span className="yt-dock-artist">
                  {isSynthDroneMode ? 'ODD FREQUENCY ENGINE' : currentTrack?.artist}
                </span>
                {!isSynthDroneMode && (
                  <span className="yt-dock-timer">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Center: Transport Playback Controls */}
          <div className="yt-transport-controls">
            {/* Random / Shuffle Button */}
            <button 
              className={`yt-control-btn ${isShuffle ? 'active-glow' : ''}`}
              onClick={() => {
                const nextShuffle = !isShuffle;
                setIsShuffle(nextShuffle);
                showPlayerToast(nextShuffle ? 'Random / Shuffle Mode: ON' : 'Shuffle Mode: OFF');
              }}
              title={isShuffle ? 'Shuffle Active (Random songs)' : 'Shuffle Disabled'}
              aria-label="Toggle shuffle"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="16 3 21 3 21 8"></polyline>
                <line x1="4" y1="20" x2="21" y2="3"></line>
                <polyline points="21 16 21 21 16 21"></polyline>
                <line x1="15" y1="15" x2="21" y2="21"></line>
                <line x1="4" y1="4" x2="9" y2="9"></line>
              </svg>
            </button>

            {/* Previous Track */}
            <button 
              className="yt-control-btn"
              onClick={handlePlayPrev}
              title="Previous Track"
              aria-label="Previous track"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="19 20 9 12 19 4 19 20"></polygon>
                <line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2"></line>
              </svg>
            </button>

            {/* Main Play / Pause Button */}
            <button 
              className="yt-play-main-btn"
              onClick={handleTogglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isBuffering ? (
                <div className="yt-spinner"></div>
              ) : isPlaying ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: 2 }}>
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              )}
            </button>

            {/* Next Track */}
            <button 
              className="yt-control-btn"
              onClick={handlePlayNext}
              title="Next Track"
              aria-label="Next track"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 4 15 12 5 20 5 4"></polygon>
                <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2"></line>
              </svg>
            </button>

            {/* Quick Roll Random Song from Genre */}
            <button 
              className="yt-control-btn yt-dice-btn"
              onClick={() => handleRollRandomGenreTrack(activeGenre)}
              title={`Roll Random Song in ${activeGenreMeta.label}`}
              aria-label="Roll random song in genre"
            >
              🎲
            </button>
          </div>

          {/* Right: Volume, Video Monitor Toggle, Drawer Toggle */}
          <div className="yt-right-controls">
            {/* Toggle CRT Video Monitor */}
            <button 
              className={`yt-action-icon-btn ${showVideoMonitor ? 'is-active' : ''}`}
              onClick={() => setShowVideoMonitor(prev => !prev)}
              title={showVideoMonitor ? 'Hide Video Monitor' : 'Show YouTube Video Monitor'}
              aria-label="Toggle video monitor"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
                <polyline points="17 2 12 7 7 2"></polyline>
              </svg>
            </button>

            {/* Volume & Mute */}
            <div className="yt-volume-cluster">
              <button 
                className="yt-mute-btn"
                onClick={handleToggleMute}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <line x1="23" y1="9" x2="17" y2="15"></line>
                    <line x1="17" y1="9" x2="23" y2="15"></line>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                className="yt-vol-slider"
                title={`Volume: ${Math.round(volume * 100)}%`}
                aria-label="Volume slider"
              />
            </div>

            {/* Playlist / Deck Drawer Trigger */}
            <button 
              className={`yt-drawer-toggle-btn ${isDrawerOpen ? 'is-active' : ''}`}
              onClick={() => setIsDrawerOpen(prev => !prev)}
              aria-label="Open tracklist and playlist manager"
              title="Tracklist, Genres & Add Songs"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
              <span className="yt-drawer-btn-label">TRACKS</span>
            </button>
          </div>
        </div>
      </aside>

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
                              src={getYouTubeThumbnail(track.youtubeId, track.type)} 
                              alt={track.title}
                              loading="lazy"
                            />
                            {track.type === 'playlist' && (
                              <span className="yt-card-playlist-tag">PLAYLIST</span>
                            )}
                          </div>

                          <div className="yt-card-details">
                            <div className="yt-card-title">{track.title}</div>
                            <div className="yt-card-sub">
                              <span className="yt-card-artist">{track.artist}</span>
                              {track.note && <span className="yt-card-note">• {track.note}</span>}
                            </div>
                          </div>

                          <div className="yt-card-right">
                            <span className="yt-card-genre-tag">{track.genre.toUpperCase()}</span>
                            <span className="yt-card-dur">{track.duration || '3:00'}</span>

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
