# The arrays.js Explanation

When building a web framework, you need to manage arrays of virtual DOM nodes or attributes, like the `children` of a node or the `class` array in an element’s props. These arrays can change between renders, and you need to find the differences to update the real DOM efficiently. The `arrays.js` file contains utility functions to handle these tasks, such as removing `null` values, comparing arrays for added or removed items, and finding a sequence of operations to transform one array into another.

When using `conditional rendering` (rendering nodes only when a condition is met), some `children` may be `null` in the array, meaning they shouldn’t be rendered. A `null` value indicates that the DOM element shouldn’t be added to the real DOM. The simplest way to handle this is to filter out `null` values from the `children` array when a new virtual node is created, so `null` nodes aren’t passed around the framework.

## The withoutNulls() Function

The `withoutNulls()` function takes an array and returns a new array with all `null` values removed. It’s like cleaning up a list to ensure only valid items, such as virtual nodes, are processed by the framework.

This function is needed to prevent `null` nodes from causing errors during rendering. By filtering out `null` values early, the framework can focus on valid nodes, making the rendering process smoother and more reliable.

```
export function withoutNulls(arr) {
  return arr.filter((item) => item != null);
}
```

## The arraysDiff() Function

The `arraysDiff()` function compares two arrays to find which items were added or removed. For example, when an element’s `class` array changes, like from `['foo', 'bar']` to `['foo', 'baz']`, this function identifies what needs to be updated in the DOM’s `classList`.

This function is important because updating the DOM efficiently requires knowing exactly which items changed. It doesn’t care about the order of items (e.g., `['foo', 'bar']` is the same as `['bar', 'foo']`), only which items were added or removed. For instance, comparing `['A', 'B', 'C']` (old array) to `['A', 'D', 'E']` (new array) shows that `B` and `C` were removed, and `D` and `E` were added. Note that a changed item is treated as a removal of the old item and an addition of the new one.

```
export function arraysDiff(oldArray, newArray) {
  const oldsCount = makeCountMap(oldArray);
  const newsCount = makeCountMap(newArray);
  const diff = mapsDiff(oldsCount, newsCount);

  const added = diff.added.flatMap((key) => Array(newsCount.get(key)).fill(key));
  const removed = diff.removed.flatMap((key) => Array(oldsCount.get(key)).fill(key));

  for (const key of diff.updated) {
    const oldCount = oldsCount.get(key);
    const newCount = newsCount.get(key);
    const delta = newCount - oldCount;

    if (delta > 0) {
      added.push(...Array(delta).fill(key));
    } else {
      removed.push(...Array(-delta).fill(key));
    }
  }

  return {
    added, // Items in newArray not in oldArray
    removed, // Items in oldArray not in newArray
  };
}
```

## The makeCountMap() Function

The `makeCountMap()` function creates a `Map` that counts how many times each item appears in an array. It’s like tallying up items in a list to know their frequency, which helps `arraysDiff()` compare arrays accurately.

This function is needed to handle cases where items appear multiple times in an array. For example, if an array is `['A', 'A', 'B']`, the `Map` would store `A: 2, B: 1`. This makes it easier to detect differences in item counts between two arrays.

```
export function makeCountMap(array) {
  const map = new Map();

  for (const item of array) {
    map.set(item, (map.get(item) || 0) + 1);
  }

  return map;
}
```

## The mapsDiff() Function

The `mapsDiff()` function compares two `Map` objects (like those created by `makeCountMap()`) to find which keys were added, removed, or updated. It’s like comparing two tally sheets to see what’s changed.

This function is needed for `arraysDiff()` because it processes the counts of items to determine differences. For example, if one `Map` has `A: 2, B: 1` and another has `A: 1, C: 1`, it identifies `B` as removed, `C` as added, and `A` as updated (due to the count change).

```
export function mapsDiff(oldMap, newMap) {
  const oldKeys = Array.from(oldMap.keys());
  const newKeys = Array.from(newMap.keys());

  return {
    added: newKeys.filter((key) => !oldMap.has(key)), // Keys in newMap not in oldMap
    removed: oldKeys.filter((key) => !newMap.has(key)), // Keys in oldMap not in newMap
    updated: newKeys.filter((key) => oldMap.has(key) && oldMap.get(key) !== newMap.get(key)), // Keys with different values
  };
}
```

## The ARRAY_DIFF_OP Constant

The `ARRAY_DIFF_OP` constant defines the types of operations used to transform one array into another: `add`, `remove`, `move`, and `noop` (no operation). It’s like a set of labels for the actions the framework can take when updating the DOM.

This constant is needed to standardize operation names across the framework, making the code easier to understand and maintain. For example, `{ op: 'add', item: 'D', index: 2 }` describes adding item `D` at index 2.

