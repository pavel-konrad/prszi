# Prší – Card Game Prototype

https://pavel-konrad.github.io/prszi/

This repository contains a school project from 2024, developed in collaboration with students of the Graphic Art School Hellichova in Prague.

The goal was to demonstrate how 2D assets can be prepared by graphic artists and implemented into a working web game.

---

## Project Description

The project was organized as a year-long collaboration between two classes:

**Computer Graphics students (Adobe Illustrator)**
- Designed 32 unique playing cards
- Focus on readability of typography, consistent color palette, and individual stylization
- Assets were exported on 32 artboards with consistent naming conventions
- Some students prepared both RGB (for web) and CMYK (for print) versions

**Digital Media Design students (Programming / OOP principles)**
- Implemented the card game logic using object-oriented programming
- The Card class served as an example of inheritance and polymorphism
- The game logic brought the graphic assets to life

---

## Features

- 32 custom designed playing cards by art students
- Implementation of OOP principles (inheritance, polymorphism)
- Basic animations and sounds for an interactive experience
- Demonstrates the asset pipeline: from Illustrator → export → integration into a web environment

---

## Changelog

### v2.0.0 (2025)
**Major refactor: Stimulus.js + OOP Architecture**

- Migrated from monolithic `script.js` to modular ES6 architecture
- Added Stimulus.js framework for controller-based DOM interaction
- Implemented Factory Pattern for card and player instantiation
- Created class hierarchies with inheritance and polymorphism:
  - `BaseCard` → `RegularCard`, `SevenCard`, `AceCard`, `QueenCard`
  - `BasePlayer` → `HumanPlayer`, `AIPlayer`
- Extracted services: `SoundService`, `AnimationService`, `TranslationService`
- Added special card effects (7 = draw 2, A = skip, Q = change suit)
- Centralized asset configuration in `config/assets.js`

### v1.0.0 (2024)
**Initial release**

- Basic card game implementation
- Single-file JavaScript architecture
- Integration of student-designed card assets
- Simple sound effects and animations

---

## Purpose

This project is a simple card game prototype created as a showcase for an asset pack designed by students.

It serves as both a presentation of their work and as an example of how graphic assets can be brought into a small game project.

---

# Technical Documentation

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                  app.js                                      │
│                         Stimulus Application Entry                           │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        ▼                             ▼                             ▼
┌───────────────┐           ┌───────────────┐           ┌───────────────┐
│    Intro      │  events   │     Game      │  events   │   Settings    │
│  Controller   │◄─────────►│  Controller   │◄─────────►│  Controller   │
└───────────────┘           └───────┬───────┘           └───────────────┘
                                    │
                                    │ creates
                                    ▼
                            ┌───────────────┐
                            │     Game      │
                            │    (Model)    │
                            └───────┬───────┘
                                    │
           ┌────────────────────────┼────────────────────────┐
           ▼                        ▼                        ▼
    ┌─────────────┐          ┌─────────────┐          ┌─────────────┐
    │    Deck     │          │DiscardPile  │          │  Players[]  │
    │             │          │             │          │             │
    │ CardFactory │          │             │          │PlayerFactory│
    └─────────────┘          └─────────────┘          └─────────────┘
           │                                                 │
           ▼                                                 ▼
    ┌─────────────┐                                   ┌─────────────┐
    │   Cards     │                                   │  BasePlayer │
    │  Hierarchy  │                                   │  Hierarchy  │
    └─────────────┘                                   └─────────────┘
```

---

## 2. Factory Pattern

### 2.1 CardFactory

Centralizes card instantiation logic. Deck doesn't know about specific card types.

```javascript
// models/cards/card_factory.js
export class CardFactory {
  static create(suit, value) {
    switch (value) {
      case '7': return new SevenCard(suit);    // Draws 2
      case 'A': return new AceCard(suit);      // Skips turn
      case 'Q': return new QueenCard(suit);    // Changes suit
      default:  return new RegularCard(suit, value);
    }
  }

  static createDeck(suits, values) {
    return suits.flatMap(suit => 
      values.map(value => CardFactory.create(suit, value))
    );
  }
}
```

**Usage in Deck:**
```javascript
// models/deck.js
loadCards() {
  const config = DECK_CONFIGS[this.deckType];
  this.cards = CardFactory.createDeck(config.suits, config.values);
}
```

### 2.2 PlayerFactory

```javascript
// models/players/player_factory.js
export class PlayerFactory {
  static create(options) {
    return options.isAI 
      ? new AIPlayer(options) 
      : new HumanPlayer(options);
  }

