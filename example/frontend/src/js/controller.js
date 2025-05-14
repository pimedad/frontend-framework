/**
 * Manages the application logic, acting as an intermediary
 * between the Model (data) and the View (user interface).
 */
class Controller {
    /**
     * Initializes the Controller.
     * @param {object} model - The data management instance (Model).
     * @param {object} view - The UI management instance (View).
     */
    constructor(model, view) {
        this.model = model;
        this.view = view;

        // Connects user actions (from View) to Controller methods.
        this.view.bindCallback("newItem", (title) => this.addItem(title));
        this.view.bindCallback("itemEdit", (item) => this.editItem(item.id));
        this.view.bindCallback("itemEditDone", (item) => this.editItemSave(item.id, item.title));
        this.view.bindCallback("itemEditCancel", (item) => this.editItemCancel(item.id));
        this.view.bindCallback("itemRemove", (item) => this.removeItem(item.id));
        this.view.bindCallback("itemToggle", (item) => this.toggleComplete(item.id, item.completed));
        this.view.bindCallback("removeCompleted", () => this.removeCompletedItems());
        this.view.bindCallback("toggleAll", (status) => this.toggleAll(status.completed));
    }

    /**
     * Sets the current view based on the URL hash (e.g., all, active, completed).
     * @param {string} hash - The URL hash string.
     */
    setView(hash) {
        const route = hash.split("/")[1];
        const page = route || "";
        this._updateFilter(page);
    }

    /** Displays all task items. */
    showAll() {
        this.model.read((data) => this.view.render("showEntries", data));
    }

    /** Displays only active (incomplete) task items. */
    showActive() {
        this.model.read({ completed: false }, (data) => this.view.render("showEntries", data));
    }

    /** Displays only completed task items. */
    showCompleted() {
        this.model.read({ completed: true }, (data) => this.view.render("showEntries", data));
    }

    /**
     * Adds a new task item.
     * @param {string} title - The title of the new task.
     */
    addItem(title) {
        const trimmedTitle = title.trim();
        if (trimmedTitle === "") {
            return; // Does not allow to add empty tasks.
        }

        this.model.create(trimmedTitle, () => {
            this.view.render("clearNewItemInput"); // Clear the input field.
            this._filter(true); // Refresh the task list.
        });
    }

    /**
     * Puts a task item into editing mode.
     * @param {number} id - The ID of the item to edit.
     */
    editItem(id) {
        this.model.read(id, (data) => {
            if (!data || data.length === 0) {
                console.error(`Controller: Item with id ${id} not found for editing.`);
                return;
            }
            this.view.render("editItem", { id, title: data[0].title });
        });
    }

    /**
     * Saves changes to an edited task item.
     * @param {number} id - The ID of the item being saved.
     * @param {string} title - The new title for the item.
     */
    editItemSave(id, title) {
        const trimmedTitle = title.trim();
        if (trimmedTitle.length !== 0) {
            this.model.update(id, { title: trimmedTitle }, () => {
                this.view.render("editItemDone", { id, title: trimmedTitle });
            });
        } else {
            this.removeItem(id); // Remove item if title is empty after edit.
        }
    }

    /**
     * Cancels editing mode for a task item, reverting to its original title.
     * @param {number} id - The ID of the item to cancel editing for.
     */
    editItemCancel(id) {
        this.model.read(id, (data) => {
            if (!data || data.length === 0) {
                console.error(`Controller: Item with id ${id} not found for cancel edit.`);
                return;
            }
            this.view.render("editItemDone", { id, title: data[0].title });
        });
    }

    /**
     * Removes a task item.
     * @param {number} id - The ID of the item to remove.
     */
    removeItem(id) {
        this.model.remove(id, () => {
            this.view.render("removeItem", id);
            this._filter(); // Refresh task list and counts.
        });
    }

    /** Removes all completed task items. */
    removeCompletedItems() {
        this.model.read({ completed: true }, (data) => {
            const completedItems = data || [];
            if (completedItems.length > 0) {
                completedItems.forEach(item => {
                    // model.remove is async, but forEach doesn't wait.
                    // The _filter(true) after the loop will handle the final UI update.
                    this.model.remove(item.id, () => {
                        this.view.render("removeItem", item.id); // Remove each from view as it's confirmed by model.
                    });
                });
                this._filter(true); // Refresh list after attempting all removals.
            } else {
                this._filter(); // Still update counts if nothing was removed.
            }
        });
    }

    /**
     * Toggles the completion status of a task item.
     * @param {number} id - The ID of the item to toggle.
     * @param {boolean} completed - The new completion status.
     * @param {boolean} [silent=false] - If true, avoids re-filtering the list (used by toggleAll).
     */
    toggleComplete(id, completed, silent) {
        this.model.update(id, { completed }, () => {
            this.view.render("elementComplete", { id, completed });
        });

        if (!silent) {
            this._filter();
        }
    }

    /**
     * Toggles the completion status of all task items.
     * @param {boolean} targetCompletedState - The desired completed state for all items.
     */
    toggleAll(targetCompletedState) {
        this.model.read({ completed: !targetCompletedState }, (itemsToChange) => {
            itemsToChange = itemsToChange || [];
            if (itemsToChange.length === 0) {
                this._filter(); // Ensure UI consistency even if no items change.
                return;
            }

            let itemsProcessed = 0;
            itemsToChange.forEach(item => {
                this.model.update(item.id, { completed: targetCompletedState }, () => {
                    this.view.render("elementComplete", { id: item.id, completed: targetCompletedState });
                    itemsProcessed++;
                    if (itemsProcessed === itemsToChange.length) {
                        this._filter(); // Update UI after all items are processed.
                    }
                });
            });
        });
    }

    /** Updates UI elements like item count and button visibility. (Private method) */
    _updateCount() {
        this.model.getCount((stats) => {
            const anyCompleted = stats.completed > 0;
            const allCompleted = stats.total > 0 && stats.completed === stats.total;

            this.view.render("updateItemCount", stats.active);
            this.view.render("clearCompletedButton", { completed: stats.completed, visible: anyCompleted });
            this.view.render("toggleAll", { checked: allCompleted });
            this.view.render("contentBlockVisibility", { visible: stats.total > 0 });
        });
    }

    /**
     * Refreshes the displayed task list based on the current filter and updates counts. (Private method)
     * @param {boolean} [force=false] - If true, forces a re-render of the task list.
     */
    _filter(force) {
        const currentRoute = this._activeRoute || "All";
        const capitalizedRoute = currentRoute.charAt(0).toUpperCase() + currentRoute.slice(1);

        this._updateCount(); // Always update counts and related UI.

        const showMethodName = `show${capitalizedRoute}`;
        if (typeof this[showMethodName] === 'function') {
            // Re-render list if forcing, or if route changed, or if previous route wasn't "All" (original logic).
            if (force || this._lastActiveRoute !== "All" || this._lastActiveRoute !== capitalizedRoute) {
                this[showMethodName]();
            }
        } else {
            console.warn(`Controller._filter: Show method ${showMethodName} not found. Defaulting to showAll.`);
            this.showAll();
        }
        this._lastActiveRoute = capitalizedRoute;
    }

    /** Updates the active filter state based on the current page. (Private method) */
    _updateFilter(currentPage) {
        this._activeRoute = currentPage || "All";
        this._filter(); // This will update counts and render the list.
        this.view.render("setFilter", currentPage); // Highlight the active filter link.
    }
}

export default Controller;