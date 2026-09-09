/**
 * SoundSynth.js - Procedural Web Audio API Sound Effects Synthesizer
 * 100% self-contained: zero external audio files, zero copyright risks, instant playback.
 */
window.NeonRumble = window.NeonRumble || {};

(function() {
  class SoundSynthesizer {
    constructor() {
      this.ctx = null;
      this.masterGain = null;
      this.sfxGain = null;
      this.initialized = false;
      this.storage = window.NeonRumble.Storage;
    }

    init() {
      if (this.initialized) return;
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        this.sfxGain = this.ctx.createGain();
        const vol = this.storage ? this.storage.settings.sfxVolume : 0.8;
        this.sfxGain.gain.setValueAtTime(vol, this.ctx.currentTime);
        this.sfxGain.connect(this.masterGain);

        this.initialized = true;
      } catch (e) {
        console.warn('Web Audio API not supported or blocked:', e);
      }
    }

    resume() {
      if (!this.ctx) this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    setVolume(volume) {
      if (this.sfxGain && this.ctx) {
        this.sfxGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime);
      }
    }

    // --- PROCEDURAL SOUND GENERATORS ---

    createNoiseBuffer(duration = 0.5) {
      if (!this.ctx) return null;
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      return buffer;
    }

    playWhoosh(isHeavy = false) {
      this.resume();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(0.3);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.setValueAtTime(3.0, now);

      const gain = this.ctx.createGain();

      if (isHeavy) {
        filter.frequency.setValueAtTime(250, now);
        filter.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
        filter.frequency.exponentialRampToValueAtTime(150, now + 0.28);
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.8, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      } else {
        filter.frequency.setValueAtTime(600, now);
        filter.frequency.exponentialRampToValueAtTime(2200, now + 0.06);
        filter.frequency.exponentialRampToValueAtTime(400, now + 0.16);
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.5, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      }

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      noise.start(now);
      noise.stop(now + 0.3);
    }

    playLightHit() {
      this.resume();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Punch transient click
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.08);

      oscGain.gain.setValueAtTime(0.7, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(oscGain);
      oscGain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.1);

      // Slap noise
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(0.12);
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1200, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.5, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.sfxGain);
      noise.start(now);
      noise.stop(now + 0.12);
    }

    playHeavyHit() {
      this.resume();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Heavy sub thump
      const sub = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(220, now);
      sub.frequency.exponentialRampToValueAtTime(35, now + 0.22);

      subGain.gain.setValueAtTime(0.9, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

      sub.connect(subGain);
      subGain.connect(this.sfxGain);
      sub.start(now);
      sub.stop(now + 0.25);

      // Distortion crunch
      const dist = this.ctx.createOscillator();
      const distGain = this.ctx.createGain();
      dist.type = 'sawtooth';
      dist.frequency.setValueAtTime(140, now);
      dist.frequency.exponentialRampToValueAtTime(40, now + 0.14);

      distGain.gain.setValueAtTime(0.6, now);
      distGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      dist.connect(distGain);
      distGain.connect(this.sfxGain);
      dist.start(now);
      dist.stop(now + 0.16);

      // Impact noise explosion
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(0.25);
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3000, now);
      filter.frequency.exponentialRampToValueAtTime(400, now + 0.22);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.8, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.sfxGain);
      noise.start(now);
      noise.stop(now + 0.25);
    }

    playBlock() {
      this.resume();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // FM Metallic Clang
      const carrier = this.ctx.createOscillator();
      const modulator = this.ctx.createOscillator();
      const modGain = this.ctx.createGain();
      const outGain = this.ctx.createGain();

      carrier.type = 'sine';
      carrier.frequency.setValueAtTime(620, now);
      carrier.frequency.exponentialRampToValueAtTime(320, now + 0.18);

      modulator.type = 'square';
      modulator.frequency.setValueAtTime(1420, now);
      modGain.gain.setValueAtTime(1200, now);
      modGain.gain.exponentialRampToValueAtTime(10, now + 0.16);

      outGain.gain.setValueAtTime(0.7, now);
      outGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      modulator.connect(modGain);
      modGain.connect(carrier.frequency);
      carrier.connect(outGain);
      outGain.connect(this.sfxGain);

      carrier.start(now);
      modulator.start(now);
      carrier.stop(now + 0.2);
      modulator.stop(now + 0.2);
    }

    playJump() {
      this.resume();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.12);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.15);
    }

    playLand() {
      this.resume();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.09);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.1);
    }

    playDash() {
      this.resume();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(0.18);
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.frequency.exponentialRampToValueAtTime(300, now + 0.16);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);
      noise.start(now);
      noise.stop(now + 0.18);
    }

    playSpecial(fighterName) {
      this.resume();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      if (fighterName === 'Ardra') {
        // Astral Blade Gale: high shimmer + razor slice
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(660, now + 0.35);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.42);

        // Electric shimmer
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer(0.35);
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(3000, now);
        const nGain = this.ctx.createGain();
        nGain.gain.setValueAtTime(0.5, now);
        nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        noise.connect(filter);
        filter.connect(nGain);
        nGain.connect(this.sfxGain);
        noise.start(now);
        noise.stop(now + 0.35);
      } else if (fighterName === 'Rex') {
        // Mach Shockwave: ground blast boom + crack
        const sub = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        sub.type = 'square';
        sub.frequency.setValueAtTime(180, now);
        sub.frequency.exponentialRampToValueAtTime(35, now + 0.4);
        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        sub.connect(gain);
        gain.connect(this.sfxGain);
        sub.start(now);
        sub.stop(now + 0.45);
      } else if (fighterName === 'Volt') {
        // Plasma Arc: electric zap
        const osc = this.ctx.createOscillator();
        const mod = this.ctx.createOscillator();
        const modGain = this.ctx.createGain();
        const outGain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.linearRampToValueAtTime(200, now + 0.3);

        mod.type = 'sine';
        mod.frequency.setValueAtTime(60, now);
        modGain.gain.setValueAtTime(400, now);

        outGain.gain.setValueAtTime(0.6, now);
        outGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        mod.connect(modGain);
        modGain.connect(osc.frequency);
        osc.connect(outGain);
        outGain.connect(this.sfxGain);

        osc.start(now);
        mod.start(now);
        osc.stop(now + 0.35);
        mod.stop(now + 0.35);
      } else {
        // Titan: Seismic earthquake crush
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.exponentialRampToValueAtTime(25, now + 0.5);
        gain.gain.setValueAtTime(0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.55);
      }
    }

    playSuperStartup() {
      this.resume();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Dramatic cinematic chime & time-freeze flash
      const chime = this.ctx.createOscillator();
      const chimeGain = this.ctx.createGain();
      chime.type = 'sine';
      chime.frequency.setValueAtTime(880, now);
      chime.frequency.setValueAtTime(1760, now + 0.08);

      chimeGain.gain.setValueAtTime(0.6, now);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      chime.connect(chimeGain);
      chimeGain.connect(this.sfxGain);
      chime.start(now);
      chime.stop(now + 0.6);

      // Deep dive bass drop
      const bass = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bass.type = 'sawtooth';
      bass.frequency.setValueAtTime(300, now);
      bass.frequency.exponentialRampToValueAtTime(40, now + 0.5);

      bassGain.gain.setValueAtTime(0.7, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      bass.connect(bassGain);
      bassGain.connect(this.sfxGain);
      bass.start(now);
      bass.stop(now + 0.6);
    }

    playSuperHit() {
      this.resume();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Colossal layered explosion
      for (let i = 0; i < 3; i++) {
        const delay = i * 0.07;
        const sub = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        sub.type = i === 1 ? 'sawtooth' : 'sine';
        sub.frequency.setValueAtTime(180 - i * 30, now + delay);
        sub.frequency.exponentialRampToValueAtTime(30, now + delay + 0.35);

        gain.gain.setValueAtTime(0.8, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.4);

        sub.connect(gain);
        gain.connect(this.sfxGain);
        sub.start(now + delay);
        sub.stop(now + delay + 0.45);
      }
    }

    playKO() {
      this.resume();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // K.O. Impact: Deep seismic boom
      const boom = this.ctx.createOscillator();
      const boomGain = this.ctx.createGain();
      boom.type = 'triangle';
      boom.frequency.setValueAtTime(150, now);
      boom.frequency.exponentialRampToValueAtTime(20, now + 1.2);

      boomGain.gain.setValueAtTime(1.0, now);
      boomGain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);

      boom.connect(boomGain);
      boomGain.connect(this.sfxGain);
      boom.start(now);
      boom.stop(now + 1.3);

      // Cymbal crash / reverberating noise
      const crash = this.ctx.createBufferSource();
      crash.buffer = this.createNoiseBuffer(1.0);
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(2000, now);
      filter.frequency.exponentialRampToValueAtTime(500, now + 0.9);

      const crashGain = this.ctx.createGain();
      crashGain.gain.setValueAtTime(0.7, now);
      crashGain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);

      crash.connect(filter);
      filter.connect(crashGain);
      crashGain.connect(this.sfxGain);
      crash.start(now);
      crash.stop(now + 1.0);
    }

    playRoundBell() {
      this.resume();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Classic boxing ring / arcade bell
      const bellFreqs = [800, 1180, 1600];
      bellFreqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.35 / (idx + 1), now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.85);
      });
    }

    playAnnouncer(phrase) {
      this.resume();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Synthesized retro vocal cues using tuned FM harmonics
      if (phrase === 'ROUND_1') {
        this.playVocoderChord([220, 330, 440], 0.25, now);
        this.playVocoderChord([277, 415, 554], 0.35, now + 0.28);
      } else if (phrase === 'ROUND_2') {
        this.playVocoderChord([220, 330, 440], 0.25, now);
        this.playVocoderChord([330, 495, 660], 0.35, now + 0.28);
      } else if (phrase === 'FINAL_ROUND') {
        this.playVocoderChord([165, 247, 330], 0.25, now);
        this.playVocoderChord([220, 330, 440], 0.4, now + 0.28);
      } else if (phrase === 'FIGHT') {
        // High energetic rising fanfare
        this.playVocoderChord([330, 495, 660], 0.15, now);
        this.playVocoderChord([440, 660, 880], 0.45, now + 0.15);
      } else if (phrase === 'KO') {
        this.playVocoderChord([440, 554, 660], 0.2, now);
        this.playVocoderChord([220, 277, 330], 0.6, now + 0.22);
      } else if (phrase === 'WINNER') {
        this.playVocoderChord([293, 440, 587], 0.2, now);
        this.playVocoderChord([370, 554, 740], 0.2, now + 0.22);
        this.playVocoderChord([440, 660, 880], 0.5, now + 0.44);
      }
    }

    playVocoderChord(freqs, duration, startTime) {
      freqs.forEach(freq => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, startTime);

        // Vocal formant bandpass filter
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(freq * 1.5, startTime);
        filter.Q.setValueAtTime(4.0, startTime);

        gain.gain.setValueAtTime(0.18, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(startTime);
        osc.stop(startTime + duration + 0.05);
      });
    }

    playUI(action) {
      this.resume();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      if (action === 'move') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(660, now + 0.04);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (action === 'select') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523, now);
        osc.frequency.setValueAtTime(784, now + 0.08);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.24);
      } else if (action === 'ready') {
        // High double chime
        [587, 880].forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);
          gain.gain.setValueAtTime(0.3, now + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.25);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.28);
        });
      } else if (action === 'special_ready') {
        // Ascending electric crystal chime for Special Attack power-up
        [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + i * 0.045);
          gain.gain.setValueAtTime(0.22, now + i * 0.045);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.045 + 0.28);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(now + i * 0.045);
          osc.stop(now + i * 0.045 + 0.3);
        });
      } else if (action === 'super_ready') {
        // Power-up chord
        [440, 554, 659, 880].forEach((f, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now + i * 0.04);
          gain.gain.setValueAtTime(0.2, now + i * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.3);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(now + i * 0.04);
          osc.stop(now + i * 0.04 + 0.35);
        });
      }
    }
  }

  window.NeonRumble.SoundSynth = new SoundSynthesizer();
})();
