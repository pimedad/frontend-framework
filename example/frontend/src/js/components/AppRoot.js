import { defineComponent, h, RouterOutlet } from "frontend-framework";
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
      console.error("AppRoot: Failed to load initial todos", error);
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
      const store = this.props.store || this.appContext.store;
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
      const store = this.props.store || this.appContext.store;
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
      const store = this.props.store || this.appContext.store;
      if (newTitle.trim() === "") {
        await this.handleRemoveItem(id);
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
      const store = this.props.store || this.appContext.store;
      try {
        await store.drop();
        this.updateState({
          todos: this.state.todos.filter((t) => !t.completed),
        });
      } catch (error) {
        console.error("Error clearing completed:", error);
      }
    },

    async handleToggleAll(completedState) {
      const store = this.props.store || this.appContext.store;
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
      const { todos, currentFilter } = this.state;
      if (currentFilter === "active") {
        return todos.filter((todo) => !todo.completed);
      }
      if (currentFilter === "completed") {
        return todos.filter((todo) => todo.completed);
      }
      return todos;
    },
  },

  render() {
    const { todos, isLoading } = this.state;
    const activeCount = todos.filter((t) => !t.completed).length;

    if (isLoading) {
      return h("p", {}, ["Loading tasks..."]);
    }

    this.appContext.todoHandlers = {
      addItem: this.methods.handleAddItem.bind(this),
      toggleItem: this.methods.handleToggleItem.bind(this),
      removeItem: this.methods.handleRemoveItem.bind(this),
      editItem: this.methods.handleEditItem.bind(this),
      clearCompleted: this.methods.handleClearCompleted.bind(this),
      toggleAll: this.methods.handleToggleAll.bind(this),
      getTodos: () => this.state.todos,
    };
    this.appContext.getTodoStats = () => ({
      active: this.state.todos.filter((t) => !t.completed).length,
      completed: this.state.todos.filter((t) => t.completed).length,
      total: this.state.todos.length,
      allCompleted:
        this.state.todos.length > 0 &&
        this.state.todos.filter((t) => !t.completed).length === 0,
    });

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
                change: (e) =>
                  this.appContext.todoHandlers.toggleAll(e.target.checked),
              },
            })
          : null,
        todos.length > 0
          ? h("label", { for: "toggle-all" }, ["Mark all as complete"])
          : null,
        h(RouterOutlet),
      ]),
      todos.length > 0 ? h(FooterComponent, {}) : null,
    ]);
  },
});
