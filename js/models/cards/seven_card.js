// Seven card - next player must draw 2 cards (or play another 7)
import { BaseCard } from './base_card.js';

export class SevenCard extends BaseCard {
  static DRAW_COUNT = 2;

  constructor(suit) {
    super(suit, '7');
  }

  get isSpecial() {
    return true;
  }

  async onPlay(game, player) {
    // Add to the seven stack
    game.sevenStack = (game.sevenStack || 0) + SevenCard.DRAW_COUNT;
    
    // The next player will need to handle this in their turn
    game.pendingSevens = true;
  }

  canPlayOn(topCard) {
    // Can always play 7 on another 7, or normal matching rules
    if (topCard && topCard.value === '7') return true;
    return super.canPlayOn(topCard);
  }
}

