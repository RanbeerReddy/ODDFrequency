import React from 'react';

export default function ProductCard({ 
  product, 
  onSelectProduct, 
  hasVoted, 
  voteCount, 
  onVote 
}) {
  const isVoid = product.collectionSlug === 'void';
  const displayPrice = product.price || product.indicativePrice || 399;
  const originalPrice = product.originalPrice || 1299;

  return (
    <div 
      className={`product-card ${isVoid ? 'product-card-void' : 'product-card-feed'}`}
      onClick={() => onSelectProduct(product)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectProduct(product)}
      aria-label={`View full details for ${product.name}`}
      style={{ cursor: 'pointer' }}
    >
      {/* Thumbnail presentation */}
      <div className="product-card-thumb-wrap">
        <div className="product-card-badges">
          <span className={`badge-id ${isVoid ? 'badge-void' : 'badge-feed'}`}>
            {product.id}
          </span>
          <span className="badge-id" style={{ background: 'rgba(0,0,0,0.75)', color: 'var(--accent-lime)' }}>
            ₹{displayPrice}
          </span>
        </div>

        <img 
          src={product.images?.[0] || product.image} 
          alt={`${product.name} product presentation`}
          loading="lazy"
        />

        {/* Quick Vote overlay button */}
        <div className="product-quick-vote" onClick={(e) => e.stopPropagation()}>
          <button 
            type="button"
            className={`btn-card-vote ${hasVoted ? 'voted' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onVote(product.id);
            }}
            title={hasVoted ? 'Session vote cast' : 'Vote to prioritize next batch production'}
            aria-label={`Vote for design ${product.name}. Current votes: ${voteCount}`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill={hasVoted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <span>{hasVoted ? 'VOTED' : 'VOTE'}</span>
            <span style={{ opacity: 0.85, fontWeight: 'normal' }}>({voteCount})</span>
          </button>
        </div>
      </div>

      {/* Card Info Body */}
      <div className="product-card-body">
        <div className="product-meta-row">
          <span>{product.collection}</span>
          <span>{product.tags?.[0] || '100% Combed Cotton'}</span>
        </div>

        <h4 className="product-name">
          {product.name}
        </h4>

        <div className="product-fit">
          {product.fit}
        </div>

        <div className="product-price-block">
          <div className="indicative-price" style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
            <span>{product.currency || '₹'}{displayPrice}</span>
            <del style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontWeight: 'normal' }}>
              ₹{originalPrice}
            </del>
            <span style={{ fontSize: '0.68rem', color: 'var(--accent-lime)', fontFamily: 'var(--font-mono)' }}>
              (69% OFF)
            </span>
          </div>
          <span className="price-stage-label" style={{ color: 'var(--accent-purple)' }}>
            [ View Amazon-Style Page &rarr; ]
          </span>
        </div>
      </div>
    </div>
  );
}
