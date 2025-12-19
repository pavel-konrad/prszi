// AI player implementation
import { BasePlayer } from './base_player.js';
import { SevenCard } from '../cards/seven_card.js';

export class AIPlayer extends BasePlayer {
  constructor(options = {}) {
    super(options);
    this.thinkingDelay = options.thinkingDelay || 1000;
  }

  get isAI() {
    return true;
  }

  get handElementId() {
    return `enemy${this.playerIndex}-hand`;
  }

  async takeTurn() {
    // Simulate thinking
    await this.think();

    const topCard = this.discardPile.topCard;
    const forcedSuit = this.game.forcedSuit;

    // Handle pending sevens
    if (this.game.pendingSevens) {
      const seven = this.hand.find(c => c.value === '7');
      if (seven) {
        // Play another 7 to pass it on
        this.game.forcedSuit = null;
        const gameEnded = await this.executeCardPlay(seven);
        if (!gameEnded) this.game.endTurn();
        return;
      } else {
        // Must draw cards
        const count = this.game.sevenStack || 2;
        for (let i = 0; i < count; i++) {
          this.drawCard();
        }
        this.game.sevenStack = 0;
        this.game.pendingSevens = false;
        this.game.endTurn();
        return;
      }
    }

    // Find best playable card
    const card = this.chooseBestCard(topCard, forcedSuit);

    if (card) {
      this.game.forcedSuit = null;
      const gameEnded = await this.executeCardPlay(card);
      if (!gameEnded) this.game.endTurn();
    } else {
      // No playable card, must draw
      this.drawCard();
      this.game.endTurn();
    }
  }

  think() {
    return new Promise(resolve => setTimeout(resolve, this.thinkingDelay));
  }

  // Override for smarter AI strategy
  chooseBestCard(topCard, forcedSuit) {
    const playable = this.findPlayableCards(topCard, forcedSuit);
    if (playable.length === 0) return null;

    // Strategy priority:
    // 1. If we have only 1-2 cards left, prefer regular cards (to win)
    // 2. If opponent has few cards, play defensive (7s, aces)
    // 3. Otherwise, save special cards for later

    if (this.cardCount <= 2) {
      // Try to win - prefer regular cards
      const regular = playable.find(c => !c.isSpecial);
      if (regular) return regular;
    }

    // Check if any opponent has few cards
    const opponentDanger = this.game.players.some(p => 
      p !== this && p.cardCount <= 2
    );

    if (opponentDanger) {
      // Play defensively - use special cards
      const seven = playable.find(c => c.value === '7');
      if (seven) return seven;
      
      const ace = playable.find(c => c.value === 'A');
      if (ace) return ace;
    }

    // Default: play regular cards first, save special cards
    const regular = playable.filter(c => !c.isSpecial);
    if (regular.length > 0) {
      // Prefer cards that match suit (more flexible)
      return regular[0];
    }

    // Must play special card
    return playable[0];
  }
}

