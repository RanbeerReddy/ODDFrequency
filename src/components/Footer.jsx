import React from 'react';

export default function Footer({ onSwitchView, onOpenArena }) {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top-grid">
          {/* Brand info column */}
          <div className="footer-col-brand">
            <div className="footer-brand-title">
              ODD FREQUENCY
            </div>
            <p className="footer-brand-bio">
              Independent experimental clothing brand for Indian counterculture. Exploring the collision between authentic vintage rock &amp; metal tour wear, Charli brat-summer irony, visual lithograph art, and underground radio soundscapes.
            </p>
            <div style={{ marginTop: '0.5rem' }}>
              <span className="badge-id">CONCEPT PROTOTYPE &bull; ZERO REAL PAYMENTS</span>
            </div>
          </div>

          {/* Navigation links */}
          <div className="footer-col-nav">
            <h4>EXPLORATION</h4>
            <ul className="footer-links-list">
              <li>
                <a href="#home" onClick={(e) => { e.preventDefault(); onSwitchView('home'); }}>
                  Home (Overview)
                </a>
              </li>
              <li>
                <a href="#apparel" onClick={(e) => { e.preventDefault(); onSwitchView('apparel'); }}>
                  Apparel (Band &amp; Grunge Tees)
                </a>
              </li>
              <li>
                <a href="#art" onClick={(e) => { e.preventDefault(); onSwitchView('art'); }}>
                  Art (Lithographs &amp; Screenprints)
                </a>
              </li>
              <li>
                <a href="#music" onClick={(e) => { e.preventDefault(); onSwitchView('music'); }}>
                  Music (Radio Sound System)
                </a>
              </li>
              <li>
                <a href="#vote-drop" onClick={(e) => { e.preventDefault(); onOpenArena(); }}>
                  Vote on Next Drop
                </a>
              </li>
              <li>
                <a href="#manifesto" onClick={(e) => { e.preventDefault(); onSwitchView('manifesto'); }}>
                  Brand Manifesto
                </a>
              </li>
            </ul>
          </div>

          {/* Community & Social placeholders */}
          <div className="footer-col-social">
            <h4>COMMUNITY CHANNELS</h4>
            <ul className="footer-links-list">
              <li>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                  Instagram // @oddfrequency.in
                </a>
              </li>
              <li>
                <a href="https://discord.com" target="_blank" rel="noopener noreferrer">
                  Discord // The Underground Signal
                </a>
              </li>
              <li>
                <a href="https://spotify.com" target="_blank" rel="noopener noreferrer">
                  Spotify // Odd Frequency Tapes
                </a>
              </li>
              <li>
                <a href="#waitlist" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); }}>
                  Launch Waitlist Access
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & disclaimer row */}
        <div className="footer-bottom-row">
          <div>
            &copy; {new Date().getFullYear()} ODD FREQUENCY &bull; ALL RIGHTS RESERVED.
          </div>
          <div>
            DEMAND-VALIDATION PROTOTYPE &bull; FABRICATED IN INDIA &bull; NO OVERPRODUCTION
          </div>
        </div>
      </div>
    </footer>
  );
}
