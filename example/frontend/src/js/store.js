import { http } from './http.js';

export class Store {

    constructor(name, callback) {
        this._dbName = name;
    }

    async findAll(callback) {
        if (typeof callback !== 'function') return;
        try {
            const items = await http.get('');
            callback(items || []);
        } catch (error) {
            console.error("Store.findAll: Error fetching items:", error);
            callback([], error);
        }
    }

    async save(itemData, callback, idToUpdate) {
        if (typeof callback !== 'function') return;
        try {
            let savedOrUpdatedItem;
            if (idToUpdate !== undefined && idToUpdate !== null) {
                const updatePayload = {};
                if (itemData.title !== undefined) updatePayload.title = itemData.title;
                if (itemData.completed !== undefined) updatePayload.completed = itemData.completed;
                savedOrUpdatedItem = await http.put(`/${idToUpdate}`, updatePayload);
            } else {
                const createPayload = { title: itemData.title };
                savedOrUpdatedItem = await http.post('', createPayload);
            }
            callback(savedOrUpdatedItem ? [savedOrUpdatedItem] : null, savedOrUpdatedItem ? null : new Error("Save operation returned no item."));
        } catch (error) {
            console.error(`Store.save: Error for item ${idToUpdate || 'new'}:`, error);
            callback(null, error);
        }
    }

    async remove(id, callback) {
        if (typeof callback !== 'function') return;
        try {
            await http.delete(`/${id}`);
            callback();
        } catch (error) {
            console.error(`Store.remove: Error deleting item ID ${id}:`, error);
            callback(error);
        }
    }

    async drop(callback) {
        if (typeof callback !== 'function') return;
        try {
            await http.delete('/completed');
            callback();
        } catch (error) {
            console.error("Store.drop (deleteCompleted): Error:", error);
            callback(error);
        }
    }
}

export default Store;