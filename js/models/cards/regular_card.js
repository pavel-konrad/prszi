// Regular card - no special effects
import { BaseCard } from './base_card.js';

export class RegularCard extends BaseCard {
  constructor(suit, value) {
    super(suit, value);
  }

  get isSpecial() {
    return false;
  }
}

