// Game controller
import { BaseController } from './base_controller.js';
import { Game } from '../models/game.js';
import { soundService } from '../services/sound_service.js';

export class GameController extends BaseController {
  static targets = ["state", "deck"];

  connect() {
    super.connect();
    this.game = null;
    this._boundGameFinished = this._onGameFinished.bind(this);
    window.addEventListener('prsi:game:finished', this._boundGameFinished);
  }

  disconnect() {
    window.removeEventListener('prsi:game:finished', this._boundGameFinished);
  }

  _onGameFinished() {
    this.game = null;
    // Dispatch Stimulus event for intro controller
    this.dispatch('ended', { bubbles: true });
  }

  start(event) {
    const { deckType } = event.detail || {};
    
    soundService.load();
    
    this.game = new Game({
      deckType: deckType || 'standard',
      playerCount: 4,
      onStateChange: (message, type) => this.updateState(message, type)
    });
    
    if (this.hasDeckTarget) {
      this.deckTarget.onclick = () => this.drawCard();
    }
    
    this.game.start();
  }

  drawCard() {
    if (!this.game) return;
    if (this.game.currentPlayerIndex !== 0) return;
    
    const human = this.game.humanPlayer;
    if (human && human.onDrawCard) {
      human.onDrawCard();
    }
  }

  updateState(message, type = 'info') {
    if (!this.hasStateTarget) return;
    
    const el = this.stateTarget;
    el.textContent = message;
    
    el.classList.remove('error', 'success', 'info');
    el.classList.add(type);
    
    if (type === 'error') {
      el.style.animation = 'none';
      el.offsetHeight;
      el.style.animation = null;
    }
  }

  exit() {
    this.game = null;
    this.dispatch('ended', { bubbles: true });
  }
}
