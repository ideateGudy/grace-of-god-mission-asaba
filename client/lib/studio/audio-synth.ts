/**
 * Deterministic Web Audio API Synthesizer for Church Broadcast Studio & Countdown.
 * 100% Offline: Generates all chime, gong, and tick sounds mathematically.
 * Zero external audio files or network requests required.
 */

class OfflineAudioSynth {
  private ctx: AudioContext | null = null;
  private isUnlocked: boolean = false;

  public getContext(): AudioContext | null {
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
   * Automatically unlock Web Audio API on first user interaction (touch/click/keydown)
   * to satisfy modern browser Autoplay Policy.
   */
  public unlock(): void {
    if (this.isUnlocked || typeof window === "undefined") return;
    const ctx = this.getContext();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      void ctx.resume().then(() => {
        this.isUnlocked = true;
      }).catch(() => {});
    } else {
      this.isUnlocked = true;
    }
  }

  /**
   * Crisp, audible acoustic tick for seconds 10 down to 6.
   * Uses dual harmonics (woodblock / digital broadcast click) with high gain (0.45)
   * so it is clearly audible on laptops, phones, and sound systems.
   */
  public playTick(): void {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      if (ctx.state === "suspended") {
        void ctx.resume();
      }

      const now = ctx.currentTime;

      // Primary crisp attack
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(1200, now);
      osc1.frequency.exponentialRampToValueAtTime(600, now + 0.06);

      gain1.gain.setValueAtTime(0.45, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      // Subtle high-pitch harmonic snap
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(2400, now);
      gain2.gain.setValueAtTime(0.25, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.08);
      osc2.start(now);
      osc2.stop(now + 0.05);
    } catch {
      // Audio playback silently guarded if browser blocks
    }
  }

  /**
   * Urgent high-visibility warning alert beep for the final 5 seconds (5, 4, 3, 2, 1).
   * Double-pulse alert tone at 1480Hz & 1760Hz with prominent gain (0.55).
   */
  public playUrgentTick(): void {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      if (ctx.state === "suspended") {
        void ctx.resume();
      }

      const now = ctx.currentTime;

      // Pulse 1
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(1480, now);

      gain1.gain.setValueAtTime(0.55, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.13);

      // Pulse 2 (Higher harmonic echo after 50ms)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(1760, now + 0.05);

      gain2.gain.setValueAtTime(0.001, now);
      gain2.gain.setValueAtTime(0.45, now + 0.05);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc2.start(now + 0.05);
      osc2.stop(now + 0.17);
    } catch {
      // Silently guarded
    }
  }

  /**
   * Majestic Sacred Cathedral Chime / Service Bell Chord at 00:00:00.
   * Synthesizes a rich harmonic major triad (A Major: 440Hz, 554.37Hz, 659.25Hz, 880Hz, 1108.73Hz).
   */
  public playServiceGong(): void {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      if (ctx.state === "suspended") {
        void ctx.resume();
      }

      const frequencies = [440, 554.37, 659.25, 880, 1108.73];
      const duration = 4.2; // Long resonant decay

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.55, ctx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      // Warm low-pass filter
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1800, ctx.currentTime);

      masterGain.connect(filter);
      filter.connect(ctx.destination);

      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();

        osc.type = idx === 0 ? "triangle" : idx === 1 ? "sine" : "sine";
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

  public playCathedralChimes(): void {
    this.playServiceGong();
  }

  public playOvertimeAlert(): void {
    this.playUrgentTick();
  }
}

export const audioSynth = new OfflineAudioSynth();

if (typeof window !== "undefined") {
  const handleInteraction = () => {
    audioSynth.unlock();
  };
  window.addEventListener("click", handleInteraction, { passive: true });
  window.addEventListener("keydown", handleInteraction, { passive: true });
  window.addEventListener("touchstart", handleInteraction, { passive: true });
}
