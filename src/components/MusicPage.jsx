import React, { useState, useMemo } from 'react';
import { useAudio } from '../context/useAudio.js';
import { STATIONS, GENRES, MIXTAPES, DEFAULT_TRACKS } from '../data/musicTracks.js';
import VisualizerBars from './player/VisualizerBars.jsx';

export default function MusicPage() {
  const {
    currentTrack,
    isPlaying,
    currentStation,
    isLiveSync,
    playTrack,
    setStation,
    tuneLive
  } = useAudio();

  const [activeGenre, setActiveGenre] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter tracks by genre and search query
  const filteredTracks = useMemo(() => {
    let list = DEFAULT_TRACKS;

    if (activeGenre !== 'all') {
      list = list.filter(t => t.genre === activeGenre || t.stationId === activeGenre);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(t => 
        t.title.toLowerCase().includes(q) || 
        t.artist.toLowerCase().includes(q) ||
        (t.note && t.note.toLowerCase().includes(q))
      );
    }

    return list;
  }, [activeGenre, searchQuery]);

  return (
    <section className="container music-page-container">
      {/* Header & Breadcrumb */}
      <div className="collection-page-header">
        <div className="collection-page-breadcrumbs">
          <span>ARCHIVE</span>
          <span>/</span>
          <span style={{ color: 'var(--text-primary)' }}>UNDERGROUND SOUND SYSTEM // 5 FREQUENCIES</span>
        </div>

        <div className="music-hero-title-wrap">
          <h1 className="collection-hero-title">
            THE SOUND VAULT.
          </h1>
          <div className="live-broadcast-status-pill font-mono">
            <span className="live-dot-pulse"></span>
            <span>BROADCASTING LIVE // {currentStation.frequency} ({currentStation.name})</span>
          </div>
        </div>

        <p className="collection-hero-desc">
          <strong>ODD FREQUENCY RADIO // 5 CURATED FREQUENCIES &mdash; </strong>
          Sound is the atmospheric foundation of the garments we forge. Switch across 5 curated channels: from slowcore dreampop and 80s romantic darkwave to Florida death metal, late-night cinematic noir jazz, and slacker lo-fi bedroom tape demos.
        </p>
      </div>

      {/* 5 Radio Station Deck Cards */}
      <div className="stations-deck-grid">
        {STATIONS.map((st) => {
          const isSelected = currentStation.id === st.id;
          return (
            <div 
              key={st.id}
              className={`station-deck-card ${isSelected ? 'active' : ''}`}
              onClick={() => setStation(st.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setStation(st.id)}
            >
              <div className="station-card-top">
                <span className="station-freq-badge font-mono" style={{ borderColor: st.accent, color: st.accent }}>
                  {st.frequency}
                </span>
                <span className="station-live-badge">
                  {isSelected && isPlaying ? (
                    <span className="station-transmitting-pill" style={{ color: st.accent }}>
                      <span className="mini-pulse-dot" style={{ backgroundColor: st.accent, boxShadow: `0 0 6px ${st.accent}` }} /> TRANSMITTING
                    </span>
                  ) : (
                    <span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                      [{st.trackCount} TRACKS]
                    </span>
                  )}
                </span>
              </div>

              <h3 className="station-card-name font-headline">{st.name}</h3>
              <p className="station-card-tagline">{st.tagline}</p>

              <div className="station-card-footer">
                <button 
                  className={`btn-station-tune ${isSelected ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setStation(st.id);
                  }}
                  style={isSelected ? { background: st.accent, borderColor: st.accent, color: '#000', fontWeight: '800' } : {}}
                >
                  {isSelected ? `✓ TUNED TO ${st.frequency}` : `TUNE FREQUENCY →`}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="music-filter-toolbar">
        <div className="music-genre-chips">
          {GENRES.map(g => (
            <button
              key={g.id}
              className={`filter-chip ${activeGenre === g.id ? 'active' : ''}`}
              onClick={() => setActiveGenre(g.id)}
            >
              {g.label}
            </button>
          ))}
        </div>

        <div className="music-search-actions">
          <div className="music-search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input 
              type="text"
              placeholder="Search artist or track..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="music-search-input"
            />
            {searchQuery && (
              <button 
                className="music-search-clear"
                onClick={() => setSearchQuery('')}
              >
                &times;
              </button>
            )}
          </div>

          <button 
            className={`btn-tune-broadcast ${isLiveSync ? 'active' : ''}`}
            onClick={tuneLive}
          >
            <span>⚡</span>
            <span>{isLiveSync ? 'SYNCED TO BROADCAST' : 'TUNE LIVE SYNC'}</span>
          </button>
        </div>
      </div>

      {/* Curated Tracklist Table */}
      <div className="music-tracklist-section">
        <div className="tracklist-header-row font-mono">
          <span className="th-num">#</span>
          <span className="th-title">TRACK / ARTIST</span>
          <span className="th-station">FREQUENCY</span>
          <span className="th-genre">PLAYLIST</span>
          <span className="th-dur">TIME</span>
          <span className="th-act">ACTION</span>
        </div>

        <div className="tracklist-rows">
          {filteredTracks.map((track, idx) => {
            const isCurrent = currentTrack.id === track.id || currentTrack.youtubeId === track.youtubeId;
            const isThisPlaying = isCurrent && isPlaying;

            return (
              <div 
                key={track.id}
                className={`track-table-row ${isCurrent ? 'is-current' : ''}`}
                onClick={() => playTrack(track)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && playTrack(track)}
              >
                {/* Index or Live Equalizer */}
                <div className="track-col-index font-mono">
                  {isThisPlaying ? (
                    <VisualizerBars isPlaying={true} barCount={4} accentColor="var(--accent-purple)" />
                  ) : (
                    <span>{idx < 9 ? `0${idx + 1}` : idx + 1}</span>
                  )}
                </div>

                {/* Track Thumbnail, Title, Artist */}
                <div className="track-col-info">
                  <img 
                    src={track.cover || `https://img.youtube.com/vi/${track.youtubeId}/mqdefault.jpg`}
                    alt={track.title}
                    className="track-col-thumb"
                    loading="lazy"
                  />
                  <div className="track-titles-block">
                    <span className="track-row-title font-headline">{track.title}</span>
                    <span className="track-row-artist">{track.artist}</span>
                    {track.note && <span className="track-row-note font-mono">{track.note}</span>}
                  </div>
                </div>

                {/* Frequency */}
                <div className="track-col-station font-mono">
                  <span className="badge-id">{track.frequency}</span>
                </div>

                {/* Playlist origin */}
                <div className="track-col-genre font-mono">
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                    {track.playlistId}
                  </span>
                </div>

                {/* Duration */}
                <div className="track-col-duration font-mono">
                  {track.duration}
                </div>

                {/* Action Button */}
                <div className="track-col-action">
                  <button 
                    className={`btn-track-play ${isCurrent ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      playTrack(track);
                    }}
                    aria-label={`Play ${track.title}`}
                  >
                    {isThisPlaying ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="4" width="4" height="16"/>
                        <rect x="14" y="4" width="4" height="16"/>
                      </svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5,3 19,12 5,21"/>
                      </svg>
                    )}
                    <span>{isThisPlaying ? 'PLAYING' : 'TUNE IN'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mixtape Cassette Archives */}
      <div className="mixtapes-archive-section">
        <div className="mixtapes-header">
          <h3 className="font-headline mixtapes-title">
            THE 5 OFFICIAL YOUTUBE RADIO PLAYLISTS
          </h3>
          <p className="font-sub" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Direct channels linked to Odd Frequency's curated YouTube archives.
          </p>
        </div>

        <div className="mixtapes-grid">
          {MIXTAPES.map(tape => (
            <div key={tape.id} className="mixtape-card">
              <div className="mixtape-cover-wrap">
                <img src={tape.cover} alt={tape.title} className="mixtape-img" loading="lazy" />
                <span className="badge-id mixtape-badge">{tape.station}</span>
              </div>
              <div className="mixtape-body">
                <h4 className="mixtape-name font-headline">{tape.title}</h4>
                <div className="mixtape-tags font-mono">
                  {tape.tags.map(t => (
                    <span key={t} className="mixtape-tag-chip">#{t}</span>
                  ))}
                </div>
                <div className="mixtape-meta font-mono">
                  <span>{tape.trackCount} TRACKS</span>
                  <span>&bull;</span>
                  <span>{tape.duration}</span>
                </div>
                <div style={{ marginTop: '0.85rem', display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="btn-station-tune"
                    onClick={() => {
                      const st = STATIONS.find(s => s.playlistId === tape.playlistId);
                      if (st) setStation(st.id);
                    }}
                    style={{ flexGrow: 1 }}
                  >
                    PLAY ON RADIO
                  </button>
                  <a 
                    href={tape.playlistUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="badge-id"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none' }}
                    title="Open on YouTube"
                  >
                    ↗ YT
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
