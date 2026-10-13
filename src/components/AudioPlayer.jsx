import React, { useState, useEffect } from 'react';
import { audioPlayerService } from '../utils/audioEngine.js';

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const trackInfo = {
    title: "ODD FREQUENCY // RADIO 001",
    subtitle: "Low-Resonance Lo-Fi Drone",
    status: isPlaying ? "STREAMING" : "PAUSED (OFF)"
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      audioPlayerService.stop();
      setIsPlaying(false);
    } else {
      audioPlayerService.setVolume(isMuted ? 0 : volume);
      audioPlayerService.start();
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (isMuted && val > 0) setIsMuted(false);
    audioPlayerService.setVolume(val);
  };

  const handleToggleMute = () => {
    const nextMuted = audioPlayerService.toggleMute();
    setIsMuted(nextMuted);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioPlayerService.stop();
    };
  }, []);

  return (
    <aside 
      className="audio-player-dock" 
      aria-label="Ambient Background Audio Experience"
    >
      {/* Play / Pause Action Button */}
      <button 
        className="audio-play-btn"
        onClick={handleTogglePlay}
        aria-label={isPlaying ? "Pause ambient soundscape" : "Play ambient lo-fi soundscape"}
        title={isPlaying ? "Pause Soundscape" : "Play Ambient Lo-Fi Tape Drone"}
      >
        {isPlaying ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: 2 }}>
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        )}
      </button>

      {/* Track & Frequency visualizer info */}
      <div className="audio-info-col">
        <div className="audio-track-title">
          {trackInfo.title}
        </div>
        <div className="audio-meta-row">
          <div className={`audio-bars ${isPlaying ? 'active' : ''}`} aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span>{isPlaying ? trackInfo.subtitle : 'CLICK PLAY TO LISTEN'}</span>
        </div>
      </div>

      {/* Volume and Mute Controls */}
      <div className="audio-controls-right">
        <button 
          className="btn-audio-mute"
          onClick={handleToggleMute}
          aria-label={isMuted ? "Unmute audio" : "Mute audio"}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted || volume === 0 ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <line x1="23" y1="9" x2="17" y2="15"></line>
              <line x1="17" y1="9" x2="23" y2="15"></line>
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          className="audio-vol-slider"
          aria-label="Audio volume"
          title={`Volume: ${Math.round(volume * 100)}%`}
        />
      </div>
    </aside>
  );
}
