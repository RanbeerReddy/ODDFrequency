import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import CollectionCards from './components/CollectionCards.jsx';
import CollectionPage from './components/CollectionPage.jsx';
import ProductModal from './components/ProductModal.jsx';
import ProductCard from './components/ProductCard.jsx';
import VoteArena from './components/VoteArena.jsx';
import Manifesto from './components/Manifesto.jsx';
import Newsletter from './components/Newsletter.jsx';
import AudioPlayer from './components/AudioPlayer.jsx';
import Footer from './components/Footer.jsx';
import Toast from './components/Toast.jsx';

import { PRODUCTS } from './data/products.js';
import { DROP_CONCEPTS } from './data/concepts.js';

export default function App() {
  const [activeView, setActiveView] = useState('home'); // 'home', 'void', 'feed', 'all', 'manifesto'
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
        initial[p.id] = (stored[p.id] !== undefined) ? stored[p.id] : p.seedVotes;
      });
      return initial;
    } catch {
      const initial = {};
      PRODUCTS.forEach(p => { initial[p.id] = p.seedVotes; });
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
        initial[c.id] = (stored[c.id] !== undefined) ? stored[c.id] : c.seedVotes;
      });
      return initial;
    } catch {
      const initial = {};
      DROP_CONCEPTS.forEach(c => { initial[c.id] = c.seedVotes; });
      return initial;
    }
  });

  // Sync theme attribute to document body for contextual aesthetic styling
  useEffect(() => {
    if (activeView === 'void') {
      document.documentElement.setAttribute('data-theme', 'void');
    } else if (activeView === 'feed') {
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
    }, 3800);
  };

  // Handle Product Vote (Demand Validation)
  const handleVoteProduct = (productId) => {
    if (votedProductIds.includes(productId)) {
      addToast(`Session lock: You have already cast your vote for ${productId}.`);
      return;
    }

    const updatedVoted = [...votedProductIds, productId];
    setVotedProductIds(updatedVoted);
    try {
      localStorage.setItem('of_voted_products', JSON.stringify(updatedVoted));
    } catch (e) {}

    const newVotesCount = (productVotes[productId] || 0) + 1;
    const updatedVotesMap = { ...productVotes, [productId]: newVotesCount };
    setProductVotes(updatedVotesMap);
    try {
      localStorage.setItem('of_product_votes', JSON.stringify(updatedVotesMap));
    } catch (e) {}

    addToast(`Vote recorded for ${productId}! Total votes: ${newVotesCount}`);
  };

  // Handle Drop Arena Concept Vote
  const handleVoteConcept = (conceptId) => {
    if (votedConceptIds.includes(conceptId)) {
      addToast(`Session lock: You've already voted for ${conceptId} in this session.`);
      return;
    }

    const updatedVoted = [...votedConceptIds, conceptId];
    setVotedConceptIds(updatedVoted);
    try {
      localStorage.setItem('of_voted_concepts', JSON.stringify(updatedVoted));
    } catch (e) {}

    const newVotes = (conceptVotes[conceptId] || 0) + 1;
    const updatedVotesMap = { ...conceptVotes, [conceptId]: newVotes };
    setConceptVotes(updatedVotesMap);
    try {
      localStorage.setItem('of_concept_votes', JSON.stringify(updatedVotesMap));
    } catch (e) {}

    addToast(`Next drop vote recorded for ${conceptId}! Total: ${newVotes}`);
  };

  // Handle Launch Interest Signup for specific product
  const handleNotifyProduct = (productId, email) => {
    try {
      const waitlist = JSON.parse(localStorage.getItem('of_product_waitlist') || '[]');
      waitlist.push({ productId, email, timestamp: new Date().toISOString() });
      localStorage.setItem('of_product_waitlist', JSON.stringify(waitlist));
    } catch (e) {}
    addToast(`Added to early release notification for ${productId}`);
  };

  // Handle General Waitlist Signup
  const handleRegisterNewsletter = (email) => {
    try {
      const waitlist = JSON.parse(localStorage.getItem('of_general_waitlist') || '[]');
      waitlist.push({ email, timestamp: new Date().toISOString() });
      localStorage.setItem('of_general_waitlist', JSON.stringify(waitlist));
    } catch (e) {}
    addToast('Signal locked: You are registered for Drop #01 early access.');
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
              onExploreVoid={() => setActiveView('void')}
              onExploreFeed={() => setActiveView('feed')}
              onOpenArena={handleOpenArena}
            />

            <CollectionCards 
              onSelectVoid={() => setActiveView('void')}
              onSelectFeed={() => setActiveView('feed')}
            />

            {/* Featured Selection Preview */}
            <section className="container" style={{ paddingBottom: '4rem' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'baseline', 
                marginBottom: '2rem',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '1rem'
              }}>
                <div>
                  <h3 className="font-headline" style={{ fontSize: '1.8rem', letterSpacing: '-0.02em' }}>
                    FLAGSHIP CONCEPTS
                  </h3>
                  <p className="font-sub" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Key silhouettes currently leading demand validation.
                  </p>
                </div>
                <button 
                  onClick={() => setActiveView('all')}
                  className="font-mono"
                  style={{ fontSize: '0.78rem', color: 'var(--text-primary)', textDecoration: 'underline' }}
                >
                  VIEW ALL PIECES &rarr;
                </button>
              </div>

              <div className="product-grid">
                {PRODUCTS.filter(p => p.isFeatured).map(product => (
                  <ProductCard 
                    key={product.id}
                    product={product}
                    onSelectProduct={setSelectedProduct}
                    hasVoted={votedProductIds.includes(product.id)}
                    voteCount={productVotes[product.id] || product.seedVotes}
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
              onExploreVoid={() => setActiveView('void')}
              onExploreFeed={() => setActiveView('feed')}
            />

            {/* First Frequency Waitlist */}
            <Newsletter onRegisterEmail={handleRegisterNewsletter} />
          </>
        )}

        {(activeView === 'void' || activeView === 'feed' || activeView === 'all') && (
          <>
            <CollectionPage 
              collectionKey={activeView}
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

        {activeView === 'manifesto' && (
          <>
            <Manifesto 
              onExploreVoid={() => setActiveView('void')}
              onExploreFeed={() => setActiveView('feed')}
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
          voteCount={productVotes[selectedProduct.id] || selectedProduct.seedVotes}
          onVote={handleVoteProduct}
          onNotifySubmit={handleNotifyProduct}
        />
      )}

      {/* Persistent Audio Player */}
      <AudioPlayer />

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
