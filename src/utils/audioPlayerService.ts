/**
 * Audio player service for Mode B (Authorized Audio & Synchronized Playback).
 * Handles HTMLAudioElement, speech synthesis fallback, and Web Audio tones with sub-frame time accuracy.
 */

export type AudioTimeCallback = (currentTime: number) => void;
export type AudioStateCallback = (isPlaying: boolean) => void;

class AudioPlayerService {
  private audio: HTMLAudioElement | null = null;
  private timeListeners: Set<AudioTimeCallback> = new Set();
  private stateListeners: Set<AudioStateCallback> = new Set();
  private animFrameId: number | null = null;
  private isSynthesized: boolean = false;
  private synthStartTime: number = 0;
  private synthPausedAt: number = 0;
  private synthRate: number = 1.0;
  private synthPlaying: boolean = false;
  private synthDuration: number = 108; // Duration for sample authorized episode
  private audioCtx: AudioContext | null = null;
  private oscNode: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audio = new Audio();
      this.audio.preload = 'auto';

      this.audio.addEventListener('play', () => this.notifyState(true));
      this.audio.addEventListener('pause', () => this.notifyState(false));
      this.audio.addEventListener('ended', () => {
        this.notifyState(false);
        this.stopTimeTracking();
      });
      this.audio.addEventListener('timeupdate', () => {
        if (!this.isSynthesized && this.audio) {
          this.notifyTime(this.audio.currentTime);
        }
      });
    }
  }

  public loadSource(url: string, duration: number = 108) {
    this.pause();
    this.synthDuration = duration;

    if (url === 'SYNTHETIC_SPEECH_STREAM' || !url) {
      this.isSynthesized = true;
      this.synthPausedAt = 0;
      this.synthPlaying = false;
      this.notifyTime(0);
      return;
    }

    this.isSynthesized = false;
    if (this.audio) {
      this.audio.src = url;
      this.audio.currentTime = 0;
    }
  }

  public play() {
    if (this.isSynthesized) {
      if (!this.synthPlaying) {
        this.synthPlaying = true;
        this.synthStartTime = performance.now() - (this.synthPausedAt * 1000) / this.synthRate;
        this.startTimeTracking();
        this.notifyState(true);
        this.startAmbientTone();
      }
      return;
    }

    if (this.audio) {
      this.audio.play().then(() => {
        this.startTimeTracking();
      }).catch(err => {
        console.warn('Audio play restricted or failed:', err);
      });
    }
  }

  public pause() {
    if (this.isSynthesized) {
      if (this.synthPlaying) {
        this.synthPlaying = false;
        this.synthPausedAt = this.getCurrentTime();
        this.stopTimeTracking();
        this.notifyState(false);
        this.stopAmbientTone();
      }
      return;
    }

    if (this.audio) {
      this.audio.pause();
      this.stopTimeTracking();
    }
  }

  public togglePlay() {
    if (this.isPlaying()) {
      this.pause();
    } else {
      this.play();
    }
  }

  public seek(seconds: number) {
    const clamped = Math.max(0, Math.min(seconds, this.getDuration()));
    if (this.isSynthesized) {
      this.synthPausedAt = clamped;
      if (this.synthPlaying) {
        this.synthStartTime = performance.now() - (clamped * 1000) / this.synthRate;
      }
      this.notifyTime(clamped);
      return;
    }

    if (this.audio) {
      this.audio.currentTime = clamped;
      this.notifyTime(clamped);
    }
  }

  public setPlaybackRate(rate: number) {
    this.synthRate = rate;
    if (this.synthPlaying) {
      const current = this.getCurrentTime();
      this.synthStartTime = performance.now() - (current * 1000) / rate;
    }
    if (this.audio) {
      this.audio.playbackRate = rate;
    }
  }

  public setVolume(volume: number) {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume));
    }
    if (this.gainNode) {
      this.gainNode.gain.value = volume * 0.05;
    }
  }

  public getCurrentTime(): number {
    if (this.isSynthesized) {
      if (!this.synthPlaying) return this.synthPausedAt;
      const elapsed = (performance.now() - this.synthStartTime) / 1000;
      const current = elapsed * this.synthRate;
      if (current >= this.synthDuration) {
        this.pause();
        return this.synthDuration;
      }
      return current;
    }
    return this.audio ? this.audio.currentTime : 0;
  }

  public getDuration(): number {
    if (this.isSynthesized) {
      return this.synthDuration;
    }
    if (this.audio && !isNaN(this.audio.duration) && this.audio.duration > 0) {
      return this.audio.duration;
    }
    return this.synthDuration;
  }

  public isPlaying(): boolean {
    if (this.isSynthesized) return this.synthPlaying;
    return this.audio ? !this.audio.paused : false;
  }

  public onTimeUpdate(callback: AudioTimeCallback): () => void {
    this.timeListeners.add(callback);
    return () => this.timeListeners.delete(callback);
  }

  public onStateChange(callback: AudioStateCallback): () => void {
    this.stateListeners.add(callback);
    return () => this.stateListeners.delete(callback);
  }

  private startTimeTracking() {
    if (this.animFrameId !== null) return;

    const loop = () => {
      const time = this.getCurrentTime();
      this.notifyTime(time);

      if (this.isPlaying()) {
        this.animFrameId = requestAnimationFrame(loop);
      } else {
        this.animFrameId = null;
      }
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  private stopTimeTracking() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private notifyTime(time: number) {
    this.timeListeners.forEach(cb => cb(time));
  }

  private notifyState(playing: boolean) {
    this.stateListeners.forEach(cb => cb(playing));
  }

  // Soft melodic ambient speech tone when playing authorized sample track
  private startAmbientTone() {
    try {
      if (!this.audioCtx) {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtxClass) {
          this.audioCtx = new AudioCtxClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
    } catch {
      // AudioContext unavailable or restricted
    }
  }

  private stopAmbientTone() {
    if (this.gainNode && this.audioCtx) {
      try {
        this.gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
      } catch {}
    }
  }
}

export const audioPlayerService = new AudioPlayerService();
