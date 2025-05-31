# The props.js Documentation

The `props.js` utility module helps our web framework manage components by separating their properties (`props`) and event listeners (`events`). In a web app, components are reusable UI pieces, like a custom button or a form. Each component has `props` (data like a button’s label or a form’s ID) and `events` (actions like what happens when a button is clicked). The `props.js` module provides a function to extract these cleanly from a virtual DOM node, making it easier to work with components when mounting or updating them.

## The extractPropsAndEvents() Function

The `extractPropsAndEvents()` function takes a virtual DOM node (`vdom`) and splits its `props` object into two parts: `props` (all properties except events and `key`) and `events` (event listeners like `onclick`). It’s like sorting a component’s instructions into “settings” (props) and “actions” (events).

For example, imagine a component node with `vdom.props = { id: "btn1", label: "Submit", on: { click: handleClick }, key: "item1" }`. The function extracts:
- `props`: `{ id: "btn1", label: "Submit" }` (removes `on` and `key`).
- `events`: `{ click: handleClick }` (the event listeners).

This separation is used in functions like `createComponentNode()` (when creating a component) and `patchComponent()` (when updating a component), ensuring the framework passes the right data to the component’s logic. The function also sets a default empty object `{}` for `events` if none are provided, avoiding errors. Additionally, it removes the `key` prop, which is used for optimizing list rendering (covered later in chapter 12), so it doesn’t interfere with the component’s regular properties.

Here’s the code:

```javascript
export function extractPropsAndEvents(vdom) {
  const { on: events = {}, ...props } = vdom.props; // Split props and events
  delete props.key; // Remove key prop for keyed lists

  return { props, events }; // Return separated objects
}
```

This function is simple but useful. By implementing the logic for extracting `props` and `events`, it prevents duplicate code in `mount-dom.js` and `patch-dom.js`. It also makes the framework ready for future updates, like handling keyed lists, without changing multiple files.