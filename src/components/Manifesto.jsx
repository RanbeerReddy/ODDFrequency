import React from 'react';

export default function Manifesto({ onExploreVoid, onExploreFeed }) {
  return (
    <section className="manifesto-section" aria-labelledby="manifesto-title">
      <div className="container">
        <div className="manifesto-grid">
          {/* Aside statement */}
          <div className="manifesto-aside">
            <span className="manifesto-tag">// BRAND MANIFESTO &bull; 001</span>
            <h2 id="manifesto-title" className="manifesto-big-quote">
              CLOTHES FOR THE BEAUTIFULLY OUT OF SYNC.
            </h2>
            <div style={{ marginTop: '1rem' }}>
              <span className="badge-id">DEMAND-FIRST &bull; ZERO DEADSTOCK &bull; MADE FOR INDIA</span>
            </div>
          </div>

          {/* Deep narrative & pillars */}
          <div className="manifesto-text-block">
            <p>
              Mainstream streetwear has become a predictable loop of copy-paste luxury logos and inflated hype-tax. <strong>Odd Frequency</strong> was founded on a different wavelength.
            </p>
            <p>
              We live between two polarities: the existential melancholy of the underground (<strong>The Void</strong>) and the absurd, hyper-ironic speed of our digital screens (<strong>The Feed</strong>). Instead of pretending these worlds don't coexist in the same brain, we built a brand that embraces both.
            </p>
            <p>
              We carry zero upfront inventory. We don't flood landfills. Every garment on this site is an open design proposition. You vote, we calibrate demand, and only the highest-conviction pieces get sourced and stitched.
            </p>

            <div className="manifesto-pillars">
              <div className="pillar-box">
                <div className="pillar-title">01 / HEAVYWEIGHT FABRICS</div>
                <div className="pillar-desc">
                  240 to 380 GSM combed cottons, engineered specifically for longevity and Indian climate wearability.
                </div>
              </div>
              <div className="pillar-box">
                <div className="pillar-title">02 / DEMAND VALIDATED</div>
                <div className="pillar-desc">
                  No artificial scarcity or fake timer drops. If you want it, vote for it. If enough people agree, we make it.
                </div>
              </div>
              <div className="pillar-box">
                <div className="pillar-title">03 / REAL DUALITY</div>
                <div className="pillar-desc">
                  Dark alternative grunge one day, ironic internet baby tees the next. You don't have to pick one personality.
                </div>
              </div>
              <div className="pillar-box">
                <div className="pillar-title">04 / ETHICAL PRICING</div>
                <div className="pillar-desc">
                  Direct-to-community pricing in ₹ INR without middleman markups or counterfeit hype premiums.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
