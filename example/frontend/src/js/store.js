let uniqueID = 1; // Simple sequential ID for new items in this session.
let memoryStorage = {}; // In-memory object to store data, simulating a database.

/**
 * Manages data persistence using an in-memory JavaScript object.
 * Simulates asynchronous operations like a real database would have.
 */
export class Store {
    /**
     * Initializes the Store for a specific data collection.
     * @param {string} name - The key for this data collection in memoryStorage.
     * @param {function} [callback] - Optional: Called with initial items after store setup.
     */
    constructor(name, callback) {
        this._dbName = name;

        if (!memoryStorage[name]) {
            memoryStorage[name] = JSON.stringify({items: []});
            uniqueID = 1; // Reset ID for a new named store instance.
        }

        if (callback) {
            try {
                const currentData = JSON.parse(memoryStorage[this._dbName]);
                // Use setTimeout to simulate async data retrieval.
                setTimeout(() => callback(currentData.items || []), 0);
            } catch (e) {
                console.error(`Store constructor: Failed to parse initial data for "${name}":`, e);
                setTimeout(() => callback([]), 0); // Provide empty array on error.
            }
        }
    }

    /**
     * Finds items matching a query.
     * @param {object} query - Object with properties to match (e.g., {completed: true}, {id: 123}).
     * @param {function} callback - Called with an array of matching items.
     */
    find(query, callback) {
        if (typeof callback !== 'function') return;

        let allItems;
        try {
            allItems = JSON.parse(memoryStorage[this._dbName]).items;
        } catch (e) {
            console.error(`Store.find: Failed to parse data for "${this._dbName}":`, e);
            setTimeout(() => callback([]), 0);
            return;
        }

        const results = allItems.filter(item => {
            for (let key in query) {
                if (query.hasOwnProperty(key) && query[key] !== item[key]) {
                    return false;
                }
            }
            return true;
        });
        setTimeout(() => callback(results), 0);
    }

    /**
     * Retrieves all items in the collection.
     * @param {function} callback - Called with an array of all items.
     */
    findAll(callback) {
        if (typeof callback !== 'function') return;
        try {
            const data = JSON.parse(memoryStorage[this._dbName]);
            setTimeout(() => callback(data.items || []), 0);
        } catch (e) {
            console.error(`Store.findAll: Failed to parse data for "${this._dbName}":`, e);
            setTimeout(() => callback([]), 0);
        }
    }

    /**
     * Saves an item (creates if no ID, updates if ID provided).
     * @param {object} newItemData - Data for the item. If creating, it's the new item's properties.
     * @param {function} callback - Called with an array containing the saved/updated item, or (null, error).
     * @param {number} [idToUpdate] - Optional ID of an item to update.
     */
    save(newItemData, callback, idToUpdate) {
        let dataSet;
        try {
            dataSet = JSON.parse(memoryStorage[this._dbName]);
        } catch (e) {
            console.error(`Store.save: Failed to parse data for "${this._dbName}":`, e);
            if (callback) setTimeout(() => callback(null, new Error("Storage read error during save.")), 0);
            return;
        }
        const items = dataSet.items;
        let savedItem = null;

        if (idToUpdate !== undefined && idToUpdate !== null) { // Update existing
            let found = false;
            for (let i = 0; i < items.length; i++) {
                if (items[i].id === idToUpdate) {
                    for (let key in newItemData) {
                        if (newItemData.hasOwnProperty(key)) items[i][key] = newItemData[key];
                    }
                    savedItem = items[i];
                    found = true;
                    break;
                }
            }
            if (!found) {
                if (callback) setTimeout(() => callback(null, new Error(`Item with ID ${idToUpdate} not found for update.`)), 0);
                return;
            }
        } else { // Create new
            newItemData.id = uniqueID++;
            items.push(newItemData);
            savedItem = newItemData;
        }

        try {
            memoryStorage[this._dbName] = JSON.stringify(dataSet);
            if (callback) setTimeout(() => callback([savedItem]), 0); // Pass saved item in an array.
        } catch (e) {
            console.error(`Store.save: Failed to stringify data for "${this._dbName}":`, e);
            if (callback) setTimeout(() => callback(null, new Error("Storage write error during save.")), 0);
        }
    }

    /**
     * Removes an item by its ID.
     * @param {number} id - The ID of the item to remove.
     * @param {function} callback - Called after removal attempt (receives error if any).
     */
    remove(id, callback) {
        let dataSet;
        try {
            dataSet = JSON.parse(memoryStorage[this._dbName]);
        } catch (e) {
            console.error(`Store.remove: Failed to parse data for "${this._dbName}":`, e);
            if (callback) setTimeout(() => callback(new Error("Storage read error during remove.")), 0);
            return;
        }
        const items = dataSet.items;
        const initialLength = items.length;

        dataSet.items = items.filter(item => item.id !== id);

        if (dataSet.items.length === initialLength) {
            console.warn(`Store.remove: Item with ID ${id} not found in "${this._dbName}".`);
            // Still call callback indicating success as the item is effectively "gone".
            if (callback) setTimeout(() => callback(), 0);
            return;
        }

        try {
            memoryStorage[this._dbName] = JSON.stringify(dataSet);
            if (callback) setTimeout(() => callback(), 0); // Success.
        } catch (e) {
            console.error(`Store.remove: Failed to stringify data for "${this._dbName}":`, e);
            if (callback) setTimeout(() => callback(new Error("Storage write error during remove.")), 0);
        }
    }

    /**
     * Deletes all items in this store's collection.
     * @param {function} callback - Called after dropping data (receives empty array).
     */
    drop(callback) {
        memoryStorage[this._dbName] = JSON.stringify({items: []});
        uniqueID = 1; // Reset ID for this store if it's cleared.

        if (callback) setTimeout(() => callback([]), 0);
    }
}

export default Store;