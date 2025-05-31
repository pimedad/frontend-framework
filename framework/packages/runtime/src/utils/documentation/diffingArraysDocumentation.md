# The arrays.js Documentation

When building a web framework, you need to manage arrays of virtual DOM nodes or attributes, like the `children` of a node or the `class` array in an element’s props. These arrays can change between renders, and you need to find the differences to update the real DOM efficiently. The `arrays.js` file contains utility functions to handle these tasks, such as removing `null` values, comparing arrays for added or removed items, and finding a sequence of operations to transform one array into another.

When using `conditional rendering` (rendering nodes only when a condition is met), some `children` may be `null` in the array, meaning they shouldn’t be rendered. A `null` value indicates that the DOM element shouldn’t be added to the real DOM. The simplest way to handle this is to filter out `null` values from the `children` array when a new virtual node is created, so `null` nodes aren’t passed around the framework.

---
## Functions and Features in arrays.js

Below, we describe each function in `arrays.js`, including its purpose, how it works, the code with detailed comments, some examples, and where it’s used in the framework. Each code line has a comment explaining what it does, why it’s there, and how it helps, making it easy for you to follow along.

---

## The withoutNulls() Function

**Purpose**: Removes `null` or `undefined` items from a list, returning a new list with only valid items. This is like cleaning up a guest list to include only people who RSVP’d.

**How It Works**:
- Takes a list (`arr`) as input.
- Uses the `filter` method to keep only items that aren’t `null` or `undefined`.
- Returns a new list, leaving the original unchanged.
- Used to ensure virtual DOM nodes (parts of your webpage) don’t include empty placeholders that could cause errors when rendering.

**Code**:
```javascript
export function withoutNulls(arr) {
  return arr.filter((item) => item != null); // Keeps only items that are not null or undefined
}
```

**Example**:
Imagine you’re building a webpage with a list of buttons, but some buttons are hidden based on user permissions:
```javascript
import { withoutNulls } from './arrays.js';
const isAdmin = false;
const children = [
  h('button', {}, ['Save']), // A valid button
  isAdmin ? h('button', {}, ['Delete']) : null, // null if not admin
  h('button', {}, ['Cancel']), // Another valid button
];
const validChildren = withoutNulls(children);
console.log(validChildren); // [{button: Save}, {button: Cancel}]
```
This removes the `null` button, ensuring only valid buttons are rendered.

**Where It’s Used**:
- In `h.js` (e.g., `h()` and `hFragment()`), to clean up `children` arrays before creating virtual nodes.
- Example: `h('div', {}, withoutNulls([null, h('span', {}, ['Text'])]))` ensures no `null` nodes are processed.

## The arraysDiff() Function

**Purpose**: Compares two lists to find which items were added or removed, like checking what’s changed in a shopping list between two trips.

**How It Works**:
- Counts items in both lists using `makeCountMap()`.
- Compares counts using `mapsDiff()` to identify added, removed, or updated items.
- Builds lists of `added` and `removed` items, accounting for items that appear multiple times.
- Returns an object with `added` and `removed` arrays.
- Used to update DOM attributes, like `classList`, by identifying changes efficiently.

**Code**:
```javascript
export function arraysDiff(oldArray, newArray) {
  const oldsCount = makeCountMap(oldArray); // Counts items in old array (e.g., {A: 2, B: 1})
  const newsCount = makeCountMap(newArray); // Counts items in new array (e.g., {A: 1, C: 1})
  const diff = mapsDiff(oldsCount, newsCount); // Compares counts to find added/removed/updated items
  const added = diff.added.flatMap((key) => Array(newsCount.get(key)).fill(key)); // Lists added items, repeating as needed
  const removed = diff.removed.flatMap((key) => Array(oldsCount.get(key)).fill(key)); // Lists removed items, repeating as needed
  for (const key of diff.updated) { // Handles items with changed counts
    const oldCount = oldsCount.get(key); // Gets old count of item
    const newCount = newsCount.get(key); // Gets new count of item
    const delta = newCount - oldCount; // Calculates count difference
    if (delta > 0) { // If count increased
      added.push(...Array(delta).fill(key)); // Adds extra occurrences to added list
    } else { // If count decreased
      removed.push(...Array(-delta).fill(key)); // Adds missing occurrences to removed list
    }
  }
  return { added, removed }; // Returns object with added and removed items
}
```


**Example**:
Suppose you’re updating a button’s classes:
```javascript
import { arraysDiff } from './arrays.js';
const oldClasses = ['btn', 'primary'];
const newClasses = ['btn', 'secondary'];
const diff = arraysDiff(oldClasses, newClasses);
console.log(diff); // { added: ['secondary'], removed: ['primary'] }
```
This tells you to remove `primary` and add `secondary` to the button’s `classList`.

**Where It’s Used**:
- In `patch-dom.js`, to update element attributes like `class` or event listeners.
- Example: Comparing old and new `class` arrays to apply changes via `element.classList`.

## The makeCountMap() Function

**Purpose**: Creates a tally of how many times each item appears in a list, like counting how many of each fruit you have in a basket.

