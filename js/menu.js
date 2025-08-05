// menu.js
document.addEventListener('DOMContentLoaded', () => {
	// UI elements (guardované - pokud chybí, nic se nestane)
	const settingsButton = document.getElementById('settings-button');
	const settingsOverlay = document.getElementById('settings-overlay');
	const closeSettingsButton = document.getElementById('close-settings');
	const languageSelect = document.getElementById('language-select');
	const volumeRange = document.getElementById('volume-range');
	const muteToggle = document.getElementById('mute-toggle');
  
	// state variables
	let muted = false;
	let volume = 0.3; // last non-zero volume value
  
	// Helper: set actual audio volume for a single audio-like object
	function setAudioVolume(audioObj, value) {
	  try {
		if (!audioObj) return;
		// Howler.js (Howl) - uses .volume(value)
		if (typeof audioObj.volume === 'function') {
		  audioObj.volume(value);
		  return;
		}
		// some libs use setVolume
		if (typeof audioObj.setVolume === 'function') {
		  audioObj.setVolume(value);
		  return;
		}
		// HTMLAudioElement: .volume is a number property (0..1)
		if (typeof audioObj.volume === 'number') {
		  audioObj.volume = value;
		  return;
		}
		// fallback: if object has gain node or similar - try .gain.value
		if (audioObj.gain && typeof audioObj.gain.value !== 'undefined') {
		  audioObj.gain.value = value;
		  return;
		}
		// nothing matched - ignore
	  } catch (err) {
		// ignore individual audio errors
		// console.debug('setAudioVolume error', err);
	  }
	}
  
	// Apply volume to all known sounds (if gameManager exists)
	function applyVolume() {
	  const gm = window.gameManager;
	  if (!gm || !gm.sounds) return;
	  const value = muted ? 0 : volume;
	  Object.values(gm.sounds).forEach(sound => setAudioVolume(sound, value));
	}
  
	function updateMuteButton() {
	  if (!muteToggle) return;
	  muteToggle.textContent = muted ? 'Unmute' : 'Mute';
	}
  
	function setVolume(val) {
	  // keep last non-zero volume
	  const v = Math.min(Math.max(Number(val) || 0, 0), 1);
	  if (v > 0) volume = v;
	  muted = (v === 0);
	  // reflect slider if present
	  if (volumeRange) volumeRange.value = muted ? 0 : volume;
	  applyVolume();
	  updateMuteButton();
	}
  
	function toggleMute() {
	  muted = !muted;
	  // restore slider to last volume (or 0)
	  if (volumeRange) volumeRange.value = muted ? 0 : volume;
	  applyVolume();
	  updateMuteButton();
	}
  
	// Event handlers - guarded (elements may be missing)
	if (settingsButton) {
	  settingsButton.addEventListener('click', () => {
		if (!settingsOverlay) return;
		settingsOverlay.classList.remove('hidden');
  
		// set current values (guard elements)
		if (languageSelect && typeof window.currentLang !== 'undefined') {
		  languageSelect.value = window.currentLang;
		}
		if (volumeRange) volumeRange.value = muted ? 0 : volume;
		updateMuteButton();
	  });
	}
  
	if (closeSettingsButton) {
	  closeSettingsButton.addEventListener('click', () => {
		if (!settingsOverlay) return;
		settingsOverlay.classList.add('hidden');
	  });
	}
  
	if (languageSelect) {
	  languageSelect.addEventListener('change', (e) => {
		// keep original behavior: set global currentLang
		window.currentLang = e.target.value;
		if (window.game && typeof window.game.updateTurnIndicator === 'function') {
		  window.game.updateTurnIndicator();
		}
	  });
	}
  
	if (volumeRange) {
	  volumeRange.addEventListener('input', (e) => {
		setVolume(parseFloat(e.target.value));
	  });
	}
  
	if (muteToggle) {
	  muteToggle.addEventListener('click', () => {
		toggleMute();
	  });
	}
  
	// If GameManager is created later, we want to apply volume as soon as it's ready.
	// The GameManager constructor should set window.gameManager = this and dispatch 'gameManagerReady'
	function onGameManagerReady() {
	  applyVolume();
	  updateMuteButton();
	}
  
	// Hook both the custom event and check window immediately
	document.addEventListener('gameManagerReady', onGameManagerReady);
	// Also try once in case it already exists
	if (window.gameManager) onGameManagerReady();
  
	// initialize UI state
	updateMuteButton();
  });
  