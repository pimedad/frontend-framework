# Destroying the DOM

Destroying the
DOM is simpler than mounting it. Well, destroying anything is always simpler than
creating it in the first place. Destroying the DOM is the process in which the HTML
elements that the mountDOM() function created are removed from the document

To destroy the DOM associated with a virtual node, you have to take into account
what type of node it is:
- Text node—Remove the text node from its parent element, using the remove()
method.
- Fragment node—Remove each of its children from the parent element (which, if
you recall, is referenced in the element property of the fragment virtual node).
- Element node—Do the two preceding things and remove the event listeners from
the element.


In all cases, you want to remove the el property from the virtual node, and in the case
of an element node, you also remove the listeners property so you can tell that the
virtual node has been destroyed, allowing the garbage collector to free the memory of
the HTML element. When a virtual node doesn’t have an el property, you can safely
assume that it’s not mounted to the real DOM and therefore can’t be destroyed. To
handle these three cases, you need a switch statement that (depending on the type
property of the virtual node) calls a different function.

# The destroyDOM() function 
```javascript
export function destroyDOM(vdom) {
  const { type } = vdom;

  switch (type) {
    case DOM_TYPES.TEXT: {
      removeTextNode(vdom);
      break;
    }

    case DOM_TYPES.ELEMENT: {
      removeElementNode(vdom);
      break;
    }

    case DOM_TYPES.FRAGMENT: {
      removeFragmentNodes(vdom);
      break;
    }

    case DOM_TYPES.COMPONENT: {
      vdom.component.unmount();
      enqueueJob(() => vdom.component.onUnmounted());
      break;
    }

    default: {
      throw new Error(`Can't destroy DOM of type: ${type}`);
    }
  }

  delete vdom.el;
}
```

# Destroying a text node
Destroying a text node is the simplest case:
```javascript
function removeTextNode(vdom) {
  const { el } = vdom;
  el.remove();
}
```

# Destroying an element
The code for destroying an element is a bit more interesting. To destroy an element,
we start by removing it from the DOM, similar to whats done with a text node. Then
recursively destroy the children of the element by calling the `destroyDOM()` function
for each of them. Finally, remove the event listeners from the element and delete the
listeners property from the virtual node: 

```javascript
function removeElementNode(vdom) {
  const { el, children, listeners } = vdom;

  el.remove();
  children.forEach(destroyDOM);

  if (listeners) {
    removeEventListeners(listeners, el);
    delete vdom.listeners;
  }
}
```

Here’s where the `removeEventListeners() function` is being used to remove the event listeners from the element.

# Destroying a fragment
Destroying a fragment is easy: simply call the `destroyDOM()` function for each of its `children`. 
But keep in mind not to remove the el referenced in the fragment’s virtual node from the DOM; 
<br>that `el` references the element where the fragment children are mounted, not the fragment itself. If the fragment children were mounted inside the
`<body>` and we would have called the `remove()` method on the element, we’d remove the `whole` document from the DOM.

```javascript
function removeFragmentNodes(vdom) {
  const { children } = vdom;
  children.forEach(destroyDOM);
}
```