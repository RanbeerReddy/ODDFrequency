import React from 'react';

export default function CollectionCards({ onSelectApparel, onSelectArt, onSelectMusic }) {
  return (
    <section className="duality-section" aria-labelledby="duality-heading">
      <div className="container">
        <div className="duality-intro">
          <div>
            <h2 id="duality-heading" className="duality-title">
              THREE PILLARS. ONE FREQUENCY.
            </h2>
            <p className="font-sub" style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Explore the collision of wearable graphic textiles, visual art lithographs, and underground broadcast sound.
            </p>
          </div>
          <div className="duality-hint font-mono">
            <span>[ SELECT PORTAL TO ENTER ]</span>
          </div>
        </div>

        <div className="duality-grid three-col-grid">
          {/* APPAREL CARD */}
          <article 
            className="collection-card card-void"
            onClick={onSelectApparel}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectApparel()}
            aria-label="Enter Apparel - Vintage band merch, grunge tees, brat summer minimalist tees"
          >
            <div className="card-image-wrap">
              <span className="card-overlay-tag badge-id" style={{ borderColor: 'var(--accent-purple)', color: 'var(--accent-purple)' }}>
                01 // WEARABLE TEXTILES
              </span>
              <img 
                src="images/slipknot-tee.jpg" 
                alt="Apparel collection - Vintage Slipknot, Nirvana, Black Sabbath and Brat graphic tees"
                loading="eager"
              />
            </div>

            <div className="card-content">
              <div className="card-header-row">
                <h3 className="card-title">APPAREL</h3>
                <span className="card-count">12 DESIGNS &bull; CONCEPT</span>
              </div>
              <p className="card-tagline">
                Authentic vintage band tour merch, heavy 280-300 GSM acid mineral-wash tees, Charli Brat summer minimalism, and 90s contrast ringers.
              </p>

              <div className="card-footer-row">
                <span className="badge-id">240-300 GSM / VINTAGE WASH / SINGLE STITCH</span>
                <span className="card-cta">
                  EXPLORE APPAREL &rarr;
                </span>
              </div>
            </div>
          </article>

          {/* ART CARD */}
          <article 
            className="collection-card card-art"
            onClick={onSelectArt}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectArt()}
            aria-label="Enter Visual Art Archive - Lithographs, dark fantasy manga proofs and screenprints"
          >
            <div className="card-image-wrap">
              <span className="card-overlay-tag badge-id" style={{ borderColor: '#94172b', color: '#ff9fae' }}>
                02 // VISUAL ARCHIVE
              </span>
              <img 
                src="images/berserk-tee.jpg" 
                alt="Art archive - Guts dark fantasy manga lithographs and screenprint proofs"
                loading="eager"
              />
            </div>

            <div className="card-content">
              <div className="card-header-row">
                <h3 className="card-title">VISUAL ART</h3>
                <span className="card-count">ARCHIVE SCANS</span>
              </div>
              <p className="card-tagline">
                High-resolution screenprint proofs, Japanese dark fantasy manga studies, tour poster lithographs, and subcultural graphic experiments.
              </p>

              <div className="card-footer-row">
                <span className="badge-id">RAW INK / SCREENPRINT / LITHOGRAPH</span>
                <span className="card-cta">
                  VIEW EXHIBITION &rarr;
                </span>
              </div>
            </div>
          </article>

          {/* MUSIC CARD */}
          <article 
            className="collection-card card-feed"
            onClick={onSelectMusic}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectMusic()}
            aria-label="Enter Sound System - Underground house, 90s grunge, metal wave and live radio"
          >
            <div className="card-image-wrap">
              <span className="card-overlay-tag badge-id" style={{ borderColor: '#38bdf8', color: '#38bdf8' }}>
                03 // BROADCAST
              </span>
              <img 
                src="images/brat-tee.jpg" 
                alt="Music Sound System - Underground live radio channels and cassette tapes"
                loading="eager"
              />
            </div>

            <div className="card-content">
              <div className="card-header-row">
                <h3 className="card-title">MUSIC SYSTEM</h3>
                <span className="card-count">5 CHANNELS &bull; LIVE</span>
              </div>
              <p className="card-tagline">
                Underground house beats, electro rave, 90s Seattle grunge cassettes, industrial metal waves, and deep meditative lo-fi drone loops.
              </p>

              <div className="card-footer-row">
                <span className="badge-id">LIVE SYNTHESIS / ZERO LATENCY / RADIO</span>
                <span className="card-cta">
                  TUNE IN FREQUENCY &rarr;
                </span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
