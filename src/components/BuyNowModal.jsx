import React, { useState, useEffect } from 'react';
import { submitOrderEmail } from '../lib/supabase.js';

export default function BuyNowModal({
  isOpen,
  onClose,
  product,
  selectedSize = 'L',
  quantity = 1,
  cartItems = null,
  onOrderSuccess
}) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setOrderConfirmed(null);
      setErrorMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isCartCheckout = Array.isArray(cartItems) && cartItems.length > 0;
  
  const totalPrice = isCartCheckout
    ? cartItems.reduce((sum, item) => sum + ((item.price || 399) * (item.quantity || 1)), 0)
    : (product?.price || 399) * quantity;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      let orderResult;

      if (isCartCheckout) {
        const itemNames = cartItems.map(i => `${i.name} (${i.size} x${i.quantity})`).join(', ');
        orderResult = await submitOrderEmail({
          email: cleanEmail,
          productId: 'CART-MULTI',
          productName: itemNames,
          size: cartItems.map(i => i.size).join('/'),
          quantity: cartItems.reduce((acc, i) => acc + i.quantity, 0),
          price: totalPrice,
          name,
          phone,
          address
        });
      } else {
        orderResult = await submitOrderEmail({
          email: cleanEmail,
          productId: product?.id || 'OF-APPAREL',
          productName: product?.name || 'Odd Frequency Piece',
          size: selectedSize,
          quantity,
          price: product?.price || 399,
          name,
          phone,
          address
        });
      }

      if (orderResult.success) {
        setOrderConfirmed(orderResult);
        if (onOrderSuccess) {
          onOrderSuccess(orderResult);
        }
      } else {
        setErrorMessage(orderResult.message || 'Could not save order. Please try again.');
      }
    } catch {
      setErrorMessage('Network error communicating with order database. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="buynow-modal-title"
    >
      <div 
        className="buynow-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close checkout"
        >
          &#10005;
        </button>

        {orderConfirmed ? (
          /* Confirmation Success Screen */
          <div className="buynow-success-view">
            <div className="success-badge-icon">&#10003;</div>
            <span className="font-mono" style={{ color: 'var(--accent-lime)', fontSize: '0.75rem', letterSpacing: '0.1em' }}>
              // DATABASE SIGNAL LOCKED &bull; ORDER SECURED
            </span>
            <h2 className="success-headline">
              ORDER CONFIRMED!
            </h2>
            <div className="order-id-pill font-mono">
              ORDER ID: <strong>{orderConfirmed.orderId}</strong>
            </div>

            <div className="success-recap-box">
              <div className="recap-row">
                <span>Buyer Email (Saved to Database):</span>
                <strong style={{ color: 'var(--accent-purple)' }}>{email}</strong>
              </div>
              <div className="recap-row">
                <span>Item:</span>
                <strong>{isCartCheckout ? `${cartItems.length} Cart Items` : `${product?.name} (Size: ${selectedSize})`}</strong>
              </div>
              <div className="recap-row">
                <span>Quantity:</span>
                <strong>{isCartCheckout ? cartItems.reduce((acc, i) => acc + i.quantity, 0) : quantity}</strong>
              </div>
              <div className="recap-row">
                <span>Total Amount:</span>
                <strong style={{ color: 'var(--accent-lime)', fontSize: '1.1rem' }}>₹{totalPrice}</strong>
              </div>
              <div className="recap-row">
                <span>Shipping:</span>
                <span className="font-mono" style={{ color: 'var(--accent-lime)' }}>FREE EXPRESS DELIVERY</span>
              </div>
            </div>

            <p className="success-desc">
              Your order has been recorded in our official production database. We will notify you at <strong>{email}</strong> with batch tracking details and dispatch timelines.
            </p>

            <button
              type="button"
              className="btn-buy-now-amazon font-mono"
              style={{ width: '100%', marginTop: '1.5rem' }}
              onClick={onClose}
            >
              CONTINUE BROWSING &rarr;
            </button>
          </div>
        ) : (
          /* Checkout / Email Request Form */
          <div className="buynow-form-view">
            <div className="buynow-header">
              <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--accent-purple)', letterSpacing: '0.08em' }}>
                // FAST CHECKOUT &bull; ODD FREQUENCY
              </span>
              <h2 id="buynow-modal-title" className="buynow-title">
                COMPLETE YOUR ORDER
              </h2>
            </div>

            {/* Order Items Preview */}
            <div className="buynow-order-summary">
              {isCartCheckout ? (
                <div className="summary-cart-list">
                  {cartItems.map((item, idx) => (
                    <div key={idx} className="summary-item-row">
                      <img src={item.images?.[0] || item.image} alt={item.name} className="summary-thumb" />
                      <div className="summary-item-info">
                        <div className="summary-name">{item.name}</div>
                        <div className="summary-meta font-mono">Size: {item.size} &bull; Qty: {item.quantity} &bull; ₹{item.price * item.quantity}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="summary-item-row">
                  <img src={product?.images?.[0] || product?.image} alt={product?.name} className="summary-thumb" />
                  <div className="summary-item-info">
                    <div className="summary-name">{product?.name}</div>
                    <div className="summary-meta font-mono">
                      <span>Size: <strong>{selectedSize}</strong></span>
                      <span className="sep">&bull;</span>
                      <span>Qty: <strong>{quantity}</strong></span>
                      <span className="sep">&bull;</span>
                      <span style={{ color: 'var(--accent-lime)' }}>₹{product?.price || 399} each</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="summary-price-total">
                <div className="price-line">
                  <span>Subtotal:</span>
                  <span>₹{totalPrice}</span>
                </div>
                <div className="price-line">
                  <span>Delivery in India:</span>
                  <span style={{ color: 'var(--accent-lime)' }}>FREE</span>
                </div>
                <div className="price-line grand-total">
                  <span>Total Amount:</span>
                  <span className="total-highlight">₹{totalPrice}</span>
                </div>
              </div>
            </div>

            {/* Error banner if any */}
            {errorMessage && (
              <div className="buynow-error-banner font-mono">
                &times; {errorMessage}
              </div>
            )}

            {/* Email and Details Input Form */}
            <form onSubmit={handleSubmit} className="buynow-input-form">
              <div className="form-group">
                <label htmlFor="buyer-email" className="font-mono form-label">
                  EMAIL ADDRESS <span style={{ color: 'var(--accent-lime)' }}>*</span>
                </label>
                <input
                  id="buyer-email"
                  type="email"
                  required
                  placeholder="your.email@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="buynow-input"
                  autoFocus
                />
                <span className="input-hint font-mono">
                  Order updates, invoice and tracking will be saved to our database under this email.
                </span>
              </div>

              <div className="form-row-two">
                <div className="form-group">
                  <label htmlFor="buyer-name" className="font-mono form-label">
                    FULL NAME (OPTIONAL)
                  </label>
                  <input
                    id="buyer-name"
                    type="text"
                    placeholder="e.g. Ranbeer Reddy"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="buynow-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="buyer-phone" className="font-mono form-label">
                    CONTACT NUMBER (OPTIONAL)
                  </label>
                  <input
                    id="buyer-phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="buynow-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="buyer-address" className="font-mono form-label">
                  SHIPPING ADDRESS / CITY &amp; PINCODE (OPTIONAL)
                </label>
                <textarea
                  id="buyer-address"
                  rows="2"
                  placeholder="Street address, City, State, Pincode"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="buynow-input"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-buy-now-amazon font-mono"
                style={{ width: '100%', marginTop: '0.5rem', padding: '0.95rem 1.5rem', fontSize: '0.95rem' }}
              >
                {isSubmitting ? 'SAVING ORDER TO DATABASE...' : `CONFIRM ORDER \u2022 \u20B9${totalPrice}`}
              </button>

              <div className="buynow-guarantee font-mono">
                <span>&#128274; 256-bit encrypted database storage</span>
                <span>&bull; Zero spam guarantee</span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
