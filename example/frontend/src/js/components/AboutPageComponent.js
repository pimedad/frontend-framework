import { defineComponent, h } from "frontend-framework";

export default defineComponent({
  render() {
    return h("div", { class: "about-page" }, [
      h("h2", {}, ["About This Todo App"]),
      h("p", {}, [
        "This is a simple TodoMVC example application built with a custom JavaScript framework.",
      ]),
      h("p", {}, [
        "It demonstrates components, state management, and routing.",
      ]),
    ]);
  },
});
