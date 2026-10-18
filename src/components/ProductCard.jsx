import React from 'react';

export default function ProductCard({ 
  product, 
  onSelectProduct, 
  hasVoted, 
  voteCount, 
  onVote 
}) {
  const isVoid = product.collectionSlug === 'void';

  return (
    <div className={`product-card ${isVoid ? 'product-card-void' : 'product-card-feed'}`}>
      {/* Thumbnail presentation */}
      <div 
        className="product-card-thumb-wrap"
        onClick={() => onSelectProduct(product)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectProduct(product)}
        aria-label={`View details for ${product.name}`}
      >
        <div className="product-card-badges">
          <span className={`badge-id ${isVoid ? 'badge-void' : 'badge-feed'}`}>
            {product.id}
          </span>
          <span className="badge-id">
            {product.category}
          </span>
        </div>

        <img 
          src={product.image} 
          alt={`${product.name} concept mockup`}
          loading="lazy"
        />

        {/* Quick Vote overlay button */}
        <div className="product-quick-vote" onClick={(e) => e.stopPropagation()}>
          <button 
            className={`btn-card-vote ${hasVoted ? 'voted' : ''}`}
            onClick={() => onVote(product.id)}
            title={hasVoted ? 'Local session vote cast' : 'Cast local preview vote for this design'}
            aria-label={`Vote for design ${product.name}. Current session votes: ${voteCount}`}
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
          <span>{product.tags?.[0] || 'Original Concept'}</span>
        </div>

        <h4 
          className="product-name"
          onClick={() => onSelectProduct(product)}
        >
          {product.name}
        </h4>

        <div className="product-fit">
          {product.fit}
        </div>

        <div className="product-price-block">
          <div className="indicative-price">
            {product.currency}{product.indicativePrice.toLocaleString('en-IN')}
          </div>
          <span className="price-stage-label">
            [ Indicative Concept Price ]
          </span>
        </div>
      </div>
    </div>
  );
}
