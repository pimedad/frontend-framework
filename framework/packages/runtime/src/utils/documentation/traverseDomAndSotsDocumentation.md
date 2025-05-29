# Traverse DOM and Slots Documentation

This document describes the purpose, role, and functions of the `traverse-dom.js` and `slots.js` files in the DotJS frontend framework. These utilities are made for managing the virtual DOM and enabling flexible component composition through slots. The documentation provides explanations of each function, practical examples, and details on where these utilities are used within the framework, ensuring developers can effectively use them into their projects.

---

## `traverse-dom.js`

### Purpose and Role
The `traverse-dom.js` file provides a utility function, `traverseDFS`, for performing a **depth-first search (DFS)** traversal of the virtual DOM tree. Its primary role is to enable other parts of the framework to process virtual DOM nodes in a structured, recursive manner. This utility is useful for tasks that require inspecting or modifying nodes, such as handling slots or applying transformations across the virtual DOM.

- **Purpose**: To traverse the virtual DOM tree, applying a user-defined processing function to each node while allowing conditional skipping of branches.
- **Role**: Acts as a reusable traversal mechanism, used by modules like `slots.js` to locate and process specific node types (e.g., slot nodes).
- **Where Used**: Primarily used in `slots.js` to find and replace slot nodes with external content. It can also be used in other parts of the framework for tasks like DOM cleanup or node analysis.

### Exported Function: `traverseDFS`

#### What It Does
The `traverseDFS` function recursively travels over the virtual DOM tree in a depth-first manner, applying a `processNode` function to each node. It allows skipping entire branches based on a `shouldSkipBranch` condition and tracks parent nodes and indices for context.

#### Function Signature
```javascript
export function traverseDFS(vdom, processNode, shouldSkipBranch = () => false, parentNode = null, index = null)
```

- **Parameters**:
    - `vdom`: The virtual DOM node to start traversal from.
    - `processNode`: A callback function to process each node, receiving `(node, parentNode, index)`.
    - `shouldSkipBranch`: An optional function that returns `true` to skip a node and its children (defaults to always `false`).
    - `parentNode`: The parent of the current node (defaults to `null` for the root).
    - `index`: The index of the current node in its parent’s children (defaults to `null` for the root).

#### How It Works
1. Checks if the current node should be skipped using `shouldSkipBranch`.
2. If not skipped, applies `processNode` to the node with its parent and index.
3. Recursively travels over each child node, passing the current node as the parent and the child’s index.

#### Code
```javascript
export function traverseDFS() {
  if (shouldSkipBranch(vdom)) return;
  
  processNode(vdom, parentNode, index);

  if (vdom.children) {
    vdom.children.forEach((child, i) => traverseDFS(child, processNode, shouldSkipBranch, vdom, i));
  }
}
```

#### Where It’s Used
- In `slots.js`, `traverseDFS` is used to locate `slot` nodes in the virtual DOM tree and replace them with external or default content.
- Example: `fillSlots` uses `traverseDFS` to process slot nodes by calling `insertViewInSlot`.

#### Example
```javascript
import { traverseDFS, h, hString } from './framework';

const vdom = h('div', {}, [
  hString('Hello'),
  h('span', {}, [hString('World')],
]);

const processedNodes = [];
traverseDFS(
  vdom,
  (node, parent, index) => {
    processedNodes.push({ type: node.type, index });
  },
  () => false
);

console.log(processedNodes);
// Output: [
//   { type: 'element', index: null },
//   { type: 'text', index: 0 },
//   { type: 'element', index: 1 },
//   { type: 'text', index: 0 },
// ],
```

#### Explanation
- The virtual DOM tree is traversed, logging each node’s type and index.
- The root `<div>` is processed first, followed by its children (`Hello` text node and `<span>`), and then the `<span>`’s child (`World` text node).

---

## `slots.js`

### Purpose and Slots

The `slots.js` file provides utilities to manage **slots**, a feature that allows components to accept and render external content dynamically. Slots are placeholders in a component’s virtual DOM where child content can be injected, enabling flexible and reusable component designs.