  static createPlayers(count, discardPile, game) {
    const players = [];
    players.push(PlayerFactory.create({ isAI: false, playerIndex: 0, discardPile, game }));
    
    for (let i = 1; i < count; i++) {
      players.push(PlayerFactory.create({ 
        isAI: true, 
        playerIndex: i, 
        discardPile, 
        game,
        thinkingDelay: 800 + Math.random() * 400
      }));
    }
    return players;
  }
}
```

---

## 3. Card Class Hierarchy

```
BaseCard (abstract)
│
│  Properties: suit, value, isFaceUp, _element
│  Methods:    createElement(), updateDisplay(), flip(), canPlayOn(), onPlay()
│
├── RegularCard
│     No overrides - inherits default behavior
│
├── SevenCard
│     OVERRIDES:
│     - get isSpecial() -> true
│     - canPlayOn(top) -> 7 on 7 always valid, else super.canPlayOn()
│     - onPlay(game) -> game.sevenStack += 2; game.pendingSevens = true
│
├── AceCard
│     OVERRIDES:
│     - get isSpecial() -> true
│     - onPlay(game) -> game.skipNextPlayer = true
│
└── QueenCard
      OVERRIDES:
      - get isSpecial() -> true
      - canPlayOn() -> always true (can play on anything)
      - onPlay(game, player) -> prompts suit selection, sets game.forcedSuit
```

### 3.1 Polymorphic Dispatch

```javascript
// Game doesn't know card types - polymorphism handles behavior
async executeCardPlay(card) {
  this.discardPile.discard(card);
  await card.onPlay(this, player);  // Each card type executes its own logic
  this.endTurn();
}
```

---

## 4. Player Class Hierarchy

```
BasePlayer (abstract)
│
│  Properties: hand[], playerIndex, discardPile, game
│  Methods:    addCard(), executeCardPlay(), findPlayableCards(), drawCard()
│  Abstract:   get isAI(), get handElementId(), takeTurn()
│
├── HumanPlayer
│     - isAI -> false
│     - handElementId -> 'player-hand'
│     - takeTurn() -> Returns Promise, resolved on card click
│     - onCardAdded() -> Attaches click listener
│
└── AIPlayer
      - isAI -> true
      - handElementId -> 'enemy{index}-hand'
      - takeTurn() -> Auto-selects best card, executes with delay
      - chooseBestCard() -> Strategy: save special cards, play defensively
```

### 4.1 Template Method Pattern

```javascript
// base_player.js - defines skeleton
addCard(card) {
  card.isFaceUp = !this.isAI;
  this.hand.push(card);
  const element = card.createElement();
  this.handElement.appendChild(element);
  
  this.onCardAdded(card, element);  // Hook for subclasses
}

onCardAdded(card, element) { }  // Default: nothing

// human_player.js - fills in the hook
onCardAdded(card, element) {
  element.addEventListener('click', () => this.onCardClicked(card));
}
```

---

## 5. Translation Service

Singleton service with function interpolation support.

```javascript
// services/translation_service.js
const TRANSLATIONS = {
  en: {
    playerTurn: "It's your turn.",
    enemyTurn: (index) => `Player ${index} is on turn.`,
    mustPlaySuit: (suit) => `Must play ${suit}`,
  },
  cs: {
    playerTurn: "Jsi na tahu.",
    enemyTurn: (index) => `Hráč ${index} je na tahu.`,
    mustPlaySuit: (suit) => `Musíš hrát ${suit}`,
  }
};

class TranslationService {
  constructor() { this.currentLang = 'en'; }

  t(key, ...args) {
    const entry = TRANSLATIONS[this.currentLang][key];
    return typeof entry === 'function' ? entry(...args) : entry || key;
  }
}

export const translationService = new TranslationService();
export const t = (key, ...args) => translationService.t(key, ...args);
```

---

## 6. Asset Configuration

Centralized in `config/assets.js`:

```javascript
export const ASSET_BASE = 'assets/classic/';
export const CARD_BACK = `${ASSET_BASE}back.png`;

export const SUITS = ['♥', '♦', '♠', '♣'];
export const VALUES = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export const DECK_CONFIGS = {
  standard: { suits: SUITS, values: VALUES },
  custom:   { suits: ['♠'], values: ['10', 'J', 'Q', 'K', 'A'] }
};

export const SOUNDS = {
  deal:  'sounds/deal.mp3',
  place: 'sounds/place.wav',
  error: 'sounds/error.wav',
  win:   'sounds/win.wav'
};
```

### 6.1 Card Asset Path Resolution

```javascript
// models/cards/base_card.js
const SUIT_NAMES = { '♥': 'hearts', '♦': 'diamonds', '♠': 'spades', '♣': 'clubs' };

