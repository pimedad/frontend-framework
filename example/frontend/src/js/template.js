"use strict";

// Helper for escaping HTML special characters to prevent XSS. https://owasp.org/www-community/attacks/xss/
const htmlEscapes = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;", "`": "&#x60;" };
const reUnescapedHtml = /[&<>"'`]/g;
const escapeHtmlChar = (chr) => htmlEscapes[chr];
const escape = (str) => {
    const stringToEscape = str === null || str === undefined ? '' : String(str);
    return reUnescapedHtml.test(stringToEscape) ? stringToEscape.replace(reUnescapedHtml, escapeHtmlChar) : stringToEscape;
};

/**
 * Generates the HTML for a single task item.
 * @param {object} item - The task item object (must have id, title, completed).
 * @returns {string} HTML string for one <li> element.
 */
const createListItem = ({ id, title, completed }) => `
<li data-id="${id}" class="${completed ? 'completed' : ''}">
    <div class="view">
        <input class="toggle" type="checkbox" ${completed ? 'checked' : ''}>
        <label>${escape(title)}</label> <button class="destroy"></button>
    </div>
    <input class="edit"> </li>
`;

/**
 * Responsible for generating HTML strings for different parts of the UI.
 */
class Template {
    /**
     * Generates HTML for a list of task items.
     * @param {Array<object>} items - Array of task item objects.
     * @returns {string} HTML string for all <li> elements, joined together.
     */
    show(items) {
        if (!Array.isArray(items)) {
            console.error("Template.show expects an array, received:", items);
            return "";
        }
        return items.map(item => createListItem(item)).join('');
    }

    /**
     * Generates HTML for the "items left" counter.
     * @param {number} activeCount - The number of active (incomplete) tasks.
     * @returns {string} HTML string for the counter.
     */
    itemCounter(activeCount) {
        const plural = activeCount === 1 ? "" : "s";
        return `<strong>${activeCount}</strong> task${plural} left`;
    }

    /**
     * Generates the text for the "Clear completed" button.
     * Shows the count of completed items if any exist.
     * @param {number} completedCount - The number of completed tasks.
     * @returns {string} Text for the button, or empty if no tasks are completed.
     */
    clearCompletedButton(completedCount) {
        return completedCount > 0 ? `Clear completed (${completedCount})` : "";
    }
}

export default Template;