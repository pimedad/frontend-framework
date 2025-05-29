import { defineComponent, h, RouterLink } from "frontend-framework";

export default defineComponent({
  props: {
    activeCount: 0,
    completedCount: 0,
    currentFilter: "all",
    onClearCompleted: () => {},
  },
  render() {
    const stats = this.appContext.getTodoStats();
    const currentFilter =
      this.appContext.router.matchedRoute?.name?.toLowerCase() || "all";
    const onClearCompleted = this.appContext.todoHandlers.clearCompleted;
    const { active: activeCount, completed: completedCount } = stats;

    const itemWord = activeCount === 1 ? "task" : "tasks";

    return h("footer", { class: "footer" }, [
      h("span", { class: "todo-count" }, [
        h("strong", {}, [String(activeCount)]),
        ` ${itemWord} left`,
      ]),
      h("ul", { class: "filters" }, [
        h("li", {}, [
          h(
            RouterLink,
            {
              to: "/",
              class: currentFilter === "all" ? "selected" : "",
            },
            ["All"]
          ),
        ]),
        h("li", {}, [
          h(
            RouterLink,
            {
              to: "/active",
              class: currentFilter === "active" ? "selected" : "",
            },
            ["Active"]
          ),
        ]),
        h("li", {}, [
          h(
            RouterLink,
            {
              to: "/completed",
              class: currentFilter === "completed" ? "selected" : "",
            },
            ["Completed"]
          ),
        ]),
      ]),
      completedCount > 0
        ? h(
            "button",
            { class: "clear-completed", on: { click: onClearCompleted } },
            [`Clear completed (${completedCount})`]
          )
        : null,
    ]);
  },
});
