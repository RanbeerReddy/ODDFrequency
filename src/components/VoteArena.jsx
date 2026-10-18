import React from 'react';
import { DROP_CONCEPTS } from '../data/concepts.js';
import { isSupabaseConfigured } from '../lib/supabase.js';

export default function VoteArena({ 
  votedConceptIds = [], 
  conceptVotes = {}, 
  onVoteConcept 
}) {
  return (
    <section className="drop-arena-section" id="next-drop" aria-labelledby="arena-heading">
      <div className="container">
        <header className="drop-arena-header">
          <div className="arena-tag">
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent-lime)', display: 'inline-block' }}></span>
            <span>
              {isSupabaseConfigured 
                ? 'COMMUNITY VALIDATION // DROP #01 REAL-TIME DATABASE' 
                : 'COMMUNITY VALIDATION // DROP #01 PRE-LAUNCH PREVIEW'}
            </span>
          </div>
          <h2 id="arena-heading" className="arena-title">
            HELP US MAKE THE NEXT DROP.
          </h2>
          <p className="arena-subtitle">
            Odd Frequency operates on zero deadstock. Below are four experimental concept prototypes competing for our very first sample production run in India. Vote for the piece you want made.
          </p>
        </header>

        {/* 4 Competing Concepts Arena */}
        <div className="concepts-arena-grid">
          {DROP_CONCEPTS.map(concept => {
            const isVoid = concept.collectionSlug === 'void';
            const currentVotes = conceptVotes[concept.id] || 0;
            const hasVoted = votedConceptIds.includes(concept.id);
            const percentage = Math.min(100, Math.round((currentVotes / concept.targetThreshold) * 100));

            return (
              <div 
                key={concept.id}
                className={`concept-battle-card ${isVoid ? 'card-void' : 'card-feed'}`}
              >
                <div className="concept-card-image">
                  <img 
                    src={concept.image} 
                    alt={`${concept.name} prototype flatlay`}
                    loading="lazy" 
                  />
                </div>

                <div className="concept-card-meta">
                  <span className={`badge-id ${isVoid ? 'badge-void' : 'badge-feed'}`}>
                    {concept.id}
                  </span>
                  <span style={{ color: 'var(--text-tertiary)' }}>
                    {concept.stage}
                  </span>
                </div>

                <h3 className="concept-card-name">
                  {concept.name}
                </h3>

                <p className="concept-card-pitch">
                  {concept.conceptPitch}
                </p>

                {/* Progress bar towards production threshold */}
                <div className="concept-progress-bar-wrap">
                  <div className="progress-labels">
                    <span>{currentVotes} / {concept.targetThreshold} VOTES</span>
                    <span>{percentage}% OF THRESHOLD</span>
                  </div>
                  <div className="progress-track" role="progressbar" aria-valuenow={percentage} aria-valuemin="0" aria-valuemax="100">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>

                <button 
                  className={`btn-vote-concept ${hasVoted ? 'voted' : ''}`}
                  onClick={() => onVoteConcept(concept.id)}
                  aria-label={`Cast local session vote for ${concept.name}. Current session votes: ${currentVotes}`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={hasVoted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  <span>{hasVoted ? 'LOCAL SESSION VOTE CAST' : 'VOTE FOR THIS PIECE'}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Ethical Transparency Note */}
        <div style={{
          padding: '1.25rem 1.5rem',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          <div>
            {isSupabaseConfigured ? (
              <>
                <strong>COMMUNITY VALIDATION:</strong> Vote tallies are synchronized with our Supabase Postgres database. Single-vote integrity is enforced to preserve genuine demand validation.
              </>
            ) : (
              <>
                <strong>TRANSPARENCY NOTE:</strong> Voting is currently operating in pre-launch local preview mode. Counts start from zero and are stored in your browser session. Server database synchronization will be activated upon Drop #01 backend deployment.
              </>
            )}
          </div>
          <div style={{ color: isSupabaseConfigured ? 'var(--accent-lime)' : 'var(--text-tertiary)' }}>
            {isSupabaseConfigured ? '[ LIVE SUPABASE PERSISTENCE ACTIVE ]' : '[ PRE-LAUNCH PREVIEW • BACKEND PENDING ]'}
          </div>
        </div>
      </div>
    </section>
  );
}
