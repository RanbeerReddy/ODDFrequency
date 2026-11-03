import React from 'react';
import { useAudio } from '../../context/useAudio.js';
import VisualizerBars from './VisualizerBars.jsx';

export default function MobileMiniPlayer() {
  const {
    currentTrack,
    isPlaying,
    progressPercent,
    currentStation,
    togglePlay,
    setIsMobileSheetOpen
  } = useAudio();

  return (
    <div 
      className="mobile-mini-player-bar"
      onClick={() => setIsMobileSheetOpen(true)}
      role="region"
      aria-label="Mobile Mini Player. Tap to open full player."
    >
      {/* Top micro progress line */}
      <div className="mini-player-progress-line" style={{ width: `${progressPercent}%` }} />

      <div className="mini-player-inner">
        {/* Left: Thumbnail with live dot */}
        <div className="mini-player-thumb-wrap">
          <img 
            src={`https://img.youtube.com/vi/${currentTrack.youtubeId}/mqdefault.jpg`}
            alt={currentTrack.title}
            className="mini-player-thumb"
            onError={(e) => {
              e.target.src = currentTrack.cover || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80';
            }}
          />
          {isPlaying && <span className="mini-pulse-dot" />}
        </div>

        {/* Center: Title & Artist marquee */}
        <div className="mini-player-text">
          <div className="mini-player-station font-mono">
            {currentStation.frequency} // {currentStation.name}
          </div>
          <div className="mini-player-title">
            {currentTrack.title} &bull; <span className="mini-artist">{currentTrack.artist}</span>
          </div>
        </div>

        {/* Right: Waveform & Play/Pause */}
        <div className="mini-player-actions" onClick={(e) => e.stopPropagation()}>
          <div className="mini-wave-wrap">
            <VisualizerBars isPlaying={isPlaying} barCount={5} accentColor="var(--accent-purple)" />
          </div>

          <button 
            className="mini-play-btn"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16"/>
                <rect x="14" y="4" width="4" height="16"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5,3 19,12 5,21"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
