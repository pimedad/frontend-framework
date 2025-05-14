import { qs, qsa, $on, $parent, $delegate } from "./helpers.js";

const ENTER_KEY = 13;
const ESCAPE_KEY = 27;

/** (Private) Sets the visual style for the active filter link. */
const _setFilter = (currentPage) => {
    qs(".filters .selected")?.classList.remove("selected");
    qs(`.filters [href="#/${currentPage}"]`)?.classList.add("selected");
    if (!qs(".filters .selected")) { // Fallback if specific filter link not found
        qs(`.filters [href="#/"]`)?.classList.add("selected");
    }
};

/** (Private) Updates a task item's visual completed state. */
const _elementComplete = (id, completed) => {
    const listItem = qs(`[data-id="${id}"]`);
    if (!listItem) return;
    listItem.className = completed ? "completed" : "";
    qs("input.toggle", listItem).checked = completed;
};

/** (Private) Switches a task item to editing mode. */
const _editItem = (id, title) => {
    const listItem = qs(`[data-id="${id}"]`);
    if (!listItem) return;
    listItem.classList.add("editing");
    const input = qs("input.edit", listItem);
    input.value = title;
    input.focus();
};

/** (Private) Finishes editing a task item. */
const _editItemDone = (id, title) => {
    const listItem = qs(`[data-id="${id}"]`);
    if (!listItem) return;
    listItem.classList.remove("editing");
    qs("label", listItem).textContent = title;
    qs("input.edit", listItem).removeAttribute('data-iscanceled');
};

/** (Private) Gets a task item's ID from one of its child elements. */
const _itemId = (element) => parseInt($parent(element, "li")?.dataset.id, 10) || null;

/** (Private) Removes a task item's DOM element. */
const _removeItem = (id) => qs(`[data-id="${id}"]`)?.remove();

/**
 * Manages the UI: rendering data and binding user interactions.
 */
export default class View {
    /** @param {Template} template - Instance for generating HTML. */
    constructor(template) {
        this.template = template;
        this.$list = qs(".todo-list");
        this.$itemCounter = qs(".todo-count");
        this.$clearCompleted = qs(".clear-completed");
        this.$main = qs(".main");
        this.$footer = qs(".footer");
        this.$toggleAllCheckbox = qs(".toggle-all");
        this.$newItemInput = qs(".new-todo");

        // Bind 'this' for methods that might be called as callbacks or detached.
        this.render = this.render.bind(this);
        this.bindCallback = this.bindCallback.bind(this);
    }

    /** (Private) Updates the "Clear completed" button. */
    _updateClearCompletedButton(completedCount, visible) {
        if (this.$clearCompleted) {
            this.$clearCompleted.innerHTML = this.template.clearCompletedButton(completedCount);
            this.$clearCompleted.style.display = visible ? "block" : "none";
        }
    }

    /** Renders UI changes based on commands. */
    render(viewCmd, parameter) {
        switch (viewCmd) {
            case "showEntries":
                if (this.$list) this.$list.innerHTML = this.template.show(parameter);
                break;
            case "updateItemCount":
                if (this.$itemCounter) this.$itemCounter.innerHTML = this.template.itemCounter(parameter);
                break;
            case "contentBlockVisibility":
                const display = parameter.visible ? "block" : "none";
                if (this.$main) this.$main.style.display = display;
                if (this.$footer) this.$footer.style.display = display;
                break;
            case "toggleAll":
                if (this.$toggleAllCheckbox) this.$toggleAllCheckbox.checked = parameter.checked;
                break;
            case "clearNewItemInput":
                if (this.$newItemInput) this.$newItemInput.value = "";
                break;
            case "removeItem":
                _removeItem(parameter); // Parameter is ID.
                break;
            case "setFilter":
                _setFilter(parameter); // Parameter is current page.
                break;
            case "elementComplete":
                _elementComplete(parameter.id, parameter.completed);
                break;
            case "editItem":
                _editItem(parameter.id, parameter.title);
                break;
            case "editItemDone":
                _editItemDone(parameter.id, parameter.title);
                break;
            case "clearCompletedButton":
                this._updateClearCompletedButton(parameter.completed, parameter.visible);
                break;
            default:
                console.warn("View.render: Unknown command:", viewCmd);
        }
    }

    /** Binds UI events to Controller handlers. */
    bindCallback(event, handler) {
        switch (event) {
            case "newItem": // Add new task on input 'change' (blur after edit).
                if (this.$newItemInput) {
                    $on(this.$newItemInput, "change", () => handler(this.$newItemInput.value));
                    // For immediate add on Enter, keeping keypress:
                    $on(this.$newItemInput, "keypress", (e) => {
                        if (e.key === 'Enter' || e.keyCode === ENTER_KEY) {
                            e.preventDefault();
                            handler(this.$newItemInput.value); // Controller's addItem handles guard & trim
                        }
                    });
                }
                break;
            case "removeCompleted":
                if (this.$clearCompleted) $on(this.$clearCompleted, "click", handler);
                break;
            case "toggleAll":
                if (this.$toggleAllCheckbox) $on(this.$toggleAllCheckbox, "change", (e) => handler({ completed: e.target.checked }));
                break;
            case "itemEdit":
                if (this.$list) $delegate(this.$list, "li label", "dblclick", (e) => {
                    const id = _itemId(e.target);
                    if (id !== null) handler({ id });
                });
                break;
            case "itemRemove":
                if (this.$list) $delegate(this.$list, ".destroy", "click", (e) => {
                    const id = _itemId(e.target);
                    if (id !== null) handler({ id });
                });
                break;
            case "itemToggle":
                if (this.$list) $delegate(this.$list, "li .toggle", "click", (e) => {
                    const id = _itemId(e.target);
                    if (id !== null) handler({ id: id, completed: e.target.checked });
                });
                break;
            case "itemEditDone":
                if (this.$list) {
                    $delegate(this.$list, "li .edit", "blur", (e) => {
                        if (!e.target.dataset.iscanceled) {
                            const id = _itemId(e.target);
                            if (id !== null) handler({ id: id, title: e.target.value.trim() });
                        }
                        e.target.removeAttribute('data-iscanceled');
                    });
                    $delegate(this.$list, "li .edit", "keypress", (e) => {
                        if (e.key === 'Enter' || e.keyCode === ENTER_KEY) e.target.blur();
                    });
                }
                break;
            case "itemEditCancel":
                if (this.$list) $delegate(this.$list, "li .edit", "keyup", (e) => {
                    if (e.key === 'Escape' || e.keyCode === ESCAPE_KEY) {
                        const id = _itemId(e.target);
                        if (id !== null) {
                            e.target.dataset.iscanceled = true;
                            e.target.blur();
                            handler({ id: id });
                        }
                    }
                });
                break;
        }
    }
}