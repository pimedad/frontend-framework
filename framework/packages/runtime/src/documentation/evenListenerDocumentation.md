# The EventListeners 
Setting the attributes and adding event listeners is the part where the code differs
from text nodes. With text nodes, you want to attach event listeners and set attributes
to the parent element node, not to the text node itself.

# Adding event listeners
To add an event listener to an element node -> its `addEventListener()` method. This `method` is available because an element node is an
instance of the `EventTarget` interface. This `interface`, which declares the `addEventListener()` method, is implemented by all the DOM nodes that can receive events.
All instances returned by calling `document.createElement()` implement the `EventTarget` interface, that's why it can safely call the `addEventListener()` method on them.

This implementation of the `addEventListener()` function is very simple: it calls the `addEventListener()` method on the element and return the event handler function it registered.
We have to return the function registered as
an event handler because when we use the `destroyDOM()` method (as you can find out in -> `../src/documentation/destroyingDomDocumentation.md`), we’ll need to remove the event listeners to avoid memory leaks. Handler function that was registered in the event listener to be able to remove it by passing it as an argument to the
`removeEventListener()` method.

# The addEventListener() function 
```
export function addEventListener(eventName, handler, el, hostComponent = null) {
  function boundHandler() {
    hostComponent ? handler.apply(hostComponent, arguments) : handler(...arguments);
  }

  el.addEventListener(eventName, boundHandler);

  return boundHandler;
}
```

The `addEventListener()` function attaches a single event listener to a DOM element. For example, it can make a button respond to a click or an input react to typing. It’s like telling an element, “When this happens, do that.”

This function is important because it lets your webpage interact with users. It creates a special version of the event handler (called `boundHandler`) that works with a component if one is provided. This ensures the handler runs in the right context, like accessing the component’s data. The function also returns the `boundHandler` so it can be stored and later removed when cleaning up with `removeEventListener()`. This prevents memory leaks, which can happen if event listeners are left attached to elements that are no longer in use.

the `addEventListener()` function is simple. But if you recall, the event listeners defined in a virtual node come packed in an object. The keys are the event names, and the values are the event handler functions, like so:
```
{
    type: DOM_TYPES.ELEMENT,
    tag: 'button',
    props: {
        on: {
            mouseover: () => console.log('almost yay!'),
            click: () => console.log('yay!') ,
            dblclick: () => console.log('double yay!'),
            }
        }
}
```
# The addEventListeners() function
It makes sense to have another function, if only for convenience, that allows you to add multiple event listeners in the form of an object to an element node. function called `addEventListeners()` `(plural)`: 
```
export function addEventListeners(listeners = {}, el, hostComponent = null) {
  const addedListeners = {};

  Object.entries(listeners).forEach(([eventName, handler]) => {
    const listener = addEventListener(eventName, handler, el, hostComponent);
    addedListeners[eventName] = listener;
  });

  return addedListeners;
}
```

The `addEventListeners()` function adds multiple event listeners to a DOM element at once. It’s like setting up all the interactive behaviors for an element in one go, such as handling clicks, mouse hovers, or key presses.

This function is needed because elements often need to respond to more than one type of event. Instead of adding each event listener one by one, this function loops through a list of events and their handlers, using `addEventListener()` to attach each one. It also keeps track of all the handlers in an object (`addedListeners`) and returns it. This is important because you’ll need those handlers later to remove the listeners when the element is no longer needed, avoiding memory leaks.

# The removeEventListeners() function

The `removeEventListeners()` function removes event listeners from a DOM element. It’s like telling an element to stop listening for certain user actions, such as clicks or key presses, when you’re done with it.

This function is crucial for cleaning up your webpage. When elements are removed from the DOM (like when a component is destroyed), you need to remove their event listeners to free up memory. Without this, the browser might keep unused listeners around, causing memory leaks that slow down your app. The function uses the stored handlers from `addEventListeners()` to know exactly which listeners to remove with `removeEventListener()`.

```
export function removeEventListeners(listeners = {}, el) {
  Object.entries(listeners).forEach(([eventName, handler]) => {
    el.removeEventListener(eventName, handler); // Removes each event listener
  });
}
```