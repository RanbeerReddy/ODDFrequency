import React from 'react';

export default function CrtOverlay({ active }) {
  if (!active) return null;
  return (
    <div className="crt-screen-overlay" aria-hidden="true">
      <div className="crt-scanlines"></div>
      <div className="crt-glow"></div>
    </div>
  );
}

