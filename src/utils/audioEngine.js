/**
 * Odd Frequency - Ambient Audio Engine
 * 
 * Generates an underground lo-fi ambient tape-loop soundscape using the Web Audio API.
 * 100% royalty-free, permission-safe, zero external network requests required.
 * Also supports switching to an external audio URL (e.g. user-provided MP3).
 */

class AmbientAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.masterGain = null;
    this.volume = 0.6;
    this.isMuted = false;
    this.oscillators = [];
    this.filter = null;
    this.lfo = null;
    this.customAudio = null;
    this.customAudioUrl = null; // Can be set to a custom MP3 URL by user
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  start() {
    if (this.isPlaying) return;
    this.initContext();
    if (!this.ctx) return;

    if (this.customAudioUrl) {
      if (!this.customAudio) {
        this.customAudio = new Audio(this.customAudioUrl);
        this.customAudio.loop = true;
      }
      this.customAudio.volume = this.isMuted ? 0 : this.volume;
      this.customAudio.play().catch(() => {});
      this.isPlaying = true;
      return;
    }

    // Build synthesized lo-fi subterranean drone
    const now = this.ctx.currentTime;
    this.oscillators = [];

    // Filter to give warm, tape-saturated dark character
    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.setValueAtTime(420, now);
    this.filter.Q.setValueAtTime(3.2, now);
    this.filter.connect(this.masterGain);

    // Minor triad drone frequencies (A2, C3, E3, A3 sub-harmonics)
    const notes = [110.0, 130.81, 164.81, 220.0];

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      osc.type = idx === 0 ? 'sine' : 'triangle';
      // Slight detune for analog warmth
      osc.frequency.setValueAtTime(freq + (Math.sin(idx) * 0.8), now);

      // Low gain so mix is subtle and relaxing
      const baseGain = idx === 0 ? 0.22 : 0.08;
      oscGain.gain.setValueAtTime(0.001, now);
      oscGain.gain.exponentialRampToValueAtTime(baseGain, now + 1.2);

      osc.connect(oscGain);
      oscGain.connect(this.filter);
      osc.start();
      this.oscillators.push({ osc, gain: oscGain });
    });

    // LFO subtle filter sweep
    this.lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    this.lfo.frequency.setValueAtTime(0.12, now); // Very slow breathing wave
    lfoGain.gain.setValueAtTime(140, now);
    this.lfo.connect(lfoGain);
    lfoGain.connect(this.filter.frequency);
    this.lfo.start();

    this.isPlaying = true;
  }

  stop() {
    if (!this.isPlaying) return;

    if (this.customAudio) {
      this.customAudio.pause();
      this.isPlaying = false;
      return;
    }

    if (this.ctx && this.oscillators.length) {
      const now = this.ctx.currentTime;
      this.oscillators.forEach(({ osc, gain }) => {
        try {
          gain.gain.setValueAtTime(gain.gain.value, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
          setTimeout(() => {
            try { osc.stop(); osc.disconnect(); } catch (e) {}
          }, 600);
        } catch (e) {}
      });
      this.oscillators = [];
    }

    if (this.lfo) {
      try {
        this.lfo.stop();
        this.lfo.disconnect();
      } catch (e) {}
      this.lfo = null;
    }

    this.isPlaying = false;
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.customAudio) {
      this.customAudio.volume = this.isMuted ? 0 : this.volume;
    }
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, now);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.setVolume(this.volume);
    return this.isMuted;
  }
}

export const audioPlayerService = new AmbientAudioEngine();
