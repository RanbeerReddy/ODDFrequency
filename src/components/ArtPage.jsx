import React, { useState } from 'react';
import { ART_PIECES, ART_CATEGORIES } from '../data/art.js';

export default function ArtPage({ onSelectPrintProposal, onOpenArena }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [likedArtIds, setLikedArtIds] = useState([]);
  const [activeModalArt, setActiveModalArt] = useState(null);

  const filteredArt = selectedCategory === 'All' 
    ? ART_PIECES 
    : ART_PIECES.filter(a => a.category === selectedCategory);

  const handleToggleLike = (id) => {
    if (likedArtIds.includes(id)) {
      setLikedArtIds(prev => prev.filter(x => x !== id));
    } else {
      setLikedArtIds(prev => [...prev, id]);
    }
  };

  return (
    <section className="container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      {/* Header */}
      <div className="collection-page-header">
        <div className="collection-page-breadcrumbs">
          <span>ARCHIVE</span>
          <span>/</span>
          <span style={{ color: 'var(--text-primary)' }}>VISUAL ART &amp; EXHIBITION</span>
        </div>

        <h1 className="collection-hero-title">
          THE ART ARCHIVE
        </h1>

        <p className="collection-hero-desc">
          <strong>SUBTERRANEAN LITHOGRAPHS // SCREENPRINT EXPERIMENTS &mdash; </strong>
          Visual culture is the mother of the garments we wear. Explore our high-res screenprint scans, vintage rock tour plates, and dark fantasy manga proofs. Vote on prints you want engineered onto heavyweight apparel.
        </p>

        {/* Categories Bar */}
        <div className="filter-bar" style={{ marginTop: '2rem' }}>
          <div className="filter-group">
            <span className="filter-label">MEDIUM:</span>
            {ART_CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`filter-chip ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="filter-group">
            <button 
              className="font-mono"
              onClick={onOpenArena}
              style={{ 
                color: 'var(--accent-purple)', 
                border: '1px solid var(--accent-purple)', 
                padding: '0.4rem 0.85rem',
                fontSize: '0.75rem',
                textTransform: 'uppercase'
              }}
            >
              PROPOSE NEW ART FOR DROP &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Art Exhibition Grid */}
      <div className="art-gallery-grid">
        {filteredArt.map(art => {
          const isLiked = likedArtIds.includes(art.id);
          const likeCount = art.seedLikes + (isLiked ? 1 : 0);

          return (
            <article key={art.id} className="art-card">
              <div 
                className="art-image-frame"
                onClick={() => setActiveModalArt(art)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setActiveModalArt(art)}
              >
                <div className="art-card-badge-row">
                  <span className="badge-id" style={{ background: 'rgba(0,0,0,0.7)', borderColor: 'var(--accent-purple)' }}>
                    {art.id}
                  </span>
                  <span className="badge-id">
                    {art.year}
                  </span>
                </div>

                <img 
                  src={art.image} 
                  alt={art.title}
                  loading="lazy"
                  className="art-img-preview"
                />

                <div className="art-zoom-hint">
                  <span>[ CLICK TO INSPECT SPECIMEN ]</span>
                </div>
              </div>

              <div className="art-card-details">
                <div className="art-meta-small">
                  <span>{art.medium}</span>
                </div>

                <h3 className="art-title" onClick={() => setActiveModalArt(art)}>
                  {art.title}
                </h3>

                <p className="art-description">
                  {art.description}
                </p>

                <div className="art-footer-row">
                  <div className="art-tags-row">
                    {art.tags.map((t, idx) => (
                      <span key={idx} className="art-tag-pill">#{t}</span>
                    ))}
                  </div>

                  <button 
                    className={`btn-art-like ${isLiked ? 'liked' : ''}`}
                    onClick={() => handleToggleLike(art.id)}
                    aria-label={`Like ${art.title}`}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    <span>{likeCount}</span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Art Modal Preview */}
      {activeModalArt && (
        <div className="modal-backdrop" onClick={() => setActiveModalArt(null)}>
          <div className="modal-content art-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setActiveModalArt(null)}>
              ✕
            </button>
            <div className="modal-gallery">
              <img src={activeModalArt.image} alt={activeModalArt.title} />
            </div>
            <div className="modal-info-panel">
              <span className="badge-id" style={{ color: 'var(--accent-purple)', borderColor: 'var(--accent-purple)' }}>
                {activeModalArt.id} // {activeModalArt.dimensions}
              </span>
              <h2 className="modal-product-title" style={{ marginTop: '0.8rem' }}>
                {activeModalArt.title}
              </h2>
              <div style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginBottom: '1.2rem' }}>
                ARTIST: {activeModalArt.artist} &bull; {activeModalArt.year}
              </div>
              <p className="modal-narrative">
                {activeModalArt.description}
              </p>
              <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <h4 className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--accent-purple)', marginBottom: '0.4rem' }}>
                  // GARMENT CONVERSION VOTE
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Do you want to see this artwork adapted into a heavyweight 280-300 GSM mineral-wash tee for the next production run?
                </p>
                <button 
                  className="btn-primary-vote"
                  style={{ marginTop: '0.8rem', width: '100%' }}
                  onClick={() => {
                    handleToggleLike(activeModalArt.id);
                    setActiveModalArt(null);
                  }}
                >
                  VOTE TO MANUFACTURE ON APPAREL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
