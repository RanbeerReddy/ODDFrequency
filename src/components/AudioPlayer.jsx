import React, { useState, useEffect, useRef } from 'react';
import { audioPlayerService } from '../utils/audioEngine.js';
import { RADIO_STATIONS } from '../data/music.js';

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStationIdx, setCurrentStationIdx] = useState(0);
  const [volume, setVolume] = useState(0.65);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  const currentStation = RADIO_STATIONS[currentStationIdx] || RADIO_STATIONS[0];
  const timerRef = useRef(null);

  // Playback timer ticker
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => (prev >= 240 ? 0 : prev + 1));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      audioPlayerService.stop();
      setIsPlaying(false);
    } else {
      audioPlayerService.setVolume(isMuted ? 0 : volume);
      audioPlayerService.start(currentStation.id);
      setIsPlaying(true);
    }
  };

  const handleNextStation = () => {
    let nextIdx;
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * RADIO_STATIONS.length);
      if (nextIdx === currentStationIdx) {
        nextIdx = (currentStationIdx + 1) % RADIO_STATIONS.length;
      }
    } else {
      nextIdx = (currentStationIdx + 1) % RADIO_STATIONS.length;
    }
    setCurrentStationIdx(nextIdx);
    setElapsedSeconds(0);
    if (isPlaying) {
      audioPlayerService.setStation(RADIO_STATIONS[nextIdx].id);
    }
  };

  const handlePrevStation = () => {
    const prevIdx = (currentStationIdx - 1 + RADIO_STATIONS.length) % RADIO_STATIONS.length;
    setCurrentStationIdx(prevIdx);
    setElapsedSeconds(0);
    if (isPlaying) {
      audioPlayerService.setStation(RADIO_STATIONS[prevIdx].id);
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

  const handleSeek = (e) => {
    const val = parseInt(e.target.value, 10);
    setElapsedSeconds(val);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioPlayerService.stop();
    };
  }, []);

  return (
    <aside 
      className={`cyber-radio-deck ${isMinimized ? 'minimized' : ''}`}
      aria-label="Odd Frequency Vintage Skeuomorphic Radio Player"
    >
      {/* Top Chrome Title Strip */}
      <div className="radio-top-strip">
        <div className="strip-title-left">
          <span className="strip-station-name">{currentStation.name.toUpperCase()}</span>
        </div>
        
        <div className="strip-right-controls">
          <span className="strip-youtube-badge">YOUTUBE</span>
          <button 
            className="btn-deck-minimize"
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? "Expand Radio Player" : "Minimize Player"}
            aria-label={isMinimized ? "Expand Player" : "Minimize Player"}
          >
            {isMinimized ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="radio-deck-body">
          {/* Left Screen Box (Video / Screen display with deep purple nebula glow) */}
          <div className="radio-screen-box">
            <div className="screen-purple-nebula" aria-hidden="true"></div>
            
            <div className="screen-content-layer">
              <div className="screen-youtube-header">
                <span className="yt-icon-play">
                  <svg width="15" height="11" viewBox="0 0 24 16" fill="red">
                    <path d="M23.5 2.6c-.3-1-1-1.8-2-2.1C19.7 0 12 0 12 0S4.3 0 2.5.5c-1 .3-1.7 1.1-2 2.1C0 4.4 0 8 0 8s0 3.6.5 5.4c.3 1 1 1.8 2 2.1C4.3 16 12 16 12 16s7.7 0 9.5-.5c1-.3 1.7-1.1 2-2.1.5-1.8.5-5.4.5-5.4s0-3.6-.5-5.4z" />
                    <polygon points="9.6 11.4 15.8 8 9.6 4.6 9.6 11.4" fill="white" />
                  </svg>
                </span>
                <span className="yt-text">YouTube</span>
              </div>

              <div className="screen-status-row">
                {isPlaying ? (
                  <>
                    <div className="screen-status-active">
                      <span className="radio-pulse-pip"></span>
                      <span>STREAMING AUDIO</span>
                    </div>
                    <div className="screen-station-sub">{currentStation.genre}</div>
                  </>
                ) : (
                  <>
                    <div className="screen-status-idle">
                      ODD FREQUENCY
                    </div>
                    <div className="screen-station-sub">CLICK PLAY TO TUNE IN</div>
                  </>
                )}
              </div>

              {/* Pulsing visualizer waves in the screen */}
              <div className={`screen-wave-bars ${isPlaying ? 'streaming' : ''}`} aria-hidden="true">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>

          {/* Right Section: Info, Timeline Seekbar, Buttons, Volume */}
          <div className="radio-controls-panel">
            {/* Title & Channel Subtitle */}
            <div className="radio-meta-header">
              <h4 className="radio-track-headline">
                {currentStation.name}
              </h4>
              <div className="radio-track-sub">
                {currentStation.subtitle}
              </div>
            </div>

            {/* Seekbar with Time Indicators */}
            <div className="radio-seek-container">
              <span className="time-display time-current">
                {formatTime(elapsedSeconds)}
              </span>
              <div className="seek-track-wrapper">
                <input 
                  type="range"
                  min="0"
                  max="240"
                  value={elapsedSeconds}
                  onChange={handleSeek}
                  className="radio-seek-range"
                  aria-label="Track progress seekbar"
                />
              </div>
              <span className="time-display time-duration">
                {currentStation.length}
              </span>
            </div>

            {/* Tactile Control Buttons Row */}
            <div className="radio-buttons-row">
              <div className="playback-buttons-group">
                {/* Shuffle Button */}
                <button 
                  className={`deck-btn btn-shuffle ${isShuffle ? 'active-glow' : ''}`}
                  onClick={() => setIsShuffle(!isShuffle)}
                  title={isShuffle ? "Shuffle On" : "Shuffle Off"}
                  aria-label="Shuffle stations"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 3 21 3 21 8"></polyline>
                    <line x1="4" y1="20" x2="21" y2="3"></line>
                    <polyline points="21 16 21 21 16 21"></polyline>
                    <line x1="15" y1="15" x2="21" y2="21"></line>
                    <line x1="4" y1="4" x2="9" y2="9"></line>
                  </svg>
                </button>

                {/* Prev Button */}
                <button 
                  className="deck-btn btn-prev"
                  onClick={handlePrevStation}
                  title="Previous Station"
                  aria-label="Previous Station"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="4" y="5" width="2.5" height="14" />
                    <polygon points="20 18 10 12 20 6 20 18" />
                  </svg>
                </button>

                {/* Play / Pause Main Button */}
                <button 
                  className={`deck-btn btn-play-main ${isPlaying ? 'playing' : ''}`}
                  onClick={handleTogglePlay}
                  title={isPlaying ? "Pause Radio" : "Play Radio"}
                  aria-label={isPlaying ? "Pause Radio" : "Play Radio"}
                >
                  {isPlaying ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: 2 }}>
                      <polygon points="6 4 20 12 6 20 6 4" />
                    </svg>
                  )}
                </button>

                {/* Next Button (highlighted cyan/purple glow outline like in screenshot) */}
                <button 
                  className="deck-btn btn-next highlighted-btn"
                  onClick={handleNextStation}
                  title="Next Station"
                  aria-label="Next Station"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="4 6 14 12 4 18 4 6" />
                    <rect x="17.5" y="5" width="2.5" height="14" />
                  </svg>
                </button>
              </div>

              {/* Volume Controls */}
              <div className="deck-volume-group">
                <button 
                  className="btn-volume-icon"
                  onClick={handleToggleMute}
                  title={isMuted ? "Unmute" : "Mute"}
                  aria-label="Toggle Mute"
                >
                  {isMuted || volume === 0 ? (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                      <line x1="23" y1="9" x2="17" y2="15"></line>
                      <line x1="17" y1="9" x2="23" y2="15"></line>
                    </svg>
                  ) : (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    </svg>
                  )}
                </button>

                <div className="volume-slider-track">
                  <input 
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="radio-vol-range"
                    aria-label="Audio volume"
                    title={`Volume: ${Math.round(volume * 100)}%`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
