# The h() function

The name `h()` is short for `hyperscript`, a script that creates `hypertext`. The name `h()` for the function is a common one used in some frontend frameworks, probably because it’s short and easy to type, which is important because you’ll be using it often.

The `h()` function returns a **virtual node object** with the passed-in `tag` `name`, `props`, and `children`, plus a `type` property set to `DOM_TYPES.ELEMENT`. You want to give default values to the props and children parameters so that you can call the function with only the tag name, as in `h('div')`, which should be equivalent to calling `h('div', {}, [])`.

````
export function h(tag, props = {}, children = []) {
  const type = typeof tag === 'string' ? DOM_TYPES.ELEMENT : DOM_TYPES.COMPONENT;
  return {
    tag,
    props,
    type,
    children: mapTextNodes(withoutNulls(children)),
  };
}
````
# The mapTextNodes() function
The `mapTextNodes()` function transforms strings into text **_virtual nodes_**. Why do that? Well, instead of writing

```
h('div', {}, [hString('Hello '), hString('world!')])
```

we can just write 
```
h('div', {}, ['Hello ', 'world!'])
```

Since we do use text children often, this function will make life easier

```
function mapTextNodes(children) {
    return children.map((child) =>
        typeof child === 'string' ? hString(child) : child
    )
}
```
# The hString() function
the `hString()` function that is used in `mapTextNodes()` is used to create text virtual nodes from strings
```
export function hString(str) {
    return { type: DOM_TYPES.TEXT, value: str }
}
```
# The hFragment() function
Since `fragment` is also a type of **_virtual node_** used to group multiple nodes that need to be attached to the `DOM` together but don’t have a `parent` node in the `DOM`. Just think of a `fragment node` as being a `container` _**for an array of virtual nodes.**_
This where the `hFragment()` function comes to play to create fragment virtual nodes. A `fragment` is an array of child nodes, so its implementation is simple: 

```
export function hFragment(vNodes) {
    return {
        type: DOM_TYPES.FRAGMENT,
        children: mapTextNodes(withoutNulls(vNodes)),
    }
}
```

# The extractChildren() function
You need a function that `extracts` the `children` array from a node in such a way that **_if it encounters a fragment node, it  extracts the children of the fragment node and adds them to the array_**. 
This function needs to be `recursive` so that if a fragment node contains another fragment node, it also extracts the children of the inner fragment node.
Once again: It Extracts the children of a virtual node. If one of the children is a fragment, its children are extracted and added to the list of children. 

In other words, the fragments are replaced by their children.

```
export function extractChildren(vdom) {
  if (vdom.children == null) { // If the node has no children, returns an empty array
    return [];
  }

  const children = [];

  for (const child of vdom.children) { // Iterates over the children
    if (child.type === DOM_TYPES.FRAGMENT) {
      children.push(...extractChildren(child, children)); // If the child is a fragment node, extracts its children recursively
    } else {
      children.push(child); // Otherwise, adds the child to the array
    }
  }

  return children;
}
```
# The didCreateSlot() function
The `didCreateSlot()` function is like a checkpoint that tells you if a component has used a slot. A slot is a special placeholder in a component where you can insert content from outside the component. Not every component uses slots, so checking this helps avoid wasting time looking for slots in components that don’t have them.

This function is important because it makes your code faster. Instead of always searching through a component’s virtual DOM tree for slots, you only do it when `didCreateSlot()` says `true`. This means a slot was created with the `hSlot()` function.

After you check `didCreateSlot()`, you should call `resetDidCreateSlot()` to set the checkpoint back to `false`. This keeps everything ready for the next time the component renders.

```
export function didCreateSlot() {
  return hSlotCalled
}
```

# The resetDidCreateSlot() function
The `resetDidCreateSlot()` function is a simple helper that clears the checkpoint set by `hSlot()`. When a component uses `hSlot()` to create a slot, it sets a flag (`hSlotCalled`) to `true`. After you’ve checked this flag with `didCreateSlot()`, you need to reset it to `false` so the component can start fresh the next time it renders.

This function is needed to keep the slot-checking process clean and accurate. Without resetting the flag, the code might think a slot is still there when it’s not, causing confusion.

```
export function resetDidCreateSlot() {
  hSlotCalled = false
}
```

# The hSlot() function

The `hSlot()` function creates a special kind of virtual node called a **slot node**. A slot is like an empty box in a component where you can put content from outside, like text or other elements. If no outside content is provided, the slot can have default content (passed as `children`).

This function is important because it lets components be flexible. For example, if you’re building a button component, you can use a slot to let users decide what text or icons go inside the button. When `hSlot()` is called, it sets a flag so `didCreateSlot()` knows a slot was used. Later, the component replaces the slot node with the actual content during rendering.

A slot node isn’t meant to be added directly to the DOM, so trying to do that will cause an error. That’s why components handle slots themselves. After using `hSlot()`, you should always call `resetDidCreateSlot()` to clear the flag.

```
export function hSlot(children = []) {
  hSlotCalled = true
  return { type: DOM_TYPES.SLOT, children }
}
```

# The isComponent() function

The `isComponent()` function checks if a virtual node represents a component. A component is like a reusable piece of your app, like a button or a card, and it’s defined as a function. Regular HTML elements, like `div` or `span`, are defined as strings. This function looks at the `tag` of a virtual node to see if it’s a function (a component) or a string (an element).

This is useful because components and elements are handled differently when rendering. Components have their own logic and might create their own virtual DOM trees, while elements are simpler and go straight to the DOM. By checking this, your code knows how to process the node correctly.

```
export function isComponent({ tag }) {
  return typeof tag === 'function'
}
```