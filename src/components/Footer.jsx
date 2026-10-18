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
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Instagram // @oddfrequency.in <span style={{ color: 'var(--accent-lime)', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>[Coming Soon]</span>
                </span>
              </li>
              <li>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Discord // Underground Signal <span style={{ color: 'var(--accent-lime)', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>[Coming Soon]</span>
                </span>
              </li>
              <li>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Spotify // Brand Audio Archive <span style={{ color: 'var(--accent-lime)', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>[Coming Soon]</span>
                </span>
              </li>
              <li>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Contact // Direct Inquiries <span style={{ color: 'var(--accent-lime)', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>[Opening with Drop #01]</span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Pre-Launch Transparency & Privacy Notice */}
        <div style={{
          marginTop: '2rem',
          padding: '1.25rem 1.5rem',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          lineHeight: '1.6'
        }}>
          <div style={{ color: 'var(--text-primary)', fontWeight: '700', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
            // PRE-LAUNCH TRANSPARENCY &amp; PRIVACY NOTICE
          </div>
          <p style={{ marginBottom: '0.5rem' }}>
            <strong>Concept Stage:</strong> Odd Frequency is currently an independent prototype testing demand for limited-run apparel in India. No commercial transactions, inventory sales, or payments take place on this website.
          </p>
          <p style={{ marginBottom: '0.5rem' }}>
            <strong>Data &amp; Privacy:</strong> This website does not currently connect to a persistent external database or tracking server. Votes and waitlist inputs remain strictly within your local browser session unless an official backend endpoint is configured. We do not sell or distribute visitor data.
          </p>
          <p style={{ margin: 0 }}>
            <strong>Contact &amp; Inquiries:</strong> Official contact channels and community links will be announced upon the public deployment of Drop #01.
          </p>
        </div>

        {/* Bottom copyright & disclaimer row */}
        <div className="footer-bottom-row">
          <div>
            &copy; 2026 ODD FREQUENCY &bull; ALL RIGHTS RESERVED.
          </div>
          <div>
            DEMAND-VALIDATION PROTOTYPE &bull; FABRICATED IN INDIA &bull; NO OVERPRODUCTION
          </div>
        </div>
      </div>
    </footer>
  );
}
