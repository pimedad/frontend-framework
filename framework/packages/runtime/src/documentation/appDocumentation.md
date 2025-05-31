# The app.js Documentation

This document provides a guide to the `app.js` module of the frontend framework, focusing on the `createApp` function. It is the entry point for creating and managing an application instance, handling the mounting and unmounting of the application's virtual DOM (vDOM) to the real DOM, and integrating with the router for navigation.

## Overview of the Framework's Architecture and Design Principles

The frontend framework is component-based designed for building web applications. Its architecture is centered around a virtual DOM for efficient updates, a component model for modularity, and a router for client-side navigation. The key design principles include:

- **Virtual DOM**: Utilizes a virtual DOM to optimize rendering by minimizing direct DOM manipulations, ensuring high performance during updates.
- **Component-Based**: Allows modular development through reusable components, each managing its own state and lifecycle.
- **Router Integration**: Supports client-side routing via a `HashRouter` or a `NoopRouter` for flexibility in navigation.
- **Minimal Overhead**: Designed with a focus on simplicity and developer experience.
- **Event-Driven**: Leverages an event dispatcher for handling interactions and updates, ensuring loose coupling between components.

The `app.js` module is the core of this architecture, providing the `createApp` function to initialize and manage the application's lifecycle.

## Detailed Explanation of `createApp` Features

The `createApp` function is the primary interface for creating an application instance. It returns an object with methods to mount and unmount the application, ensuring proper initialization and cleanup.

### Function Signature

```javascript
createApp(RootComponent, props = {}, options = {})
```

- **Parameters**:
    - `RootComponent` (required): The root component of the application, typically defined using `defineComponent` from `component.js`.
    - `props` (optional): An object containing initial properties to pass to the root component. Defaults to an empty object.
    - `options` (optional): Configuration options for the application, including:
        - `router`: A router instance (e.g., `HashRouter`) for client-side navigation. Defaults to `NoopRouter` if not provided.

- **Returns**: An object with two methods: `mount` and `unmount`.

### Internal State

The `createApp` function maintains internal state to track the application's lifecycle and configuration:

- `parentEl`: Stores the DOM element where the application is mounted.
- `isMounted`: A boolean indicating whether the application is currently mounted.
- `vdom`: The virtual DOM representation of the application, created using the `h` function.
- `context`: An object containing shared application context, including the router instance.

### Methods

#### `mount(_parentEl)`

Mounts the application to the specified DOM element.

- **Parameters**:
    - `_parentEl` (required): The DOM element (e.g., `document.getElementById('app')`) where the application will be rendered.

- **Behavior**:
    - Checks if the application is already mounted to prevent multiple mounts, throwing an error if `isMounted` is `true`.
    - Sets the `parentEl` to the provided DOM element.
    - Creates a virtual DOM node for the `RootComponent` using the `h` function with the provided `props`.
    - Calls `mountDOM` to render the virtual DOM to the real DOM, passing the `appContext` to provide access to the router.
    - Initializes the router via `context.router.init()`.
    - Sets `isMounted` to `true`.

- **Throws**:
    - `Error: The application is already mounted` if the application is already mounted.

- **Example**:
  ```javascript
  import { createApp, defineComponent } from './framework';

  const App = defineComponent({
    render() {
      return h('div', {}, ['Hello, World!']);
    }
  });

  const app = createApp(App);
  app.mount(document.getElementById('app'));
  ```

  This example creates a simple application with a root component that renders a `<div>` containing "Hello, World!" and mounts it to a DOM element with the ID `app`.

#### `unmount()`

Unmounts the application, cleaning up the DOM and resources.

- **Behavior**:
    - Checks if the application is mounted, throwing an error if `isMounted` is `false`.
    - Calls `destroyDOM` to remove the virtual DOM from the real DOM.
    - Destroys the router via `context.router.destroy()`.
    - Resets internal state (`parentEl`, `isMounted`, `vdom`) to `null` or `false` using the internal `reset` function.

- **Throws**:
    - `Error: The application is not mounted` if the application is not mounted.

- **Example**:
  ```javascript
  app.unmount();
  ```

  This removes the application from the DOM and cleans up resources, allowing the application to be remounted later if needed.

#### Internal `reset` Function

Resets the internal state of the application.

- **Behavior**:
    - Sets `parentEl` to `null`.
    - Sets `isMounted` to `false`.
    - Sets `vdom` to `null`.

- **Usage**: Called internally by `unmount` to ensure a clean state after unmounting.


## Best Practices and Guidelines

To build applications with the framework and `createApp`, follow these best practices:

1. **Single Mount Point**:
    - Mount the application to a single DOM element (e.g., `<div id="app"></div>`).
    - Avoid mounting multiple applications to the same element to prevent conflicts.

2. **Component Design**:
    - Define the root component using `defineComponent` to leverage lifecycle hooks (`onMounted`, `onUnmounted`) and state management.
    - Keep components small and focused for reusability and maintainability.

3. **Router Usage**:
    - Use `HashRouter` for client-side routing if navigation is required. Define routes with components to map URLs to application views.
    - Ensure routes are properly configured with `path` and `component` properties.

4. **Error Handling**:
    - Handle errors thrown by `mount` and `unmount` to gracefully manage lifecycle issues.
    - Example:
      ```javascript
      try {
        app.mount(document.getElementById('app'));
      } catch (error) {
        console.error('Failed to mount application:', error);
      }
      ```

5. **Cleanup**:
    - Always call `unmount` when removing the application to prevent memory leaks and ensure proper cleanup of DOM nodes and router subscriptions.
    - Example:
      ```javascript
      window.addEventListener('unload', () => {
        app.unmount();
      });
      ```

6. **Props and Context**:
    - Pass initial props to the root component to configure its behavior.
    - Use the `appContext` to share global state or services (e.g., router) across components.

7. **Performance**:
    - Minimize unnecessary re-renders by optimizing component state updates.
    - Use the `scheduler.js` `nextTick` function to batch updates and improve performance.

8. **Testing**:
    - Test the application lifecycle by mounting and unmounting in a controlled environment.
    - Mock the `NoopRouter` for unit tests to isolate routing logic.


## Conclusion

The `createApp` function in `app.js` is the fundament of the frontend framework, providing a simple yet powerful interface for initializing and managing applications. 