- **Purpose**: To replace slot nodes in the virtual DOM with external content provided by the parent component, or fallback to default content if none is provided.
- **Role**: Enhances component composition by supporting slot-based content injection, similar to [Vue.js](https://vuejs.org/guide/components/slots) or Web Components’ `<slot>` slot.
- **Where Used**: In the `component.js` file’s `render` method, where `fillSlots` is called to process slots when a component’s virtual DOM contains slot nodes (detected via `didCreateSlot`).

### Exported Function: `fillSlots`

#### What It Does
The `fillSlots` function processes a slot node in the virtual DOM tree, replacing `slot` nodes with external content or removing them if no content is provided.

#### Function Signature
```javascript
export function fillSlots(vdom, externalContent = [])
```

- **Parameters**:
    - `vdom`: The virtual DOM tree to process.
    - `externalContent`: An array of child nodes to insert into slots (defaults to an empty array).

#### How It Works
1. Defines a `processNode` function that calls `insertViewInSlot` for each node.
2. Uses `traverseDFS` to traverse the virtual DOM, applying `processNode` to slot nodes and skipping component branches with `shouldSkipBranch`.
3. Replaces slot nodes with external content or removes them, updating the parent’s children array.

#### Code
```javascript
export function fillSlots(vdom, externalContent = []) {
  function processNode(node, parent, index) {
    insertViewInSlot(node, parent, index, externalContent);
  }

  traverseDFS(vdom, processNode, shouldSkipBranch);
}
```

#### Where It’s Used
- In `component.js`, the `render` method calls `fillSlots(vdom, this.#children)` when `didCreateSlot()` returns `true`, indicating a slot was created in the virtual DOM.
- Example:
  ```javascript
  render() {
    const vdom = render.call(this.#children);
    if (didCreateSlot()) {
      fillSlots(vdom, this.#children);
      resetDidCreateSlot();
    }
    return vdom;
  }
  ```

### Internal Functions

#### `insertViewInSlot(node, parent, index, externalContent)`
- **What It Does**: Replaces a slot node with external content or removes it if no content is available.
- **Logic**:
    - Checks if the node is a `slot` type.
    - Uses `externalContent` if provided; otherwise, falls back to the slot’s default children.
    - If content exists, replaces the slot with an `hFragment` containing the content; otherwise, removes the slot.
- **Code**:
  ```javascript
  function insertViewInSlot(node, parent, index, externalContent) {
    if (node.type !== DOM_TYPES.SLOT) return;
    const defaultContent = node.children;
    const views = externalContent.length > 0 ? externalContent : defaultContent;
    const hasContent = views.length > 0;
    if (hasContent) {
      parent.children.splice(index, 1, hFragment(views));
    } else {
      parent.children.splice(index, 1);
    }
  }
  ```

#### `shouldSkipBranch(node)`
- **What It Does**: Determines if a node branch should be skipped during traversal.
- **Logic**: Returns `true` for `component` nodes to avoid processing their internal virtual DOM, as components manage their own rendering.
- **Code**:
  ```javascript
  function shouldSkipBranch(node) {
    return node.type === DOM_TYPES.COMPONENT;
  }
  ```

#### Example
```javascript
import { createApp, defineComponent, h, hSlot, hString } from './framework';

const MyComponent = defineComponent({
  render() {
    return h('div', {}, [
      hSlot([hString('Default Content')]), // Slot with default content
    ]);
  },
});

const App = defineComponent({
  render() {
    return h(MyComponent, {}, [hString('External Content')]);
  },
});

const app = createApp(App);
app.mount(document.getElementById('app'));
```

#### Explanation
- `MyComponent` defines a slot with default content (`Default Content`).
- `App` passes `External Content` to the slot.
- `fillSlots` replaces the slot node with an `hFragment` containing `External Content`, resulting in `<div>External Content</div>`.

---

## Where These Utilities Are Used

- **`traverse-dom.js`**:
    - **Primary Use**: In `slots.js` to traverse the virtual DOM and locate slot nodes for processing.
    - **Potential Use**: Could be used in other framework modules for tasks like DOM cleanup (`destroyDOM`), node analysis, or custom transformations, though currently limited to `slots.js`.

- **`slots.js`**:
    - **Primary Use**: In `component.js`’s `render` method to process slot nodes when `didCreateSlot()` is `true`.
    - **Context**: Called automatically when a component’s virtual DOM includes a slot created via `hSlot`. The component’s `#children` (set via `setExternalContent`) are passed as `externalContent` to `fillSlots`.

---

## Practical Example: Building a Card Component with Slots

Here’s a complete example demonstrating both `traverse-dom.js` and `slots.js`:

```javascript
import { createApp, defineComponent, h, hSlot, hString } from './framework';

const Card = defineComponent({
  render() {
    return h('div', { class: 'card' }, [
      h('header', {}, [hSlot([hString('Default Header')])]),
      h('main', {}, [hSlot([hString('Default Content')])]),
    ]);
  },
});

const App = defineComponent({
  render() {
    return h(Card, {}, [
      hString('Custom Header'),
      h('p', {}, ['Custom Content']),
    ]);
  },
});

const app = createApp(App);
app.mount(document.getElementById('app'));
```

### Explanation
- **Card Component**: Defines a card with two slots for header and main content, each with default content.
- **App Component**: Passes custom content (`Custom Header` and `<p>Custom Content</p>`) to the slots.
- **Slots Processing**:
    - `fillSlots` is called in `Card`’s `render` method because `hSlot` sets `didCreateSlot` to `true`.
    - `traverseDFS` roams the virtual DOM, finding slot nodes.
    - `insertViewInSlot` replaces the header slot with `Custom Header` and the main slot with `<p>Custom Content</p>`.
- **Result**: `<div class="card"><header>Custom Header</header><main><p>Custom Content</p></main></div>`.

---

## Guidelines for Using `traverse-dom.js` and `slots.js`

1. **Using `traverseDFS`**:
    - Use `traverseDFS` when you need to process virtual DOM nodes recursively, such as for custom transformations or inspections.
    - Define a clear `processNode` function to handle specific node types.
    - Use `shouldSkipBranch` to optimize traversal by skipping irrelevant branches (e.g., components).

2. **Using Slots**:
    - Include `hSlot` in component render functions to define placeholders for external content.
    - Provide default content in `hSlot([defaultContent])` to ensure fallback rendering.
    - Pass external content via a parent component’s children to replace slot content dynamically.
    - Ensure `didCreateSlot` is reset properly (handled automatically in `component.js`).

3. **Performance**:
    - Minimize the complexity of `processNode` in `traverseDFS` to avoid performance bottlenecks in large DOM trees.
    - Use `shouldSkipBranch` to skip component nodes, as they manage their own rendering.
    - Avoid excessive external content in slots to keep rendering efficient.

4. **Debugging**:
    - Log `processedNodes` in `traverseDFS` to verify traversal order and node processing.
    - Check the virtual DOM output after `fillSlots` to ensure slots are replaced correctly.

---

## Best Practices

1. **Clear Slot Design**: Use slots for flexible component composition, such as headers, footers, or content areas in reusable components.
2. **Default Content**: Always provide default content in slots to handle cases where no external content is passed.
3. **Efficient Traversal**: Use `shouldSkipBranch` in `traverseDFS` to skip unnecessary branches, improving performance.
4. **Component Integration**: Ensure components that use slots call `fillSlots` only when `didCreateSlot` is `true`, as implemented in `component.js`.
5. **Testing**: Test slot rendering with and without external content to verify fallback behavior.
6. **Documentation**: When sharing components, document which slots are available and their expected content types.

---

## Conclusion

`traverse-dom.js` and `slots.js` are helpful tools in the DotJS framework. They make it easier to work with the virtual DOM and build flexible components. `traverseDFS` goes through the virtual DOM nodes and helps `slots.js` manage where content should go. `fillSlots` lets you add content into components in a dynamic way, which is great for reusing components. These tools work smoothly with `component.js` when rendering. By checking out the examples and following the instructions, you can use them to build clean, reusable components more easily.