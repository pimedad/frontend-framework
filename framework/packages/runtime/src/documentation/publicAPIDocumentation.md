# The index.js Documentation: Public API

This document describes the purpose and role of the `index.js` file in the DotJS frontend framework. As the primary entry point, `index.js` defines the <ins>**public API**</ins>, exporting the core functions and components that developers can use to build and manage single-page applications (`SPAs`). The goal is to provide an interface for creating applications, defining components, rendering virtual DOM nodes, implementing client-side routing, and scheduling tasks.

---

## Purpose and Role of `index.js`
The `index.js` file serves as the <ins>**public API**</ins> of the DotJS framework, acting as a `central hub` that exposes essential functions and components to developers. It is the starting point for interacting with the framework, allowing users to import only what they need to create and manage their applications. As noted in <ins>*Build a Frontend Web Framework (From Scratch)*</ins>, “Whatever you export from the `src/index.js` file is what’s going to be available to the users of your framework” (Listing 12.8). This makes `index.js` critical for defining the developer experience, ensuring simplicity and accessibility.
### Key Responsibilities
- **Export Core Functionality**: Provides functions like `createApp` and `defineComponent` to initialize applications and create reusable components.
- **Virtual DOM Creation**: Exports `h`, `hString`, `hFragment`, `hSlot`, and `DOM_TYPES` for constructing virtual DOM nodes.
- **Routing Support**: Exports `HashRouter`, `RouterLink`, and `RouterOutlet` for client-side navigation.
- **Task Scheduling**: Exports `nextTick` for coordinating asynchronous tasks.
- **Modular Access**: Acts as a “barrel” file, re-exporting features from other modules (`app.js`, `component.js`, `h.js`, `router.js`, `router-components.js`, `scheduler.js`) to streamline imports.

By consolidating exports in one file, `index.js` simplifies the developer workflow, allowing imports like `import { createApp, h } from './framework'` instead of importing from multiple files.

---
## Exported Features

The `index.js` file exports the following functions and components, each serving a specific purpose in building SPAs. Below, each export is explained with its role, usage, and a practical example.

### 1. `createApp` (from `app.js`)

#### What It Does
The `createApp` function creates an application instance, enabling developers to mount a root component to a DOM element and manage its lifecycle.

#### Role
- Initializes the application by creating a virtual DOM node for the root component using `h` and mounting it with `mountDOM`.
- Supports optional router integration for navigation.
- Provides `mount` and `unmount` methods to attach or remove the application from the DOM.

#### Code in `app.js`
```javascript
export function createApp(RootComponent, props = {}, options = {}) {
  let parentEl = null;
  let isMounted = false;
  let vdom = null;

  const context = {
    router: options.router || new NoopRouter(),
  }

  return {
    mount(_parentEl) {
      if (isMounted) {
        throw new Error('The application is already mounted');
      }
      parentEl = _parentEl;
      vdom = h(RootComponent, props);
      mountDOM(vdom, parentEl, null, { appContext: context });
      context.router.init();
      isMounted = true;
    },
    unmount() {
      if (!isMounted) {
        throw new Error('The application is not mounted');
      }
      destroyDOM(vdom);
      context.router.destroy();
      reset();
    },
  }
}
```

#### Example
```javascript
import { createApp, defineComponent, h } from './framework';

const App = defineComponent({
  render() {
    return h('h1', {}, ['Hello, DotJS!']);
  },
});

const app = createApp(App);
app.mount(document.getElementById('app'));
```

#### Explanation
- `createApp(App)` creates an application instance with the `App` component.
- `app.mount` renders the component into the `<div id="app">` element.
- The result is an `<h1>Hello, DotJS!</h1>` in the DOM.

---

### 2. `defineComponent` (from `component.js`)

#### What It Does
The `defineComponent` function creates reusable components with state, props, lifecycle hooks, and custom methods.

#### Role
- Defines a component class with methods for rendering, state management (`updateState`), and lifecycle hooks (`onMounted`, `onUnmounted`).
- Supports event handling and slot content for flexible composition.

