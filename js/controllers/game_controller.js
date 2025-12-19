// Game controller
import { BaseController } from './base_controller.js';
import { Game } from '../models/game.js';
import { soundService } from '../services/sound_service.js';

export class GameController extends BaseController {
  static targets = ["state", "deck"];

  connect() {
    super.connect();
    this.game = null;
    
    window.addEventListener('game:ended', () => this.handleGameEnded());
  }

  start(event) {
    const { deckType } = event.detail || {};
    
    soundService.load();
    
    this.game = new Game({
      deckType: deckType || 'standard',
      playerCount: 4,
      onStateChange: (message, type) => this.updateState(message, type)
    });
    
    // Connect deck click to human player
    if (this.hasDeckTarget) {
      this.deckTarget.onclick = () => this.drawCard();
    }
    
    this.game.start();
  }

  drawCard() {
    if (!this.game) return;
    if (this.game.currentPlayerIndex !== 0) return;
    
    // Delegate to human player
    const human = this.game.humanPlayer;
    if (human && human.onDrawCard) {
      human.onDrawCard();
    }
  }

  updateState(message, type = 'info') {
    if (!this.hasStateTarget) return;
    
    const el = this.stateTarget;
    el.textContent = message;
    
    // Remove all state classes and add the new one
    el.classList.remove('error', 'success', 'info');
    this.addClass(el, type);
    
    // Trigger animation on error
    if (type === 'error') {
      el.style.animation = 'none';
      el.offsetHeight; // Force reflow
      el.style.animation = null;
    }
  }

  handleGameEnded() {
    this.game = null;
    this.emit('ended');
  }

  exit() {
    this.game = null;
    this.emit('ended');
  }
}