```
export const ARRAY_DIFF_OP = {
  ADD: 'add',
  REMOVE: 'remove',
  MOVE: 'move',
  NOOP: 'noop',
};
```

## The ArrayWithOriginalIndices Class

The `ArrayWithOriginalIndices` class wraps an array and keeps track of each item’s original index, even as the array is modified. It’s like a smart list that remembers where items started, which is crucial for operations like moving nodes in the DOM.

This class is needed because virtual DOM nodes (like children of a node) can move, be added, or removed, and the framework needs to know their original positions to patch the DOM correctly. It uses a custom `equalsFn` to compare nodes, since virtual nodes are objects and can’t be compared with `===`. For example, comparing `oldArray = ['X', 'A', 'A', 'B', 'C']` to `newArray = ['C', 'K', 'A', 'B']` requires tracking indices to generate operations like moving `C` from index 4 to 0.

```
class ArrayWithOriginalIndices {
  #array = [];
  #originalIndices = [];
  #equalsFn;

  constructor(array, equalsFn) {
    this.#array = [...array]; // Copy of the original array
    this.#originalIndices = array.map((_, i) => i); // Tracks original indices
    this.#equalsFn = equalsFn; // Custom comparison function
  }

  get length() {
    return this.#array.length; // Current array length
  }

  isRemoval(index, newArray) {
    if (index >= this.length) {
      return false; // No item to remove if index is out of bounds
    }

    const item = this.#array[index];
    const indexInNewArray = newArray.findIndex((newItem) => this.#equalsFn(item, newItem));

    return indexInNewArray === -1; // Item is removed if not found in newArray
  }

  removeItem(index) {
    const operation = {
      op: ARRAY_DIFF_OP.REMOVE,
      index,
      item: this.#array[index],
    };

    this.#array.splice(index, 1); // Remove item from array
    this.#originalIndices.splice(index, 1); // Remove corresponding index

    return operation; // Return remove operation
  }

  isNoop(index, newArray) {
    if (index >= this.length) {
      return false; // No item for a noop if index is out of bounds
    }

    const item = this.#array[index];
    const newItem = newArray[index];

    return this.#equalsFn(item, newItem); // Items are equal (no operation needed)
  }

  originalIndexAt(index) {
    return this.#originalIndices[index]; // Get original index of item
  }

  noopItem(index) {
    return {
      op: ARRAY_DIFF_OP.NOOP,
      originalIndex: this.originalIndexAt(index),
      index,
      item: this.#array[index],
    }; // Return noop operation with original index
  }

  isAddition(item, fromIdx) {
    return this.findIndexFrom(item, fromIdx) === -1; // Item is added if not found in array
  }

  findIndexFrom(item, fromIndex) {
    for (let i = fromIndex; i < this.length; i++) {
      if (this.#equalsFn(item, this.#array[i])) {
        return i; // Return index if item is found
      }
    }

    return -1; // Return -1 if item is not found
  }

  addItem(item, index) {
    const operation = {
      op: ARRAY_DIFF_OP.ADD,
      index,
      item,
    };

    this.#array.splice(index, 0, item); // Add item to array
    this.#originalIndices.splice(index, 0, -1); // Add -1 for new item’s index

    return operation; // Return add operation
  }

  moveItem(item, toIndex) {
    const fromIndex = this.findIndexFrom(item, toIndex);

    const operation = {
      op: ARRAY_DIFF_OP.MOVE,
      originalIndex: this.originalIndexAt(fromIndex),
      from: fromIndex,
      index: toIndex,
      item: this.#array[fromIndex],
    };

    const [_item] = this.#array.splice(fromIndex, 1); // Remove item from current position
    this.#array.splice(toIndex, 0, _item); // Insert item at new position

    const [originalIndex] = this.#originalIndices.splice(fromIndex, 1); // Update indices
    this.#originalIndices.splice(toIndex, 0, originalIndex);

    return operation; // Return move operation
  }

  removeItemsAfter(index) {
    const operations = [];

    while (this.length > index) {
      operations.push(this.removeItem(index)); // Remove excess items
    }

    return operations; // Return array of remove operations
  }
}
```

## The arraysDiffSequence() Function

The `arraysDiffSequence()` function compares two arrays (like the `children` of two virtual nodes) and returns a sequence of operations (`add`, `remove`, `move`, `noop`) to transform the old array into the new one. It’s like creating a step-by-step plan to update the DOM’s child nodes, ensuring the smallest number of changes.

This function is needed for the reconciliation algorithm, which updates the DOM by finding differences between virtual DOM trees. For example, transforming `['A', 'B', 'C']` into `['C', 'B', 'D']` might involve operations like removing `A`, moving `C` to index 0, keeping `B` in place (noop), and adding `D`. The function uses the `ArrayWithOriginalIndices` class to track original indices, ensuring accurate updates, especially for recursive DOM patching.

```
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