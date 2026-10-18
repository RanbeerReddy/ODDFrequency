import React, { useState, useMemo } from 'react';
import ProductCard from './ProductCard.jsx';
import { CATEGORIES } from '../data/products.js';

export default function CollectionPage({ 
  collectionKey = 'all', // 'all', 'band', 'grunge', 'ringer', 'meme', 'void', 'feed'
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
    if (collectionKey === 'band') {
      return {
        title: 'VINTAGE BAND TEES',
        subtitle: 'CONCERT ARCHIVE // 70s-90s ROCK & METAL',
        description: 'Authentic tour tees inspired by Slipknot, Black Sabbath, Led Zeppelin, Metallica, and Nirvana. Heavyweight mineral stonewash with cracked discharge prints.',
        accent: 'band'
      };
    }
    if (collectionKey === 'meme') {
      return {
        title: 'POP & MEME AESTHETIC',
        subtitle: 'BRAT SUMMER // HYPER-IRONY',
        description: 'Iconic Charli brat summer neon minimalist shirts, retro sci-fi parodies, and internet counterculture statement garments.',
        accent: 'meme'
      };
    }
    if (collectionKey === 'ringer') {
      return {
        title: 'RINGER & BABY TEES',
        subtitle: '90s HERITAGE // CONTRAST TRIMS',
        description: 'Vintage unbleached natural cotton with rich contrast ribbing and cropped baby tee silhouettes for effortless post-punk nostalgia.',
        accent: 'ringer'
      };
    }
    return {
      title: 'APPAREL COLLECTION',
      subtitle: 'VINTAGE BAND, GRUNGE & CULT TEES',
      description: 'The complete 12-piece wardrobe prototype of Odd Frequency. Vote on designs to determine which pieces graduate from prototype to physical manufacturing in India.',
      accent: 'all'
    };
  }, [collectionKey]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let list = products.filter(p => {
      // Style / Collection filter
      if (collectionKey === 'band' && p.styleGroup !== 'band') return false;
      if (collectionKey === 'meme' && p.styleGroup !== 'meme') return false;
      if (collectionKey === 'ringer' && p.styleGroup !== 'ringer') return false;
      if (collectionKey === 'void' && p.collectionSlug !== 'void') return false;
      if (collectionKey === 'feed' && p.collectionSlug !== 'feed') return false;

      // Category filter
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      return true;
    });

    // Sorting
    return list.sort((a, b) => {
      if (sortBy === 'voted') {
        const votesA = productVotes[a.id] || 0;
        const votesB = productVotes[b.id] || 0;
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
            aria-selected={collectionKey === 'all' || collectionKey === 'apparel'}
            className={`switch-tab ${collectionKey === 'all' || collectionKey === 'apparel' ? 'active' : ''}`}
            onClick={() => onSwitchCollection('apparel')}
          >
            All Pieces ({products.length})
          </button>
          <button 
            role="tab"
            aria-selected={collectionKey === 'band'}
            className={`switch-tab tab-void ${collectionKey === 'band' ? 'active' : ''}`}
            onClick={() => onSwitchCollection('band')}
          >
            Vintage Band Tees
          </button>
          <button 
            role="tab"
            aria-selected={collectionKey === 'meme'}
            className={`switch-tab tab-feed ${collectionKey === 'meme' ? 'active' : ''}`}
            onClick={() => onSwitchCollection('meme')}
          >
            Brat &amp; Pop Culture
          </button>
          <button 
            role="tab"
            aria-selected={collectionKey === 'ringer'}
            className={`switch-tab ${collectionKey === 'ringer' ? 'active' : ''}`}
            onClick={() => onSwitchCollection('ringer')}
          >
            Ringer &amp; Baby Tees
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
            <option value="voted">Most Voted (Session)</option>
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
              voteCount={productVotes[product.id] || 0}
              onVote={onVote}
            />
          ))}
        </div>
      )}
    </section>
  );
}
