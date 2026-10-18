import React, { useState } from 'react';

export default function Navbar({
  activeView,
  setActiveView,
  totalVotesCount = 0,
  onOpenArena
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Navigate to a view and always close the mobile drawer
  const navigate = (view) => {
    setActiveView(view);
    setMobileOpen(false);
  };

  const openArena = () => {
    onOpenArena();
    setMobileOpen(false);
  };

  return (
    <>
      {/* Top Demand Validation Disclaimer Strip */}
      <div className="disclaimer-strip" role="banner" aria-label="Prototype Notice">
        <span className="dot" aria-hidden="true"></span>
        <span>
          <strong>CONCEPT PROTOTYPE:</strong> We carry zero inventory. Vote for your favourite designs to help us decide what to manufacture in India. No real payments.
        </span>
      </div>

      <header className="site-nav">
        <div className="container">
          <div className="nav-inner">

            {/* Brand Logo & Wordmark */}
            <div
              className="brand-logo-wrap"
              onClick={() => navigate('home')}
              style={{ cursor: 'pointer' }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate('home')}
              aria-label="Odd Frequency Home"
            >
              <div className="brand-wordmark">
                ODD FREQUENCY
                <div className="brand-mark-wave" aria-hidden="true">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
              <span className="brand-tag">00 // INDEPENDENT LABEL</span>
            </div>

            {/* Desktop Navigation Links — hidden on mobile via CSS */}
            <nav aria-label="Main Navigation" className="nav-desktop">
              <ul className="nav-links">
                <li>
                  <button
                    className={`nav-link ${activeView === 'home' ? 'active' : ''}`}
                    onClick={() => navigate('home')}
                  >
                    Home
                  </button>
                </li>
                <li>
                  <button
                    className={`nav-link ${activeView === 'apparel' || activeView === 'void' || activeView === 'feed' ? 'active' : ''}`}
                    onClick={() => navigate('apparel')}
                  >
                    Apparel
                  </button>
                </li>
                <li>
                  <button
                    className={`nav-link ${activeView === 'art' ? 'active' : ''}`}
                    onClick={() => navigate('art')}
                  >
                    Art
                  </button>
                </li>
                <li>
                  <button
                    className={`nav-link ${activeView === 'music' ? 'active' : ''}`}
                    onClick={() => navigate('music')}
                  >
                    Music
                  </button>
                </li>
                <li>
                  <button
                    className={`nav-link ${activeView === 'manifesto' ? 'active' : ''}`}
                    onClick={() => navigate('manifesto')}
                  >
                    Manifesto
                  </button>
                </li>
              </ul>
            </nav>

            {/* Desktop Action Bar — hidden on mobile via CSS */}
            <div className="nav-actions nav-desktop">
              <button
                className="btn-vote-shortcut"
                onClick={openArena}
                aria-label={`View Next Drop Voting Arena, ${totalVotesCount} session votes cast`}
                title="Community Voting Arena"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <span>NEXT DROP</span>
                {totalVotesCount > 0 && (
                  <span style={{
                    background: 'var(--accent-purple)',
                    color: '#ffffff',
                    padding: '0.1rem 0.35rem',
                    fontSize: '0.65rem',
                    borderRadius: '2px',
                    fontWeight: '800'
                  }}>
                    {totalVotesCount}
                  </span>
                )}
              </button>
            </div>

            {/* Hamburger toggle — visible only on mobile via CSS */}
            <button
              className={`nav-hamburger ${mobileOpen ? 'is-open' : ''}`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-drawer"
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              <span className="hamburger-bar"></span>
              <span className="hamburger-bar"></span>
              <span className="hamburger-bar"></span>
            </button>

          </div>
        </div>

        {/* Mobile navigation drawer */}
        <div
          id="mobile-nav-drawer"
          className={`mobile-nav-drawer ${mobileOpen ? 'is-open' : ''}`}
          aria-hidden={!mobileOpen}
        >
          <nav aria-label="Mobile Navigation">
            <ul className="mobile-nav-links">
              <li>
                <button
                  className={`mobile-nav-link ${activeView === 'home' ? 'active' : ''}`}
                  onClick={() => navigate('home')}
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  className={`mobile-nav-link ${activeView === 'apparel' || activeView === 'void' || activeView === 'feed' ? 'active' : ''}`}
                  onClick={() => navigate('apparel')}
                >
                  Apparel
                </button>
              </li>
              <li>
                <button
                  className={`mobile-nav-link ${activeView === 'art' ? 'active' : ''}`}
                  onClick={() => navigate('art')}
                >
                  Art
                </button>
              </li>
              <li>
                <button
                  className={`mobile-nav-link ${activeView === 'music' ? 'active' : ''}`}
                  onClick={() => navigate('music')}
                >
                  Music
                </button>
              </li>
              <li>
                <button
                  className={`mobile-nav-link ${activeView === 'manifesto' ? 'active' : ''}`}
                  onClick={() => navigate('manifesto')}
                >
                  Manifesto
                </button>
              </li>
              <li className="mobile-nav-divider" aria-hidden="true"></li>
              <li>
                <button
                  className="mobile-nav-link mobile-nav-vote"
                  onClick={openArena}
                  aria-label={`View Next Drop Voting Arena, ${totalVotesCount} session votes cast`}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                  NEXT DROP
                  {totalVotesCount > 0 && (
                    <span className="mobile-vote-badge">{totalVotesCount}</span>
                  )}
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </header>
    </>
  );
}