get assetPath() {
  return `${ASSET_BASE}${SUIT_NAMES[this.suit]}_${this.value}.png`;
  // -> "assets/classic/hearts_7.png"
}
```

---

## 7. Sound Service

Lazy-loaded singleton with volume/mute controls.

```javascript
// services/sound_service.js
class SoundService {
  constructor() {
    this.sounds = {};
    this.volume = 0.4;
    this.muted = false;
    this._loaded = false;
  }

  load() {
    if (this._loaded) return;
    for (const [key, path] of Object.entries(SOUNDS)) {
      const audio = new Audio(path);
      audio.preload = 'auto';
      audio.volume = this.volume;
      this.sounds[key] = audio;
    }
    this._loaded = true;
  }

  play(key) {
    const audio = this.sounds[key];
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }

  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, value));
    this._applyVolume();
  }
}

export const soundService = new SoundService();
```

---

## 8. Stimulus Controllers

### 8.1 Event Flow

```html
<body data-controller="intro game settings"
      data-action="intro:started->game#start game:ended->intro#show">
```

```
User clicks "Start Game"
        │
        ▼
IntroController.start()
        │
        │ dispatches 'intro:started' event
        ▼
GameController.start()  <-- data-action="intro:started->game#start"
        │
        │ creates Game model, game runs...
        ▼
Game.onWin() dispatches 'game:ended'
        │
        ▼
IntroController.show()  <-- data-action="game:ended->intro#show"
```

### 8.2 BaseController

```javascript
// controllers/base_controller.js
export class BaseController extends Controller {
  show(el)  { if (el) el.style.display = 'block'; }
  hide(el)  { if (el) el.style.display = 'none'; }
  
  $(selector)       { return this.element.querySelector(selector); }
  $global(selector) { return document.querySelector(selector); }
  
  emit(eventName, detail = {}) {
    this.dispatch(eventName, { detail });
  }
}
```

---

## 9. Game Loop

```javascript
// models/game.js
start() {
  // Deal 4 cards to each player
  for (let round = 0; round < 4; round++) {
    for (const player of this.players) {
      player.addCard(this.deck.draw());
    }
  }
  
  // First card to discard (re-draw if special)
  let first = this.deck.draw();
  while (first.isSpecial) {
    this.deck.cards.unshift(first);
    this.deck.shuffle();
    first = this.deck.draw();
  }
  this.discardPile.discard(first);
  
  this.updateTurnIndicator();
  if (this.currentPlayer.isAI) {
    setTimeout(() => this.executeTurn(), 1000);
  }
}

async executeTurn() {
  await this.currentPlayer.takeTurn();  // Polymorphic
}

endTurn() {
  if (this.skipNextPlayer) {
    this.skipNextPlayer = false;
    this.currentPlayerIndex = (this.currentPlayerIndex + 2) % this.players.length;
  } else {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
  }
  
  if (this.currentPlayer.isAI) {
    setTimeout(() => this.executeTurn(), 500);
  }
}
```

---

## 10. File Structure

```
js/
├── app.js                           # Stimulus init, controller registration
├── config/
│   └── assets.js                    # Paths, suits, values, sounds
├── controllers/
│   ├── base_controller.js           # Shared utilities
│   ├── game_controller.js           # Game lifecycle
│   ├── intro_controller.js          # Start screen
│   └── settings_controller.js       # Volume, mute
├── models/
│   ├── cards/
│   │   ├── base_card.js             # Abstract card
│   │   ├── regular_card.js          # 8, 9, 10, J, K
│   │   ├── seven_card.js            # Draw 2 effect
│   │   ├── ace_card.js              # Skip effect
│   │   ├── queen_card.js            # Change suit effect
│   │   └── card_factory.js          # Factory + re-exports
│   ├── players/
│   │   ├── base_player.js           # Abstract player
│   │   ├── human_player.js          # Click-based input
│   │   ├── ai_player.js             # Auto-play logic
│   │   └── player_factory.js        # Factory + re-exports
│   ├── deck.js                      # Card stack, shuffle, draw
│   ├── discard_pile.js              # Played cards
│   └── game.js                      # Orchestration
└── services/
    ├── animation_service.js         # Deal, shake, move animations
    ├── sound_service.js             # Audio playback
    └── translation_service.js       # i18n
```

---

## 11. Running

No build step. ES modules loaded directly via `<script type="module">`.

```bash
npx serve .
# or just open index.html
```

Stimulus loaded from CDN:
```javascript
import { Application } from "https://unpkg.com/@hotwired/stimulus/dist/stimulus.js";
```
