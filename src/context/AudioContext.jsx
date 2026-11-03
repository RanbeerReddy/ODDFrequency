import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { AudioContext } from './audioContextDef.js';
import { DEFAULT_TRACKS, STATIONS } from '../data/musicTracks.js';

export function AudioProvider({ children }) {
  const [tracks, setTracks] = useState(DEFAULT_TRACKS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentStation, setCurrentStation] = useState(STATIONS[0]);
  const [crtMode, setCrtMode] = useState(false);
  const [theatreMode, setTheatreMode] = useState(false);
  const [visualizerActive, setVisualizerActive] = useState(true);
  const [isLiveSync, setIsLiveSync] = useState(false);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  const playerRef = useRef(null);
  const timerRef = useRef(null);

  const currentTrack = tracks[currentIndex] || tracks[0];

  // Derived track duration in seconds
  const duration = useMemo(() => {
    if (!currentTrack?.duration) return 240;
    const parts = currentTrack.duration.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    }
    return 240;
  }, [currentTrack]);

  // Audio playback ticker simulation for background/fallback audio
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setCurrentIndex(idx => (idx + 1) % tracks.length);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, duration, tracks.length]);

  const playTrack = useCallback((track) => {
    const idx = tracks.findIndex(t => t.id === track.id || t.youtubeId === track.youtubeId);
    if (idx !== -1) {
      setCurrentIndex(idx);
    } else {
      setTracks(prev => [track, ...prev]);
      setCurrentIndex(0);
    }
    if (track.stationId) {
      const st = STATIONS.find(s => s.id === track.stationId);
      if (st) setCurrentStation(st);
    }
    setCurrentTime(0);
    setIsPlaying(true);
  }, [tracks]);

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const nextTrack = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % tracks.length);
    setCurrentTime(0);
    setIsPlaying(true);
  }, [tracks.length]);

  const prevTrack = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + tracks.length) % tracks.length);
    setCurrentTime(0);
    setIsPlaying(true);
  }, [tracks.length]);

  const seekTo = useCallback((seconds) => {
    const clamped = Math.max(0, Math.min(seconds, duration));
    setCurrentTime(clamped);
  }, [duration]);

  const setVolume = useCallback((val) => {
    const num = Math.max(0, Math.min(100, Number(val)));
    setVolumeState(num);
    if (num > 0 && isMuted) {
      setIsMuted(false);
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const setStation = useCallback((stationId) => {
    const st = STATIONS.find(s => s.id === stationId) || STATIONS[0];
    setCurrentStation(st);
    const trackIdx = tracks.findIndex(t => t.stationId === st.id);
    if (trackIdx !== -1) {
      setCurrentIndex(trackIdx);
      setCurrentTime(0);
      setIsPlaying(true);
    }
  }, [tracks]);

  const tuneLive = useCallback(() => {
    setIsLiveSync(prev => !prev);
    const now = Math.floor(Date.now() / 1000);
    const virtualOffset = now % (duration || 300);
    setCurrentTime(virtualOffset);
    setIsPlaying(true);
  }, [duration]);

  const toggleCrt = useCallback(() => {
    setCrtMode(prev => !prev);
  }, []);

  const toggleTheatre = useCallback(() => {
    setTheatreMode(prev => !prev);
  }, []);

  const toggleVisualizer = useCallback(() => {
    setVisualizerActive(prev => !prev);
  }, []);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const value = {
    tracks,
    currentTrack,
    currentIndex,
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
    isMobileSheetOpen,
    playerRef,
    playTrack,
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
    toggleVisualizer,
    setIsMobileSheetOpen
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
}
