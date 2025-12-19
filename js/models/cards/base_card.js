// Abstract base card class
import { ASSET_BASE, CARD_BACK } from '../../config/assets.js';

function suitToName(suit) {
  const mapping = {
    '♥': 'hearts',
    '♦': 'diamonds',
    '♠': 'spades',
    '♣': 'clubs'
  };
  return mapping[suit] || String(suit).toLowerCase();
}

export class BaseCard {
  constructor(suit, value) {
    if (new.target === BaseCard) {
      throw new Error('BaseCard is abstract and cannot be instantiated directly');
    }
    
    this.suit = suit;
    this.value = value;
    this.isFaceUp = false;
    this._element = null;
  }

  // Template method - can be overridden by special cards
  get isSpecial() {
    return false;
  }

  // Template method - effect when card is played
  async onPlay(game, player) {
    // Default: no special effect
  }

  // Check if this card can be played on top of another
  canPlayOn(topCard) {
    if (!topCard) return true;
    return this.suit === topCard.suit || this.value === topCard.value;
  }

  // Get asset path for this card
  get assetPath() {
    const suitName = suitToName(this.suit);
    return `${ASSET_BASE}${suitName}_${this.value}.png`;
  }

  flip() {
    this.isFaceUp = !this.isFaceUp;
    this.updateDisplay();
  }

  createElement() {
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card');
    
    if (this.isSpecial) {
      cardDiv.classList.add('special-card');
    }

    const img = document.createElement('img');
    img.alt = `${this.suit} ${this.value}`;
    img.draggable = false;
    img.classList.add('card-img');
    cardDiv.appendChild(img);

    this._element = cardDiv;
    this.updateDisplay();
    return cardDiv;
  }

  updateDisplay() {
    if (!this._element) return;

    const img = this._element.querySelector('img.card-img');
    if (!img) return;

    if (this.isFaceUp) {
      img.src = this.assetPath;
      img.alt = `${this.suit} ${this.value}`;
      this._element.classList.add('flipped');
    } else {
      img.src = CARD_BACK;
      img.alt = 'card back';
      this._element.classList.remove('flipped');
    }
  }

  get element() {
    return this._element;
  }

  // String representation
  toString() {
    return `${this.suit}${this.value}`;
  }
}

