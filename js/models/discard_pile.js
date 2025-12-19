// Discard Pile model

export class DiscardPile {
  constructor() {
    this.card = null; // Current top card
    this.previousCards = []; // Stack of older cards
    this._element = null;
  }

  setElement(element) {
    this._element = element;
  }

  discard(card) {
    if (this.card) {
      this.previousCards.push(this.card);
    }
    
    this.card = card;
    card.isFaceUp = true;
    this.render();
  }

  render() {
    if (!this._element) {
      this._element = document.getElementById('discard-pile');
    }
    
    if (!this._element) return;

    this._element.innerHTML = '';

    if (this.card) {
      const cardElement = this.card.createElement();
      this.card.isFaceUp = true;
      this.card.updateDisplay();
      this._element.appendChild(cardElement);
    }
  }

  clear() {
    this.card = null;
    this.previousCards = [];
    this.render();
  }

  get topCard() {
    return this.card;
  }
}

