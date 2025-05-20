# Mounting the virtual DOM
Given a `virtual DOM tree`, you want your `framework` to create the real `DOM` tree from  it and attach it to the browser’s document. We call this process **`mounting the virtual DOM.`**

For example if we define a `virtual DOM`, we define its as
```
const vdom = h('form', { class: 'login-form', action: 'login' }, [
    h('input', { type: 'text', name: 'user' }),
    h('input', { type: 'password', name: 'pass' }),
    h('button', { on: { click: login } }, ['Login'])
])
```
passed to the `mountDOM()` function as `mountDOM(vdom, document.body)`. This `HTML` tree would be attached to the `<body>` element, and the resulting `HTML`
markup would be
```
<body>
    <form class="login-form" action="login">
        <input type="text" name="user">
        <input type="password" name="pass">
        <button>Login</button>
    </form>
</body>
```
A virtual node of type `text` requires a `Text` node to be created (via the `document.createTextNode()` method).<br>A virtual `node` of type `element` requires an Element node to be created (via the `document.createElement()` method).

# The mountDOM() function
```
export function mountDOM(vdom, parentEl, index, hostComponent = null) {
  switch (vdom.type) {
    case DOM_TYPES.TEXT: {
      createTextNode(vdom, parentEl, index); // Mounts a text virtual node
      break;
    }

    case DOM_TYPES.ELEMENT: {
      createElementNode(vdom, parentEl, index, hostComponent); // Mounts an element virtual node
      break;
    }

    case DOM_TYPES.FRAGMENT: {
      createFragmentNodes(vdom, parentEl, index, hostComponent); // Mounts the children of a fragment virtual node
      break;
    }

    case DOM_TYPES.COMPONENT: { // Checks whetherthe node is a component
      createComponentNode(vdom, parentEl, index, hostComponent); // Mounts the component node
      enqueueJob(() => vdom.component.onMounted());
      break;
    }

    default: {
      throw new Error(`Can't mount DOM of type: ${vdom.type}`);
    }
  }
}
```
The function uses a `switch statement` that checks the type of the virtual node. Depending on the node’s type, the appropriate function to create the real DOM node gets called.

- `createTextNode()` method creates text node via Document API. This method expects a string as an argument, which is the text that the text node will contain. The virtual
  nodes created by the `hString()` function implemented in `h.js` have the following structure:
    ````
      {
        type: DOM_TYPES.TEXT,
        value: 'I need more coffee'
      }
    ````
    ```
  function createTextNode(vdom, parentEl) {
        const { value } = vdom
    
        const textNode = document.createTextNode(value) // Creates a text node
        vdom.el = textNode // Saves a reference of the node
    
        parentEl.append(textNode) // Appends to the parent element
  }
    ```
  
-  `createElementNode()` function turns an element virtual node (like one created by `h()` for a `div` or `button`) into a real HTML element in the DOM. It’s like building a piece of the webpage, such as a `<div>` or `<button>`, and filling it with its properties and children.

  This function is needed because most of your webpage is made up of elements like divs, buttons, or inputs. It creates the element, adds its properties (like `class` or `id`), and then processes its children (which could be text, other elements, or components) by calling `mountDOM()` on each one. Finally, it attaches the element to the parent at the right spot.

  ```
  function createElementNode(vdom, parentEl, index, hostComponent) {
    const { tag, children } = vdom;
  
    const element = document.createElement(tag); // Creates a real HTML element
    addProps(element, vdom, hostComponent); // Adds properties and events
    vdom.el = element; // Saves the element for later use
  
    children.forEach((child) => mountDOM(child, element, null, hostComponent)); // Mounts all children
    insert(element, parentEl, index); // Adds the element to the parent
  }
  ```
  
- `createFragmentNodes()` method creates the nodes for the children of a virtual DOM fragment node and appends them to the parent element.
  ```
  function createFragmentNodes(vdom, parentEl, index, hostComponent) {
  const { children } = vdom;
  vdom.el = parentEl;

  for (const child of children) {
    mountDOM(child, parentEl, index, hostComponent);

    if (index == null) {
      continue;
    };

    switch (child.type) {
      case DOM_TYPES.FRAGMENT:
        index += child.children.length;
        break;
      case DOM_TYPES.COMPONENT:
        index += child.component.elements.length;
        break;
      default:
        index++;
    }
   }
  }

