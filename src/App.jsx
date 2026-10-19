import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import CollectionCards from './components/CollectionCards.jsx';
import CollectionPage from './components/CollectionPage.jsx';
import ArtPage from './components/ArtPage.jsx';
import MusicPage from './components/MusicPage.jsx';
import ProductModal from './components/ProductModal.jsx';
import ProductCard from './components/ProductCard.jsx';
import VoteArena from './components/VoteArena.jsx';
import Manifesto from './components/Manifesto.jsx';
import Newsletter from './components/Newsletter.jsx';
import YouTubePlayer from './components/YouTubePlayer.jsx';
import Footer from './components/Footer.jsx';
import Toast from './components/Toast.jsx';

import { PRODUCTS } from './data/products.js';
import { DROP_CONCEPTS } from './data/concepts.js';
import { 
  isSupabaseConfigured, 
  submitWaitlistEmail, 
  recordVoteOnServer, 
  fetchServerVoteCounts, 
  fetchUserVotedItemIds, 
  getOrCreateAnonymousVoterToken 
} from './lib/supabase.js';

export default function App() {
  const [activeView, setActiveView] = useState('home'); // 'home', 'apparel', 'band', 'meme', 'ringer', 'art', 'music', 'manifesto'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Session-persisted voting states
  const [votedProductIds, setVotedProductIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('of_voted_products') || '[]');
    } catch {
      return [];
    }
  });

  const [productVotes, setProductVotes] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('of_product_votes') || '{}');
      const initial = {};
      PRODUCTS.forEach(p => {
        const val = stored[p.id];
        // Ensure reset if previously seeded with fabricated 300+ counts
        initial[p.id] = (typeof val === 'number' && val < 50) ? val : 0;
      });
      return initial;
    } catch {
      const initial = {};
      PRODUCTS.forEach(p => { initial[p.id] = 0; });
      return initial;
    }
  });

  const [votedConceptIds, setVotedConceptIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('of_voted_concepts') || '[]');
    } catch {
      return [];
    }
  });

  const [conceptVotes, setConceptVotes] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('of_concept_votes') || '{}');
      const initial = {};
      DROP_CONCEPTS.forEach(c => {
        const val = stored[c.id];
        // Ensure reset if previously seeded with fabricated 400+ counts
        initial[c.id] = (typeof val === 'number' && val < 50) ? val : 0;
      });
      return initial;
    } catch {
      const initial = {};
      DROP_CONCEPTS.forEach(c => { initial[c.id] = 0; });
      return initial;
    }
  });

  // Fetch real vote tallies and user voted items from Supabase when configured
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const voterToken = getOrCreateAnonymousVoterToken();

    // 1. Fetch live aggregate vote totals from database
    fetchServerVoteCounts().then(serverCounts => {
      if (serverCounts && Object.keys(serverCounts).length > 0) {
        setProductVotes(prev => {
          const updated = { ...prev };
          PRODUCTS.forEach(p => {
            if (serverCounts[p.id] !== undefined) {
              updated[p.id] = serverCounts[p.id];
            }
          });
          return updated;
        });

        setConceptVotes(prev => {
          const updated = { ...prev };
          DROP_CONCEPTS.forEach(c => {
            if (serverCounts[c.id] !== undefined) {
              updated[c.id] = serverCounts[c.id];
            }
          });
          return updated;
        });
      }
    });

    // 2. Fetch voted item IDs for this anonymous voter token
    fetchUserVotedItemIds(voterToken).then(votedIds => {
      if (Array.isArray(votedIds) && votedIds.length > 0) {
        const prodVoted = votedIds.filter(id => PRODUCTS.some(p => p.id === id));
        const conceptVoted = votedIds.filter(id => DROP_CONCEPTS.some(c => c.id === id));
        if (prodVoted.length > 0) setVotedProductIds(prev => Array.from(new Set([...prev, ...prodVoted])));
        if (conceptVoted.length > 0) setVotedConceptIds(prev => Array.from(new Set([...prev, ...conceptVoted])));
      }
    });
  }, []);

  // Sync theme attribute to document body for contextual aesthetic styling
  useEffect(() => {
    if (activeView === 'band' || activeView === 'void') {
      document.documentElement.setAttribute('data-theme', 'void');
    } else if (activeView === 'meme' || activeView === 'feed') {
      document.documentElement.setAttribute('data-theme', 'feed');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeView]);

  // Toast dispatcher
  const addToast = (message) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4200);
  };

  const votingInProgressRef = useRef(new Set());

  // Handle Product Vote (Demand Validation)
  const handleVoteProduct = async (productId) => {
    if (votedProductIds.includes(productId) || votingInProgressRef.current.has(productId)) {
      addToast(`Session lock: You have already cast a vote for ${productId}.`);
      return;
    }

    if (!isSupabaseConfigured) {
      // Pre-launch local preview mode
      const updatedVoted = [...votedProductIds, productId];
      setVotedProductIds(updatedVoted);
      try {
        localStorage.setItem('of_voted_products', JSON.stringify(updatedVoted));
      } catch {}

      const newVotesCount = (productVotes[productId] || 0) + 1;
      const updatedVotesMap = { ...productVotes, [productId]: newVotesCount };
      setProductVotes(updatedVotesMap);
      try {
        localStorage.setItem('of_product_votes', JSON.stringify(updatedVotesMap));
      } catch {}

      addToast(`Local session vote cast for ${productId} (Stored in browser • Server database pending)`);
      return;
    }

    // Live Supabase integration
    votingInProgressRef.current.add(productId);
    try {
      const voterToken = getOrCreateAnonymousVoterToken();
      const result = await recordVoteOnServer(productId, 'product', voterToken);

      if (result.success) {
        const updatedVoted = [...votedProductIds, productId];
        setVotedProductIds(updatedVoted);
        try {
          localStorage.setItem('of_voted_products', JSON.stringify(updatedVoted));
        } catch {}

        const newVotesCount = (productVotes[productId] || 0) + 1;
        const updatedVotesMap = { ...productVotes, [productId]: newVotesCount };
        setProductVotes(updatedVotesMap);

        addToast(`✓ Vote recorded on server for ${productId}!`);
      } else {
        if (result.duplicate) {
          if (!votedProductIds.includes(productId)) {
            setVotedProductIds(prev => [...prev, productId]);
          }
        }
        addToast(result.message);
      }
    } finally {
      votingInProgressRef.current.delete(productId);
    }
  };

  // Handle Drop Arena Concept Vote
  const handleVoteConcept = async (conceptId) => {
    if (votedConceptIds.includes(conceptId) || votingInProgressRef.current.has(conceptId)) {
      addToast(`Session lock: You have already voted for ${conceptId}.`);
      return;
    }

    if (!isSupabaseConfigured) {
      // Pre-launch local preview mode
      const updatedVoted = [...votedConceptIds, conceptId];
      setVotedConceptIds(updatedVoted);
      try {
        localStorage.setItem('of_voted_concepts', JSON.stringify(updatedVoted));
      } catch {}

      const newVotes = (conceptVotes[conceptId] || 0) + 1;
      const updatedVotesMap = { ...conceptVotes, [conceptId]: newVotes };
      setConceptVotes(updatedVotesMap);
      try {
        localStorage.setItem('of_concept_votes', JSON.stringify(updatedVotesMap));
      } catch {}

      addToast(`Local session vote cast for ${conceptId} (Stored in browser • Server database pending)`);
      return;
    }

    // Live Supabase integration
    votingInProgressRef.current.add(conceptId);
    try {
      const voterToken = getOrCreateAnonymousVoterToken();
      const result = await recordVoteOnServer(conceptId, 'concept', voterToken);

      if (result.success) {
        const updatedVoted = [...votedConceptIds, conceptId];
        setVotedConceptIds(updatedVoted);
        try {
          localStorage.setItem('of_voted_concepts', JSON.stringify(updatedVoted));
        } catch {}

        const newVotes = (conceptVotes[conceptId] || 0) + 1;
        const updatedVotesMap = { ...conceptVotes, [conceptId]: newVotes };
        setConceptVotes(updatedVotesMap);

        addToast(`✓ Vote recorded on server for ${conceptId}!`);
      } else {
        if (result.duplicate) {
          if (!votedConceptIds.includes(conceptId)) {
            setVotedConceptIds(prev => [...prev, conceptId]);
          }
        }
        addToast(result.message);
      }
    } finally {
      votingInProgressRef.current.delete(conceptId);
    }
  };

  // Handle Launch Interest Signup for specific product
  const handleNotifyProduct = async (productId, email) => {
    if (!isSupabaseConfigured) {
      addToast(`Notice: Waitlist backend is not connected. Notification request for ${productId} was not saved to a server.`);
      return { success: false, isConfigured: false, message: 'Waitlist service is pending backend connection.' };
    }

    const res = await submitWaitlistEmail(email, productId);
    addToast(res.message);
    return res;
  };

  // Handle General Waitlist Signup
  const handleRegisterNewsletter = async (email) => {
    if (!isSupabaseConfigured) {
      addToast('Notice: Waitlist backend is not connected. Email was not saved to a server database.');
      return { success: false, isConfigured: false, message: 'Waitlist service is pending backend connection.' };
    }

    const res = await submitWaitlistEmail(email, null);
    addToast(res.message);
    return res;
  };

  const handleOpenArena = () => {
    setActiveView('home');
    setTimeout(() => {
      const el = document.getElementById('next-drop');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const totalVotesCount = votedProductIds.length + votedConceptIds.length;

  return (
    <div className="site-wrapper">
      {/* Navigation */}
      <Navbar 
        activeView={activeView}
        setActiveView={setActiveView}
        totalVotesCount={totalVotesCount}
        onOpenArena={handleOpenArena}
      />

      {/* Main Content Router */}
      <main id="main-content">
        {activeView === 'home' && (
          <>
            <Hero 
              onExploreApparel={() => setActiveView('apparel')}
              onExploreArt={() => setActiveView('art')}
              onExploreMusic={() => setActiveView('music')}
              onOpenArena={handleOpenArena}
            />

            <CollectionCards 
              onSelectApparel={() => setActiveView('apparel')}
              onSelectArt={() => setActiveView('art')}
              onSelectMusic={() => setActiveView('music')}
            />

            {/* Featured Selection Preview */}
            <section className="container" style={{ paddingBottom: '4rem' }}>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap',
                justifyContent: 'space-between', 
                alignItems: 'baseline', 
                marginBottom: '2rem',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '1rem',
                gap: '0.5rem'
              }}>
                <div>
                  <h3 className="font-headline" style={{ fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', letterSpacing: '-0.02em' }}>
                    FLAGSHIP CONCEPTS
                  </h3>
                  <p className="font-sub" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Key silhouettes currently leading demand validation.
                  </p>
                </div>
                <button 
                  onClick={() => setActiveView('apparel')}
                  className="font-mono"
                  style={{ fontSize: '0.78rem', color: 'var(--accent-purple)', textDecoration: 'underline' }}
                >
                  VIEW ALL {PRODUCTS.length} PIECES &rarr;
                </button>
              </div>

              <div className="product-grid">
                {PRODUCTS.filter(p => p.isFeatured).map(product => (
                  <ProductCard 
                    key={product.id}
                    product={product}
                    onSelectProduct={setSelectedProduct}
                    hasVoted={votedProductIds.includes(product.id)}
                    voteCount={productVotes[product.id] || 0}
                    onVote={handleVoteProduct}
                  />
                ))}
              </div>
            </section>

            {/* Community Validation Arena */}
            <VoteArena 
              votedConceptIds={votedConceptIds}
              conceptVotes={conceptVotes}
              onVoteConcept={handleVoteConcept}
            />

            {/* Brand Manifesto */}
            <Manifesto 
              onExploreVoid={() => setActiveView('band')}
              onExploreFeed={() => setActiveView('meme')}
            />

            {/* First Frequency Waitlist */}
            <Newsletter onRegisterEmail={handleRegisterNewsletter} />
          </>
        )}

        {(activeView === 'apparel' || activeView === 'band' || activeView === 'meme' || activeView === 'ringer' || activeView === 'void' || activeView === 'feed' || activeView === 'all') && (
          <>
            <CollectionPage 
              collectionKey={activeView === 'apparel' ? 'all' : activeView}
              onSwitchCollection={setActiveView}
              products={PRODUCTS}
              onSelectProduct={setSelectedProduct}
              votedProductIds={votedProductIds}
              productVotes={productVotes}
              onVote={handleVoteProduct}
            />

            {/* Also include the voting arena for seamless access */}
            <VoteArena 
              votedConceptIds={votedConceptIds}
              conceptVotes={conceptVotes}
              onVoteConcept={handleVoteConcept}
            />

            <Newsletter onRegisterEmail={handleRegisterNewsletter} />
          </>
        )}

        {activeView === 'art' && (
          <>
            <ArtPage 
              onSelectPrintProposal={() => setActiveView('apparel')}
              onOpenArena={handleOpenArena}
            />
            <VoteArena 
              votedConceptIds={votedConceptIds}
              conceptVotes={conceptVotes}
              onVoteConcept={handleVoteConcept}
            />
            <Newsletter onRegisterEmail={handleRegisterNewsletter} />
          </>
        )}

        {activeView === 'music' && (
          <>
            <MusicPage />
            <VoteArena 
              votedConceptIds={votedConceptIds}
              conceptVotes={conceptVotes}
              onVoteConcept={handleVoteConcept}
            />
            <Newsletter onRegisterEmail={handleRegisterNewsletter} />
          </>
        )}

        {activeView === 'manifesto' && (
          <>
            <Manifesto 
              onExploreVoid={() => setActiveView('band')}
              onExploreFeed={() => setActiveView('meme')}
            />
            <VoteArena 
              votedConceptIds={votedConceptIds}
              conceptVotes={conceptVotes}
              onVoteConcept={handleVoteConcept}
            />
            <Newsletter onRegisterEmail={handleRegisterNewsletter} />
          </>
        )}
      </main>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductModal 
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          hasVoted={votedProductIds.includes(selectedProduct.id)}
          voteCount={productVotes[selectedProduct.id] || 0}
          onVote={handleVoteProduct}
          onNotifySubmit={handleNotifyProduct}
        />
      )}

      {/* Persistent Skeuomorphic Cyber YouTube Radio Player Deck */}
      <YouTubePlayer />

      {/* Site Footer */}
      <Footer 
        onSwitchView={setActiveView}
        onOpenArena={handleOpenArena}
      />

      {/* Micro-interaction Toasts */}
      <Toast toasts={toasts} />
    </div>
  );
}
