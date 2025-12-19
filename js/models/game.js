// Game model - orchestrates gameplay with polymorphic players
import { Deck } from './deck.js';
import { DiscardPile } from './discard_pile.js';
import { PlayerFactory } from './players/player_factory.js';
import { soundService } from '../services/sound_service.js';
import { t } from '../services/translation_service.js';

export class Game {
  constructor(options = {}) {
    this.deckType = options.deckType || 'standard';
    this.playerCount = options.playerCount || 4;
    this.stateCallback = options.onStateChange || (() => {});
    
    this.deck = new Deck(this.deckType);
    this.discardPile = new DiscardPile();
    this.deck.setDiscardPile(this.discardPile);
    
    // Special card state
    this.forcedSuit = null;      // Set by Queen
    this.pendingSevens = false;  // Set by Seven
    this.sevenStack = 0;         // Accumulated sevens
    this.skipNextPlayer = false; // Set by Ace
    
    // Create players using factory
    this.players = PlayerFactory.createPlayers(
      this.playerCount, 
      this.discardPile, 
      this
    );
    
    this.currentPlayerIndex = 0;
  }

  start() {
    // Deal 4 cards to each player
    for (let round = 0; round < 4; round++) {
      for (const player of this.players) {
        const card = this.deck.draw();
        if (card) player.addCard(card);
      }
    }

    // Place first card on discard pile
    let firstCard = this.deck.draw();
    
    // Re-draw if first card is special (common house rule)
    while (firstCard && firstCard.isSpecial) {
      this.deck.cards.unshift(firstCard);
      this.deck.shuffle();
      firstCard = this.deck.draw();
    }
    
    if (firstCard) {
      firstCard.isFaceUp = true;
      this.discardPile.discard(firstCard);
    }

    this.updateTurnIndicator();
    
    // Start first turn if it's AI
    if (this.currentPlayer.isAI) {
      setTimeout(() => this.executeTurn(), 1000);
    }
  }

  get currentPlayer() {
    return this.players[this.currentPlayerIndex];
  }

  get humanPlayer() {
    return this.players[0];
  }

  async executeTurn() {
    const player = this.currentPlayer;
    
    // Polymorphic call - each player type handles its turn differently
    await player.takeTurn();
  }

  endTurn() {
    // Handle Ace skip
    if (this.skipNextPlayer) {
      this.skipNextPlayer = false;
      this.currentPlayerIndex = (this.currentPlayerIndex + 2) % this.players.length;
      this.showState(t('playerSkipped', this.currentPlayerIndex));
    } else {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    }
    
    this.updateTurnIndicator();

    // If next player is AI, execute their turn
    if (this.currentPlayer.isAI) {
      setTimeout(() => this.executeTurn(), 500);
    }
  }

  updateTurnIndicator() {
    const player = this.currentPlayer;
    
    let message;
    if (player.isAI) {
      message = t('enemyTurn', this.currentPlayerIndex);
    } else {
      message = t('playerTurn');
    }
    
    // Add special state info
    if (this.forcedSuit) {
      message += ` (${t('mustPlaySuit', this.forcedSuit)})`;
    }
    if (this.pendingSevens) {
      message += ` (${t('mustPlaySevenOrDraw')}: ${this.sevenStack})`;
    }
    
    this.showState(message);
  }

  showState(message, type = 'info') {
    this.stateCallback(message, type);
  }

  onWin(winner) {
    soundService.play('win');
    
    const message = winner === 'player' 
      ? t('youWon') 
      : t('enemyWon', winner);
    
    this.showState(message, 'success');
    
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('game:ended'));
    }, 2000);
  }
}
