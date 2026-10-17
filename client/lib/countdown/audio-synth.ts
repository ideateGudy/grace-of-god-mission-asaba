/**
 * Deterministic Web Audio API Synthesizer for Church Countdown Timer.
 * 100% Offline: Generates all chime, gong, and tick sounds mathematically.
 * Zero external audio files or network requests required.
 */

class OfflineAudioSynth {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Subtle glass tick for regular second countdown when under 10 seconds.
   */
  public playTick(): void {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {
      // Audio playback silently guarded if browser blocks unmuted audio
    }
  }

  /**
   * Urgent dual-chime for the final 5 seconds (5, 4, 3, 2, 1).
   */
  public playUrgentTick(): void {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(1046.5, ctx.currentTime); // C6

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // Silently guarded
    }
  }

  /**
   * Majestic Sacred Cathedral Chime / Service Bell Chord at 00:00:00.
   * Synthesizes a rich harmonic major triad (A Major: 440Hz, 554.37Hz, 659.25Hz, 880Hz).
   */
  public playServiceGong(): void {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const frequencies = [440, 554.37, 659.25, 880];
      const duration = 3.8; // Long resonant decay

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.3, ctx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      // Low-pass filter for warm bell resonance
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1400, ctx.currentTime);

      masterGain.connect(filter);
      filter.connect(ctx.destination);

      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();

        // Layer pure sine with slight bell triangle overtone
        osc.type = idx === 0 ? "triangle" : "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        oscGain.gain.setValueAtTime(1 / frequencies.length, ctx.currentTime);
        osc.connect(oscGain);
        oscGain.connect(masterGain);

        osc.start();
        osc.stop(ctx.currentTime + duration);
      });
    } catch {
      // Silently guarded
    }
  }
}

export const audioSynth = new OfflineAudioSynth();
