/**
 * Manages the application's data (task items) and interacts with the Store for persistence.
 */
class Model {
    /**
     * Initializes the Model.
     * @param {object} storage - The storage instance (Store) to save and load data.
     */
    constructor(storage) {
        this.storage = storage;
    }

    /**
     * Creates a new task item.
     * @param {string} title - The title of the task.
     * @param {function} [callback] - Function to call after creation (receives [newItem], error).
     */
    create(title, callback) {
        const trimmedTitle = (title || "").trim(); // Ensure title is a string and trim.
        if (!trimmedTitle) {
            if (callback) callback(null, new Error("Title cannot be empty."));
            return;
        }

        const newItem = {
            title: trimmedTitle,
            completed: false,
        };
        this.storage.save(newItem, callback);
    }

    /**
     * Reads task items from storage.
     * @param {string|number|object|function} [query] -
     * If function: it's the callback, reads all.
     * If string/number: item ID to find.
     * If object: properties to match.
     * @param {function} [callback] - Function to call with found data (receives data, error).
     */
    read(query, callback) {
        const queryType = typeof query;

        if (queryType === "function") {
            this.storage.findAll(query); // query is the callback here.
        } else if (queryType === "string" || queryType === "number") {
            // Assumes Store's find method can handle {id: query} for specific item lookup.
            this.storage.find({ id: query }, callback);
        } else if (queryType === 'object' && query !== null) {
            this.storage.find(query, callback);
        } else {
            console.error("Model.read: Invalid query type provided:", query);
            if (callback) callback([], new Error("Invalid query for read operation."));
        }
    }

    /**
     * Updates an existing task item.
     * @param {number} id - The ID of the item to update.
     * @param {object} data - An object with properties to update (e.g., {title: 'new title'}).
     * @param {function} [callback] - Function to call after update (receives [updatedItem], error).
     */
    update(id, data, callback) {
        this.storage.save(data, callback, id);
    }

    /**
     * Removes a task item from storage.
     * @param {number} id - The ID of the item to remove.
     * @param {function} [callback] - Function to call after removal (receives error if any).
     */
    remove(id, callback) {
        this.storage.remove(id, callback);
    }

    /**
     * Removes ALL task items from storage. Use with caution.
     * @param {function} [callback] - Function to call after all items are removed (receives emptyArray, error).
     */
    removeAll(callback) {
        this.storage.drop(callback); // 'drop' implies deleting all.
    }

    /**
     * Gets statistics about task items (total, active, completed).
     * @param {function} callback - Function to call with the stats object.
     */
    getCount(callback) {
        if (typeof callback !== 'function') {
            console.error("Model.getCount requires a valid callback function.");
            return;
        }

        const stats = { active: 0, completed: 0, total: 0 };

        this.storage.findAll((data, error) => {
            if (error) {
                console.error("Model.getCount: Error reading items from storage:", error);
                // Call callback with zeroed stats or propagate error as per contract.
                callback(stats); // Or callback(null, error) if preferred.
                return;
            }
            if (Array.isArray(data)) {
                data.forEach(item => {
                    if (item.completed) {
                        stats.completed++;
                    } else {
                        stats.active++;
                    }
                    stats.total++;
                });
            } else {
                // This indicates an issue with the storage or its callback contract.
                console.error("Model.getCount: Data from storage.findAll was not an array:", data);
            }
            callback(stats);
        });
    }
}

export default Model;