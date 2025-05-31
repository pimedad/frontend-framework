# The patch-dom.js Documentation

The `patch-dom.js` module is a key part of our web framework, responsible for updating the real Document Object Model `(DOM)` to match changes in the `virtual DOM`. In a web app, the virtual DOM represents the structure of your UI, like a `<form>` with an `<input>` and a `<button>`. When the app’s state changes (e.g., a user types invalid text, triggering an error message), the virtual DOM updates, and `patchDOM()` ensures the real DOM reflects these changes efficiently without rebuilding everything from scratch.

This module uses the `reconciliation algorithm`, which compares two virtual DOM trees (the old one, currently rendered, and the new one, after a state change) to find differences, then applies only the necessary updates to the real DOM. For example, if an error message `<p class="error">Invalid text!</p>` is added between an `<input>` and a `<button>`, `patchDOM()` inserts it at the right spot without touching the other elements. This approach makes the framework fast and keeps things like input field focus intact, unlike the older version that replaced the entire DOM.

## The patchDOM() Function

The `patchDOM()` function is the main entry point for the reconciliation algorithm. It compares two virtual DOM trees (`oldVdom` and `newVdom`) and updates the real DOM to match the new tree. 

The function works `recursively`, starting at the top-level nodes and moving to their children in a depth-first manner. For example, if a `<div id="abc">` changes to `<div id="def">`, `patchDOM()` updates the `id` attribute. If a new `<p>` is added, it inserts it at the correct index, like between an `<input>` and a `<button>` in a `<form>`.

Here’s how it works in simple steps:
1. **Check if nodes are different**: If `oldVdom` and `newVdom` aren’t equal (e.g., a `<div>` vs. a `<span>`), destroy the old node’s subtree and mount the new one.
2. **Copy DOM reference**: If nodes are equal, save the real DOM element reference (`el`) from `oldVdom` to `newVdom` to reuse it.
3. **Handle node types**:
    - **Text nodes**: Update the text if it changed (e.g., “Hello” to “Hi”).
    - **Element nodes**: Update attributes, CSS classes, styles, and event listeners.
    - **Component nodes**: Update component props and children.
4. **Patch children**: Use `arraysDiffSequence()` to find which children were added, removed, or moved, and update the DOM accordingly.

```javascript
export function patchDOM(oldVdom, newVdom, parentEl, hostComponent = null) {
  if (!areNodesEqual(oldVdom, newVdom)) {
    const index = findIndexInParent(parentEl, oldVdom.el);
    destroyDOM(oldVdom); // Remove old node and subtree
    mountDOM(newVdom, parentEl, index, hostComponent); // Add new node and subtree
    return newVdom;
  }

  newVdom.el = oldVdom.el; // Reuse DOM element

  switch (newVdom.type) {
    case DOM_TYPES.TEXT: {
      patchText(oldVdom, newVdom); // Update text if changed
      return newVdom;
    }

    case DOM_TYPES.ELEMENT: {
      patchElement(oldVdom, newVdom, hostComponent); // Update attributes, classes, etc.
      break;
    }

    case DOM_TYPES.COMPONENT: {
      patchComponent(oldVdom, newVdom); // Update component props and children
      break;
    }
  }

  patchChildren(oldVdom, newVdom, hostComponent); // Update children
  return newVdom;
}
```

## The patchComponent() Function

The `patchComponent()` function updates a component node, which represents a reusable UI piece, like a custom button or form. It’s like telling a component, “Here’s your new data and children, update yourself!” Components have their own logic, so this function passes new properties (`props`) and children to the component’s methods.

For example, if a component’s props change (e.g., a button’s label updates from “Submit” to “Save”), `patchComponent()` calls `updateProps()` to apply the change. It also updates the component’s children (like text or nested elements) and ensures the DOM reference (`el`) points to the component’s first DOM element.

```javascript
function patchComponent(oldVdom, newVdom) {
  const { component } = oldVdom;
  const { children } = newVdom;
  const { props } = extractPropsAndEvents(newVdom);

  component.setExternalContent(children); // Update children
  component.updateProps(props); // Update properties
  newVdom.component = component; // Keep component reference
  newVdom.el = component.firstElement; // Set DOM reference
}
```

## The patchChildren() Function

The `patchChildren()` function updates the children of a node, like the `<input>`, `<p>`, and `<button>` inside a `<form>`. It uses `arraysDiffSequence()` to find which children were added, removed, moved, or stayed in place (noop), then applies the right DOM changes. It’s like rearranging furniture in a room to match a new layout plan.

