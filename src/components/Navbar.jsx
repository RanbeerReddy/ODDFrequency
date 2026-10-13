import React from 'react';

export default function Navbar({ 
  activeView, 
  setActiveView, 
  totalVotesCount = 0,
  onOpenArena
}) {
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
              onClick={() => setActiveView('home')} 
              style={{ cursor: 'pointer' }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setActiveView('home')}
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

            {/* Navigation Links */}
            <nav aria-label="Main Navigation">
              <ul className="nav-links">
                <li>
                  <button 
                    className={`nav-link ${activeView === 'home' ? 'active' : ''}`}
                    onClick={() => setActiveView('home')}
                  >
                    Convergence
                  </button>
                </li>
                <li>
                  <button 
                    className={`nav-link nav-link-void ${activeView === 'void' ? 'active' : ''}`}
                    onClick={() => setActiveView('void')}
                  >
                    The Void
                  </button>
                </li>
                <li>
                  <button 
                    className={`nav-link nav-link-feed ${activeView === 'feed' ? 'active' : ''}`}
                    onClick={() => setActiveView('feed')}
                  >
                    The Feed
                  </button>
                </li>
                <li>
                  <button 
                    className={`nav-link ${activeView === 'manifesto' ? 'active' : ''}`}
                    onClick={() => setActiveView('manifesto')}
                  >
                    Manifesto
                  </button>
                </li>
              </ul>
            </nav>

            {/* Action Bar */}
            <div className="nav-actions">
              <button 
                className="btn-vote-shortcut"
                onClick={onOpenArena}
                aria-label={`View Next Drop Voting Arena, ${totalVotesCount} total votes recorded`}
                title="Community Voting Arena"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <span>NEXT DROP</span>
                {totalVotesCount > 0 && (
                  <span style={{ 
                    background: 'var(--accent-lime)', 
                    color: '#080809', 
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
          </div>
        </div>
      </header>
    </>
  );
}
