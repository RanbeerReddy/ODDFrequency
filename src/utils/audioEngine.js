/**
 * Odd Frequency - Ambient & Radio Multi-Channel Audio Engine
 * 
 * Generates interactive subterranean synthesized audio in the browser via Web Audio API.
 * 100% royalty-free, permission-safe, zero external network requests required.
 * Supports multiple stations: House, Electro, Grunge, Metal, Lo-Fi Drone.
 */

class AmbientAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.masterGain = null;
    this.volume = 0.55;
    this.isMuted = false;
    this.currentStationId = 'house';
    this.loopTimer = null;
    this.activeNodes = [];
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

  setStation(stationId) {
    this.currentStationId = stationId;
    if (this.isPlaying) {
      this.stop();
      this.start(stationId);
    }
  }

  start(stationId = this.currentStationId) {
    this.currentStationId = stationId;
    this.initContext();
    if (!this.ctx) return;
    this.stopActiveRhythms();

    this.isPlaying = true;

    if (stationId === 'house') {
      this.startHouseBeat();
    } else if (stationId === 'brat') {
      this.startElectroBeat();
    } else if (stationId === 'grunge') {
      this.startGrungeDrone();
    } else if (stationId === 'metal') {
      this.startMetalWave();
    } else {
      this.startAmbientDrone();
    }
  }

  // Station 1: House (124 BPM 4-on-the-floor kick + chord stab)
  startHouseBeat() {
    const bpm = 124;
    const beatInterval = 60 / bpm; // ~0.484 seconds
    let step = 0;

    const tick = () => {
      if (!this.isPlaying || this.currentStationId !== 'house') return;
      const t = this.ctx.currentTime;

      // 4/4 Kick drum
      this.playKick(t);

      // Offbeat hi-hat on every odd half-beat
      setTimeout(() => {
        if (!this.isPlaying || this.currentStationId !== 'house') return;
        this.playHiHat(this.ctx.currentTime);
      }, (beatInterval * 500));

      // Deep minor house chord stab on bar start & step 2
      if (step % 4 === 0 || step % 4 === 2) {
        this.playChord(t, [130.81, 155.56, 196.00], 0.22); // C minor
      }

      step++;
      this.loopTimer = setTimeout(tick, beatInterval * 1000);
    };

    tick();
  }

  // Station 2: Brat Summer Club / Electro (130 BPM pumping bass)
  startElectroBeat() {
    const bpm = 130;
    const beatInterval = 60 / bpm;
    let step = 0;

    const tick = () => {
      if (!this.isPlaying || this.currentStationId !== 'brat') return;
      const t = this.ctx.currentTime;

      this.playKick(t, 110, 0.28);

      // Pumping electro bass notes
      const bassNotes = [55, 55, 65.4, 73.4, 55, 82.4, 73.4, 65.4];
      const note = bassNotes[step % bassNotes.length];
      this.playBassSynth(t, note, beatInterval * 0.7);

      this.playHiHat(t + (beatInterval * 0.5));

      step++;
      this.loopTimer = setTimeout(tick, beatInterval * 1000);
    };

    tick();
  }

  // Station 3: Grunge / Alt-Rock Drone (Seattle tape saturation)
  startGrungeDrone() {
    const now = this.ctx.currentTime;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(650, now);
    filter.Q.setValueAtTime(4.0, now);
    filter.connect(this.masterGain);

    // Grunge Drop-D minor chord (D2, A2, D3, F3)
    const notes = [73.42, 110.0, 146.83, 174.61];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq + (Math.sin(idx) * 0.6), now);

      oscGain.gain.setValueAtTime(0.001, now);
      oscGain.gain.exponentialRampToValueAtTime(0.08, now + 1.5);

      osc.connect(oscGain);
      oscGain.connect(filter);
      osc.start();
      this.activeNodes.push({ osc, gain: oscGain });
    });
  }

  // Station 4: Nu-Metal Industrial Wave
  startMetalWave() {
    const bpm = 135;
    const interval = 60 / bpm;
    let step = 0;

    const tick = () => {
      if (!this.isPlaying || this.currentStationId !== 'metal') return;
      const t = this.ctx.currentTime;

      // Heavy industrial double punch
      this.playKick(t, 90, 0.35);
      if (step % 2 === 1) {
        this.playKick(t + 0.12, 100, 0.25);
      }

      // Distorted industrial metallic strike
      this.playMetalClang(t + (interval * 0.5));

      step++;
      this.loopTimer = setTimeout(tick, interval * 1000);
    };

    tick();
  }

  // Station 5: Ambient Lo-Fi Drone
  startAmbientDrone() {
    const now = this.ctx.currentTime;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);
    filter.Q.setValueAtTime(2.5, now);
    filter.connect(this.masterGain);

    const notes = [110.0, 130.81, 164.81, 220.0];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq + (Math.sin(idx) * 0.4), now);

      const baseGain = idx === 0 ? 0.22 : 0.08;
      oscGain.gain.setValueAtTime(0.001, now);
      oscGain.gain.exponentialRampToValueAtTime(baseGain, now + 1.2);

      osc.connect(oscGain);
      oscGain.connect(filter);
      osc.start();
      this.activeNodes.push({ osc, gain: oscGain });
    });
  }

  // Sound generator helpers
  playKick(time, startFreq = 140, duration = 0.28) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(42, time + duration);

    gain.gain.setValueAtTime(0.65, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  playHiHat(time) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 0.04;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7500;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(time);
  }

  playChord(time, freqs, duration = 0.3) {
    if (!this.ctx) return;
    freqs.forEach(freq => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.value = freq;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, time);
      filter.frequency.exponentialRampToValueAtTime(300, time + duration);

      gain.gain.setValueAtTime(0.14, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(time);
      osc.stop(time + duration);
    });
  }

  playBassSynth(time, freq, duration) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, time);
    filter.frequency.exponentialRampToValueAtTime(200, time + duration);

    gain.gain.setValueAtTime(0.24, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  playMetalClang(time) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(380, time);

    gain.gain.setValueAtTime(0.15, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.15);
  }

  stopActiveRhythms() {
    if (this.loopTimer) {
      clearTimeout(this.loopTimer);
      this.loopTimer = null;
    }
    if (this.activeNodes.length) {
      const now = this.ctx ? this.ctx.currentTime : 0;
      this.activeNodes.forEach(({ osc, gain }) => {
        try {
          gain.gain.setValueAtTime(gain.gain.value, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
          setTimeout(() => {
            try { osc.stop(); osc.disconnect(); } catch { /* noop */ }
          }, 350);
        } catch { /* noop */ }
      });
      this.activeNodes = [];
    }
  }

  stop() {
    this.stopActiveRhythms();
    this.isPlaying = false;
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
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
