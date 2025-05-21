import { http } from './http.js';

export class Store {

    constructor(name ) {
        this._dbName = name;
    }

    async findAll() {
        try {
            const items = await http.get('');
            return items || [];
        } catch (error) {
            console.error("Store.findAll: Error fetching items:", error);
            throw error;
        }
    }

    async save(itemData, idToUpdate) {
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
            if (!savedOrUpdatedItem) {
                throw new Error("Save operation returned no item.");
            }
            return [savedOrUpdatedItem];
        } catch (error) {
            console.error(`Store.save: Error for item ${idToUpdate || 'new'}:`, error);
            throw error;
        }
    }

    async remove(id) {
        try {
            await http.delete(`/${id}`);
        } catch (error) {
            console.error(`Store.remove: Error deleting item ID ${id}:`, error);
            throw error;
        }
    }

    async drop() {
        try {
            await http.delete('/completed');
        } catch (error) {
            console.error("Store.drop (deleteCompleted): Error:", error);
            throw error;
        }
    }
}

export default Store;