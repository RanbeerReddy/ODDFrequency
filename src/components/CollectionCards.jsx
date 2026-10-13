import React from 'react';

export default function CollectionCards({ onSelectVoid, onSelectFeed }) {
  return (
    <section className="duality-section" aria-labelledby="duality-heading">
      <div className="container">
        <div className="duality-intro">
          <div>
            <h2 id="duality-heading" className="duality-title">
              TWO WORLDS. ONE FREQUENCY.
            </h2>
            <p className="font-sub" style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Choose your subculture below or switch effortlessly at any time.
            </p>
          </div>
          <div className="duality-hint font-mono">
            <span>[ SELECT PORTAL TO ENTER ]</span>
          </div>
        </div>

        <div className="duality-grid">
          {/* THE VOID CARD */}
          <article 
            className="collection-card card-void"
            onClick={onSelectVoid}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectVoid()}
            aria-label="Enter The Void collection - Dark alternative, goth, metal-inspired and grunge fashion"
          >
            <div className="card-image-wrap">
              <span className="card-overlay-tag badge-id badge-void">
                01 // SUBTERRANEAN
              </span>
              <img 
                src="images/void-hero.jpg" 
                alt="The Void editorial look - Dark grunge distressed heavy streetwear with cyber-sigilism graphics"
                loading="eager"
              />
            </div>

            <div className="card-content">
              <div className="card-header-row">
                <h3 className="card-title">THE VOID</h3>
                <span className="card-count">4 DESIGNS &bull; CONCEPT</span>
              </div>
              <p className="card-tagline">
                Dark alternative, goth, metal-inspired, grunge and underground heavywear. Heavyweight French Terry, acid distressing and cyber-sigils.
              </p>

              <div className="card-footer-row">
                <span className="badge-id">FADED BLACK / BURGUNDY / 280-380 GSM</span>
                <span className="card-cta">
                  EXPLORE THE VOID &rarr;
                </span>
              </div>
            </div>
          </article>

          {/* THE FEED CARD */}
          <article 
            className="collection-card card-feed"
            onClick={onSelectFeed}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectFeed()}
            aria-label="Enter The Feed collection - Ironic graphic tees, baby tees, niche internet humour and playful Gen-Z fashion"
          >
            <div className="card-image-wrap">
              <span className="card-overlay-tag badge-id badge-feed">
                02 // CHRONICALLY ONLINE
              </span>
              <img 
                src="images/feed-hero.jpg" 
                alt="The Feed editorial look - Playful Gen-Z baby tee with ironic internet culture graphics and lime green accents"
                loading="eager"
              />
            </div>

            <div className="card-content">
              <div className="card-header-row">
                <h3 className="card-title">THE FEED</h3>
                <span className="card-count">4 DESIGNS &bull; CONCEPT</span>
              </div>
              <p className="card-tagline">
                Ironic graphic tees, cropped baby tees, niche internet humor, absurd slogans and high-flash playful Gen-Z aesthetics.
              </p>

              <div className="card-footer-row">
                <span className="badge-id">BONE WHITE / ACID LIME / 190-250 GSM</span>
                <span className="card-cta">
                  EXPLORE THE FEED &rarr;
                </span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
