import React, { useState, useEffect } from 'react';
import { useAudio } from '../../context/useAudio.js';
import CyberDeck from './CyberDeck.jsx';
import MobileMiniPlayer from './MobileMiniPlayer.jsx';
import MobilePlayerSheet from './MobilePlayerSheet.jsx';
import CrtOverlay from './CrtOverlay.jsx';

export default function YouTubePlayer() {
  const { currentTrack, isPlaying, crtMode } = useAudio();
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const listParam = currentTrack?.playlistId ? `&list=${currentTrack.playlistId}` : '';
  const embedUrl = currentTrack?.youtubeId 
    ? `https://www.youtube.com/embed/${currentTrack.youtubeId}?autoplay=1&enablejsapi=1${listParam}&origin=${origin}`
    : '';

  return (
    <>
      {/* Hidden/Background YouTube Audio Streamer */}
      {currentTrack?.youtubeId && isPlaying && (
        <div 
          style={{ 
            position: 'absolute', 
            width: 1, 
            height: 1, 
            opacity: 0.01, 
            pointerEvents: 'none', 
            overflow: 'hidden',
            bottom: 0,
            left: 0
          }} 
          aria-hidden="true"
        >
          <iframe
            title="Audio Background Streamer"
            width="100"
            height="100"
            src={embedUrl}
            allow="autoplay; encrypted-media"
          />
        </div>
      )}

      {/* Retro CRT Scanline Screen Overlay */}
      <CrtOverlay active={crtMode} />

      {/* Responsive Presentation: Desktop Floating Deck vs Mobile Mini-Dock + Sheet */}
      {isMobile ? (
        <>
          <MobileMiniPlayer />
          <MobilePlayerSheet />
        </>
      ) : (
        <CyberDeck />
      )}
    </>
  );
}
