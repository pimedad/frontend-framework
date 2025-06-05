import { http } from './http.js';

export class Store {

    constructor(name ) {
        this._dbName = name;
        this.commands = {};
        this.afterEveryCommand = [];
    }

    subscribe(command, handler) {
      this.commands[command] = handler;
    }

    dispatch(command, payload) {
      if (this.commands[command]) {
        this.commands[command](payload);
        this.afterEveryCommand.forEach(hook => hook());
      }
    }

    addAfterCommandHook(hook) {
      this.afterEveryCommand.push(hook);
    }

    async findAll() {
        try {
            const items = await http.get('');
            this.dispatch('TODOS_LOADED', items);
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
                this.dispatch('TODO_UPDATED', savedOrUpdatedItem);
            } else {
                const createPayload = { title: itemData.title };
                savedOrUpdatedItem = await http.post('', createPayload);
                this.dispatch('TODO_CREATED', savedOrUpdatedItem);
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