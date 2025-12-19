// Sound service
import { SOUNDS } from '../config/assets.js';

class SoundService {
  constructor() {
    this.sounds = {};
    this.volume = 0.4;
    this.muted = false;
    this._loaded = false;
  }

  load() {
    if (this._loaded) return;
    
    for (const [key, path] of Object.entries(SOUNDS)) {
      const audio = new Audio(path);
      audio.preload = 'auto';
      audio.volume = this.volume;
      this.sounds[key] = audio;
    }
    this._loaded = true;
  }

  play(key) {
    const audio = this.sounds[key];
    if (!audio) return;
    
    try {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } catch (e) {
      // Ignore playback errors
    }
  }

  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, value));
    this.muted = this.volume === 0;
    this._applyVolume();
  }

  toggleMute() {
    this.muted = !this.muted;
    this._applyVolume();
  }

  _applyVolume() {
    const effectiveVolume = this.muted ? 0 : this.volume;
    for (const audio of Object.values(this.sounds)) {
      if (audio && typeof audio.volume !== 'undefined') {
        audio.volume = effectiveVolume;
      }
    }
  }

  get isMuted() {
    return this.muted;
  }
}

export const soundService = new SoundService();

