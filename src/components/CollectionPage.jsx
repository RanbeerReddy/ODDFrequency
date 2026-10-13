import React, { useState, useMemo } from 'react';
import ProductCard from './ProductCard.jsx';
import { CATEGORIES } from '../data/products.js';

export default function CollectionPage({ 
  collectionKey, // 'void', 'feed', or 'all'
  onSwitchCollection,
  products,
  onSelectProduct,
  votedProductIds,
  productVotes,
  onVote
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured'); // 'featured', 'voted', 'price-asc', 'price-desc'

  const collectionMeta = useMemo(() => {
    if (collectionKey === 'void') {
      return {
        title: 'THE VOID',
        subtitle: 'DISTORTION // UNDERGROUND HEAVYWEAR',
        description: 'Dark alternative, goth, metal-inspired, grunge and underground fashion. Distressed 280-380 GSM loopback cottons, cyber-sigilism typography, and raw frayed seams designed for subcultural resonance.',
        accent: 'void'
      };
    }
    if (collectionKey === 'feed') {
      return {
        title: 'THE FEED',
        subtitle: 'CHRONICALLY ONLINE // IRONIC GRAPHICS',
        description: 'Ironic graphic tees, baby tees, niche internet humour, absurd slogans and playful Gen-Z fashion. Direct-flash aesthetic, contrast ringers, and hyperstition pixel graphics.',
        accent: 'feed'
      };
    }
    return {
      title: 'ALL EXPERIMENTS',
      subtitle: 'THE FULL CONVERGENCE',
      description: 'The complete dual-catalogue of Odd Frequency. Vote on designs to determine which pieces graduate from prototype to physical manufacturing run in India.',
      accent: 'all'
    };
  }, [collectionKey]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let list = products.filter(p => {
      // Collection filter
      if (collectionKey === 'void' && p.collectionSlug !== 'void') return false;
      if (collectionKey === 'feed' && p.collectionSlug !== 'feed') return false;
      // Category filter
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      return true;
    });

    // Sorting
    return list.sort((a, b) => {
      if (sortBy === 'voted') {
        const votesA = productVotes[a.id] || a.seedVotes;
        const votesB = productVotes[b.id] || b.seedVotes;
        return votesB - votesA;
      }
      if (sortBy === 'price-asc') {
        return a.indicativePrice - b.indicativePrice;
      }
      if (sortBy === 'price-desc') {
        return b.indicativePrice - a.indicativePrice;
      }
      return 0; // featured default
    });
  }, [products, collectionKey, selectedCategory, sortBy, productVotes]);

  return (
    <section className="container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      {/* Header & Breadcrumb */}
      <div className="collection-page-header">
        <div className="collection-page-breadcrumbs">
          <span>CATALOGUE</span>
          <span>/</span>
          <span style={{ color: 'var(--text-primary)' }}>{collectionMeta.title}</span>
        </div>

        <h1 className="collection-hero-title">
          {collectionMeta.title}
        </h1>

        <p className="collection-hero-desc">
          <strong>{collectionMeta.subtitle} &mdash; </strong>
          {collectionMeta.description}
        </p>

        {/* Collection Quick Switcher */}
        <div className="collection-switch-tabs" role="tablist" aria-label="Collections">
          <button 
            role="tab"
            aria-selected={collectionKey === 'void'}
            className={`switch-tab tab-void ${collectionKey === 'void' ? 'active' : ''}`}
            onClick={() => onSwitchCollection('void')}
          >
            The Void (Dark Alternative)
          </button>
          <button 
            role="tab"
            aria-selected={collectionKey === 'feed'}
            className={`switch-tab tab-feed ${collectionKey === 'feed' ? 'active' : ''}`}
            onClick={() => onSwitchCollection('feed')}
          >
            The Feed (Ironic Gen-Z)
          </button>
          <button 
            role="tab"
            aria-selected={collectionKey === 'all'}
            className={`switch-tab ${collectionKey === 'all' ? 'active' : ''}`}
            onClick={() => onSwitchCollection('all')}
          >
            All Pieces ({products.length})
          </button>
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="filter-bar">
        <div className="filter-group">
          <span className="filter-label">Filter:</span>
          {CATEGORIES.map(cat => (
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
          <label htmlFor="sort-select" className="filter-label">Sort:</label>
          <select 
            id="sort-select"
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="featured">Featured Order</option>
            <option value="voted">Most Voted by Community</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div style={{ 
          padding: '4rem 2rem', 
          textAlign: 'center', 
          border: '1px dashed var(--border-color)',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-secondary)'
        }}>
          No design concepts match the selected category in this collection.
        </div>
      ) : (
        <div className="product-grid">
          {filteredProducts.map(product => (
            <ProductCard 
              key={product.id}
              product={product}
              onSelectProduct={onSelectProduct}
              hasVoted={votedProductIds.includes(product.id)}
              voteCount={productVotes[product.id] || product.seedVotes}
              onVote={onVote}
            />
          ))}
        </div>
      )}
    </section>
  );
}
