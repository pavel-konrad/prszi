// Player Factory - creates appropriate player type
import { HumanPlayer } from './human_player.js';
import { AIPlayer } from './ai_player.js';

export class PlayerFactory {
  static create(options = {}) {
    if (options.isAI) {
      return new AIPlayer(options);
    }
    return new HumanPlayer(options);
  }

  static createPlayers(playerCount, discardPile, game) {
    const players = [];
    
    // First player is human
    players.push(PlayerFactory.create({
      isAI: false,
      playerIndex: 0,
      discardPile,
      game
    }));

    // Rest are AI
    for (let i = 1; i < playerCount; i++) {
      players.push(PlayerFactory.create({
        isAI: true,
        playerIndex: i,
        discardPile,
        game,
        thinkingDelay: 800 + Math.random() * 400 // Vary AI thinking time
      }));
    }

    return players;
  }
}

// Re-export classes
export { BasePlayer } from './base_player.js';
export { HumanPlayer } from './human_player.js';
export { AIPlayer } from './ai_player.js';

