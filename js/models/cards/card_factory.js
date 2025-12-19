// Card Factory - creates appropriate card type based on value
import { RegularCard } from './regular_card.js';
import { SevenCard } from './seven_card.js';
import { AceCard } from './ace_card.js';
import { QueenCard } from './queen_card.js';

export class CardFactory {
  static create(suit, value) {
    switch (value) {
      case '7':
        return new SevenCard(suit);
      case 'A':
        return new AceCard(suit);
      case 'Q':
        return new QueenCard(suit);
      default:
        return new RegularCard(suit, value);
    }
  }

  static createDeck(suits, values) {
    const cards = [];
    for (const suit of suits) {
      for (const value of values) {
        cards.push(CardFactory.create(suit, value));
      }
    }
    return cards;
  }
}

// Re-export card classes for type checking
export { BaseCard } from './base_card.js';
export { RegularCard } from './regular_card.js';
export { SevenCard } from './seven_card.js';
export { AceCard } from './ace_card.js';
export { QueenCard } from './queen_card.js';

