import React, { useState } from 'react';

export default function Newsletter({ onRegisterEmail }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;
    onRegisterEmail(email);
    setSubscribed(true);
    setEmail('');
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

          {subscribed ? (
            <div style={{
              background: 'rgba(212, 255, 0, 0.12)',
              border: '1px solid var(--accent-lime)',
              color: 'var(--accent-lime)',
              padding: '1.25rem 2rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              maxWidth: '520px',
              width: '100%',
              lineHeight: '1.5'
            }}>
              &check; SIGNAL LOCKED. You are registered in the local launch interest queue. When our first batch of samples enters production in India, we will notify you first.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="first-freq-form">
              <div className="first-freq-input-row">
                <input 
                  type="email" 
                  placeholder="your.email@oddfrequency.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="first-freq-input"
                  aria-label="Email address for launch list"
                />
                <button type="submit" className="first-freq-btn">
                  JOIN LAUNCH LIST
                </button>
              </div>
              <p className="first-freq-privacy">
                Zero spam. Zero marketing fluff. This connects to our local prototype waitlist (ready to link to Formspree, Mailchimp or Google Sheets).
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
