import '../assets/app.css';
import View from "./view.js";
import Controller from "./controller.js";
import Model from "./model.js";
import Store from "./store.js";
import Template from "./template.js";

let appInstance; // Holds the single instance of our application.

/**
 * Handles URL hash changes (e.g., switching between #/, #/active, #/completed).
 * Tells the controller to update the view based on the new route.
 */
const onHashChange = () => {
    if (appInstance && appInstance.controller) {
        appInstance.controller.setView(document.location.hash);
    } else {
        console.error("App instance or controller not initialized for onHashChange");
    }
};

/**
 * Initializes the application when the page has fully loaded.
 * Creates the main App object and sets the initial view based on the current URL hash.
 */
const onLoad = () => {
    appInstance = new App("blind-todo-app-storage");
    onHashChange();
};

/**
 * Main application constructor.
 * Sets up the core components: Store, Model, Template, View, and Controller.
 * @param {string} name - The unique name for the data store (e.g., for localStorage).
 */
function App(name) {
    this.storage = new Store(name);
    this.model = new Model(this.storage);
    this.template = new Template();
    this.view = new View(this.template);
    this.controller = new Controller(this.model, this.view);
}

// Start the app when the page loads.
window.addEventListener("load", onLoad);
// Update the view when the URL hash changes.
window.addEventListener("hashchange", onHashChange);