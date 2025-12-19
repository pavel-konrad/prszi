// Base controller with common functionality
import { Controller } from "https://unpkg.com/@hotwired/stimulus/dist/stimulus.js";

export class BaseController extends Controller {
  // Common DOM helpers
  show(element) {
    if (element) element.style.display = 'block';
  }

  hide(element) {
    if (element) element.style.display = 'none';
  }

  toggle(element, visible) {
    if (element) {
      element.style.display = visible ? 'block' : 'none';
    }
  }

  addClass(element, className) {
    if (element) element.classList.add(className);
  }

  removeClass(element, className) {
    if (element) element.classList.remove(className);
  }

  toggleClass(element, className, force) {
    if (element) element.classList.toggle(className, force);
  }

  // Query helpers
  $(selector) {
    return this.element.querySelector(selector);
  }

  $$(selector) {
    return this.element.querySelectorAll(selector);
  }

  // Global query (outside controller scope)
  $global(selector) {
    return document.querySelector(selector);
  }

  // Event dispatch helper
  emit(eventName, detail = {}) {
    this.dispatch(eventName, { detail });
  }

  // Logging helper
  log(...args) {
    console.log(`[${this.identifier}]`, ...args);
  }

  // Lifecycle hooks for subclasses
  initialize() {
    // Called once when controller is first instantiated
  }

  connect() {
    // Called each time controller is connected to DOM
    super.connect && super.connect();
  }

  disconnect() {
    // Called when controller is disconnected from DOM
    super.disconnect && super.disconnect();
  }
}

