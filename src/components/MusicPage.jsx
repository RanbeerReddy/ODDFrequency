import React, { useState, useEffect, useMemo } from 'react';
import { 
  DEFAULT_TRACKS, 
  GENRES, 
  normalizeTracks, 
  getYouTubeThumbnail, 
  fetchYouTubeMetadata,
  playTrack,
  playGenre,
  MIXTAPES,
  catalog 
} from '../data/musicTracks.js';
import { audioPlayerService } from '../utils/audioEngine.js';

export default function MusicPage() {
  const [activeGenre, setActiveGenre] = useState('all');
  const [liveMetadata, setLiveMetadata] = useState({});
  const [isSynthPlaying, setIsSynthPlaying] = useState(false);
  const [catalogState, setCatalogState] = useState(() => catalog.getState());

  useEffect(() => {
    const unsub = catalog.subscribe(setCatalogState);
    catalog.load();
    return unsub;
  }, []);

  // Normalize tracks from live catalog or default fallback
  const tracks = useMemo(() => {
    const sourceTracks = catalogState.tracks?.length > 0 ? catalogState.tracks : DEFAULT_TRACKS;
    return normalizeTracks(sourceTracks);
  }, [catalogState.tracks]);

  const displayGenres = useMemo(() => {
    return catalogState.genres?.length > 0 ? catalogState.genres : GENRES;
  }, [catalogState.genres]);

  const displayMixtapes = useMemo(() => {
    return catalogState.mixtapes?.length > 0 ? catalogState.mixtapes : MIXTAPES;
  }, [catalogState.mixtapes]);

  // Filtered tracks
  const filteredTracks = useMemo(() => {
    if (activeGenre === 'all') return tracks;
    return tracks.filter(t => t.genre === activeGenre || (activeGenre === 'custom' && t.type === 'playlist') || t.stationId === activeGenre);
  }, [tracks, activeGenre]);

  // Dynamically fetch metadata for autoFetch tracks (e.g. YouTube playlist or URL-only items)
  useEffect(() => {
    tracks.forEach(track => {
      if (track.autoFetch && !liveMetadata[track.id]) {
        fetchYouTubeMetadata(track.url || track.youtubeId, track.type).then(meta => {
          if (meta) {
            setLiveMetadata(prev => ({
              ...prev,
              [track.id]: {
                ...prev[track.id],
                title: meta.title || prev[track.id]?.title,
                artist: meta.artist || prev[track.id]?.artist,
                thumbnail: meta.thumbnail || prev[track.id]?.thumbnail,
                duration: meta.duration || prev[track.id]?.duration
              }
            }));
          }
        });
      }
    });
  }, [tracks, liveMetadata]);

  // Handle tuning into a track or playlist
  const handleTuneIn = (trackId) => {
    if (isSynthPlaying) {
      audioPlayerService.stop();
      setIsSynthPlaying(false);
    }
    playTrack(trackId);
  };

  // Handle procedural synth toggle
  const handleToggleSynth = () => {
    if (isSynthPlaying) {
      audioPlayerService.stop();
      setIsSynthPlaying(false);
    } else {
      audioPlayerService.start('ambient');
      setIsSynthPlaying(true);
    }
  };

  return (
    <section className="container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      {/* Page Header */}
      <div className="collection-page-header">
        <div className="collection-page-breadcrumbs">
          <span>BROADCAST</span>
          <span>/</span>
          <span style={{ color: 'var(--text-primary)' }}>SOUND SYSTEM &amp; YOUTUBE DECK</span>
        </div>

        <h1 className="collection-hero-title">
          ODD FREQUENCY SOUND SYSTEM
        </h1>

        <p className="collection-hero-desc">
          <strong>THE SONIC FREQUENCIES BEHIND OUR THREADS &mdash; </strong>
          Fashion and music are indivisible. From underground 90s nu-metal basements to Berlin four-on-the-floor warehouse house and hyper-pop rave culture. Tune into our live YouTube satellite channels, community playlist archives, or direct procedural browser drone.
        </p>
      </div>

      {/* Genre Filter Bar */}
      <div style={{ 
        display: 'flex', 
        gap: '0.6rem', 
        flexWrap: 'wrap', 
        marginBottom: '2.5rem', 
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '1.25rem'
      }}>
        {displayGenres.map(genre => (
          <button
            key={genre.id}
            onClick={() => setActiveGenre(genre.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 1rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              background: activeGenre === genre.id ? 'var(--accent-purple)' : 'var(--card-bg)',
              color: activeGenre === genre.id ? '#ffffff' : 'var(--text-secondary)',
              border: `1px solid ${activeGenre === genre.id ? 'var(--accent-purple)' : 'var(--border-color)'}`,
              borderRadius: '2px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <span>{genre.icon}</span>
            <span>{genre.label}</span>
          </button>
        ))}
      </div>

      {/* Featured Stations & Tracks Grid */}
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
            ACTIVE SATELLITE CHANNELS &amp; TRACKS ({filteredTracks.length})
          </h2>
          <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--accent-purple)' }}>
            [ LIVE YOUTUBE INTEGRATION ]
          </span>
        </div>

        <div className="music-stations-grid">
          {filteredTracks.map((track, idx) => {
            const meta = liveMetadata[track.id] || {};
            const displayTitle = meta.title || track.title;
            const displayArtist = meta.artist || track.artist;
            const displayThumb = getYouTubeThumbnail(track.youtubeId, track.type, meta.thumbnail || track.thumbnail);
            const isPlaylist = track.type === 'playlist';

            return (
              <div key={track.id} className="music-station-card">
                <div>
                  {/* Track Thumbnail Header */}
                  <div style={{ 
                    position: 'relative', 
                    aspectRatio: '16/9', 
                    overflow: 'hidden', 
                    borderRadius: '2px', 
                    marginBottom: '1rem',
                    background: '#0a0a0a',
                    border: '1px solid var(--border-color)'
                  }}>
                    <img 
                      src={displayThumb} 
                      alt={displayTitle}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                    <span 
                      className="font-mono"
                      style={{
                        position: 'absolute',
                        top: '0.5rem',
                        left: '0.5rem',
                        fontSize: '0.65rem',
                        background: 'rgba(0,0,0,0.85)',
                        color: isPlaylist ? 'var(--accent-lime)' : 'var(--accent-purple)',
                        border: `1px solid ${isPlaylist ? 'var(--accent-lime)' : 'var(--accent-purple)'}`,
                        padding: '0.15rem 0.4rem',
                        fontWeight: 700
                      }}
                    >
                      {isPlaylist ? '⚡ YOUTUBE PLAYLIST' : `CHANNEL [0${idx + 1}]`}
                    </span>
                    <span 
                      className="font-mono"
                      style={{
                        position: 'absolute',
                        bottom: '0.5rem',
                        right: '0.5rem',
                        fontSize: '0.65rem',
                        background: 'rgba(0,0,0,0.85)',
                        color: '#ffffff',
                        padding: '0.15rem 0.35rem'
                      }}
                    >
                      {meta.duration || track.duration || (isPlaylist ? 'PLAYLIST' : 'YOUTUBE')}
                    </span>
                  </div>

                  <div className="station-card-top">
                    <div className="station-freq-badge font-mono">
                      {track.genre.toUpperCase()} // FREQ
                    </div>
                    <span className="station-bpm-badge font-mono">
                      {isPlaylist ? 'PLAYLIST SYNC' : (track.duration ? `${track.duration} EST` : 'DIRECT FEED')}
                    </span>
                  </div>

                  <h3 className="station-card-title" style={{ fontSize: '1.15rem', lineHeight: '1.3' }}>
                    {displayTitle}
                  </h3>
                  
                  <div className="station-card-genre">
                    {displayArtist}
                  </div>

                  {track.note && (
                    <p className="station-card-desc" style={{ fontSize: '0.8rem', marginBottom: '1rem' }}>
                      {track.note}
                    </p>
                  )}
                </div>

                <div className="station-card-footer" style={{ marginTop: '1rem' }}>
                  <button 
                    className="btn-station-tune"
                    onClick={() => handleTuneIn(track.id)}
                    aria-label={`Tune into ${displayTitle}`}
                    style={{ cursor: 'pointer' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    <span>{isPlaylist ? 'STREAM PLAYLIST' : 'TUNE IN RADIO'}</span>
                  </button>
                  <span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                    {track.type.toUpperCase()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cassette Mixtape Vault */}
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
            OFFICIAL CASSETTE VAULT &amp; MIXTAPES
          </h2>
          <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            LIMITED ARCHIVE RELEASES
          </span>
        </div>

        <div className="mixtapes-grid">
          {displayMixtapes.map(tape => (
            <div key={tape.id} className="mixtape-card">
              <div className="mixtape-cover-wrap">
                <img src={tape.cover} alt={tape.title} loading="lazy" />
                <span className="mixtape-runtime-badge font-mono">
                  {tape.runtime}
                </span>
              </div>

              <div className="mixtape-info">
                <span className="badge-id" style={{ color: 'var(--accent-purple)', borderColor: 'var(--accent-purple)' }}>
                  {tape.id} // TAPE
                </span>
                <h3 className="mixtape-title" style={{ marginTop: '0.5rem', marginBottom: '0.2rem' }}>
                  {tape.title}
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>
                  Curated by {tape.curator}
                </div>

                <div className="mixtape-tracklist" style={{ marginBottom: '1rem' }}>
                  <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: '0.4rem' }}>
                    // TRACKLIST:
                  </div>
                  <ul>
                    {tape.tracks.map((trk, i) => (
                      <li key={i}>{trk}</li>
                    ))}
                  </ul>
                </div>

                <button 
                  className="btn-station-tune"
                  onClick={() => {
                    if (tape.playlistId) {
                      handleTuneIn(`playlist-${tape.playlistId}`);
                    } else {
                      playGenre(tape.id === 'TAPE-02' ? 'void' : 'feed');
                    }
                  }}
                  style={{ width: '100%', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  <span>PLAY CASSETTE TAPE</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Procedural Web Audio API Tape Drone Synthesis Mode */}
      <div style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        padding: '2rem',
        borderRadius: '2px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div style={{ maxWidth: '650px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem' }}>📼</span>
            <h3 className="font-headline" style={{ fontSize: '1.2rem', margin: 0 }}>
              SUBTERRANEAN ANALOG TAPE DRONE // 432Hz
            </h3>
            <span className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--accent-lime)', border: '1px solid var(--accent-lime)', padding: '0.1rem 0.35rem' }}>
              ZERO NETWORK / WEB AUDIO API
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
            Real-time synthesized harmonic drone generated directly inside your browser's audio buffer. Deep sinus sub-bass, warm tape saturation flutter, and hypnotic meditation frequencies.
          </p>
        </div>

        <button
          onClick={handleToggleSynth}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            fontWeight: 700,
            padding: '0.75rem 1.4rem',
            background: isSynthPlaying ? 'var(--accent-lime)' : 'transparent',
            color: isSynthPlaying ? '#000000' : 'var(--text-primary)',
            border: `1px solid ${isSynthPlaying ? 'var(--accent-lime)' : 'var(--border-color)'}`,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          {isSynthPlaying ? '■ STOP TAPE SYNTHESIS' : '▶ ACTIVATE BROWSER TAPE DRONE'}
        </button>
      </div>
    </section>
  );
}
