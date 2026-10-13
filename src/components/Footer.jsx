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
              Independent experimental clothing brand for Indian Gen-Z. Exploring the friction between underground heavywear (The Void) and ironic niche internet humor (The Feed).
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
                <a href="#convergence" onClick={(e) => { e.preventDefault(); onSwitchView('home'); }}>
                  Convergence (Home)
                </a>
              </li>
              <li>
                <a href="#void" onClick={(e) => { e.preventDefault(); onSwitchView('void'); }}>
                  The Void (Grunge Heavywear)
                </a>
              </li>
              <li>
                <a href="#feed" onClick={(e) => { e.preventDefault(); onSwitchView('feed'); }}>
                  The Feed (Ironic Internet Tees)
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
