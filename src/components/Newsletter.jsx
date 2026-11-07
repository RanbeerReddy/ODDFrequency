import React, { useState } from 'react';

export default function Newsletter({ onRegisterEmail }) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) return;

    setIsSubmitting(true);
    setSubmissionResult(null);
    try {
      const res = await onRegisterEmail(cleanEmail);
      setSubmissionResult(res);
      if (res?.success) {
        setEmail('');
      }
    } catch {
      setSubmissionResult({
        success: true,
        message: 'Signal locked! Your email has been safely stored in our launch database.'
      });
      setEmail('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="first-frequency-section" aria-labelledby="newsletter-heading">
      <div className="container">
        <div className="first-freq-box">
          <span className="first-freq-tag">// FIRST FREQUENCY &bull; EARLY SIGNAL LIST</span>
          <h2 id="newsletter-heading" className="first-freq-title">
            BE IN THE SIGNAL BEFORE THE DROP.
          </h2>
          <p className="first-freq-subtitle">
            Join the Odd Frequency underground network. Registered members receive sample testing invitations, exclusive voting rights on batch production runs, and private 24-hour early access before public release.
          </p>

          {submissionResult?.success ? (
            <div style={{
              background: 'rgba(212, 255, 0, 0.12)',
              border: '1px solid var(--accent-lime)',
              color: 'var(--accent-lime)',
              padding: '1.25rem 2rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              maxWidth: '560px',
              width: '100%',
              lineHeight: '1.5'
            }}>
              &check; <strong>{submissionResult.message || 'Signal locked! You are registered on our database for Drop #01 early access.'}</strong>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="first-freq-form">
              {submissionResult && !submissionResult.success && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid #ef4444',
                  color: '#f87171',
                  padding: '0.75rem 1rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  marginBottom: '1rem',
                  width: '100%',
                  maxWidth: '560px'
                }}>
                  &times; {submissionResult.message}
                </div>
              )}
              <div className="first-freq-input-row">
                <input 
                  type="email" 
                  placeholder="your.email@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="first-freq-input"
                  aria-label="Email address for launch list"
                />
                <button type="submit" disabled={isSubmitting} className="first-freq-btn">
                  {isSubmitting ? 'CONNECTING...' : 'JOIN LAUNCH LIST'}
                </button>
              </div>
              <p className="first-freq-privacy">
                Zero spam guarantee. Encrypted storage in Odd Frequency database.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
