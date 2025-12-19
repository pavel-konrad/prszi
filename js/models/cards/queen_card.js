// Queen card (Svršek) - player can change the suit
import { BaseCard } from './base_card.js';
import { SUITS } from '../../config/assets.js';

export class QueenCard extends BaseCard {
  constructor(suit) {
    super(suit, 'Q');
    this.chosenSuit = null;
  }

  get isSpecial() {
    return true;
  }

  // Queen can be played on any card
  canPlayOn(topCard) {
    return true;
  }

  async onPlay(game, player) {
    // For human player, show suit selection dialog
    if (!player.isAI) {
      this.chosenSuit = await this.promptSuitSelection();
    } else {
      // AI chooses the suit they have most cards of
      this.chosenSuit = this.chooseBestSuit(player);
    }
    
    // Set the "virtual" suit for the next player
    game.forcedSuit = this.chosenSuit;
  }

  promptSuitSelection() {
    return new Promise((resolve) => {
      // Create modal for suit selection
      const modal = document.createElement('div');
      modal.className = 'suit-modal';
      modal.innerHTML = `
        <div class="suit-modal-content">
          <h3>Choose a suit:</h3>
          <div class="suit-buttons">
            ${SUITS.map(suit => `
              <button class="suit-btn" data-suit="${suit}">${suit}</button>
            `).join('')}
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      modal.querySelectorAll('.suit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const suit = btn.dataset.suit;
          modal.remove();
          resolve(suit);
        });
      });
    });
  }

  chooseBestSuit(player) {
    // Count cards by suit
    const suitCounts = {};
    for (const card of player.hand) {
      if (card !== this) { // Don't count the queen being played
        suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1;
      }
    }
    
    // Find suit with most cards
    let bestSuit = SUITS[0];
    let maxCount = 0;
    
    for (const [suit, count] of Object.entries(suitCounts)) {
      if (count > maxCount) {
        maxCount = count;
        bestSuit = suit;
      }
    }
    
    return bestSuit;
  }

  // Override to check forced suit
  get effectiveSuit() {
    return this.chosenSuit || this.suit;
  }
}

