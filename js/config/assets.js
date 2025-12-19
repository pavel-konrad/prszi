// Asset configuration
export const ASSET_BASE = 'assets/classic/';
export const CARD_BACK = `${ASSET_BASE}back.png`;

export const SOUNDS = {
  deal: 'sounds/deal.mp3',
  place: 'sounds/place.wav',
  error: 'sounds/error.wav',
  win: 'sounds/win.wav'
};

export const SUITS = ['♥', '♦', '♠', '♣'];
export const VALUES = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

// Deck configurations
export const DECK_CONFIGS = {
  standard: {
    suits: SUITS,
    values: VALUES
  },
  custom: {
    suits: ['♠'],
    values: ['10', 'J', 'Q', 'K', 'A']
  }
};

