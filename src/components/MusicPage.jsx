import React from 'react';
import { RADIO_STATIONS, MIXTAPES } from '../data/music.js';
import { audioPlayerService } from '../utils/audioEngine.js';

export default function MusicPage() {
  const handleTuneIn = (stationId) => {
    audioPlayerService.setStation(stationId);
    audioPlayerService.start(stationId);
  };

  return (
    <section className="container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      {/* Page Header */}
      <div className="collection-page-header">
        <div className="collection-page-breadcrumbs">
          <span>BROADCAST</span>
          <span>/</span>
          <span style={{ color: 'var(--text-primary)' }}>SOUND SYSTEM &amp; RADIO</span>
        </div>

        <h1 className="collection-hero-title">
          ODD FREQUENCY SOUND SYSTEM
        </h1>

        <p className="collection-hero-desc">
          <strong>THE SONIC FREQUENCIES BEHIND OUR THREADS &mdash; </strong>
          Fashion and music are indivisible. From underground 90s nu-metal basements to Berlin four-on-the-floor warehouse house and hyper-pop rave culture. Tune into our live synthesized frequencies or stream community tape archives.
        </p>
      </div>

      {/* Featured Stations Grid */}
      <div style={{ marginBottom: '4rem' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'baseline', 
          marginBottom: '1.5rem',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '0.8rem'
        }}>
          <h2 className="font-headline" style={{ fontSize: '1.4rem' }}>
            LIVE SATELLITE CHANNELS
          </h2>
          <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--accent-purple)' }}>
            [ DIRECT BROWSER SYNTHESIS ]
          </span>
        </div>

        <div className="music-stations-grid">
          {RADIO_STATIONS.map((station) => (
            <div key={station.id} className="music-station-card">
              <div className="station-card-top">
                <div className="station-freq-badge font-mono">
                  {station.frequency}
                </div>
                <span className="station-bpm-badge font-mono">
                  {station.bpm}
                </span>
              </div>

              <h3 className="station-card-title">
                {station.name}
              </h3>
              
              <div className="station-card-genre">
                {station.genre}
              </div>

              <p className="station-card-desc">
                {station.description}
              </p>

              <div className="station-card-footer">
                <button 
                  className="btn-station-tune"
                  onClick={() => handleTuneIn(station.id)}
                  aria-label={`Tune into ${station.name}`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  <span>TUNE IN RADIO</span>
                </button>
                <span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                  EST: {station.length}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mixtape Cassette Releases */}
      <div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'baseline', 
          marginBottom: '1.5rem',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '0.8rem'
        }}>
          <h2 className="font-headline" style={{ fontSize: '1.4rem' }}>
            OFFICIAL CASSETTE VAULT
          </h2>
          <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            LIMITED ARCHIVE RELEASES
          </span>
        </div>

        <div className="mixtapes-grid">
          {MIXTAPES.map(tape => (
            <div key={tape.id} className="mixtape-card">
              <div className="mixtape-cover-wrap">
                <img src={tape.cover} alt={tape.title} />
                <span className="mixtape-runtime-badge font-mono">
                  {tape.runtime}
                </span>
              </div>

              <div className="mixtape-info">
                <span className="badge-id" style={{ color: 'var(--accent-purple)', borderColor: 'var(--accent-purple)' }}>
                  {tape.id} // TAPE
                </span>
                <h3 className="mixtape-title" style={{ marginTop: '0.5rem' }}>
                  {tape.title}
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Curated by {tape.curator}
                </div>

                <div className="mixtape-tracklist">
                  <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: '0.4rem' }}>
                    // TRACKLIST:
                  </div>
                  <ul>
                    {tape.tracks.map((trk, i) => (
                      <li key={i}>{trk}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