For example, if an old virtual DOM has `<form><input><button></form>` and the new one has `<form><input><p><button></form>`, `patchChildren()` adds the `<p>` at index 1. If the order changes to `<form><p><input><button></form>`, it moves the `<p>` to index 0. It handles four operations:
- **Add**: Mount a new node (e.g., add `<p>`).
- **Remove**: Destroy a node (e.g., remove `<p>`).
- **Move**: Shift a node to a new index and patch it (e.g., move `<p>` to index 0).
- **Noop**: Patch a node that stayed in place (e.g., update `<input>`’s attributes).

```javascript
function patchChildren(oldVdom, newVdom, hostComponent) {
  const oldChildren = extractChildren(oldVdom); // Get old children
  const newChildren = extractChildren(newVdom); // Get new children
  const parentEl = oldVdom.el;

  const diffSeq = arraysDiffSequence(oldChildren, newChildren, areNodesEqual); // Find changes

  for (const operation of diffSeq) {
    const { originalIndex, index, item } = operation;
    const offset = hostComponent?.offset ?? 0;

    switch (operation.op) {
      case ARRAY_DIFF_OP.ADD: {
        mountDOM(item, parentEl, index + offset, hostComponent); // Add new node
        break;
      }

      case ARRAY_DIFF_OP.REMOVE: {
        destroyDOM(item); // Remove node
        break;
      }

      case ARRAY_DIFF_OP.MOVE: {
        const oldChild = oldChildren[originalIndex];
        const newChild = newChildren[index];
        const elAtTargetIndex = parentEl.childNodes[index + offset];

        const elementsToMove = isComponent(oldChild) ? oldChild.component.elements : [oldChild.el];

        elementsToMove.forEach((el) => {
          parentEl.insertBefore(el, elAtTargetIndex); // Move node
          patchDOM(oldChild, newChild, parentEl, hostComponent); // Patch moved node
        });
        break;
      }

      case ARRAY_DIFF_OP.NOOP: {
        patchDOM(oldChildren[originalIndex], newChildren[index], parentEl, hostComponent); // Patch unchanged node
        break;
      }
    }
  }
}
```

## The patchElement() Function

The `patchElement()` function updates an element node, like a `<div>` or `<input>`, by comparing its properties (attributes, CSS classes, styles, and event listeners) and applying changes. It’s like renovating a house by updating the paint color, furniture, and wiring without tearing it down.

For example, if a `<div id="abc" class="foo">` changes to `<div id="def" class="bar">`, `patchElement()` updates the `id` and replaces the `foo` class with `bar`. It delegates to helper functions:
- `patchAttrs()` for attributes like `id` or `value`.
- `patchClasses()` for CSS classes.
- `patchStyles()` for styles like `color: blue`.
- `patchEvents()` for event listeners like `onclick`.

```javascript
function patchElement(oldVdom, newVdom, hostComponent) {
  const el = oldVdom.el;
  const {
    class: oldClass,
    style: oldStyle,
    on: oldEvents,
    ...oldAttrs
  } = oldVdom.props;
  const {
    class: newClass,
    style: newStyle,
    on: newEvents,
    ...newAttrs
  } = newVdom.props;
  const { listeners: oldListeners } = oldVdom;

  patchAttrs(el, oldAttrs, newAttrs); // Update attributes
  patchClasses(el, oldClass, newClass); // Update classes
  patchStyles(el, oldStyle, newStyle); // Update styles
  newVdom.listeners = patchEvents(el, oldListeners, oldEvents, newEvents, hostComponent); // Update events
}
```

## The patchAttrs() Function

The `patchAttrs()` function updates an element’s attributes, like `id`, `name`, or `value`, using `objectsDiff()` to find which attributes were added, removed, or changed. It’s like updating a name tag by adding new details or removing outdated ones.

For example, if a `<div id="abc">` changes to `<div id="def" data-test="true">`, `patchAttrs()` removes `id="abc"`, sets `id="def"`, and adds `data-test="true"`. It uses `setAttribute()` for adding or updating and `removeAttribute()` for removing.

```javascript
function patchAttrs(el, oldAttrs, newAttrs) {
  const { added, removed, updated } = objectsDiff(oldAttrs, newAttrs);

  for (const attr of removed) {
    removeAttribute(el, attr); // Remove old attributes
  }

  for (const attr of added.concat(updated)) {
    setAttribute(el, attr, newAttrs[attr]); // Add or update attributes
  }
}
```

## The patchClasses() Function

The `patchClasses()` function updates an element’s CSS classes, which can be a string (e.g., `"foo bar"`) or an array (e.g., `["foo", "bar"]`). It converts both to arrays, uses `arraysDiff()` to find added or removed classes, and updates the DOM’s `classList`. It’s like swapping labels on a box to reflect its new contents.