#### Code in `component.js`
```javascript
export function defineComponent({ render, state, onMounted = emptyFn, onUnmounted = emptyFn, ...methods }) {
  class Component {
    constructor(props = {}, eventHandlers = {}, parentComponent = null) {
      this.props = props;
      this.state = state ? state(props) : {};
      this.#eventHandlers = eventHandlers;
      this.#parentComponent = parentComponent;
    }
    render() {
      const vdom = render.call(this);
      if (didCreateSlot()) {
        fillSlots(vdom, this.#children);
        resetDidCreateSlot();
      }
      return vdom;
    }
    // ... other methods
  }
  // ... attach custom methods
  return Component;
}
```

#### Example
```javascript
import { defineComponent, h } from './framework';

const Counter = defineComponent({
  state() {
    return { count: 0 };
  },
  render() {
    return h('div', {}, [
      h('p', {}, [`Count: ${this.state.count}`]),
      h('button', { on: { click: () => this.updateState({ count: this.state.count + 1 }) } }, ['Increment']),
    ]);
  },
});

const app = createApp(Counter);
app.mount(document.getElementById('app'));
```

#### Explanation
- `Counter` tracks a count in its state and renders a paragraph and button.
- Clicking the button updates the state, triggering a re-render.

---

### 3. `DOM_TYPES`, `h`, `hFragment`, `hSlot`, `hString` (from `h.js`)

#### What They Do
These exports create virtual DOM nodes to describe the UI structure.

- **`DOM_TYPES`**: Defines node types (`TEXT`, `ELEMENT`, `FRAGMENT`, `COMPONENT`, `SLOT`) for internal use.
- **`h(tag, props, children)`**: Creates a node for an HTML element or component.
- **`hString(str)`**: Creates a text node.
- **`hFragment(vNodes)`**: Groups nodes without a wrapper element.
- **`hSlot(children)`**: Marks a placeholder for child content.

#### Role
- Enable developers to define the UI structure in component `render` functions.
- Used by the framework to render and update the DOM efficiently.

#### Code in `h.js`
```javascript
export const DOM_TYPES = {
  TEXT: "text",
  ELEMENT: "element",
  FRAGMENT: "fragment",
  COMPONENT: "component",
  SLOT: "slot",
};

export function h(tag, props = {}, children = []) {
  const type = typeof tag === 'string' ? DOM_TYPES.ELEMENT : DOM_TYPES.COMPONENT;
  return {
    tag,
    props,
    type,
    children: mapTextNodes(withoutNulls(children)),
  };
}

export function hString(str) {
  return { type: DOM_TYPES.TEXT, value: str };
}

export function hFragment(vNodes) {
  return {
    type: DOM_TYPES.FRAGMENT,
    children: mapTextNodes(withoutNulls(vNodes)),
  };
}

export function hSlot(children = []) {
  hSlotCalled = true;
  return { type: DOM_TYPES.SLOT, children};
}
```

#### Example
```javascript
import { defineComponent, h, hString, hFragment, hSlot } from './framework';

const MyComponent = defineComponent({
  render() {
    return hFragment([
      hString('Hello, '),
      h('span', { style: 'color: blue' }, ['World']),
      hSlot(),
    ]);
  },
});

const App = defineComponent({
  render() {
    return h(MyComponent, {}, [hString('from Slots!')]);
  },
});

const app = createApp(App);
app.mount(document.getElementById('app'));
```

#### Explanation
- `MyComponent` renders a fragment with text, a styled `<span>`, and a slot.
- `App` passes content to the slot, resulting in: `Hello, <span style="color: blue">World</span>from Slots!`.

---

### 4. `RouterLink`, `RouterOutlet` (from `router-components.js`)

#### What They Do
These components enable client-side routing.

- **`RouterLink`**: Creates a navigable link that updates the URL without reloading.
- **`RouterOutlet`**: Renders the component for the current route.

#### Role
- Provide UI elements for navigation and dynamic content rendering in routed applications.

