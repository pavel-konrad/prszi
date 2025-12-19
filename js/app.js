// Main application entry point
import { Application } from "https://unpkg.com/@hotwired/stimulus/dist/stimulus.js";

// Import controllers
import { IntroController } from './controllers/intro_controller.js';
import { SettingsController } from './controllers/settings_controller.js';
import { GameController } from './controllers/game_controller.js';

// Start Stimulus application
const application = Application.start();

// Configure Stimulus development experience
application.debug = false;

// Register controllers
application.register('intro', IntroController);
application.register('settings', SettingsController);
application.register('game', GameController);

console.log('🃏 Prší game initialized with Stimulus');

