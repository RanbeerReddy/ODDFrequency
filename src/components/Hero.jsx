import React from 'react';

export default function Hero({ onExploreApparel, onExploreArt, onExploreMusic, onOpenArena }) {
  return (
    <section className="hero-section" aria-labelledby="hero-title">
      <div className="container">
        {/* Top metadata strip */}
        <div className="hero-meta-strip">
          <span>// INDEPENDENT EXPERIMENTAL WEAR &amp; SOUND</span>
          <span>CONCEPT STAGE &bull; DEMAND VALIDATION</span>
          <span>EST. 2026 // INDIA</span>
        </div>

        {/* Main Editorial Headline & Subtitle */}
        <h1 id="hero-title" className="hero-headline">
          FIND YOUR FREQUENCY.
        </h1>

        <p className="hero-subheading">
          <strong>Clothes for the beautifully out of sync.</strong>{' '}
          Zero inventory. Zero hype-tax. Vintage 90s band tour merch, dark fantasy manga graphics, Charli brat-summer irony, and underground radio soundscapes designed for counterculture youth.
        </p>

        {/* Exploration pills & status */}
        <div className="hero-sub-meta">
          <button 
            onClick={onExploreApparel}
            className="hero-pill"
            style={{ cursor: 'pointer' }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-purple)', display: 'inline-block' }}></span>
            <span>APPAREL &bull; Vintage Band &amp; Grunge Tees ({12})</span>
          </button>
          
          <button 
            onClick={onExploreArt}
            className="hero-pill"
            style={{ cursor: 'pointer' }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#94172b', display: 'inline-block' }}></span>
            <span>ART &bull; Screenprint &amp; Tour Poster Archive</span>
          </button>

          <button 
            onClick={onExploreMusic}
            className="hero-pill"
            style={{ cursor: 'pointer' }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#38bdf8', display: 'inline-block' }}></span>
            <span>MUSIC &bull; Radio Sound System</span>
          </button>

          <button 
            onClick={onOpenArena}
            className="hero-pill"
            style={{ cursor: 'pointer', border: '1px solid var(--accent-purple)', color: 'var(--text-primary)' }}
          >
            <span>&rarr; Vote on Next Drop Prototype</span>
          </button>
        </div>
      </div>
    </section>
  );
}
