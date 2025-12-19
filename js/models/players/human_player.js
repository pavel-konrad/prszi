// Human player implementation
import { BasePlayer } from './base_player.js';
import { soundService } from '../../services/sound_service.js';
import { animationService } from '../../services/animation_service.js';
import { t } from '../../services/translation_service.js';

export class HumanPlayer extends BasePlayer {
  constructor(options = {}) {
    super(options);
    this._turnResolver = null;
  }

  get isAI() {
    return false;
  }

  get handElementId() {
    return 'player-hand';
  }

  // Human player waits for click events
  async takeTurn() {
    // The turn is resolved when player clicks a card or draws
    return new Promise((resolve) => {
      this._turnResolver = resolve;
    });
  }

  onCardAdded(card, cardElement) {
    // Add click handler for playing cards
    cardElement.addEventListener('click', () => this.onCardClicked(card));
  }

  async onCardClicked(card) {
    if (!this.game) return;

    // Check if it's our turn
    if (this.game.currentPlayerIndex !== this.playerIndex) {
      this.game.showState(t('notYourTurn'), 'error');
      soundService.play('error');
      return;
    }

    // Handle pending sevens - must play 7 or draw
    if (this.game.pendingSevens) {
      if (card.value !== '7') {
        this.game.showState(t('mustPlaySevenOrDraw'), 'error');
        soundService.play('error');
        animationService.shake(card.element);
        return;
      }
    }

    const topCard = this.discardPile.topCard;
    const forcedSuit = this.game.forcedSuit;

    // Check if card can be played
    if (forcedSuit) {
      if (card.suit !== forcedSuit && card.value !== 'Q') {
        this.game.showState(t('mustPlaySuit', forcedSuit), 'error');
        soundService.play('error');
        animationService.shake(card.element);
        return;
      }
    } else if (!card.canPlayOn(topCard)) {
      this.game.showState(t('cannotPlayCard'), 'error');
      soundService.play('error');
      animationService.shake(card.element);
      return;
    }

    // Clear forced suit after valid play
    this.game.forcedSuit = null;

    const gameEnded = await this.executeCardPlay(card);

    if (!gameEnded) {
      this.resolveTurn();
    }
  }

  // Called when player draws a card
  onDrawCard() {
    if (this.game.pendingSevens) {
      // Must draw the accumulated cards
      const count = this.game.sevenStack || 2;
      for (let i = 0; i < count; i++) {
        this.drawCard();
      }
      this.game.sevenStack = 0;
      this.game.pendingSevens = false;
    } else {
      this.drawCard();
    }
    
    this.resolveTurn();
  }

  resolveTurn() {
    if (this._turnResolver) {
      this._turnResolver();
      this._turnResolver = null;
    }
    this.game.endTurn();
  }
}

