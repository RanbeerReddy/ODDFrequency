import React, { useState, useEffect } from 'react';
import { isSupabaseConfigured } from '../lib/supabase.js';

export default function ProductModal({ 
  product, 
  onClose, 
  hasVoted, 
  voteCount, 
  onVote,
  onNotifySubmit
}) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [submittedEmail, setSubmittedEmail] = useState(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  const isVoid = product.collectionSlug === 'void';

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) return;

    if (!isSupabaseConfigured) {
      onNotifySubmit(product.id, cleanEmail);
      setSubmittedEmail(cleanEmail);
      setEmail('');
      return;
    }

    setIsSubmitting(true);
    setSubmissionResult(null);
    try {
      const res = await onNotifySubmit(product.id, cleanEmail);
      setSubmissionResult(res);
      if (res?.success) {
        setEmail('');
      }
    } catch {
      setSubmissionResult({
        success: false,
        message: 'Network error communicating with waitlist database.'
      });
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
      aria-labelledby="modal-product-title"
    >
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close product view"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Gallery / Mockup Visual */}
        <div className="modal-gallery">
          <img 
            src={product.image} 
            alt={`${product.name} large concept presentation`} 
          />
        </div>

        {/* Product Details & Validation Panel */}
        <div className="modal-info-panel">
          <div className="modal-header-meta">
            <span className={`badge-id ${isVoid ? 'badge-void' : 'badge-feed'}`}>
              {product.id} // {product.collection}
            </span>
            <span>{product.fit}</span>
          </div>

          <h3 id="modal-product-title" className="modal-product-title">
            {product.name}
          </h3>

          {/* Indicative Price Block */}
          <div className="modal-price-box">
            <div className="modal-price-val">
              {product.currency}{product.indicativePrice.toLocaleString('en-IN')}
            </div>
            <div className="modal-price-disclaimer">
              &bull; INDICATIVE CONCEPT PRICE &mdash; Not manufactured yet. Real payments are disabled.
            </div>
          </div>

          {/* Artistic Narrative & Concept */}
          <div>
            <h4 className="font-mono" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '0.4rem' }}>
              // CONCEPT NARRATIVE
            </h4>
            <p className="modal-narrative">
              {product.conceptSummary}
            </p>
          </div>

          {/* Fabrication Specifications */}
          {product.fabricSpecs && (
            <div>
              <h4 className="font-mono" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>
                // PLANNED SPECIFICATIONS
              </h4>
              <ul className="modal-specs-list">
                {product.fabricSpecs.map((spec, i) => (
                  <li key={i}>{spec}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Demand Validation Actions */}
          <div className="modal-vote-action-box">
            <button 
              className={`btn-primary-vote ${hasVoted ? 'voted' : ''}`}
              onClick={() => onVote(product.id)}
              aria-label={`Cast local vote for ${product.name}. Current session votes: ${voteCount}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={hasVoted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <span>{hasVoted ? 'LOCAL SESSION VOTE CAST' : 'VOTE FOR THIS DESIGN'}</span>
              <span>({voteCount})</span>
            </button>

            {/* Launch Interest Signup Form */}
            <div className="launch-interest-form">
              <div className="interest-form-title">
                NOTIFY ME IF PRODUCED
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                If this piece receives enough community votes to hit our minimum production threshold in India, we will notify you before sample release.
              </p>

              {!isSupabaseConfigured && submittedEmail ? (
                <div style={{ 
                  background: 'rgba(255, 170, 0, 0.1)', 
                  border: '1px solid #ffaa00', 
                  color: '#ffc83b', 
                  padding: '0.65rem 0.85rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  lineHeight: '1.4'
                }}>
                  &bull; <strong>NOTICE:</strong> The waitlist service is not yet connected to a server database. Your email ({submittedEmail}) was not saved to a live server. Live notifications will open when the backend launches.
                </div>
              ) : submissionResult?.success ? (
                <div style={{ 
                  background: 'rgba(212, 255, 0, 0.12)', 
                  border: '1px solid var(--accent-lime)', 
                  color: 'var(--accent-lime)', 
                  padding: '0.65rem 0.85rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  lineHeight: '1.4'
                }}>
                  &check; <strong>{submissionResult.message}</strong>
                </div>
              ) : (
                <form onSubmit={handleEmailSubmit} className="interest-input-row">
                  {submissionResult && !submissionResult.success && (
                    <div style={{
                      width: '100%',
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid #ef4444',
                      color: '#f87171',
                      padding: '0.45rem 0.65rem',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.72rem',
                      marginBottom: '0.5rem'
                    }}>
                      &times; {submissionResult.message}
                    </div>
                  )}
                  <input 
                    type="email" 
                    placeholder="your.email@odd.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="interest-input"
                    aria-label="Email address for launch interest notification"
                  />
                  <button type="submit" disabled={isSubmitting} className="btn-interest-submit">
                    {isSubmitting ? 'SAVING...' : 'JOIN LIST'}
                  </button>
                </form>
              )}
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', marginTop: '0.4rem' }}>
                {isSupabaseConfigured
                  ? 'Connected to live sample production notification database.'
                  : 'Pre-launch notice • Server endpoint pending connection'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
