// Abstract base player class
import { soundService } from '../../services/sound_service.js';
import { animationService } from '../../services/animation_service.js';

export class BasePlayer {
  constructor(options = {}) {
    if (new.target === BasePlayer) {
      throw new Error('BasePlayer is abstract and cannot be instantiated directly');
    }
    
    this.hand = [];
    this.playerIndex = options.playerIndex || 0;
    this.discardPile = options.discardPile;
    this.game = options.game;
    this._handElement = null;
  }

  // Abstract property - must be overridden
  get isAI() {
    throw new Error('isAI must be implemented by subclass');
  }

  // Abstract method - how this player takes their turn
  async takeTurn() {
    throw new Error('takeTurn must be implemented by subclass');
  }

  // Template method for hand element ID
  get handElementId() {
    throw new Error('handElementId must be implemented by subclass');
  }

  get handElement() {
    if (!this._handElement) {
      this._handElement = document.getElementById(this.handElementId);
    }
    return this._handElement;
  }

  addCard(card) {
    card.isFaceUp = !this.isAI;
    this.hand.push(card);

    const handElement = this.handElement;
    if (!handElement) return;

    const cardElement = card.createElement();
    handElement.appendChild(cardElement);

    soundService.play('deal');
    animationService.animateDeal(cardElement);

    this.onCardAdded(card, cardElement);
  }

  // Hook for subclasses to add behavior when card is added
  onCardAdded(card, cardElement) {
    // Default: nothing
  }

  async executeCardPlay(card) {
    const cardElement = card.element;

    await animationService.moveToDiscard(cardElement, { flipDuring: this.isAI });

    this.discardPile.discard(card);
    this.removeCardFromHand(card);

    if (cardElement && cardElement.parentNode) {
      cardElement.remove();
    }

    soundService.play('place');

    // Execute special card effect (polymorphism!)
    await card.onPlay(this.game, this);

    if (this.hand.length === 0) {
      this.game.onWin(this.isAI ? this.playerIndex : 'player');
      return true; // Game ended
    }

    return false; // Game continues
  }

  removeCardFromHand(card) {
    const index = this.hand.indexOf(card);
    if (index !== -1) {
      this.hand.splice(index, 1);
    }
  }

  findPlayableCards(topCard, forcedSuit = null) {
    return this.hand.filter(card => {
      if (forcedSuit) {
        // After queen, must match the chosen suit
        return card.suit === forcedSuit || card.value === 'Q';
      }
      return card.canPlayOn(topCard);
    });
  }

  findBestCard(topCard, forcedSuit = null) {
    const playable = this.findPlayableCards(topCard, forcedSuit);
    if (playable.length === 0) return null;

    // Strategy: prefer special cards, then regular cards
    // Could be overridden by smarter AI
    const specialCards = playable.filter(c => c.isSpecial);
    if (specialCards.length > 0) {
      return specialCards[0];
    }
    return playable[0];
  }

  drawCard() {
    const card = this.game.deck.draw();
    if (card) {
      this.addCard(card);
    }
    return card;
  }

  get hasCards() {
    return this.hand.length > 0;
  }

  get cardCount() {
    return this.hand.length;
  }

  toString() {
    return `Player ${this.playerIndex} (${this.isAI ? 'AI' : 'Human'})`;
  }
}

