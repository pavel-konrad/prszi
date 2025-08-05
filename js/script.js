document.addEventListener('DOMContentLoaded', () => {

	// --- Asset paths (adjust to your project) ---
	const ASSET_BASE = 'assets/classic/'; // e.g. "assets/cards/"
	const CARD_BACK = `${ASSET_BASE}back.png`; // back of card image
  
	// --- Translations (keep as before or adjust) ---
	const TRANSLATIONS = {
	  en: {
		playerTurn: "It's your turn.",
		enemyTurn: (index) => `Player ${index} is on turn.`,
		cannotPlayCard: "You can't play this card!",
		deckEmpty: "Deck is empty! Refilling from discard pile.",
		noDiscardCards: "No cards in discard pile!",
		youWon: "You won!",
		enemyWon: (index) => `Player ${index} is winner!`,
		notYourTurn: "It's not your turn!",
		deckLabel: "Draw Pile",
		discardLabel: "Discard Pile",
		loading: "Loading..."
	  }
	};
  
	let currentLang = 'en';
	function t(key, ...args) {
	  const entry = (TRANSLATIONS[currentLang] || TRANSLATIONS.en)[key];
	  if (typeof entry === 'function') return entry(...args);
	  return entry || key;
	}
  
	// --- Helpers for asset name mapping ---
	function suitToName(suit) {
	  // suits are expected as symbols: "♥", "♦", "♠", "♣"
	  switch (suit) {
		case '♥': return 'hearts';
		case '♦': return 'diamonds';
		case '♠': return 'spades';
		case '♣': return 'clubs';
		default: return String(suit).toLowerCase();
	  }
	}
  
	function valueToName(value) {
	  // keep values as-is (7,8,9,10,J,Q,K,A) - filenames will use these tokens
	  return String(value);
	}
  
	function cardAssetPath(card) {
	  // e.g. assets/cards/hearts_7.png
	  const suitName = suitToName(card.suit);
	  const valueName = valueToName(card.value);
	  return `${ASSET_BASE}${suitName}_${valueName}.png`;
	}
  
	// --- Card class using <img> ---
	class Card {
	  constructor(suit, value) {
		this.suit = suit;
		this.value = value;
		this.isFaceUp = false;
		this._element = null; // cached DOM element if created
	  }
	  flip() { this.isFaceUp = !this.isFaceUp; this.updateCardDisplay(this._element); }
	  createCardElement() {
		const cardDiv = document.createElement('div');
		cardDiv.classList.add('card');
  
		const img = document.createElement('img');
		img.alt = `${this.suit} ${this.value}`;
		img.draggable = false;
		img.classList.add('card-img');
		cardDiv.appendChild(img);
  
		// cache element reference and initial display
		this._element = cardDiv;
		this.updateCardDisplay(cardDiv);
		return cardDiv;
	  }
	  updateCardDisplay(cardElement) {
		if (!cardElement) return;
		const img = cardElement.querySelector('img.card-img');
		if (!img) return;
		if (this.isFaceUp) {
		  img.src = cardAssetPath(this);
		  img.alt = `${this.suit} ${this.value}`;
		  cardElement.classList.add('flipped');
		} else {
		  img.src = CARD_BACK;
		  img.alt = 'card back';
		  cardElement.classList.remove('flipped');
		}
	  }
	}
  
	// --- Deck ---
	class Deck {
	  constructor() {
		this.cards = [];
		this.loadCards();
		this.shuffle();
	  }
	  loadCards() {
		if (deckType === 'standard') {
		  const suits = ["♥", "♦", "♠", "♣"];
		  const values = ["7", "8", "9", "10", "J", "Q", "K", "A"];
		  this.cards = suits.flatMap(s => values.map(v => new Card(s, v)));
		} else if (deckType === 'custom') {
		  const suits = ["♠"];
		  const values = ["10", "J", "Q", "K", "A"];
		  this.cards = suits.flatMap(s => values.map(v => new Card(s, v)));
		}
	  }
	  shuffle() {
		for (let i = this.cards.length - 1; i > 0; i--) {
		  const j = Math.floor(Math.random() * (i + 1));
		  [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
		}
	  }
	  drawCard() {
		if (this.cards.length === 0) {
		  alert(t('deckEmpty'));
		  this.refillFromDiscardPile();
		}
		if (this.cards.length === 0) {
		  // nothing after refill
		  setTimeout(() => { if (game) game.endTurn(); }, 100);
		  return null;
		}
		return this.cards.pop();
	  }
	  refillFromDiscardPile() {
		const discardedCard = game.discardPile.card;
		if (discardedCard) {
		  // take previousCards (which are older discard entries), flip them face-down and add to deck
		  const cardsToRefill = game.discardPile.previousCards.map(c => {
			c.isFaceUp = false;
			return c;
		  }).reverse(); // reverse so original order approximates previous top-to-bottom
  
		  // leave only the current top in discard pile
		  game.discardPile.previousCards = [];
  
		  this.cards = cardsToRefill;
		  this.shuffle();
		} else {
		  alert(t('noDiscardCards'));
		}
	  }
	}
  
	// --- DiscardPile ---
	class DiscardPile {
	  constructor() {
		this.card = null; // top card
		this.previousCards = []; // older cards (stack)
	  }
	  discard(card) {
		if (this.card) this.previousCards.push(this.card);
		this.card = card;
		card.isFaceUp = true;
		this.displayDiscardedCard();
	  }
	  displayDiscardedCard() {
		const el = document.getElementById('discard-pile');
		if (!el) return;
		el.innerHTML = '';
  
		if (this.card) {
		  const cardElement = this.card.createCardElement();
		  // ensure display shows face-up (top card must be face-up)
		  this.card.isFaceUp = true;
		  this.card.updateCardDisplay(cardElement);
		  el.appendChild(cardElement);
		}
	  }
	  clear() {
		this.card = null;
		this.previousCards = [];
		this.displayDiscardedCard();
	  }
	}
  
	// --- Player ---
	class Player {
	  constructor(discardPile, isAI = false, playerIndex = 0) {
		this.hand = [];
		this.discardPile = discardPile;
		this.isAI = isAI;
		this.playerIndex = playerIndex;
	  }
  
	  addCard(card) {
		// AI cards are face-down by default; human face-up
		card.isFaceUp = !this.isAI;
		this.hand.push(card);
  
		const handId = this.isAI ? `enemy${this.playerIndex}-hand` : 'player-hand';
		const handElement = document.getElementById(handId);
		if (!handElement) return;
  
		const cardElement = card.createCardElement();
		handElement.appendChild(cardElement);
  
		// play deal sound immediately, animate deal
		if (gameManager) gameManager.playSound('deal');
		if (gameManager) gameManager.animateDeal(cardElement);
  
		// Attach click for human
		if (!this.isAI) {
		  cardElement.addEventListener('click', () => this.playCard(card, cardElement));
		}
	  }
  
	  playCard(card, cardElement) {
		if (!game) return;
		if (game.currentPlayerIndex !== this.playerIndex) {
		  game.stateDisplay.updateState(t('notYourTurn'), "error");
		  if (gameManager) gameManager.playSound('error');
		  return;
		}
  
		const topCard = this.discardPile.card;
		if (!topCard || card.suit === topCard.suit || card.value === topCard.value) {
		  if (gameManager) {
			gameManager.animateMoveToDiscard(cardElement, { flipDuring: false }, () => {
			  this.discardPile.discard(card);
			  const idx = this.hand.indexOf(card);
			  if (idx !== -1) this.hand.splice(idx, 1);
			  if (cardElement && cardElement.parentNode) cardElement.remove();
  
			  gameManager.playSound('place');
  
			  if (this.hand.length === 0) {
				const winner = this.isAI ? this.playerIndex : 'player';
				gameManager.onWin(winner);
				return;
			  }
  
			  game.endTurn();
			});
		  } else {
			// fallback
			this.discardPile.discard(card);
			const idx = this.hand.indexOf(card);
			if (idx !== -1) this.hand.splice(idx, 1);
			if (cardElement && cardElement.parentNode) cardElement.remove();
			if (this.hand.length === 0) {
			  const winner = this.isAI ? this.playerIndex : 'player';
			  if (gameManager) gameManager.onWin(winner);
			  return;
			}
			game.endTurn();
		  }
		} else {
		  game.stateDisplay.updateState(t('cannotPlayCard'), "error");
		  if (gameManager) gameManager.playSound('error');
		  if (gameManager) gameManager.shakeElement(cardElement);
		}
	  }
	}
  
	// --- GameStateDisplay ---
	class GameStateDisplay {
	  constructor(elementId) {
		this.element = document.getElementById(elementId);
		if (this.element) this.element.classList.add('game-state');
	  }
	  updateState(message, type = 'info') {
		if (!this.element) return;
		this.element.textContent = message;
		this.element.classList.remove('error', 'success', 'info');
		this.element.classList.add(type);
		if (type === 'error') {
		  this.element.style.animation = 'none';
		  this.element.offsetHeight;
		  this.element.style.animation = null;
		}
	  }
	  showWinner(winner) {
		let msg;
		if (winner === 'player') msg = t('youWon');
		else if (typeof winner === 'number') msg = t('enemyWon', winner);
		else msg = t('enemyWon', winner);
		this.updateState(msg, 'success');
	  }
	}
  
	// --- GameManager (sounds + animations) ---
	class GameManager {
	  constructor() {
		this.sounds = {
		  deal: new Audio('sounds/deal.mp3'),
		  place: new Audio('sounds/place.wav'),
		  error: new Audio('sounds/error.wav'),
		  win: new Audio('sounds/win.wav')
		};
		window.gameManager = this;
		document.dispatchEvent(new Event('gameManagerReady'));
		Object.values(this.sounds).forEach(a => { try { a.volume = 0.4; } catch(e){}; a.preload = 'auto'; });
  
		const deckEl = document.getElementById('deck');
		if (deckEl) deckEl.addEventListener('click', () => { if (game && game.currentPlayerIndex === 0) game.playerDrawCard(); });
	  }
  
	  playSound(key) {
		const audio = this.sounds[key];
		if (!audio) return;
		try { audio.currentTime = 0; audio.play().catch(()=>{}); } catch(e){}
	  }
  
	  animateDeal(cardElement) {
		if (!cardElement) return;
		requestAnimationFrame(() => {
		  cardElement.classList.add('dealt');
		  setTimeout(() => cardElement.classList.remove('dealt'), 350);
		});
	  }
  
	  shakeElement(el) {
		if (!el) return;
		el.classList.add('shake');
		setTimeout(() => el.classList.remove('shake'), 500);
	  }
  
	  animateMoveToDiscard(cardElement, options = {}, callback) {
		if (!cardElement) { if (typeof callback === 'function') callback(); return; }
		const discardEl = document.getElementById('discard-pile');
		if (!discardEl) { if (typeof callback === 'function') callback(); return; }
  
		const fromRect = cardElement.getBoundingClientRect();
		const toRect = discardEl.getBoundingClientRect();
  
		const clone = cardElement.cloneNode(true);
		clone.classList.add('card-clone');
		if (options.flipDuring) clone.classList.add('flip');
  
		clone.style.position = 'fixed';
		clone.style.left = `${fromRect.left}px`;
		clone.style.top = `${fromRect.top}px`;
		clone.style.width = `${fromRect.width}px`;
		clone.style.height = `${fromRect.height}px`;
		clone.style.margin = '0';
		clone.style.zIndex = 9999;
		clone.style.opacity = '1';
  
		// ensure clone image shows face (if moving to discard, we want the image to show current card face)
		const originalImg = clone.querySelector('img.card-img');
		if (originalImg) {
		  // leave as-is: for human played card it is face-up, for AI card it may be face-down.
		  // If we want to flip during animation, we could swap src here depending on options.flipDuring
		}
  
		document.body.appendChild(clone);
		cardElement.style.visibility = 'hidden';
  
		const fromCenterX = fromRect.left + fromRect.width / 2;
		const fromCenterY = fromRect.top + fromRect.height / 2;
		const toCenterX = toRect.left + toRect.width / 2;
		const toCenterY = toRect.top + toRect.height / 2;
  
		const deltaX = toCenterX - fromCenterX;
		const deltaY = toCenterY - fromCenterY;
  
		clone.getBoundingClientRect();
  
		clone.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.9)`;
		clone.style.opacity = '0.98';
  
		let called = false;
		const done = () => {
		  if (called) return;
		  called = true;
		  clone.removeEventListener('transitionend', onEnd);
		  if (clone.parentNode) clone.parentNode.removeChild(clone);
		  if (typeof callback === 'function') callback();
		};
  
		const onEnd = () => done();
		clone.addEventListener('transitionend', onEnd);
		setTimeout(() => done(), 900);
	  }
  
	  onWin(who) {
		this.playSound('win');
		if (game && game.stateDisplay) game.stateDisplay.showWinner(who);
		setTimeout(() => location.reload(), 2000);
	  }
	}
  
	// --- Game ---
	class Game {
	  constructor() {
		this.deck = new Deck();
		this.discardPile = new DiscardPile();
  
		this.players = [
		  new Player(this.discardPile, false, 0),
		  new Player(this.discardPile, true, 1),
		  new Player(this.discardPile, true, 2),
		  new Player(this.discardPile, true, 3)
		];
  
		this.currentPlayerIndex = 0;
		this.stateDisplay = new GameStateDisplay('game-state');
  
		this.init();
	  }
  
	  init() {
		// deal: 4 rounds
		for (let i = 0; i < 4; i++) {
		  for (const player of this.players) {
			const c = this.deck.drawCard();
			if (c) player.addCard(c);
		  }
		}
  
		const firstCard = this.deck.drawCard();
		if (firstCard) {
		  firstCard.isFaceUp = true;
		  this.discardPile.discard(firstCard);
		}
  
		this.updateTurnIndicator();
	  }
  
	  playerDrawCard() {
		if (this.currentPlayerIndex !== 0) return;
		const player = this.players[0];
		const card = this.deck.drawCard();
		if (card) player.addCard(card);
		this.endTurn();
	  }
  
	  enemyTurn() {
		const player = this.players[this.currentPlayerIndex];
		const topCard = this.discardPile.card;
		const playableCard = player.hand.find(card => topCard && (card.suit === topCard.suit || card.value === topCard.value));
  
		if (playableCard) {
		  const handId = `enemy${player.playerIndex}-hand`;
		  const cardIndex = player.hand.indexOf(playableCard);
		  const cardElement = document.querySelector(`#${handId} .card:nth-child(${cardIndex + 1})`);
		  player.playCard(playableCard, cardElement);
		} else {
		  const card = this.deck.drawCard();
		  if (card) player.addCard(card);
		  this.endTurn();
		}
	  }
  
	  endTurn() {
		this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
		this.updateTurnIndicator();
		if (this.currentPlayerIndex !== 0) {
		  setTimeout(() => this.enemyTurn(), 1000);
		}
	  }
  
	  updateTurnIndicator() {
		const currentPlayer = this.players[this.currentPlayerIndex];
		if (currentPlayer.isAI) this.stateDisplay.updateState(t('enemyTurn', this.currentPlayerIndex));
		else this.stateDisplay.updateState(t('playerTurn'));
	  }
	}
  
	// --- Init and UI wiring ---
	let gameManager;
	let game;
	let deckType = 'standard';
  
	const introScreen = document.getElementById('intro-screen');
	const introLangSelect = document.getElementById('intro-lang-select');
	const introDeckSelect = document.getElementById('intro-deck-select');
	const startBtn = document.getElementById('intro-start-game');
	const exitBtn = document.getElementById('exit-game');
  
	function showIntro() {
	  if (introScreen) introScreen.style.display = 'block';
	  if (exitBtn) exitBtn.style.display = 'none';
	  const gameContainers = document.querySelectorAll('.game-container, #discard-pile, #player-hand, #enemy1-hand, #enemy2-hand, #enemy3-hand, #game-state');
	  gameContainers.forEach(el => el.innerHTML = '');
	}
  
	function showGame() {
	  if (introScreen) introScreen.style.display = 'none';
	  if (exitBtn) exitBtn.style.display = 'inline-block';
	}
  
	if (startBtn) {
	  startBtn.addEventListener('click', () => {
		if (introLangSelect) currentLang = introLangSelect.value || currentLang;
		if (introDeckSelect) deckType = introDeckSelect.value || deckType;
		showGame();
		gameManager = new GameManager();
		game = new Game();
	  });
	}
  
	if (exitBtn) {
	  exitBtn.addEventListener('click', () => {
		game = null;
		gameManager = null;
		showIntro();
	  });
	}
  
	showIntro();
  
  });
  