- `createElementNode()` function turns an element virtual node (like one created by `h()` for a `div` or `button`) into a real HTML element in the DOM. It’s like building a piece of the webpage, such as a `<div>` or `<button>`, and filling it with its properties and children. 

  <br>This function is needed because most of your webpage is made up of elements like `divs`, `buttons`, or `inputs`. It creates the element, adds its properties (like `class` or `id`), and then processes its `children` (which could be `text`, other elements, or components) by calling `mountDOM()` on each one. Finally, it attaches the element to the `parent` at the right spot.

  ```
  function createElementNode(vdom, parentEl, index, hostComponent) {
    const { tag, children } = vdom;
  
    const element = document.createElement(tag); // Creates a real HTML element
    addProps(element, vdom, hostComponent); // Adds properties and events
    vdom.el = element; // Saves the element for later use
  
    children.forEach((child) => mountDOM(child, element, null, hostComponent)); // Mounts all children
    insert(element, parentEl, index); // Adds the element to the parent
  }
  ```
  
- `createComponentNode()` function handles component virtual nodes, which represent reusable parts of your app, like a button or a form. It’s like setting up a mini-app inside your webpage, with its own logic and content.

  This function is important because `components` are a key part of building reusable and organized code. It creates a new instance of the component, passes it the properties and events, sets up any external content (like `slot` content), and connects it to the app’s context. Then, it mounts the component to the DOM and schedules its `onMounted()` method to run after mounting, which is useful for setup tasks like fetching data.

  ```
  function createComponentNode(vdom, parentEl, index, hostComponent) {
    const { tag: Component, children } = vdom;
    const { props, events } = extractPropsAndEvents(vdom);
    const component = new Component(props, events, hostComponent); // Creates a new component instance
    component.setExternalContent(children); // Sets slot or child content
    component.setAppContext(hostComponent?.appContext ?? {}); // Sets the app context
  
    component.mount(parentEl, index); // Mounts the component
    vdom.component = component; // Saves the component instance
    vdom.el = component.firstElement; // Saves the first DOM element
  }
  ```

- `insert()` function adds a DOM element to a parent element at a specific position. Think of it as a helper that decides where to place a new element in the DOM, like putting a new book on a shelf at a certain spot.

  This function is needed because sometimes you want to `add` an element at a specific place in the parent’s list of children, not just at the end. For example, if you’re adding a new item to a list, you might want it to go in the middle, not always at the bottom. The `index` parameter tells the function where to put the element. If no index is given, it just adds the element to the end.

  ```
  function insert(el, parentEl, index) {
    if (index == null) {
      parentEl.append(el); // Adds to the end if no index is provided
      return;
    }
  
    if (index < 0) {
      throw new Error(`Index must be a positive integer, got ${index}`); // Prevents invalid indexes
    }
  
    const children = parentEl.childNodes;
  
    if (index >= children.length) {
      parentEl.append(el); // Adds to the end if index is too big
    } else {
      parentEl.insertBefore(el, children[index]); // Inserts at the specified index
    }
  }
  ```
  
- `addProps()` function adds properties (like `class` or `id`) and event listeners (like `onclick`) to a real DOM element. It’s like decorating an element with all the attributes and behaviors it needs to work as intended.

  This function is important because elements in the DOM need attributes to look and act correctly, like having a specific style or responding to a user’s click. It splits the virtual node’s properties into attributes and events, applies the attributes with `setAttributes()`, and adds the event listeners with `addEventListeners()`. It also saves the listeners so they can be removed or updated later.
  As you can see, the props property of the virtual node contains the attributes and event listeners. But attributes and event listeners are handled differently `-> ../documentation/evenListenerDocumentation.md`
  ```
  function addProps(el, vdom, hostComponent) {
    const { props: attrs, events } = extractPropsAndEvents(vdom);
  
    vdom.listeners = addEventListeners(events, el, hostComponent); // Adds event listeners
    setAttributes(el, attrs); // Adds attributes like class or id
  }
  ```