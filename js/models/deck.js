// Deck model - uses CardFactory for polymorphic card creation
import { CardFactory } from './cards/card_factory.js';
import { DECK_CONFIGS } from '../config/assets.js';
import { t } from '../services/translation_service.js';

export class Deck {
  constructor(deckType = 'standard') {
    this.cards = [];
    this.deckType = deckType;
    this.discardPile = null;
    this.loadCards();
    this.shuffle();
  }

  setDiscardPile(discardPile) {
    this.discardPile = discardPile;
  }

  loadCards() {
    const config = DECK_CONFIGS[this.deckType] || DECK_CONFIGS.standard;
    // Use factory to create appropriate card types (polymorphism!)
    this.cards = CardFactory.createDeck(config.suits, config.values);
  }

  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  draw() {
    if (this.cards.length === 0) {
      this.refillFromDiscardPile();
    }
    
    if (this.cards.length === 0) {
      return null;
    }
    
    return this.cards.pop();
  }

  refillFromDiscardPile() {
    if (!this.discardPile || !this.discardPile.card) {
      alert(t('noDiscardCards'));
      return;
    }

    alert(t('deckEmpty'));

    const cardsToRefill = this.discardPile.previousCards.map(card => {
      card.isFaceUp = false;
      return card;
    }).reverse();

    this.discardPile.previousCards = [];
    this.cards = cardsToRefill;
    this.shuffle();
  }

  get isEmpty() {
    return this.cards.length === 0;
  }

  get count() {
    return this.cards.length;
  }
}
