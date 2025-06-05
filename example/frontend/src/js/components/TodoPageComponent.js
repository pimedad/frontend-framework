import { defineComponent, h } from "frontend-framework";
import TodoItemComponent from "./TodoItemComponent.js";
import HeaderComponent from "./HeaderComponent.js";
import FooterComponent from "./FooterComponent.js";

export default defineComponent({
  state() {
    return {
      todos: [],
      isLoading: true,
    };
  },

  async onMounted() {
    this.updateState({ isLoading: true });
    const store = this.appContext.store;
    try {
      const initialTodos = await store.findAll();
      this.updateState({ todos: initialTodos || [], isLoading: false });
    } catch (error) {
      console.error("TodoPageComponent: Failed to load initial todos", error);
      this.updateState({ isLoading: false, todos: [] });
    }
  },

  methods: {
    async handleAddItem(title) {
      const store = this.appContext.store;
      try {
        const newItems = await store.save({ title, completed: false });
        if (newItems && newItems.length > 0) {
          this.updateState({ todos: [...this.state.todos, newItems[0]] });
        }
      } catch (error) {
        console.error("Error adding item:", error);
      }
    },

    async handleToggleItem(id) {
      const store = this.appContext.store;
      const todo = this.state.todos.find((t) => t.id === id);
      if (todo) {
        try {
          const updatedItems = await store.save(
            { completed: !todo.completed },
            id
          );
          if (updatedItems && updatedItems.length > 0) {
            this.updateState({
              todos: this.state.todos.map((t) =>
                t.id === id ? updatedItems[0] : t
              ),
            });
          }
        } catch (error) {
          console.error("Error toggling item:", error);
        }
      }
    },

    async handleRemoveItem(id) {
      const store = this.appContext.store;
      try {
        await store.remove(id);
        this.updateState({
          todos: this.state.todos.filter((t) => t.id !== id),
        });
      } catch (error) {
        console.error("Error removing item:", error);
      }
    },

    async handleEditItem(id, newTitle) {
      const store = this.appContext.store;
      if (newTitle.trim() === "") {
        await this.methods.handleRemoveItem.call(this, id);
        return;
      }
      try {
        const updatedItems = await store.save({ title: newTitle }, id);
        if (updatedItems && updatedItems.length > 0) {
          this.updateState({
            todos: this.state.todos.map((t) =>
              t.id === id ? updatedItems[0] : t
            ),
          });
        }
      } catch (error) {
        console.error("Error editing item:", error);
      }
    },

    async handleClearCompleted() {
      const store = this.appContext.store;
      try {
        const completedIds = this.state.todos
          .filter((t) => t.completed)
          .map((t) => t.id);
        if (completedIds.length > 0) {
          for (const id of completedIds) {
            await store.remove(id);
          }
          const allTodos = await store.findAll();
          this.updateState({ todos: allTodos || [] });
        }
      } catch (error) {
        console.error("Error clearing completed:", error);
      }
    },

    async handleToggleAll(completedState) {
      const store = this.appContext.store;
      const todosToUpdate = this.state.todos.filter(
        (todo) => todo.completed !== completedState
      );
      if (todosToUpdate.length === 0) return;
      try {
        await Promise.all(
          todosToUpdate.map((todo) =>
            store.save({ completed: completedState }, todo.id)
          )
        );
        const allTodos = await store.findAll();
        this.updateState({ todos: allTodos || [] });
      } catch (error) {
        console.error("Error toggling all items:", error);
      }
    },

    getFilteredTodos() {
      const { todos } = this.state;
      const currentRouteName =
        this.appContext.router.matchedRoute?.name?.toLowerCase() || "all";

      if (currentRouteName === "active") {
        return todos.filter((todo) => !todo.completed);
      }
      if (currentRouteName === "completed") {
        return todos.filter((todo) => todo.completed);
      }
      return todos;
    },
  },

  render() {
    const { todos, isLoading } = this.state;

    if (isLoading) {
      return h("p", {}, ["Loading tasks..."]);
    }

    const todoHandlers = {
      addItem: this.methods.handleAddItem.bind(this),
      toggleItem: this.methods.handleToggleItem.bind(this),
      removeItem: this.methods.handleRemoveItem.bind(this),
      editItem: this.methods.handleEditItem.bind(this),
      clearCompleted: this.methods.handleClearCompleted.bind(this),
      toggleAll: this.methods.handleToggleAll.bind(this),
      getTodos: () => this.state.todos,
    };
    this.appContext.todoHandlers = todoHandlers;

    const todoStats = {
      active: todos.filter((t) => !t.completed).length,
      completed: todos.filter((t) => t.completed).length,
      total: todos.length,
      allCompleted:
        todos.length > 0 && todos.filter((t) => !t.completed).length === 0,
    };
    this.appContext.getTodoStats = () => todoStats;

    const filteredTodos = this.methods.getFilteredTodos.call(this);
    const activeCount = todoStats.active;

    const todoListComponent = () => {
      if (!filteredTodos || filteredTodos.length === 0) {
        const currentRouteName =
          this.appContext.router.matchedRoute?.name?.toLowerCase() || "all";
        let message = "No tasks here. Add one above!";
        if (currentRouteName === "active" && todos.some((t) => t.completed)) {
          message = "No active tasks.";
        } else if (
          currentRouteName === "completed" &&
          todos.some((t) => !t.completed)
        ) {
          message = "No completed tasks.";
        } else if (todos.length > 0) {
          if (currentRouteName === "active") message = "No active tasks.";
          else if (currentRouteName === "completed")
            message = "No completed tasks.";
        }
        return h("ul", { class: "todo-list" }, [
          h("li", { class: "todo-item-empty" }, [message]),
        ]);
      }

      return h("ul", { class: "todo-list" }, [
        ...filteredTodos.map((todo) =>
          h(TodoItemComponent, {
            key: todo.id,
            todo: todo,
            onToggle: () => todoHandlers.toggleItem(todo.id),
            onRemove: () => todoHandlers.removeItem(todo.id),
            onSave: (newTitle) => todoHandlers.editItem(todo.id, newTitle),
          }, [
            h("div", { class: "extra-info" }, [`Created: ${new Date().toLocaleDateString()}`])
          ])
        ),
      ]);
    };

    return h("div", { class: "todoapp-inner-container" }, [
      h(HeaderComponent, {}),
      h("main", { class: "main" }, [
        todos.length > 0
          ? h("input", {
              id: "toggle-all",
              class: "toggle-all",
              type: "checkbox",
              checked: activeCount === 0 && todos.length > 0,
              on: {
                change: (e) => todoHandlers.toggleAll(e.target.checked),
              },
            })
          : null,
        todos.length > 0
          ? h("label", { for: "toggle-all" }, ["Mark all as complete"])
          : null,
        todoListComponent(),
      ]),
      todos.length > 0 ? h(FooterComponent, {}) : null,
    ]);
  },
});
