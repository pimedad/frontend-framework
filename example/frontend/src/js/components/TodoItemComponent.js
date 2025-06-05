import { defineComponent, h } from "frontend-framework";

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
    handleViewClick(event) {
      if (event.target.classList.contains("toggle")) {
        return;
      }
      if (event.target.classList.contains("destroy")) {
        event.stopPropagation();
        this.props.onRemove();
        return;
      }
      if (event.target.tagName === "LABEL") {
        return;
      }
    },
    handleContextMenu(event) {
      event.preventDefault();
      console.log("Context menu prevented for todo:", this.props.todo.title);
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
      h(
        "div",
        {
          class: "view",
          on: {
            click: this.methods.handleViewClick.bind(this),
            contextmenu: this.methods.handleContextMenu.bind(this),
          },
        },
        [
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
          h(
            "button",
            {
              class: "destroy",
            },
            ["×"]
          ),
        ]
      ),
      hSlot("extra-info")
    ]);
  },
});
