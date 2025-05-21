import { defineComponent, h } from "frontend-framework";

export default defineComponent({
  state() {
    return {
      newTodoTitle: "",
    };
  },
  methods: {
    handleSubmit(event) {
      event.preventDefault();
      const title = this.state.newTodoTitle.trim();
      if (title) {
        if (
          this.appContext &&
          this.appContext.todoHandlers &&
          typeof this.appContext.todoHandlers.addItem === "function"
        ) {
          this.appContext.todoHandlers.addItem(title);
        } else {
          console.error(
            "HeaderComponent: addItem handler not found in appContext.todoHandlers"
          );
        }
        this.updateState({ newTodoTitle: "" });
      }
    },
    handleInput(event) {
      this.updateState({ newTodoTitle: event.target.value });
    },
  },
  render() {
    return h("header", { class: "header" }, [
      h("h1", {}, ["Tasks"]),
      h("form", { on: { submit: this.methods.handleSubmit.bind(this) } }, [
        h("input", {
          class: "new-todo",
          placeholder: "What needs to be done?",
          autofocus: true,
          value: this.state.newTodoTitle,
          on: { input: this.methods.handleInput.bind(this) },
        }),
      ]),
    ]);
  },
});
