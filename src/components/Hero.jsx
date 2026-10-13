import React from 'react';

export default function Hero({ onExploreVoid, onExploreFeed, onOpenArena }) {
  return (
    <section className="hero-section" aria-labelledby="hero-title">
      <div className="container">
        {/* Top metadata strip */}
        <div className="hero-meta-strip">
          <span>// INDEPENDENT EXPERIMENTAL WEAR</span>
          <span>CONCEPT STAGE &bull; DEMAND VALIDATION</span>
          <span>EST. 2026 // INDIA</span>
        </div>

        {/* Main Editorial Headline & Subtitle */}
        <h1 id="hero-title" className="hero-headline">
          FIND YOUR FREQUENCY.
        </h1>

        <p className="hero-subheading">
          <strong>Clothes for the beautifully out of sync.</strong>{' '}
          Zero inventory. Zero hype-tax. An experimental fashion project designed at the collision of dark underground heavywear and niche internet irony.
        </p>

        {/* Exploration pills & status */}
        <div className="hero-sub-meta">
          <div className="hero-pill">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#94172b', display: 'inline-block' }}></span>
            <span>THE VOID &bull; Underground Grunge Heavywear</span>
          </div>
          <div className="hero-pill">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#d4ff00', display: 'inline-block' }}></span>
            <span>THE FEED &bull; Ironic Graphics &amp; Baby Tees</span>
          </div>
          <button 
            onClick={onOpenArena}
            className="hero-pill"
            style={{ cursor: 'pointer', border: '1px solid var(--accent-lime)', color: 'var(--text-primary)' }}
          >
            <span>&rarr; Vote to Decide Drop #01</span>
          </button>
        </div>
      </div>
    </section>
  );
}
