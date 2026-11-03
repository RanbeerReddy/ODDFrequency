import React from 'react';

export default function VisualizerBars({ isPlaying, barCount = 12, accentColor = 'var(--accent-purple)' }) {
  const bars = Array.from({ length: barCount }, (_, i) => i);

  return (
    <div className={`audio-visualizer-bars ${isPlaying ? 'is-playing' : 'is-paused'}`} aria-hidden="true">
      {bars.map((bar) => {
        // Randomize initial heights or animation delays
        const delay = (bar * 0.08).toFixed(2);
        const duration = (0.4 + (bar % 5) * 0.15).toFixed(2);
        return (
          <span
            key={bar}
            className="vis-bar"
            style={{
              backgroundColor: accentColor,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`
            }}
          />
        );
      })}
    </div>
  );
}

