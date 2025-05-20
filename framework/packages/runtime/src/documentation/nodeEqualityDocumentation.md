# Virtual node equality

You want to know when `two virtual nodes` are `equal` so that you can reuse the existing DOM node.
Reusing an existing DOM node and patching its properties is much more `efficient` than `destroying` it and mounting a new one, so you want to `reuse nodes as much as possible.`

<br>For two virtual nodes to be equal, first they need to be of the `same type`. 
A text node and an element node, for example, can never be equal because you wouldn’t be able to reuse the existing DOM node. 
When you know that the two nodes you’re comparing are of the same type, the `rules` are as follows:

- **Text nodes**: Two text nodes are always equal, even if their text content is different.
- **Fragment nodes**: Two fragment nodes are always equal, even if they contain different children.
- **Element nodes**: Two element nodes are equal if they have the same `tagName` (e.g., both are `<input>`) and the same `key` attribute (if provided).
- **Component nodes**: Two component nodes are equal if they are instances of the same component prototype (e.g., the same `Counter` class) and have the same `key` attribute (if provided).


# Comparing Virtual DOM Nodes

When updating a webpage, the framework compares virtual DOM nodes to decide what changes to make in the real DOM. This table explains the rules for determining when two nodes are considered equal or not, which helps the framework update the DOM efficiently.

| **Node Type 1** | **Node Type 2** | **Attributes (Node 1)** | **Attributes (Node 2)** | **Equal?** | **Explanation** |
|-----------------|-----------------|-------------------------|-------------------------|------------|------------------------------------------------------------------------------------------------|
| Text            | Text            | "What is love?"         | "Baby don't hurt me"    | Yes        | Text nodes are always equal, regardless of their content.                                      |
| Fragment        | Fragment        | -                       | -                       | Yes        | Fragment nodes are always equal, as they are just containers for other nodes.                  |
| Element         | Element         | `<input type="text" class="error">` | `<input type="number" id="age">` | Yes        | Element nodes are equal if they have the same tag (e.g., both are `<input>`). Attributes don’t matter. |
| Element         | Element         | `<input type="text" class="error">` | `<button type="button" class="error">` | No         | Element nodes with different tags (e.g., `<input>` vs. `<button>`) are not equal.              |
| Text            | Fragment        | "What is love?"         | -                       | No         | Nodes of different types (e.g., text vs. fragment) are never equal.                            |
| Text            | Element         | "Baby don't hurt me"    | `<input type="text" class="error">` | No         | Nodes of different types (e.g., text vs. element) are never equal.                             |


# The Key Attribute for Components

Components have internal state, like a `count` in a `Counter` component, that isn’t visible in the virtual DOM tree. This makes it hard for the reconciliation algorithm to tell components apart when updating a list. For example, if you have a list of `Counter` components:

```
h('div', {}, [
  h(Counter, { initialCount: 0 }),
  h(Counter, { initialCount: 1 }),
  h(Counter, { initialCount: 2 }),
])
```

and remove the middle one, the algorithm can’t tell which component was removed without extra help. This could lead to incorrect updates, like keeping the wrong `Counter` values in the DOM.

To solve this, developers can add a `key` attribute to each component to give it a unique identifier, like this:

```
h('div', {}, [
  h(Counter, { key: 'counter-0', initialCount: 0 }),
  h(Counter, { key: 'counter-1', initialCount: 1 }),
  h(Counter, { key: 'counter-2', initialCount: 2 }),
])
```

If the middle component (`key: 'counter-1'`) is removed, the new virtual DOM tree becomes:

```
h('div', {}, [
  h(Counter, { key: 'counter-0', initialCount: 0 }),
  h(Counter, { key: 'counter-2', initialCount: 2 }),
])
```

The `key` attribute lets the reconciliation algorithm know exactly which component was removed, ensuring the DOM updates correctly to show `Count: 0` and `Count: 2`. Without keys, the algorithm might mistakenly think the last component was removed, leading to errors.

The downside is that developers must provide unique `key` attributes. Using list indexes as keys (e.g., `key: 0`, `key: 1`) is a bad idea because it can cause problems if the list order changes. It’s better to use something unique, like an ID from your data.

# The areNodesEqual() Function

The `areNodesEqual()` function checks if two virtual nodes are equal based on the rules above. It’s like a referee that decides whether a DOM node can be reused or needs to be replaced during an update.

This function is crucial for efficient DOM updates. It first checks if the nodes have the same `type`. If they do, it applies specific rules: for element nodes, it compares their tags and `key` attributes; for component nodes, it compares their prototypes (e.g., the same `Counter` class) and `key` attributes; for text and fragment nodes, it considers them equal. This ensures the framework reuses nodes when possible, making updates faster and more accurate.

```
import { DOM_TYPES } from "./h";

export function areNodesEqual(nodeOne, nodeTwo) {
  if (nodeOne.type !== nodeTwo.type) {
    return false; // Nodes of different types are never equal
  }

  if (nodeOne.type === DOM_TYPES.ELEMENT) {
    const { tag: tagOne, props: { key: keyOne } } = nodeOne;
    const { tag: tagTwo, props: { key: keyTwo } } = nodeTwo;

    return tagOne === tagTwo && keyOne === keyTwo; // Element nodes are equal if tags and keys match
  }

  if (nodeOne.type === DOM_TYPES.COMPONENT) {
    const { tag: componentOne, props: { key: keyOne } } = nodeOne;
    const { tag: componentTwo, props: { key: keyTwo } } = nodeTwo;

    return componentOne === componentTwo && keyOne === keyTwo; // Component nodes are equal if prototypes and keys match
  }

  return true; // Text and fragment nodes are always equal
}
```