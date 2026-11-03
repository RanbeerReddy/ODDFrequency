import React from 'react';
import { useAudio } from '../../context/useAudio.js';
import VisualizerBars from './VisualizerBars.jsx';
import { formatTime } from '../../utils/youtubeUtils.js';
import { STATIONS } from '../../data/musicTracks.js';

export default function MobilePlayerSheet() {
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
    isLiveSync,
    isMobileSheetOpen,
    setIsMobileSheetOpen,
    togglePlay,
    nextTrack,
    prevTrack,
    seekTo,
    setVolume,
    toggleMute,
    setStation,
    tuneLive,
    toggleCrt
  } = useAudio();

  if (!isMobileSheetOpen) return null;

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    seekTo(ratio * duration);
  };

  return (
    <div 
      className="mobile-sheet-backdrop" 
      onClick={() => setIsMobileSheetOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Cyber Radio Control Deck"
    >
      <div 
        className="mobile-sheet-drawer"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pull Grabber */}
        <div className="sheet-grabber-bar" onClick={() => setIsMobileSheetOpen(false)}>
          <span className="grabber-pill"></span>
        </div>

        {/* Top Header */}
        <div className="sheet-top-header">
          <div className="sheet-badge-wrap">
            <span className="live-dot-pulse"></span>
            <span className="font-mono sheet-station-badge">{currentStation.badge}</span>
          </div>

          <div className="sheet-top-buttons">
            <button 
              className={`sheet-pill-btn ${isLiveSync ? 'active' : ''}`}
              onClick={tuneLive}
            >
              ⚡ LIVE
            </button>
            <button 
              className={`sheet-pill-btn ${crtMode ? 'active' : ''}`}
              onClick={toggleCrt}
            >
              CRT
            </button>
            <button 
              className="sheet-close-btn"
              onClick={() => setIsMobileSheetOpen(false)}
              aria-label="Close radio sheet"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Station Switcher Quick Strip */}
        <div className="sheet-station-pills">
          {STATIONS.map((st) => (
            <button
              key={st.id}
              className={`sheet-station-chip ${currentStation.id === st.id ? 'active' : ''}`}
              onClick={() => setStation(st.id)}
            >
              <span>{st.frequency}</span>
              <span className="sheet-station-chip-name">{st.name}</span>
            </button>
          ))}
        </div>

        {/* Big Artwork Presentation */}
        <div className="sheet-art-wrap">
          <img 
            src={`https://img.youtube.com/vi/${currentTrack.youtubeId}/hqdefault.jpg`}
            alt={currentTrack.title}
            className="sheet-album-art"
            onError={(e) => {
              e.target.src = currentTrack.cover || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80';
            }}
          />
          <div className="sheet-art-visualizer">
            <VisualizerBars isPlaying={isPlaying} barCount={16} accentColor="var(--accent-purple)" />
          </div>
        </div>

        {/* Track Metadata */}
        <div className="sheet-track-info">
          <h3 className="sheet-track-title">{currentTrack.title}</h3>
          <p className="sheet-artist-name">{currentTrack.artist}</p>
          <div className="sheet-tag-row">
            <span className="badge-id">{currentTrack.frequency}</span>
            <span className="badge-id">{currentTrack.genre?.toUpperCase()}</span>
            {currentTrack.note && <span className="sheet-note-text font-mono">{currentTrack.note}</span>}
          </div>
        </div>

        {/* Scrubber Bar */}
        <div className="sheet-scrubber-box">
          <div 
            className="sheet-progress-track"
            onClick={handleSeek}
            role="slider"
            aria-valuemin="0"
            aria-valuemax={duration}
            aria-valuenow={currentTime}
            aria-label="Track progress slider"
          >
            <div className="sheet-progress-fill" style={{ width: `${progressPercent}%` }}>
              <span className="sheet-slider-knob"></span>
            </div>
          </div>
          <div className="sheet-time-labels font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Big Touch Controls */}
        <div className="sheet-controls-grid">
          <button 
            className="sheet-touch-btn"
            onClick={prevTrack}
            aria-label="Previous track"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="19,20 9,12 19,4"/>
              <line x1="5" y1="4" x2="5" y2="20" stroke="currentColor" strokeWidth="2.5"/>
            </svg>
          </button>

          <button 
            className="sheet-play-mega-btn"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16"/>
                <rect x="14" y="4" width="4" height="16"/>
              </svg>
            ) : (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: 3 }}>
                <polygon points="5,3 19,12 5,21"/>
              </svg>
            )}
          </button>

          <button 
            className="sheet-touch-btn"
            onClick={nextTrack}
            aria-label="Next track"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,4 15,12 5,20"/>
              <line x1="19" y1="4" x2="19" y2="20" stroke="currentColor" strokeWidth="2.5"/>
            </svg>
          </button>
        </div>

        {/* Volume & Mute Row */}
        <div className="sheet-volume-row">
          <button 
            className="sheet-vol-mute-btn"
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="1" y1="1" x2="23" y2="23"/>
                <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
                <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            className="sheet-volume-slider"
            aria-label="Volume slider"
          />
        </div>
      </div>
    </div>
  );
}
