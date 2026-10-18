import React, { useState } from 'react';
import { isSupabaseConfigured } from '../lib/supabase.js';

export default function Newsletter({ onRegisterEmail }) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [submittedEmail, setSubmittedEmail] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) return;

    if (!isSupabaseConfigured) {
      onRegisterEmail(cleanEmail);
      setSubmittedEmail(cleanEmail);
      setEmail('');
      return;
    }

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
        success: false,
        message: 'Network error communicating with waitlist database.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="first-frequency-section" aria-labelledby="newsletter-heading">
      <div className="container">
        <div className="first-freq-box">
          <span className="first-freq-tag">// FIRST FREQUENCY &bull; LAUNCH INTEREST</span>
          <h2 id="newsletter-heading" className="first-freq-title">
            BE IN THE SIGNAL BEFORE THE DROP.
          </h2>
          <p className="first-freq-subtitle">
            Odd Frequency is currently in its demand-validation prototype phase. Join our early signal list to receive sample testing invitations, early voting power, and private access when physical batches open.
          </p>

          {!isSupabaseConfigured && submittedEmail ? (
            <div style={{
              background: 'rgba(255, 170, 0, 0.1)',
              border: '1px solid #ffaa00',
              color: '#ffc83b',
              padding: '1.25rem 2rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              maxWidth: '560px',
              width: '100%',
              lineHeight: '1.5'
            }}>
              &bull; <strong>NOTICE &bull; WAITLIST DISCONNECTED:</strong> The live waitlist service is not yet connected to a server database. Your email ({submittedEmail}) was not transmitted to a server. Real early access signups will open when the backend is deployed.
            </div>
          ) : submissionResult?.success ? (
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
              &check; <strong>{submissionResult.message}</strong>
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
                  placeholder="your.email@oddfrequency.in"
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
                {isSupabaseConfigured
                  ? 'Encrypted connection to our Supabase launch database. Zero spam. Zero tracking fluff.'
                  : 'Pre-launch notice: The database endpoint is pending connection. Submissions are not currently captured on a server.'}
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
