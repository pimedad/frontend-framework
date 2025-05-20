# Diffing objects

When comparing two virtual nodes, you need to find the differences between the
attributes of the two nodes (the `props` object) to patch the DOM accordingly. We
want to know what attributes were added, what attributes were removed, and what
attributes changed. This process is called diffing.

# The objectsDiff() function
This is what `objectsDiff()` function does:
- Take a key in the old object. If you don’t see it in the new object, you know that the key was removed. Repeat with all keys.
- Take a key in the new object. If you don’t see it in the old object, you know that the key was added. Repeat with all keys.
- Take a key in the new object. If you see it in the old object and the value associated with the key is different, you know that the value associated with the key changed.

This function is important because updating the DOM can be slow, and diffing helps you make the smallest possible changes. It looks at the keys in the old and new objects, then returns an object with three lists: `added` (keys in the new object but not the old), `removed` (keys in the old object but not the new), and `updated` (keys in both objects with different values). This makes it easy to update the DOM accurately.
```
export function objectsDiff(oldObj, newObj) {
  const oldKeys = Object.keys(oldObj);
  const newKeys = Object.keys(newObj);

  return {
    added: newKeys.filter((key) => !(key in oldObj)), //Keys in the new object that are not in the old object were added.
    removed: oldKeys.filter((key) => !(key in newObj)), // Keys in the old object that are not in the new object were removed.
    updated: newKeys.filter(
      (key) => key in oldObj && oldObj[key] !== newObj[key] // Keys in both objects that have different values were changed.
    ),
  }
}
```

# The hasOwnProperty() Function

The `hasOwnProperty()` function checks if an object has a specific property as its own (not inherited from its prototype). It’s like asking, “Does this object directly own this key?” instead of relying on properties it might get from its parent objects.

This function is needed because JavaScript objects can inherit properties from their prototypes, and using the `in` operator (like in `objectsDiff()`) checks both own and inherited properties. To avoid confusion, `hasOwnProperty()` ensures you’re only looking at properties directly defined on the object. It uses `Object.prototype.hasOwnProperty.call()` to safely check the property, which is useful when the object might have a modified or missing `hasOwnProperty` method.

```
export function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop); // Safely checks if the object owns the property
}
```
