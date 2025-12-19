// Animation service

class AnimationService {
  animateDeal(cardElement) {
    if (!cardElement) return;
    
    requestAnimationFrame(() => {
      cardElement.classList.add('dealt');
      setTimeout(() => cardElement.classList.remove('dealt'), 350);
    });
  }

  shake(element) {
    if (!element) return;
    
    element.classList.add('shake');
    setTimeout(() => element.classList.remove('shake'), 500);
  }

  moveToDiscard(cardElement, options = {}) {
    return new Promise((resolve) => {
      if (!cardElement) {
        resolve();
        return;
      }

      const discardEl = document.getElementById('discard-pile');
      if (!discardEl) {
        resolve();
        return;
      }

      const fromRect = cardElement.getBoundingClientRect();
      const toRect = discardEl.getBoundingClientRect();

      const clone = cardElement.cloneNode(true);
      clone.classList.add('card-clone');
      if (options.flipDuring) clone.classList.add('flip');

      Object.assign(clone.style, {
        position: 'fixed',
        left: `${fromRect.left}px`,
        top: `${fromRect.top}px`,
        width: `${fromRect.width}px`,
        height: `${fromRect.height}px`,
        margin: '0',
        zIndex: '9999',
        opacity: '1'
      });

      document.body.appendChild(clone);
      cardElement.style.visibility = 'hidden';

      const fromCenterX = fromRect.left + fromRect.width / 2;
      const fromCenterY = fromRect.top + fromRect.height / 2;
      const toCenterX = toRect.left + toRect.width / 2;
      const toCenterY = toRect.top + toRect.height / 2;

      const deltaX = toCenterX - fromCenterX;
      const deltaY = toCenterY - fromCenterY;

      // Force reflow
      clone.getBoundingClientRect();

      clone.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.9)`;
      clone.style.opacity = '0.98';

      let called = false;
      const done = () => {
        if (called) return;
        called = true;
        clone.removeEventListener('transitionend', onEnd);
        if (clone.parentNode) clone.parentNode.removeChild(clone);
        resolve();
      };

      const onEnd = () => done();
      clone.addEventListener('transitionend', onEnd);
      setTimeout(() => done(), 900);
    });
  }
}

export const animationService = new AnimationService();

