import { defineComponent, h, RouterOutlet } from "frontend-framework";

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

  render() {
    const { isLoading } = this.state;

    if (isLoading) {
      return h("p", {}, ["Loading tasks..."]);
    }

    return h("div", { class: "todoapp-outer-container" }, [h(RouterOutlet)]);
  },
});
