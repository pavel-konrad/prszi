// Ace card - next player is skipped (stojí)
import { BaseCard } from './base_card.js';

export class AceCard extends BaseCard {
  constructor(suit) {
    super(suit, 'A');
  }

  get isSpecial() {
    return true;
  }

  async onPlay(game, player) {
    // Skip the next player
    game.skipNextPlayer = true;
  }
}

