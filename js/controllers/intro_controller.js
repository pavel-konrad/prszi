// Intro screen controller
import { BaseController } from './base_controller.js';
import { translationService } from '../services/translation_service.js';

export class IntroController extends BaseController {
  static targets = ["screen", "langSelect", "deckSelect"];

  connect() {
    super.connect();
    this.showIntro();
  }

  showIntro() {
    if (this.hasScreenTarget) {
      this.screenTarget.style.display = 'block';
    }
    
    const exitBtn = this.$global('#exit-game');
    if (exitBtn) exitBtn.style.display = 'none';
    
    this.clearGameAreas();
  }

  // Called by game:ended event - renamed to avoid conflict with BaseController.show()
  showScreen() {
    this.showIntro();
  }

  hideIntro() {
    if (this.hasScreenTarget) {
      this.screenTarget.style.display = 'none';
    }
    
    const exitBtn = this.$global('#exit-game');
    if (exitBtn) exitBtn.style.display = 'inline-block';
  }

  clearGameAreas() {
    const areas = document.querySelectorAll(
      '#discard-pile, #player-hand, #enemy1-hand, #enemy2-hand, #enemy3-hand, #game-state'
    );
    areas.forEach(el => el.innerHTML = '');
  }

  start() {
    const lang = this.hasLangSelectTarget ? this.langSelectTarget.value : 'en';
    const deckType = this.hasDeckSelectTarget ? this.deckSelectTarget.value : 'standard';
    
    translationService.setLanguage(lang);
    
    this.hideIntro();
    
    this.emit('started', { lang, deckType });
  }
}