**How It Works**:
- Creates a `Map` to store items and their counts.
- Loops through the list, incrementing the count for each item.
- Returns the `Map` for comparison in `arraysDiff()`.

**Code with Comments**:
```javascript
export function makeCountMap(array) {
  const map = new Map(); // Creates a new Map to store item counts
  for (const item of array) { // Loops through each item in the array
    map.set(item, (map.get(item) || 0) + 1); // Increments count for item (starts at 0 if new)
  }
  return map; // Returns the Map with item counts
}
```

**Example**:
Counting items in a list of tags:
```javascript
import { makeCountMap } from './arrays.js';
const tags = ['news', 'sports', 'news'];
const countMap = makeCountMap(tags);
console.log(countMap); // Map { 'news' => 2, 'sports' => 1 }
```

**Where It’s Used**:
- In `arraysDiff()`, to count items in old and new arrays for comparison.
- Example: `makeCountMap(['A', 'A', 'B'])` creates `Map { A: 2, B: 1 }`.

## The mapsDiff() Function

**Purpose**: Compares two tally sheets (Maps) to find which items were added, removed, or changed in count, like comparing two inventory lists.

**How It Works**:
- Gets the keys (items) from both Maps.
- Identifies keys present in one Map but not the other (`added`, `removed`).
- Finds keys with different counts (`updated`).
- Returns an object with these differences.

**Code with Comments**:
```javascript
export function mapsDiff(oldMap, newMap) {
  const oldKeys = Array.from(oldMap.keys()); // Gets list of items in old Map
  const newKeys = Array.from(newMap.keys()); // Gets list of items in new Map
  return {
    added: newKeys.filter((key) => !oldMap.has(key)), // Items only in new Map
    removed: oldKeys.filter((key) => !newMap.has(key)), // Items only in old Map
    updated: newKeys.filter((key) => oldMap.has(key) && oldMap.get(key) !== newMap.get(key)), // Items with different counts
  };
}
```

**Example**:
Comparing tag counts:
```javascript
import { makeCountMap, mapsDiff } from './arrays.js';
const oldMap = makeCountMap(['news', 'news']);
const newMap = makeCountMap(['news', 'sports']);
const diff = mapsDiff(oldMap, newMap);
console.log(diff); // { added: ['sports'], removed: [], updated: ['news'] }
```

**Where It’s Used**:
- In `arraysDiff()`, to compare item counts between old and new arrays.
- Example: Identifies changes in `class` counts for DOM updates.

## The ARRAY_DIFF_OP Constant

**Purpose**: Defines labels for operations (add, remove, move, no-op) used to update lists, like a set of instructions for changing a webpage.

**How It Works**:
- Provides standard names for operations.
- Used by `ArrayWithOriginalIndices` and `arraysDiffSequence()` to describe actions.

**Code with Comments**:
```javascript
export const ARRAY_DIFF_OP = {
  ADD: 'add', // Label for adding an item
  REMOVE: 'remove', // Label for removing an item
  MOVE: 'move', // Label for moving an item
  NOOP: 'noop', // Label for no change (no operation)
};
```

**Example**:
Using operation labels:
```javascript
import { ARRAY_DIFF_OP } from './arrays.js';
console.log(ARRAY_DIFF_OP.ADD); // 'add'
```

**Where It’s Used**:
- In `ArrayWithOriginalIndices` methods to tag operations.
- Example: `{ op: ARRAY_DIFF_OP.ADD, item: 'D', index: 2 }` describes adding `D`.

## The ArrayWithOriginalIndices Class

**Purpose**: Manages a list while tracking each item’s original position, like keeping track of where students sat in a classroom even if they move.

**How It Works**:
- Stores a copy of the list and its original indices.
- Uses a custom comparison function (`equalsFn`) to handle complex items (e.g., virtual DOM nodes).
- Provides methods to check for removals, additions, moves, or no-ops, and generates operations to update the list.

