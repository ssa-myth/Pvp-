/**
 * MusicSynth.js - Procedural 16-Bit Arcade Chiptune & Synthwave Sequencer
 * Uses Web Audio API to create authentic multi-channel synthesized retro soundtracks.
 */
window.NeonRumble = window.NeonRumble || {};

(function() {
  class MusicSequencer {
    constructor() {
      this.ctx = null;
      this.musicGain = null;
      this.currentTrack = null;
      this.isPlaying = false;
      this.timerId = null;
      this.step = 0;
      this.bpm = 125;
      this.tempo = 125;
      this.storage = window.NeonRumble.Storage;
      this.tracks = this.defineTracks();
    }

    init() {
      if (this.ctx) return;
      try {
        const soundSynth = window.NeonRumble.SoundSynth;
        if (soundSynth && soundSynth.ctx) {
          this.ctx = soundSynth.ctx;
        } else {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          this.ctx = new AudioContext();
        }

        this.musicGain = this.ctx.createGain();
        const vol = this.storage ? this.storage.settings.musicVolume : 0.65;
        this.musicGain.gain.setValueAtTime(vol, this.ctx.currentTime);
        this.musicGain.connect(this.ctx.destination);
      } catch (e) {
        console.warn('MusicSynth audio init failed:', e);
      }
    }

    setVolume(volume) {
      if (this.musicGain && this.ctx) {
        this.musicGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime);
      }
    }

    // Note to Frequency helper
    mtof(note) {
      if (!note || note === '---' || note === '...') return 0;
      const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      const octave = parseInt(note.slice(-1));
      const key = note.slice(0, -1);
      const semitone = notes.indexOf(key);
      if (semitone === -1) return 0;
      return 440 * Math.pow(2, (octave - 4) + (semitone - 9) / 12);
    }

    defineTracks() {
      return {
        MENU: {
          bpm: 122,
          lead: [
            'E4', '---', 'G4', '---', 'A4', '---', 'B4', '---',
            'D5', '---', 'B4', '---', 'A4', 'G4', 'E4', '---',
            'C4', '---', 'E4', '---', 'G4', '---', 'A4', '---',
            'B4', '---', 'A4', 'G4', 'E4', 'D4', 'E4', '---'
          ],
          bass: [
            'E2', 'E2', 'E3', 'E2', 'G2', 'G2', 'G3', 'G2',
            'A2', 'A2', 'A3', 'A2', 'B2', 'B2', 'D3', 'B2',
            'C2', 'C2', 'C3', 'C2', 'E2', 'E2', 'E3', 'E2',
            'D2', 'D2', 'D3', 'D2', 'B2', 'B2', 'A2', 'G2'
          ],
          arp: [
            'E3', 'G3', 'B3', 'E4', 'G3', 'B3', 'E4', 'G4',
            'A3', 'C4', 'E4', 'A4', 'B3', 'D4', 'F#4', 'B4',
            'C3', 'E3', 'G3', 'C4', 'E3', 'G3', 'C4', 'E4',
            'D3', 'F#3', 'A3', 'D4', 'B2', 'D3', 'G3', 'B3'
          ],
          drums: [
            'K', 'H', 'S', 'H', 'K', 'K', 'S', 'H',
            'K', 'H', 'S', 'H', 'K', 'H', 'S', 'O',
            'K', 'H', 'S', 'H', 'K', 'K', 'S', 'H',
            'K', 'H', 'S', 'H', 'K', 'S', 'S', 'O'
          ]
        },
        CHAR_SELECT: {
          bpm: 130,
          lead: [
            'A4', 'C5', 'D5', 'E5', '---', 'D5', 'C5', 'A4',
            'G4', 'A4', 'C5', 'D5', '---', 'C5', 'A4', 'G4',
            'F4', 'A4', 'C5', 'D5', '---', 'C5', 'D5', 'F5',
            'E5', '---', 'D5', '---', 'C5', 'B4', 'A4', '---'
          ],
          bass: [
            'A2', 'A2', 'A2', 'A3', 'G2', 'G2', 'G2', 'G3',
            'F2', 'F2', 'F2', 'F3', 'E2', 'E2', 'E2', 'E3',
            'D2', 'D2', 'D2', 'D3', 'F2', 'F2', 'F2', 'F3',
            'G2', 'G2', 'G2', 'G3', 'E2', 'E2', 'G2', 'E2'
          ],
          arp: [
            'A3', 'E4', 'A4', 'C5', 'G3', 'D4', 'G4', 'B4',
            'F3', 'C4', 'F4', 'A4', 'E3', 'B3', 'E4', 'G4',
            'D3', 'A3', 'D4', 'F4', 'F3', 'C4', 'F4', 'A4',
            'G3', 'D4', 'G4', 'B4', 'E3', 'B3', 'E4', 'G#4'
          ],
          drums: [
            'K', 'H', 'S', 'H', 'K', 'H', 'S', 'H',
            'K', 'K', 'S', 'H', 'K', 'H', 'S', 'O',
            'K', 'H', 'S', 'H', 'K', 'H', 'S', 'H',
            'K', 'H', 'S', 'K', 'S', 'S', 'O', 'O'
          ]
        },
        STAGE_1: { // Neon Alley: Cyberpunk Aggressive
          bpm: 138,
          lead: [
            'D4', '---', 'F4', '---', 'G4', 'G#4', 'A4', '---',
            'C5', '---', 'A4', '---', 'G4', 'F4', 'D4', '---',
            'F4', '---', 'G4', '---', 'A4', 'C5', 'D5', '---',
            'F5', '---', 'D5', '---', 'C5', 'A4', 'F4', 'G4'
          ],
          bass: [
            'D2', 'D2', 'D3', 'D2', 'D2', 'D2', 'F2', 'G2',
            'D2', 'D2', 'D3', 'D2', 'C2', 'C2', 'C3', 'C2',
            'A#1', 'A#1', 'A#2', 'A#1', 'C2', 'C2', 'C3', 'C2',
            'D2', 'D2', 'D3', 'D2', 'F2', 'G2', 'G#2', 'A2'
          ],
          arp: [
            'D3', 'F3', 'A3', 'D4', 'F3', 'A3', 'D4', 'F4',
            'C3', 'E3', 'G3', 'C4', 'E3', 'G3', 'C4', 'E4',
            'A#2', 'D3', 'F3', 'A#3', 'C3', 'E3', 'G3', 'C4',
            'D3', 'F3', 'A3', 'D4', 'A3', 'C4', 'E4', 'G4'
          ],
          drums: [
            'K', 'H', 'S', 'H', 'K', 'K', 'S', 'H',
            'K', 'H', 'S', 'H', 'K', 'H', 'S', 'O',
            'K', 'H', 'S', 'H', 'K', 'K', 'S', 'H',
            'K', 'H', 'S', 'H', 'K', 'S', 'K', 'S'
          ]
        },
        STAGE_2: { // Abandoned Arcade: 16-Bit Funky FM
          bpm: 132,
          lead: [
            'E4', 'G4', 'A4', 'A#4', 'B4', '---', 'G4', 'E4',
            'D4', 'E4', '---', 'G4', 'A4', '---', 'B4', 'D5',
            'E5', '---', 'D5', 'B4', 'A4', 'G4', 'E4', '---',
            'G4', 'A4', 'B4', 'D5', 'B4', 'A4', 'G4', 'D4'
          ],
          bass: [
            'E2', '---', 'E2', 'G2', '---', 'A2', '---', 'A#2',
            'B2', '---', 'B2', 'D3', '---', 'E3', '---', 'D3',
            'C2', '---', 'C2', 'E2', '---', 'G2', '---', 'A2',
            'B2', '---', 'B2', 'D3', '---', 'B2', 'A2', 'G2'
          ],
          arp: [
            'E3', 'B3', 'E4', 'G4', 'E3', 'B3', 'E4', 'G4',
            'B2', 'F#3', 'B3', 'D#4', 'B2', 'F#3', 'B3', 'D#4',
            'C3', 'G3', 'C4', 'E4', 'C3', 'G3', 'C4', 'E4',
            'D3', 'A3', 'D4', 'F#4', 'B2', 'F#3', 'B3', 'D#4'
          ],
          drums: [
            'K', 'H', 'S', 'H', 'K', 'H', 'S', 'H',
            'K', 'K', 'S', 'H', 'K', 'H', 'S', 'O',
            'K', 'H', 'S', 'H', 'K', 'H', 'S', 'H',
            'K', 'H', 'S', 'S', 'K', 'S', 'H', 'O'
          ]
        },
        STAGE_3: { // Skyline Rooftop: Dramatic Climax Battle
          bpm: 144,
          lead: [
            'F#4', '---', 'A4', '---', 'B4', '---', 'C#5', '---',
            'D5', '---', 'C#5', '---', 'B4', 'A4', 'F#4', '---',
            'G4', '---', 'B4', '---', 'D5', '---', 'E5', '---',
            'F#5', '---', 'E5', 'D5', 'C#5', 'B4', 'A4', 'G#4'
          ],
          bass: [
            'F#2', 'F#2', 'F#3', 'F#2', 'D2', 'D2', 'D3', 'D2',
            'B1', 'B1', 'B2', 'B1', 'C#2', 'C#2', 'C#3', 'C#2',
            'G2', 'G2', 'G3', 'G2', 'E2', 'E2', 'E3', 'E2',
            'A2', 'A2', 'A3', 'A2', 'C#2', 'C#2', 'E2', 'C#2'
          ],
          arp: [
            'F#3', 'A3', 'C#4', 'F#4', 'D3', 'F#3', 'A3', 'D4',
            'B2', 'D3', 'F#3', 'B3', 'C#3', 'E#3', 'G#3', 'C#4',
            'G3', 'B3', 'D4', 'G4', 'E3', 'G3', 'B3', 'E4',
            'A3', 'C#4', 'E4', 'A4', 'C#3', 'E#3', 'G#3', 'C#4'
          ],
          drums: [
            'K', 'H', 'S', 'H', 'K', 'K', 'S', 'H',
            'K', 'H', 'S', 'H', 'K', 'H', 'S', 'O',
            'K', 'H', 'S', 'H', 'K', 'K', 'S', 'H',
            'K', 'S', 'K', 'S', 'K', 'K', 'S', 'O'
          ]
        },
        VICTORY: {
          bpm: 135,
          lead: [
            'C4', 'E4', 'G4', 'C5', '---', 'G4', 'C5', '---',
            'D5', '---', 'E5', '---', 'D5', 'C5', 'D5', '---',
            'E5', '---', 'G5', '---', 'F5', 'E5', 'D5', 'C5',
            'C5', '---', '---', '---', '---', '---', '---', '---'
          ],
          bass: [
            'C2', 'C2', 'C3', 'C2', 'G2', 'G2', 'G3', 'G2',
            'A2', 'A2', 'A3', 'A2', 'F2', 'F2', 'F3', 'F2',
            'C2', 'C2', 'E2', 'G2', 'F2', 'A2', 'G2', 'B2',
            'C3', '---', '---', '---', '---', '---', '---', '---'
          ],
          arp: [
            'C3', 'E3', 'G3', 'C4', 'G2', 'B2', 'D3', 'G3',
            'A2', 'C3', 'E3', 'A3', 'F2', 'A2', 'C3', 'F3',
            'C3', 'E3', 'G3', 'C4', 'F2', 'A2', 'C3', 'F3',
            'C3', 'E3', 'G3', 'C4', '---', '---', '---', '---'
          ],
          drums: [
            'K', 'H', 'S', 'H', 'K', 'H', 'S', 'H',
            'K', 'H', 'S', 'H', 'K', 'H', 'S', 'O',
            'K', 'H', 'S', 'H', 'K', 'S', 'K', 'S',
            'K', '---', '---', '---', '---', '---', '---', '---'
          ]
        }
      };
    }

    playTrack(trackName) {
      this.init();
      if (!this.ctx) return;

      if (this.currentTrack === trackName && this.isPlaying) return;

      this.stop();

      const track = this.tracks[trackName];
      if (!track) return;

      this.currentTrack = trackName;
      this.isPlaying = true;
      this.step = 0;
      this.bpm = track.bpm || 128;

      const stepIntervalMs = (60 / this.bpm) * 1000 / 4; // 16th note timing

      this.timerId = setInterval(() => {
        this.tick();
      }, stepIntervalMs);
    }

    stop() {
      if (this.timerId) {
        clearInterval(this.timerId);
        this.timerId = null;
      }
      this.isPlaying = false;
    }

    tick() {
      if (!this.ctx || !this.isPlaying) return;
      const track = this.tracks[this.currentTrack];
      if (!track) return;

      const length = track.lead.length;
      const currentStep = this.step % length;
      const now = this.ctx.currentTime;
      const stepDuration = (60 / this.bpm) / 4;

      // 1. Play Lead
      const leadNote = track.lead[currentStep];
      if (leadNote && leadNote !== '---') {
        const freq = this.mtof(leadNote);
        if (freq > 0) {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.16, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 1.8);

          osc.connect(gain);
          gain.connect(this.musicGain);
          osc.start(now);
          osc.stop(now + stepDuration * 2.0);
        }
      }

      // 2. Play Bass
      const bassNote = track.bass[currentStep];
      if (bassNote && bassNote !== '---') {
        const freq = this.mtof(bassNote);
        if (freq > 0) {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.24, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 1.5);

          osc.connect(gain);
          gain.connect(this.musicGain);
          osc.start(now);
          osc.stop(now + stepDuration * 1.6);
        }
      }

      // 3. Play Arp
      const arpNote = track.arp[currentStep];
      if (arpNote && arpNote !== '---') {
        const freq = this.mtof(arpNote);
        if (freq > 0) {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 0.9);

          osc.connect(gain);
          gain.connect(this.musicGain);
          osc.start(now);
          osc.stop(now + stepDuration);
        }
      }

      // 4. Play Percussion / Drum
      const drum = track.drums[currentStep];
      if (drum === 'K') {
        // Kick
        const kick = this.ctx.createOscillator();
        const kGain = this.ctx.createGain();
        kick.type = 'sine';
        kick.frequency.setValueAtTime(130, now);
        kick.frequency.exponentialRampToValueAtTime(35, now + 0.09);
        kGain.gain.setValueAtTime(0.35, now);
        kGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        kick.connect(kGain);
        kGain.connect(this.musicGain);
        kick.start(now);
        kick.stop(now + 0.11);
      } else if (drum === 'S') {
        // Snare (Noise burst + tone)
        const tone = this.ctx.createOscillator();
        const tGain = this.ctx.createGain();
        tone.type = 'triangle';
        tone.frequency.setValueAtTime(180, now);
        tone.frequency.exponentialRampToValueAtTime(70, now + 0.08);
        tGain.gain.setValueAtTime(0.2, now);
        tGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        tone.connect(tGain);
        tGain.connect(this.musicGain);
        tone.start(now);
        tone.stop(now + 0.1);

        const soundSynth = window.NeonRumble.SoundSynth;
        if (soundSynth && soundSynth.createNoiseBuffer) {
          const noise = this.ctx.createBufferSource();
          noise.buffer = soundSynth.createNoiseBuffer(0.12);
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'highpass';
          filter.frequency.setValueAtTime(1000, now);
          const nGain = this.ctx.createGain();
          nGain.gain.setValueAtTime(0.15, now);
          nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
          noise.connect(filter);
          filter.connect(nGain);
          nGain.connect(this.musicGain);
          noise.start(now);
          noise.stop(now + 0.12);
        }
      } else if (drum === 'H') {
        // Closed Hi-hat
        const soundSynth = window.NeonRumble.SoundSynth;
        if (soundSynth && soundSynth.createNoiseBuffer) {
          const noise = this.ctx.createBufferSource();
          noise.buffer = soundSynth.createNoiseBuffer(0.05);
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'highpass';
          filter.frequency.setValueAtTime(6000, now);
          const nGain = this.ctx.createGain();
          nGain.gain.setValueAtTime(0.09, now);
          nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
          noise.connect(filter);
          filter.connect(nGain);
          nGain.connect(this.musicGain);
          noise.start(now);
          noise.stop(now + 0.05);
        }
      } else if (drum === 'O') {
        // Open Hi-hat / Crash tap
        const soundSynth = window.NeonRumble.SoundSynth;
        if (soundSynth && soundSynth.createNoiseBuffer) {
          const noise = this.ctx.createBufferSource();
          noise.buffer = soundSynth.createNoiseBuffer(0.2);
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'highpass';
          filter.frequency.setValueAtTime(4500, now);
          const nGain = this.ctx.createGain();
          nGain.gain.setValueAtTime(0.12, now);
          nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
          noise.connect(filter);
          filter.connect(nGain);
          nGain.connect(this.musicGain);
          noise.start(now);
          noise.stop(now + 0.2);
        }
      }

      this.step++;
    }
  }

  window.NeonRumble.MusicSynth = new MusicSequencer();
})();
