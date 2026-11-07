import React from 'react';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems = [],
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}) {
  if (!isOpen) return null;

  const totalAmount = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="cart-drawer-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="cart-drawer-panel" onClick={(e) => e.stopPropagation()}>

        {/* Drawer Header */}
        <div className="cart-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <h2 className="cart-drawer-title font-headline">YOUR CART</h2>
            <span className="cart-drawer-badge font-mono">{totalCount}</span>
          </div>
          <button 
            type="button" 
            className="modal-close-btn" 
            onClick={onClose}
            aria-label="Close cart"
          >
            &#10005;
          </button>
        </div>

        {/* Cart Item List */}
        <div className="cart-drawer-body">
          {cartItems.length === 0 ? (
            <div className="cart-empty-state">
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1rem' }}>&#128722;</span>
              <p className="font-headline" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                YOUR CART IS EMPTY
              </p>
              <p className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Explore our ₹399 underground apparel pieces and add your size.
              </p>
              <button 
                type="button" 
                className="btn-add-to-cart font-mono" 
                onClick={onClose}
              >
                EXPLORE APPAREL &rarr;
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {cartItems.map((item, idx) => (
                <div key={`${item.id}-${item.size}-${idx}`} className="cart-item-card">
                  <img src={item.images?.[0] || item.image} alt={item.name} className="cart-item-img" />
                  <div className="cart-item-content">
                    <h4 className="cart-item-name">{item.name}</h4>
                    <div className="cart-item-meta font-mono">
                      <span>SIZE: <strong>{item.size}</strong></span>
                      <span className="cart-sep">&bull;</span>
                      <span style={{ color: 'var(--accent-lime)' }}>₹{item.price}</span>
                    </div>

                    <div className="cart-item-controls">
                      <div className="quantity-counter sm">
                        <button 
                          type="button" 
                          onClick={() => onUpdateQuantity(item.id, item.size, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          &minus;
                        </button>
                        <span className="qty-number font-mono">{item.quantity}</span>
                        <button 
                          type="button" 
                          onClick={() => onUpdateQuantity(item.id, item.size, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>

                      <button 
                        type="button" 
                        className="cart-item-remove font-mono"
                        onClick={() => onRemoveItem(item.id, item.size)}
                        aria-label={`Remove ${item.name}`}
                      >
                        REMOVE
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer Checkout */}
        {cartItems.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-footer-summary font-mono">
              <div className="summary-row">
                <span>Items ({totalCount}):</span>
                <span>₹{totalAmount}</span>
              </div>
              <div className="summary-row">
                <span>Shipping in India:</span>
                <span style={{ color: 'var(--accent-lime)' }}>FREE</span>
              </div>
              <div className="summary-row total-line">
                <span>Total Amount:</span>
                <span className="total-val">₹{totalAmount}</span>
              </div>
            </div>

            <button
              type="button"
              className="btn-buy-now-amazon font-mono"
              style={{ width: '100%', padding: '0.9rem', fontSize: '0.95rem' }}
              onClick={() => {
                onClose();
                onCheckout();
              }}
            >
              PROCEED TO BUY NOW &bull; ₹{totalAmount}
            </button>
            <button
              type="button"
              className="cart-continue-btn font-mono"
              onClick={onClose}
            >
              &larr; Continue Browsing
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
