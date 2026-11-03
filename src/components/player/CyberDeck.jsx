import React, { useState } from 'react';
import { useAudio } from '../../context/useAudio.js';
import VisualizerBars from './VisualizerBars.jsx';
import { formatTime } from '../../utils/youtubeUtils.js';
import { STATIONS } from '../../data/musicTracks.js';

export default function CyberDeck() {
  const {
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    currentTime,
    duration,
    progressPercent,
    currentStation,
    crtMode,
    theatreMode,
    visualizerActive,
    isLiveSync,
    togglePlay,
    nextTrack,
    prevTrack,
    seekTo,
    setVolume,
    toggleMute,
    setStation,
    tuneLive,
    toggleCrt,
    toggleTheatre,
    toggleVisualizer
  } = useAudio();

  const [isMinimized, setIsMinimized] = useState(false);

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    seekTo(ratio * duration);
  };

  if (isMinimized) {
    return (
      <aside 
        className="cyberdeck-minimized"
        onClick={() => setIsMinimized(false)}
        role="region"
        aria-label="Odd Frequency Audio Player Minimized"
      >
        <span className="live-dot-pulse"></span>
        <span className="font-mono">{currentStation.badge}</span>
        <span className="min-track-title">{currentTrack.title}</span>
        <button className="deck-btn-tiny" onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
          {isPlaying ? 'PAUSE' : 'PLAY'}
        </button>
      </aside>
    );
  }

  return (
    <aside 
      className={`cyberdeck-floating ${crtMode ? 'has-crt' : ''} ${theatreMode ? 'theatre-mode' : ''}`}
      role="region"
      aria-label="Odd Frequency Radio Cyberdeck"
    >
      {/* Top Deck Header Strip */}
      <div className="cyberdeck-header">
        <div className="cyberdeck-header-left">
          <span className="live-dot-pulse"></span>
          <span className="deck-title font-mono">
            ODD FREQUENCY // {currentStation.badge}
          </span>
        </div>

        <div className="cyberdeck-header-actions">
          <button 
            className={`deck-pill-btn ${isLiveSync ? 'active' : ''}`}
            onClick={tuneLive}
            title="Synchronize with live global broadcast"
          >
            <span className="deck-bolt">⚡</span>
            <span>TUNE LIVE</span>
          </button>

          <button 
            className={`deck-pill-btn ${crtMode ? 'active' : ''}`}
            onClick={toggleCrt}
            title="Toggle Retro CRT Scanline Filter"
          >
            CRT
          </button>

          <button 
            className={`deck-pill-btn ${theatreMode ? 'active' : ''}`}
            onClick={toggleTheatre}
            title="Toggle Theatre Glow Mode"
          >
            THEATRE
          </button>

          <button 
            className="deck-window-btn"
            onClick={() => setIsMinimized(true)}
            aria-label="Minimize radio player"
            title="Minimize"
          >
            &minus;
          </button>
        </div>
      </div>

      {/* 5-Station Frequency Switcher Strip */}
      <div className="deck-freq-strip font-mono" role="tablist" aria-label="Radio Frequency Tuner">
        {STATIONS.map(st => (
          <button
            key={st.id}
            className={`deck-freq-btn ${currentStation.id === st.id ? 'active' : ''}`}
            onClick={() => setStation(st.id)}
            title={`Tune to ${st.name} (${st.frequency})`}
          >
            <span className="freq-num">{st.frequency.replace(' FM', '')}</span>
            <span className="freq-lbl">{st.id.toUpperCase()}</span>
          </button>
        ))}
      </div>

      {/* Cyberdeck Main Body */}
      <div className="cyberdeck-body">
        {/* Left: Thumbnail & Visualizer Overlay */}
        <div className="deck-media-wrap">
          <img 
            src={currentTrack.cover || `https://img.youtube.com/vi/${currentTrack.youtubeId}/mqdefault.jpg`} 
            alt={currentTrack.title}
            className="deck-thumb"
            loading="lazy"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80';
            }}
          />
          {visualizerActive && (
            <div className="deck-thumb-visualizer">
              <VisualizerBars isPlaying={isPlaying} barCount={8} accentColor={currentStation.accent || 'var(--accent-purple)'} />
            </div>
          )}
          <button 
            className="deck-thumb-play-overlay"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16"/>
                <rect x="14" y="4" width="4" height="16"/>
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5,3 19,12 5,21"/>
              </svg>
            )}
          </button>
        </div>

        {/* Right: Info, Progress & Controls */}
        <div className="deck-content-wrap">
          {/* Track Meta */}
          <div className="deck-meta-info">
            <h4 className="deck-track-title" title={currentTrack.title}>
              {currentTrack.title}
            </h4>
            <div className="deck-artist-row">
              <span className="deck-artist-name">{currentTrack.artist}</span>
              <span className="deck-tag-pill" style={{ color: currentStation.accent, borderColor: currentStation.accent }}>
                {currentStation.frequency}
              </span>
            </div>
          </div>

          {/* Scrubber Bar */}
          <div className="deck-scrubber-row">
            <span className="deck-time font-mono">{formatTime(currentTime)}</span>
            <div 
              className="deck-progress-track"
              onClick={handleSeek}
              role="slider"
              aria-valuemin="0"
              aria-valuemax={duration}
              aria-valuenow={currentTime}
              aria-label="Track progress slider"
            >
              <div 
                className="deck-progress-fill"
                style={{ 
                  width: `${progressPercent}%`,
                  background: `linear-gradient(90deg, ${currentStation.accent || 'var(--accent-purple)'}, #d946ef)`
                }}
              >
                <span className="deck-slider-knob"></span>
              </div>
            </div>
            <span className="deck-time font-mono">{formatTime(duration)}</span>
          </div>

          {/* Controls Dock */}
          <div className="deck-controls-row">
            {/* Prev Track */}
            <button 
              className="deck-control-icon-btn" 
              onClick={prevTrack}
              aria-label="Previous track"
              title="Previous Track"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="19,20 9,12 19,4"/>
                <line x1="5" y1="4" x2="5" y2="20" stroke="currentColor" strokeWidth="2.5"/>
              </svg>
            </button>

            {/* Play/Pause Button */}
            <button 
              className="deck-play-main-btn" 
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              style={{ background: currentStation.accent || 'var(--accent-purple)' }}
            >
              {isPlaying ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16"/>
                  <rect x="14" y="4" width="4" height="16"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5,3 19,12 5,21"/>
                </svg>
              )}
            </button>

            {/* Next Track */}
            <button 
              className="deck-control-icon-btn" 
              onClick={nextTrack}
              aria-label="Next track"
              title="Next Track"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5,4 15,12 5,20"/>
                <line x1="19" y1="4" x2="19" y2="20" stroke="currentColor" strokeWidth="2.5"/>
              </svg>
            </button>

            {/* Volume Control */}
            <div className="deck-volume-wrap">
              <button 
                className="deck-control-icon-btn"
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
                title="Mute / Unmute"
              >
                {isMuted || volume === 0 ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="1" y1="1" x2="23" y2="23"/>
                    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
                    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="11,5 6,9 2,9 2,15 6,15 11,19"/>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                  </svg>
                )}
              </button>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={isMuted ? 0 : volume} 
                onChange={(e) => setVolume(e.target.value)}
                className="deck-volume-slider"
                aria-label="Volume slider"
              />
            </div>

            {/* Visualizer Toggle */}
            <button 
              className={`deck-control-icon-btn ${visualizerActive ? 'active' : ''}`}
              onClick={toggleVisualizer}
              title="Toggle Audio Visualizer"
              aria-label="Toggle Audio Visualizer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
