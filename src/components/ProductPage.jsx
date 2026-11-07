import React, { useState, useEffect } from 'react';

export default function ProductPage({
  product,
  allProducts = [],
  onSelectProduct,
  onBack,
  hasVoted,
  voteCount,
  onVote,
  onAddToCart,
  onBuyNow
}) {
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('L');
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });

  // Reset scroll and image index on product change
  useEffect(() => {
    setSelectedImgIndex(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product?.id]);

  if (!product) return null;

  const images = (product.images && product.images.length > 0) 
    ? product.images 
    : [product.image || 'images/brat-tee.jpg'];

  const isVoid = product.collectionSlug === 'void';
  const displayPrice = product.price || product.indicativePrice || 399;
  const originalPrice = product.originalPrice || 1299;
  const discountPercent = Math.round(((originalPrice - displayPrice) / originalPrice) * 100);

  const sizes = [
    { label: 'XS', chest: '36"', length: '27"' },
    { label: 'S', chest: '38"', length: '28"' },
    { label: 'M', chest: '40"', length: '29"' },
    { label: 'L', chest: '42"', length: '30"' },
    { label: 'XL', chest: '44"', length: '31"' },
    { label: 'XXL', chest: '46"', length: '32"' }
  ];

  // Related products
  const relatedProducts = allProducts
    .filter(p => p.id !== product.id)
    .slice(0, 4);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <div className="product-page-wrapper">
      <div className="container">

        {/* Amazon-style Breadcrumbs Navigation */}
        <nav className="product-breadcrumb-bar" aria-label="Breadcrumb">
          <button 
            type="button"
            className="product-back-btn"
            onClick={onBack}
            aria-label="Back to collection"
          >
            &larr; Back to Apparel
          </button>
          <div className="breadcrumb-trail">
            <span>HOME</span>
            <span className="sep">/</span>
            <span>APPAREL</span>
            <span className="sep">/</span>
            <span>{product.collection}</span>
            <span className="sep">/</span>
            <span className="current">{product.name}</span>
          </div>
        </nav>

        {/* Main 2-Column Product Experience */}
        <div className="product-detail-layout">

          {/* LEFT COLUMN: Multi-Image Amazon-style Gallery */}
          <div className="product-gallery-column">
            <div className="gallery-layout-flex">

              {/* Vertical Thumbnail Strip */}
              <div className="gallery-thumbnails-strip" role="tablist" aria-label="Product image angles">
                {images.map((imgSrc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    role="tab"
                    aria-selected={selectedImgIndex === idx}
                    className={`gallery-thumb-btn ${selectedImgIndex === idx ? 'active' : ''}`}
                    onClick={() => setSelectedImgIndex(idx)}
                    onMouseEnter={() => setSelectedImgIndex(idx)}
                    title={`View angle ${idx + 1}`}
                  >
                    <img src={imgSrc} alt={`${product.name} angle ${idx + 1}`} />
                    <span className="thumb-idx font-mono">{idx + 1}</span>
                  </button>
                ))}
              </div>

              {/* Large Active Image Stage */}
              <div 
                className="gallery-main-stage"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
              >
                {/* Badges Over Stage */}
                <div className="stage-badges-row">
                  <span className={`badge-id ${isVoid ? 'badge-void' : 'badge-feed'}`}>
                    {product.id} // {product.collection}
                  </span>
                  <span className="badge-promo font-mono">
                    ₹{displayPrice} &bull; LIMITED BATCH #01
                  </span>
                </div>

                {/* Primary Image View */}
                <div className="stage-image-container">
                  <img 
                    src={images[selectedImgIndex] || images[0]} 
                    alt={`${product.name} main showcase`}
                    className="stage-main-image"
                    style={{
                      transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                      transform: isZoomed ? 'scale(1.75)' : 'scale(1)'
                    }}
                  />
                </div>

                {/* Arrow Controls */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="stage-nav-arrow stage-prev"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImgIndex(prev => (prev - 1 + images.length) % images.length);
                      }}
                      aria-label="Previous image"
                    >
                      &#8249;
                    </button>
                    <button
                      type="button"
                      className="stage-nav-arrow stage-next"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImgIndex(prev => (prev + 1) % images.length);
                      }}
                      aria-label="Next image"
                    >
                      &#8250;
                    </button>
                  </>
                )}

                <div className="stage-counter-tag font-mono">
                  {selectedImgIndex + 1} / {images.length} ANGLES (HOVER TO ZOOM)
                </div>
              </div>

            </div>

            {/* Mobile Thumbnails Row */}
            <div className="mobile-thumbnails-row">
              {images.map((imgSrc, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`gallery-thumb-btn ${selectedImgIndex === idx ? 'active' : ''}`}
                  onClick={() => setSelectedImgIndex(idx)}
                >
                  <img src={imgSrc} alt="" />
                </button>
              ))}
            </div>

            {/* Feature Highlights Grid Under Gallery */}
            <div className="gallery-trust-grid">
              <div className="trust-card">
                <span className="trust-icon">&#10003;</span>
                <div>
                  <div className="trust-title font-mono">100% COMBED COTTON</div>
                  <div className="trust-desc">240–300 GSM heavy bio-washed jersey</div>
                </div>
              </div>
              <div className="trust-card">
                <span className="trust-icon">&#9889;</span>
                <div>
                  <div className="trust-title font-mono">FREE EXPRESS SHIPPING</div>
                  <div className="trust-desc">Direct dispatch across all Indian PIN codes</div>
                </div>
              </div>
              <div className="trust-card">
                <span className="trust-icon">&#8635;</span>
                <div>
                  <div className="trust-title font-mono">7-DAY REPLACEMENT</div>
                  <div className="trust-desc">Zero friction replacement if sizing needs change</div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Purchasing Details & Actions */}
          <div className="product-info-column">

            {/* Brand / Series Strip */}
            <div className="product-brand-tag font-mono">
              <span>ODD FREQUENCY APPAREL // BATCH #01</span>
              <span className="brand-dot">&bull;</span>
              <span>{product.category}</span>
            </div>

            {/* Product Headline */}
            <h1 className="product-main-title">
              {product.name}
            </h1>

            {/* Rating / Community Demand Row */}
            <div className="product-rating-row font-mono">
              <div className="rating-stars" aria-label="5 out of 5 stars">
                <span>&#9733;&#9733;&#9733;&#9733;&#9733;</span>
                <span className="rating-num">4.9</span>
              </div>
              <span className="rating-sep">|</span>
              <span className="rating-votes">
                {voteCount > 0 ? `${voteCount} community signals cast` : 'Batch Demand Leader'}
              </span>
              <span className="rating-sep">|</span>
              <span className="stock-pill">
                &#9679; IN STOCK FOR BATCH #01
              </span>
            </div>

            {/* Pricing Section (Amazon Style) */}
            <div className="product-price-card">
              <div className="price-top-line">
                <span className="discount-badge">-{discountPercent}%</span>
                <span className="current-price-val">
                  {product.currency || '₹'}{displayPrice}
                </span>
              </div>
              <div className="price-mrp-line">
                <span>M.R.P.:</span>
                <del>₹{originalPrice}</del>
                <span className="save-amount font-mono">
                  You save ₹{originalPrice - displayPrice} ({discountPercent}%)
                </span>
              </div>
              <div className="price-tax-note font-mono">
                Inclusive of all taxes &bull; <strong>Free Delivery</strong> in India
              </div>
            </div>

            {/* Size Selector */}
            <div className="product-option-block">
              <div className="option-header-row">
                <span className="option-title font-mono">
                  SELECT SIZE: <strong style={{ color: 'var(--text-primary)' }}>{selectedSize}</strong>
                </span>
                <button
                  type="button"
                  className="size-guide-toggle font-mono"
                  onClick={() => setShowSizeGuide(!showSizeGuide)}
                >
                  &#9881; Size Chart &amp; Fit Guide
                </button>
              </div>

              {/* Size Pills */}
              <div className="size-pills-grid" role="radiogroup" aria-label="Select size">
                {sizes.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    role="radio"
                    aria-checked={selectedSize === s.label}
                    className={`size-pill-btn ${selectedSize === s.label ? 'active' : ''}`}
                    onClick={() => setSelectedSize(s.label)}
                  >
                    <span className="size-label">{s.label}</span>
                    <span className="size-sub font-mono">{s.chest}</span>
                  </button>
                ))}
              </div>

              {/* Collapsible Size Guide Modal */}
              {showSizeGuide && (
                <div className="size-guide-table-box font-mono">
                  <div className="guide-table-title">// BODY MEASUREMENT CHART (INCHES)</div>
                  <table>
                    <thead>
                      <tr>
                        <th>Size</th>
                        <th>Chest Width</th>
                        <th>Body Length</th>
                        <th>Shoulder</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td>XS</td><td>36"</td><td>27"</td><td>18.5"</td></tr>
                      <tr><td>S</td><td>38"</td><td>28"</td><td>19.5"</td></tr>
                      <tr><td>M</td><td>40"</td><td>29"</td><td>20.5"</td></tr>
                      <tr><td>L</td><td>42"</td><td>30"</td><td>21.5"</td></tr>
                      <tr><td>XL</td><td>44"</td><td>31"</td><td>22.5"</td></tr>
                      <tr><td>XXL</td><td>46"</td><td>32"</td><td>23.5"</td></tr>
                    </tbody>
                  </table>
                  <div className="guide-note">
                    * Engineered with relaxed boxy drop-shoulder proportions. True to Indian streetwear sizing.
                  </div>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="product-quantity-row">
              <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                QUANTITY:
              </span>
              <div className="quantity-counter">
                <button 
                  type="button" 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  aria-label="Decrease quantity"
                  disabled={quantity <= 1}
                >
                  &minus;
                </button>
                <span className="qty-number font-mono">{quantity}</span>
                <button 
                  type="button" 
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <span className="subtotal-indicator font-mono">
                Total: <strong>₹{displayPrice * quantity}</strong>
              </span>
            </div>

            {/* PRIMARY ACTION BUTTONS: ADD TO CART & BUY NOW */}
            <div className="product-actions-cluster">
              <button
                type="button"
                className="btn-add-to-cart font-mono"
                onClick={() => onAddToCart(product, selectedSize, quantity)}
                aria-label={`Add ${product.name} to cart`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <span>ADD TO CART</span>
              </button>

              <button
                type="button"
                className="btn-buy-now-amazon font-mono"
                onClick={() => onBuyNow(product, selectedSize, quantity)}
                aria-label={`Buy ${product.name} now`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
                <span>BUY NOW &bull; ₹{displayPrice * quantity}</span>
              </button>
            </div>

            {/* Quick Demand Validation Vote Button */}
            <div className="product-demand-vote-box">
              <button
                type="button"
                className={`btn-product-vote ${hasVoted ? 'voted' : ''}`}
                onClick={() => onVote(product.id)}
                aria-label={`Vote for ${product.name}`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill={hasVoted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <span>{hasVoted ? 'VOTE RECORDED IN SESSION' : 'VOTE TO EXPEDITE NEXT BATCH'}</span>
                <span className="font-mono">({voteCount})</span>
              </button>
            </div>

            {/* Concept Narrative */}
            <div className="product-narrative-card">
              <div className="font-mono section-label">// CONCEPT &amp; SILHOUETTE</div>
              <p className="narrative-text">
                {product.conceptSummary}
              </p>
            </div>

            {/* Fabrication Specifications */}
            {product.fabricSpecs && (
              <div className="product-specs-card">
                <div className="font-mono section-label">// FABRICATION &amp; CONSTRUCTION</div>
                <ul className="specs-list font-mono">
                  {product.fabricSpecs.map((spec, i) => (
                    <li key={i}>{spec}</li>
                  ))}
                  <li>Direct screenprint with zero heavy-rubber handfeel</li>
                  <li>Machine wash cold with like colors &bull; dry flat in shade</li>
                </ul>
              </div>
            )}

          </div>

        </div>

        {/* FREQUENTLY VIEWED TOGETHER / RECOMMENDED SECTION */}
        <section className="product-recommended-section">
          <div className="recommended-header">
            <h2 className="font-headline" style={{ fontSize: 'clamp(1.2rem, 3vw, 1.6rem)' }}>
              MORE UNDERGROUND PIECES AT ₹399
            </h2>
            <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--accent-purple)' }}>
              BATCH #01 PROTOTYPES
            </span>
          </div>

          <div className="recommended-grid">
            {relatedProducts.map(rel => (
              <div 
                key={rel.id} 
                className="recommended-card"
                onClick={() => onSelectProduct(rel)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectProduct(rel)}
              >
                <div className="rel-thumb-wrap">
                  <img src={rel.images?.[0] || rel.image} alt={rel.name} loading="lazy" />
                  <span className="rel-price-tag font-mono">₹{rel.price || 399}</span>
                </div>
                <div className="rel-body">
                  <span className="rel-cat font-mono">{rel.collection}</span>
                  <h4 className="rel-name">{rel.name}</h4>
                  <div className="rel-fit font-mono">{rel.fit}</div>
                  <button 
                    type="button" 
                    className="rel-view-btn font-mono"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProduct(rel);
                    }}
                  >
                    VIEW PIECE &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
