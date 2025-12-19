// Settings controller
import { BaseController } from './base_controller.js';
import { soundService } from '../services/sound_service.js';

export class SettingsController extends BaseController {
  static targets = ["overlay", "volumeRange", "muteButton"];

  connect() {
    super.connect();
    this.syncUI();
  }

  syncUI() {
    if (this.hasVolumeRangeTarget) {
      this.volumeRangeTarget.value = soundService.volume;
    }
    this.updateMuteButton();
  }

  open() {
    this.removeClass(this.overlayTarget, 'hidden');
    this.syncUI();
  }

  close() {
    this.addClass(this.overlayTarget, 'hidden');
  }

  setVolume(event) {
    const value = parseFloat(event.target.value);
    soundService.setVolume(value);
    this.updateMuteButton();
  }

  toggleMute() {
    soundService.toggleMute();
    
    if (this.hasVolumeRangeTarget) {
      this.volumeRangeTarget.value = soundService.isMuted ? 0 : soundService.volume;
    }
    this.updateMuteButton();
  }

  updateMuteButton() {
    if (this.hasMuteButtonTarget) {
      this.muteButtonTarget.textContent = soundService.isMuted ? 'Unmute' : 'Mute';
    }
  }
}
