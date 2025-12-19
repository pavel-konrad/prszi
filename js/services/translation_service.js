// Translation service with special card messages
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
    loading: "Loading...",
    // Special card messages
    mustPlaySuit: (suit) => `Must play ${suit}`,
    mustPlaySevenOrDraw: "Play 7 or draw cards",
    playerSkipped: (index) => `Player ${index} was skipped!`,
    chooseSuit: "Choose a suit"
  },
  cs: {
    playerTurn: "Jsi na tahu.",
    enemyTurn: (index) => `Hráč ${index} je na tahu.`,
    cannotPlayCard: "Tuto kartu nemůžeš zahrát!",
    deckEmpty: "Balíček je prázdný! Doplňuji z odhazovacího balíčku.",
    noDiscardCards: "Žádné karty v odhazovacím balíčku!",
    youWon: "Vyhrál jsi!",
    enemyWon: (index) => `Hráč ${index} vyhrál!`,
    notYourTurn: "Nejsi na tahu!",
    deckLabel: "Balíček",
    discardLabel: "Odhazovací balíček",
    loading: "Načítání...",
    // Special card messages
    mustPlaySuit: (suit) => `Musíš hrát ${suit}`,
    mustPlaySevenOrDraw: "Zahraj 7 nebo táhni",
    playerSkipped: (index) => `Hráč ${index} byl přeskočen!`,
    chooseSuit: "Vyber barvu"
  }
};

class TranslationService {
  constructor() {
    this.currentLang = 'en';
  }

  setLanguage(lang) {
    if (TRANSLATIONS[lang]) {
      this.currentLang = lang;
    }
  }

  t(key, ...args) {
    const entry = (TRANSLATIONS[this.currentLang] || TRANSLATIONS.en)[key];
    if (typeof entry === 'function') return entry(...args);
    return entry || key;
  }
}

export const translationService = new TranslationService();
export const t = (key, ...args) => translationService.t(key, ...args);