For example, if a `<p class="foo">` changes to `<p class="bar">`, `patchClasses()` removes `foo` and adds `bar` using `classList.remove()` and `classList.add()`. It filters out blank or empty strings to avoid errors.

```javascript
function patchClasses(el, oldClass, newClass) {
  const oldClasses = toClassList(oldClass); // Convert to array
  const newClasses = toClassList(newClass);

  const { added, removed } = arraysDiff(oldClasses, newClasses); // Find changes

  if (removed.length > 0) {
    el.classList.remove(...removed); // Remove old classes
  }

  if (added.length > 0) {
    el.classList.add(...added); // Add new classes
  }
}
```

## The patchStyles() Function

The `patchStyles()` function updates an element’s CSS styles, like `color` or `font-size`, using `objectsDiff()` to compare old and new style objects. It’s like repainting a wall or changing the curtains based on a new design plan.

For example, if a `<div style="color: blue">` changes to `<div style="color: red">`, `patchStyles()` removes `color: blue` and sets `color: red` using `setStyle()` and `removeStyle()`. It handles both added and updated styles in one step.

```javascript
function patchStyles(el, oldStyle = {}, newStyle = {}) {
  const { added, removed, updated } = objectsDiff(oldStyle, newStyle);

  for (const style of removed) {
    removeStyle(el, style); // Remove old styles
  }

  for (const style of added.concat(updated)) {
    setStyle(el, style, newStyle[style]); // Add or update styles
  }
}
```

## The patchEvents() Function

The `patchEvents()` function updates an element’s event listeners, like `onclick` or `onchange`, using `objectsDiff()` to find which listeners were added, removed, or changed. It’s like updating the buttons on a remote control to trigger new actions.

For example, if a `<button onclick="handleClick">` changes its handler, `patchEvents()` removes the old listener and adds the new one. It uses `addEventListener()` (a custom function that wraps handlers) to add listeners and `removeEventListener()` to remove them, tracking listeners in an object for later removal.

```javascript
function patchEvents(el, oldListeners = {}, oldEvents = {}, newEvents = {}, hostComponent) {
  const { removed, added, updated } = objectsDiff(oldEvents, newEvents);

  for (const eventName of removed.concat(updated)) {
    el.removeEventListener(eventName, oldListeners[eventName]); // Remove old listeners
  }

  const addedListeners = {};

  for (const eventName of added.concat(updated)) {
    const listener = addEventListener(eventName, newEvents[eventName], el, hostComponent); // Add new listeners
    addedListeners[eventName] = listener;
  }

  return addedListeners; // Return new listeners for tracking
}
```

## The patchText() Function

The `patchText()` function updates a text node’s content if it has changed, like changing “Hello” to “Hi” in a `<p>`. It’s like editing a sticky note to show new text.

For example, if a text node’s `nodeValue` changes from “Hello” to “Hi”, `patchText()` sets the DOM element’s `nodeValue` to the new text. If the text is the same, it does nothing to avoid unnecessary updates.

```javascript
function patchText(oldVdom, newVdom) {
  const el = oldVdom.el;
  const { value: oldText } = oldVdom;
  const { value: newText } = newVdom;

  if (oldText !== newText) {
    el.nodeValue = newText; // Update text
  }
}
```

## The findIndexInParent() Function

The `findIndexInParent()` function finds the index of a DOM element within its parent’s `childNodes`. It’s like finding a book’s position on a shelf to know where to insert or remove it.

For example, if a `<p>` is the second child of a `<form>`, this function returns `1`. If the element isn’t found (e.g., for fragments), it returns `null`, meaning the new node will be appended.

```javascript
function findIndexInParent(parentEl, el) {
  const index = Array.from(parentEl.childNodes).indexOf(el);
  if (index < 0) {
    return null; // Append if not found
  }

  return index; // Return index
}
```

## The toClassList() Function

The `toClassList()` function converts a class string (e.g., `"foo bar"`) or array (e.g., `["foo", "bar"]`) into a clean array of class names, filtering out blank or empty strings. It’s like organizing a list of tags for easy comparison.

For example, `"foo bar "` becomes `["foo", "bar"]`, and `["foo", "", "bar"]` becomes `["foo", "bar"]`. This helps `patchClasses()` work with consistent arrays.

```javascript
function toClassList(classes = '') {
  return Array.isArray(classes)
    ? classes.filter(isNotBlankOrEmptyString) // Filter array
    : classes.split(/(\s+)/).filter(isNotBlankOrEmptyString); // Split string
}
```