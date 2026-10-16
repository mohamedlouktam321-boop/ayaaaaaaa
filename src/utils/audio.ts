/**
 * Web Audio API based ambient sound generator and emotional music box.
 * 100% client-side, zero external files, no 404s, seamlessly loopable.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private rainNode: AudioNode | null = null;
  private rainGain: GainNode | null = null;
  private musicInterval: number | null = null;
  private currentScene: number = 1;

  // Lullaby melody note frequencies (Hz) in C Major / A Minor pentatonic (gentle & poignant)
  private melodyNotes: number[] = [
    261.63, // C4
    293.66, // D4
    329.63, // E4
    392.00, // G4
    440.00, // A4
    523.25, // C5
    587.33, // D5
    659.25, // E5
    783.99, // G5
  ];

  private melodySequence: number[][] = [
    [523.25, 392.00], // C5, G4
    [440.00, 329.63], // A4, E4
    [392.00, 261.63], // G4, C4
    [329.63, 220.00], // E4, A3
    [440.00, 329.63],
    [523.25, 392.00],
    [587.33, 440.00],
    [523.25, 329.63],
  ];

  private seqIndex = 0;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (!muted) {
      this.initContext();
      this.startAmbient();
      this.startMusic();
    } else {
      this.stopAmbient();
      this.stopMusic();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setScene(scene: number) {
    this.currentScene = scene;
    if (!this.isMuted && this.ctx && this.rainGain) {
      const now = this.ctx.currentTime;
      // Fade out rain in scene 3 and silence in scene 4-5
      if (scene >= 4) {
        this.rainGain.gain.setTargetAtTime(0, now, 1.2);
      } else if (scene === 3) {
        this.rainGain.gain.setTargetAtTime(0.015, now, 1.5);
      } else {
        this.rainGain.gain.setTargetAtTime(0.045, now, 1.0);
      }
    }
  }

  private startAmbient() {
    if (!this.ctx || this.isMuted) return;
    try {
      // Create filtered noise for rain sound
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Pink-ish noise filter
        lastOut = (lastOut * 0.95) + (white * 0.05);
        data[i] = lastOut * 1.5;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1100;

      const rainGain = this.ctx.createGain();
      const initialVol = this.currentScene >= 4 ? 0 : this.currentScene === 3 ? 0.015 : 0.045;
      rainGain.gain.setValueAtTime(initialVol, this.ctx.currentTime);

      noise.connect(filter);
      filter.connect(rainGain);
      rainGain.connect(this.ctx.destination);

      noise.start();
      this.rainNode = noise;
      this.rainGain = rainGain;
    } catch {
      // Audio playback fails safely if blocked
    }
  }

  private stopAmbient() {
    if (this.rainNode) {
      try {
        (this.rainNode as AudioBufferSourceNode).stop();
        this.rainNode.disconnect();
      } catch {
        // Safe catch
      }
      this.rainNode = null;
      this.rainGain = null;
    }
  }

  private startMusic() {
    this.stopMusic();
    if (!this.ctx || this.isMuted) return;

    this.seqIndex = 0;
    const playTick = () => {
      if (this.isMuted || !this.ctx) return;
      const notes = this.melodySequence[this.seqIndex % this.melodySequence.length];
      this.seqIndex++;

      // Play gentle music box notes
      notes.forEach((freq, i) => {
        setTimeout(() => {
          this.playBellNote(freq, 0.04, 2.5);
        }, i * 160);
      });

      // In scenes 4 and 5, add high twinkling harmony
      if (this.currentScene >= 4 && Math.random() > 0.4) {
        setTimeout(() => {
          const highNote = this.melodyNotes[Math.floor(Math.random() * this.melodyNotes.length)] * 2;
          this.playBellNote(highNote, 0.02, 1.8);
        }, 320);
      }
    };

    playTick();
    this.musicInterval = window.setInterval(playTick, 2400);
  }

  private stopMusic() {
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  private playBellNote(freq: number, volume: number, duration: number) {
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const oscHarmonic = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      oscHarmonic.type = 'triangle';
      oscHarmonic.frequency.setValueAtTime(freq * 2.01, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(volume, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(volume * 0.4, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.00001, now + duration);

      osc.connect(gain);
      oscHarmonic.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      oscHarmonic.start(now);
      osc.stop(now + duration + 0.1);
      oscHarmonic.stop(now + duration + 0.1);
    } catch {
      // Audio context error safe guard
    }
  }

  // Interactive chime on click
  public playChime() {
    if (!this.ctx || this.isMuted) return;
    try {
      const notes = [587.33, 739.99, 880.00]; // D major cheerful chime
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playBellNote(freq, 0.05, 1.5);
        }, idx * 90);
      });
    } catch {
      // Safe
    }
  }

  // Magical bloom sound for Scene 4
  public playBloomSound() {
    if (!this.ctx || this.isMuted) return;
    try {
      const arpeggio = [329.63, 392.00, 493.88, 587.33, 659.25, 783.99, 987.77];
      arpeggio.forEach((f, idx) => {
        setTimeout(() => {
          this.playBellNote(f, 0.04, 2.0);
        }, idx * 110);
      });
    } catch {
      // Safe
    }
  }

  // Soft purr sound for Aya patting the kitten
  public playPurr() {
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(75, now);

      // Tremolo LFO for purring vibration
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(18, now); // ~18Hz purr rhythm
      lfoGain.gain.setValueAtTime(0.015, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.025, now + 0.3);
      gain.gain.linearRampToValueAtTime(0.001, now + 1.2);

      lfo.connect(lfoGain.gain);
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      lfo.start(now);
      osc.stop(now + 1.3);
      lfo.stop(now + 1.3);
    } catch {
      // Safe
    }
  }

  // Final celebration fanfare for Scene 5
  public playCelebration() {
    if (!this.ctx || this.isMuted) return;
    try {
      const notes = [440, 554.37, 659.25, 880, 1108.73];
      notes.forEach((f, i) => {
        setTimeout(() => {
          this.playBellNote(f, 0.06, 2.5);
        }, i * 120);
      });
    } catch {
      // Safe
    }
  }
}

export const soundEngine = new SoundEngine();