#### Code in `router-components.js`
```javascript
export const RouterLink = defineComponent({
  render() {
    const { to } = this.props;
    return h(
      'a',
      {
        href: to,
        on: {
          click: (e) => {
            e.preventDefault();
            this.appContext.router.navigateTo(to);
          },
        },
      },
      [hSlot()]
    )
  },
});

export const RouterOutlet = defineComponent({
  state() {
    return {
      matchedRoute: null,
      subscription: null,
    }
  },
  render() {
    const { matchedRoute } = this.state;
    return h('div', { id: 'router-outlen' }, [
      matchedRoute ? h(matchedRoute.componenet) : null,
    ])
  }
});
```

#### Example
```javascript
import { createApp, defineComponent, h, RouterLink, RouterOutlet, HashRouter } from './framework';

const Home = defineComponent({
  render() {
    return h('h1', {}, ['Home']);
  },
});

const App = defineComponent({
  render() {
    return h('div', {}, [
      h(RouterLink, { to: '/' }, ['Home']),
      h(RouterOutlet),
    ]);
  },
});

const router = new HashRouter([{ path: '/', component: Home }]);
const app = createApp(App, {}, { router });
app.mount(document.getElementById('app'));
```

#### Explanation
- `RouterLink` creates a link to the home route.
- `RouterOutlet` renders the `Home` component when the route matches.

---

### 5. `HashRouter` (from `router.js`)

#### What It Does
The `HashRouter` class implements client-side routing using URL hashes (e.g., `#/path`).

#### Role
- Manages route matching, navigation, and subscriptions for route changes.
- Integrates with `RouterOutlet` to render route components.

#### Code in `router.js`
```javascript
export class HashRouter {
  constructor(routes = []) {
    this.#matchers = routes.map(makeRouteMatcher);
  }
}
```

#### Example
See the `RouterLink` and `RouterOutlet` example above.

---

### 6. `nextTick` (from `scheduler.js`)

#### What It Does
The `nextTick` function schedules tasks and returns a promise that resolves after all scheduled tasks (e.g., lifecycle hooks) are complete.

#### Role
- Allows developers to wait for DOM updates or lifecycle hooks to finish before running additional code.

#### Code in `scheduler.js`
```javascript
export function nextTick() {
  scheduleUpdate();
  return flushPromises();
}
```

#### Example
```javascript
import { createApp, defineComponent, h, nextTick } from './framework';

const App = defineComponent({
  state: { message: 'Initial' },
  render() {
    return h('div', {}, [this.state.message]);
  },
  async onMounted() {
    this.updateState({ message: 'Updated' });
    await nextTick();
    console.log('DOM updated:', this.elements[0].textContent); // Logs "Updated"
  },
});

const app = createApp(App);
app.mount(document.getElementById('app'));
```

#### Explanation
- `nextTick` ensures the DOM reflects the updated state before logging.

---

## Guidelines for Using the Public API

1. **Import Only What You Need**: Import specific exports (e.g., `import { createApp, h } from './framework'`) to keep code clean.
2. **Start with `createApp`**: Use `createApp` to initialize your application and mount the root component.
3. **Define Components**: Use `defineComponent` to create reusable components with clear render functions and state.
4. **Use Virtual DOM Functions**: Leverage `h`, `hString`, `hFragment`, and `hSlot` to build flexible UI structures.
5. **Implement Routing**: Use `HashRouter`, `RouterLink`, and `RouterOutlet` for navigation in SPAs.
6. **Coordinate Updates**: Use `nextTick` to wait for DOM updates or lifecycle hooks in asynchronous code.
7. **Organize Imports**: Import from `index.js` (e.g., `./framework`) rather than individual files to maintain consistency.

---

## Conclusion

The `index.js` file is the gateway to the DotJS framework, providing a clean and focused public API. By exporting `createApp`, `defineComponent`, virtual DOM functions, routing components, `HashRouter`, and `nextTick`, it enables developers to build dynamic SPAs with minimal effort. Use the provided examples and guidelines to create applications, and refer to individual module documentation for deeper insights into specific features.