**Code with Comments**:
```javascript
class ArrayWithOriginalIndices {
  #array = []; // Stores the current list
  #originalIndices = []; // Tracks original positions of items
  #equalsFn; // Custom function to compare items
  constructor(array, equalsFn) {
    this.#array = [...array]; // Copies input list to avoid modifying original
    this.#originalIndices = array.map((_, i) => i); // Assigns indices 0, 1, 2, ...
    this.#equalsFn = equalsFn; // Stores comparison function
  }
  get length() {
    return this.#array.length; // Returns current list length
  }
  isRemoval(index, newArray) {
    if (index >= this.length) { // Checks if index is valid
      return false; // No item to remove
    }
    const item = this.#array[index]; // Gets item at index
    const indexInNewArray = newArray.findIndex((newItem) => this.#equalsFn(item, newItem)); // Checks if item is in new list
    return indexInNewArray === -1; // True if item is not in new list
  }
  removeItem(index) {
    const operation = { // Creates operation object
      op: ARRAY_DIFF_OP.REMOVE, // Marks as remove operation
      index, // Stores index of removal
      item: this.#array[index], // Stores item being removed
    };
    this.#array.splice(index, 1); // Removes item from list
    this.#originalIndices.splice(index, 1); // Removes corresponding index
    return operation; // Returns operation
  }
  isNoop(index, newArray) {
    if (index >= this.length) { // Checks if index is valid
      return false; // No item for no-op
    }
    const item = this.#array[index]; // Gets current item
    const newItem = newArray[index]; // Gets item in new list
    return this.#equalsFn(item, newItem); // True if items are same
  }
  originalIndexAt(index) {
    return this.#originalIndices[index]; // Returns original index
  }
  noopItem(index) {
    return { // Creates no-op operation
      op: ARRAY_DIFF_OP.NOOP, // Marks as no operation
      originalIndex: this.originalIndexAt(index), // Includes original index
      index, // Includes current index
      item: this.#array[index], // Includes item
    };
  }
  isAddition(item, fromIdx) {
    return this.findIndexFrom(item, fromIdx) === -1; // True if item not found in list
  }
  findIndexFrom(item, fromIndex) {
    for (let i = fromIndex; i < this.length; i++) { // Loops from given index
      if (this.#equalsFn(item, this.#array[i])) { // Checks if item matches
        return i; // Returns index
      }
    }
    return -1; // Returns -1 if not found
  }
  addItem(item, index) {
    const operation = { // Creates add operation
      op: ARRAY_DIFF_OP.ADD, // Marks as add operation
      index, // Stores index for addition
      item, // Stores item to add
    };
    this.#array.splice(index, 0, item); // Inserts item at index
    this.#originalIndices.splice(index, 0, -1); // Adds -1 for new item
    return operation; // Returns operation
  }
  moveItem(item, toIndex) {
    const fromIndex = this.findIndexFrom(item, toIndex); // Finds item’s current index
    const operation = { // Creates move operation
      op: ARRAY_DIFF_OP.MOVE, // Marks as move operation
      originalIndex: this.originalIndexAt(fromIndex), // Stores original index
      from: fromIndex, // Stores current index
      index: toIndex, // Stores target index
      item: this.#array[fromIndex], // Stores item
    };
    const [_item] = this.#array.splice(fromIndex, 1); // Removes item
    this.#array.splice(toIndex, 0, _item); // Inserts at new position
    const [originalIndex] = this.#originalIndices.splice(fromIndex, 1); // Updates indices
    this.#originalIndices.splice(toIndex, 0, originalIndex); // Inserts original index
    return operation; // Returns operation
  }
  removeItemsAfter(index) {
    const operations = []; // Stores remove operations
    while (this.length > index) { // Removes items beyond index
      operations.push(this.removeItem(index)); // Adds remove operation
    }
    return operations; // Returns operations
  }
}
```

**Example**:
Tracking a list of webpage elements:
```javascript
import { ArrayWithOriginalIndices } from './arrays.js';
const oldList = [{ id: 1 }, { id: 2 }];
const equalsFn = (a, b) => a.id === b.id;
const tracker = new ArrayWithOriginalIndices(oldList, equalsFn);
tracker.addItem({ id: 3 }, 1); // Adds { id: 3 } at index 1
console.log(tracker); // List: [{ id: 1 }, { id: 3 }, { id: 2 }]
```

**Where It’s Used**:
- In `arraysDiffSequence()`, to track indices during DOM updates.
- Example: Managing `children` arrays in virtual DOM reconciliation.

## The arraysDiffSequence() Function

The `arraysDiffSequence()` function compares two arrays (like the `children` of two virtual nodes) and returns a sequence of operations (`add`, `remove`, `move`, `noop`) to transform the old array into the new one. It’s like creating a step-by-step plan to update the DOM’s child nodes, ensuring the smallest number of changes.

This function is needed for the reconciliation algorithm, which updates the DOM by finding differences between virtual DOM trees. For example, transforming `['A', 'B', 'C']` into `['C', 'B', 'D']` might involve operations like removing `A`, moving `C` to index 0, keeping `B` in place (noop), and adding `D`. The function uses the `ArrayWithOriginalIndices` class to track original indices, ensuring accurate updates, especially for recursive DOM patching.

```javascript
export function arraysDiffSequence(oldArray, newArray, equalsFn = (a, b) => a === b) {
  const sequence = [];
  const array = new ArrayWithOriginalIndices(oldArray, equalsFn);

  for (let index = 0; index < newArray.length; index++) {
    if (array.isRemoval(index, newArray)) {
      sequence.push(array.removeItem(index)); // Remove item not in newArray
      index--; // Stay at same index
      continue;
    }
    if (array.isNoop(index, newArray)) {
      sequence.push(array.noopItem(index)); // No operation if items match
      continue;
    }
    
    const item = newArray[index];

    if (array.isAddition(item, index)) {
      sequence.push(array.addItem(item, index)); // Add item not in oldArray
      continue;
    }
    
    sequence.push(array.moveItem(item, index)); // Move item to correct position
  }

  sequence.push(...array.removeItemsAfter(newArray.length)); // Remove excess items

  return sequence; // Return sequence of operations
}
```