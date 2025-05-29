import { defineComponent, h } from "frontend-framework";
import TodoItemComponent from "./TodoItemComponent.js";

export default defineComponent({
  methods: {
    getFilteredTodos() {
      const allTodos = this.appContext.todoHandlers.getTodos();
      const currentRouteName =
        this.appContext.router.matchedRoute?.name?.toLowerCase() || "all";

      if (currentRouteName === "active") {
        return allTodos.filter((todo) => !todo.completed);
      }
      if (currentRouteName === "completed") {
        return allTodos.filter((todo) => todo.completed);
      }
      return allTodos;
    },
  },

  render() {
    const filteredTodos = this.methods.getFilteredTodos.call(this);
    const todoHandlers = this.appContext.todoHandlers;

    if (!filteredTodos || filteredTodos.length === 0) {
      const currentRouteName =
        this.appContext.router.matchedRoute?.name?.toLowerCase() || "all";
      let message = "No tasks here.";
      if (
        currentRouteName === "active" &&
        this.appContext.todoHandlers.getTodos().some((t) => t.completed)
      ) {
        message = "No active tasks.";
      } else if (
        currentRouteName === "completed" &&
        this.appContext.todoHandlers.getTodos().some((t) => !t.completed)
      ) {
        message = "No completed tasks.";
      } else if (this.appContext.todoHandlers.getTodos().length > 0) {
        if (currentRouteName === "active") message = "No active tasks.";
        else if (currentRouteName === "completed")
          message = "No completed tasks.";
      }

      return h("ul", { class: "todo-list" }, [h("li", {}, [message])]);
    }

    return h("ul", { class: "todo-list" }, [
      ...filteredTodos.map((todo) =>
        h(
          TodoItemComponent,
          {
            key: todo.id,
            todo: todo,
            onToggle: () => todoHandlers.toggleItem(todo.id),
            onRemove: () => todoHandlers.removeItem(todo.id),
            onSave: (newTitle) => todoHandlers.editItem(todo.id, newTitle),
          },
          [
            h(
              "span",
              {
                style: {
                  "font-size": "0.8em",
                  "margin-left": "10px",
                  color: "grey",
                },
              },
              [`ID: ${todo.id}`]
            ),
          ]
        )
      ),
    ]);
  },
});
