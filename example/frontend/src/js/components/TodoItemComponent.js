import { defineComponent, h, hSlot } from "frontend-framework";

export default defineComponent({
  props: {
    todo: {},
    onToggle: () => {},
    onRemove: () => {},
    onSave: () => {},
  },
  state() {
    return {
      editing: false,
      editText: "",
    };
  },
  methods: {
    handleDoubleClick() {
      this.updateState({ editing: true, editText: this.props.todo.title });
    },
    handleSave() {
      if (this.state.editing) {
        const newTitle = this.state.editText.trim();
        this.props.onSave(newTitle);
        this.updateState({ editing: false });
      }
    },
    handleCancelEdit() {
      this.updateState({ editing: false });
    },
    handleEditInput(event) {
      this.updateState({ editText: event.target.value });
    },
    handleKeyDown(event) {
      if (event.key === "Enter") {
        this.methods.handleSave.call(this);
      } else if (event.key === "Escape") {
        this.methods.handleCancelEdit.call(this);
      }
    },
  },
  render() {
    const { todo } = this.props;
    const liClass = `${todo.completed ? "completed" : ""} ${
      this.state.editing ? "editing" : ""
    }`;

    if (this.state.editing) {
      return h("li", { class: liClass, "data-id": todo.id }, [
        h("input", {
          class: "edit",
          type: "text",
          value: this.state.editText,
          on: {
            input: this.methods.handleEditInput.bind(this),
            blur: this.methods.handleSave.bind(this),
            keydown: this.methods.handleKeyDown.bind(this),
          },
        }),
      ]);
    }

    return h("li", { class: liClass, "data-id": todo.id }, [
      h("div", { class: "view" }, [
        h("input", {
          class: "toggle",
          type: "checkbox",
          checked: todo.completed,
          on: { change: () => this.props.onToggle() },
        }),
        h(
          "label",
          { on: { dblclick: this.methods.handleDoubleClick.bind(this) } },
          [todo.title]
        ),
        h("button", {
          class: "destroy",
          on: { click: () => this.props.onRemove() },
        }),
        hSlot([h("em", {}, [" (default slot content)"])]),
      ]),
    ]);
  },
});
