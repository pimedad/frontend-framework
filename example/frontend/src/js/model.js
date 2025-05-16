/**
 * Manages the application's data (to-do task items), using a local cache to not relly on polling each time we toggle
 * a to-do item and interacting with the Store for persistence.
 */
class Model {
    /**
     * Initializes the Model.
     * @param {object} storage - The storage instance (Store) to save and load data.
     */
    constructor(storage) {
        this.storage = storage;
        this.todos = []; // An empty Array for Local cache for to-do items
        this._isCacheInitialized = false;
        this._cacheInitializationPromise = null; // To handle concurrent initial reads
    }

    /**
     * Ensures the cache is initialized. Loads data from storage if not already done.
     * @returns {Promise} A promise that resolves when the cache is initialized, or rejects on error.
     */
    _ensureCacheInitialized() {
        if (this._isCacheInitialized) {
            return Promise.resolve();
        }
        if (this._cacheInitializationPromise) {
            return this._cacheInitializationPromise;
        }

        this._cacheInitializationPromise = new Promise((resolve, reject) => {
            this.storage.findAll((data, error) => {
                if (error) {
                    console.error("Model: Failed to initialize cache", error);
                    this._cacheInitializationPromise = null; // Reset for potential retry
                    reject(error);
                    return;
                }
                this.todos = data || [];
                this._isCacheInitialized = true;
                this._cacheInitializationPromise = null;
                resolve();
            });
        });
        return this._cacheInitializationPromise;
    }

    /**
     * Creates a new task item.
     * Adds to local cache optimistically if backend call is expected to succeed,
     * then confirms with backend.
     * @param {string} title - The title of the task.
     * @param {function} [callback] - Function to call after creation (receives [newItem], error).
     */
    create(title, callback) {
        const trimmedTitle = (title || "").trim();
        if (!trimmedTitle) {
            if (callback) callback(null, new Error("Title cannot be empty."));
            return;
        }

        const newItemData = {
            title: trimmedTitle,
            completed: false,
        };

        this.storage.save(newItemData, (savedItemArray, error) => {
            if (error) {
                if (callback) callback(null, error);
                return;
            }
            if (savedItemArray && savedItemArray.length > 0) {
                const savedItem = savedItemArray[0];
                // Ensure cache is up-to-date before adding.
                this._ensureCacheInitialized().then(() => {
                    this.todos.push(savedItem);
                    if (callback) callback([savedItem]);
                }).catch(initError => {
                    // If cache init failed, the new item is still created on backend,
                    // but frontend state might be inconsistent until next full load.
                    console.error("Model.create: Cache initialization error after create", initError);
                    if (callback) callback(savedItemArray, new Error("Created, but cache error: " + initError.message));
                });
            } else {
                if (callback) callback(null, new Error("Item creation failed to return data."));
            }
        });
    }

    /**
     * Reads task items. Ensures cache is initialized before reading.
     * @param {string|number|object|function} [query] -
     * If function: it's the callback, reads all.
     * If string/number: item ID to find.
     * If object: properties to match.
     * @param {function} [callback] - Function to call with found data (receives data, error).
     */
    read(query, callback) {
        this._ensureCacheInitialized()
            .then(() => {
                const queryType = typeof query;
                let result = [];

                if (queryType === "function") {
                    callback = query;
                    result = [...this.todos];
                } else if (queryType === "string" || queryType === "number") {
                    const idToFind = Number(query);
                    const item = this.todos.find(todo => todo.id === idToFind);
                    if (item) result = [item];
                } else if (queryType === 'object' && query !== null) {
                    result = this.todos.filter(todo =>
                        Object.keys(query).every(key => todo[key] === query[key])
                    );
                } else {
                    console.error("Model.read: Invalid query type provided:", query);
                    if (callback) callback([], new Error("Invalid query for read operation."));
                    return;
                }
                if (callback) callback(result);
            })
            .catch(error => {
                console.error("Model.read: Cache initialization failed.", error);
                if (callback) callback([], error);
            });
    }

    /**
     * Updates an existing task item optimistically.
     * @param {number} id - The ID of the item to update.
     * @param {object} data - An object with properties to update (e.g., {title: 'new title'}).
     * @param {function} [callback] - Function to call after update (receives [updatedItem], error).
     */
    update(id, data, callback) {
        this._ensureCacheInitialized().then(() => {
            const itemIndex = this.todos.findIndex(todo => todo.id === id);
            if (itemIndex === -1) {
                if (callback) callback(null, new Error(`Item with id ${id} not found in cache.`));
                return;
            }

            const originalItem = { ...this.todos[itemIndex] };
            const updatedItemLocally = { ...originalItem, ...data };

            this.todos.splice(itemIndex, 1, updatedItemLocally);

            this.storage.save(data, (savedItemArray, error) => {
                if (error) {
                    this.todos.splice(itemIndex, 1, originalItem);
                    if (callback) callback(null, error);
                    return;
                }
                // Confirm update with server's response
                if (savedItemArray && savedItemArray.length > 0) {
                    this.todos.splice(itemIndex, 1, savedItemArray[0]);
                    if (callback) callback(savedItemArray);
                } else {
                    // Rollback if server response is not as expected but no direct error
                    this.todos.splice(itemIndex, 1, originalItem);
                    if (callback) callback(null, new Error("Update failed to return data. Rolled back."));
                }

            }, id);
        }).catch(initError => {
            if (callback) callback(null, initError);
        });
    }

    /**
     * Removes a task item from storage.
     * @param {number} id - The ID of the item to remove.
     * @param {function} [callback] - Function to call after removal (receives error if any).
     */
    remove(id, callback) {
        this._ensureCacheInitialized().then(() => {
            const itemIndex = this.todos.findIndex(todo => todo.id === id);
            if (itemIndex === -1) {
                if (callback) callback(new Error(`Item with id ${id} not found in cache for removal.`));
                return;
            }
            const removedItem = this.todos.splice(itemIndex, 1)[0];

            this.storage.remove(id, (error) => {
                if (error) {
                    this.todos.splice(itemIndex, 0, removedItem);
                    if (callback) callback(error);
                    return;
                }
                if (callback) callback(null);
            });
        }).catch(initError => {
            if (callback) callback(initError);
        });
    }

    /**
     * Removes all completed task items.
     * This maps to `storage.drop` which in the current implementation deletes completed items.
     * @param {function} [callback] - Function to call after (receives error if any).
     */
    removeAll(callback) {
        this.storage.drop((error) => { // 'drop' implies deleting all.
            if (error) {
                if (callback) callback(error);
                return;
            }
            // If successful, update local cache
            this.todos = this.todos.filter(todo => !todo.completed);
            if (callback) callback(null);
        });
    }

    /**
     * Gets statistics about task items (total, active, completed) from the local cache.
     * @param {function} callback - Function to call with the stats object.
     */
    getCount(callback) {
        this._ensureCacheInitialized()
            .then(() => {
                const stats = { active: 0, completed: 0, total: 0 };
                this.todos.forEach(item => {
                    if (item.completed) {
                        stats.completed++;
                    } else {
                        stats.active++;
                    }
                    stats.total++;
                });
                callback(stats);
            })
            .catch(error => {
                // If cache init fails, return zeroed stats or propagate error
                console.error("Model.getCount: Cache initialization failed.", error);
                callback({ active: 0, completed: 0, total: 0 }, error);
            });
    }
}

export default Model;