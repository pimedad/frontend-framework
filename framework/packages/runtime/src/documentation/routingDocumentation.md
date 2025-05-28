# Routing Documentation

This document provides guidance for developers using the routing features of the `Blind Dating App Team Ⓒ frontend framework`, covering `router.js`, `router-components.js`, and `route-matchers.js`. These modules enable client-side routing, allowing applications to navigate between views without full page reloads. The documentation includes an `overview` of the routing architecture, detailed `explanations` of each function and component with practical `examples`.

---

![Routing Architecture](img/router.png)

## Routing Architecture and Design Principles

The framework’s routing system is designed to provide solution for client-side navigation in `single-page applications (SPAs)`. It uses a **hash-based routing** approach, supporting the browser’s URL hash (e.g., `#/path`) to manage routes, making it simple to implement and compatible with static hosting.

### Key Design Principles
1. **Simplicity**: The system for moving around the website is built with just a few main parts: `HashRouter` (the brain for figuring out which page to show based on the URL after the #), `RouterLink` (what you click to go to a new page), and `RouterOutlet` (the placeholder that shows the actual page content).
2. **Event-Driven**: When you click a link and the page changes, the router uses a built-in messenger (called `dispatcher`). This messenger shouts out, "Hey, the page just changed!"
3. **Modularity**: Separates route matching logic (`route-matchers.js`) from router logic (`router.js`) and UI components (`router-components.js`).Each doing its own job:
   - `route-matchers.js:` This part is like a detective that just figures out if a URL matches a specific page pattern (like /user/123).
   - `router.js:` This is the main traffic controller. It uses the "detective" to find the right page and then manages the actual switch.
   - `router-components.js:` These are the bits you actually use in your page templates, like the clickable links (RouterLink) and the spot where pages appear (RouterOutlet).
4. **Flexibility**: Supports dynamic routes with parameters, query strings, redirects, and route guards (`beforeEnter`).
5. **Efficiency**: Minimizes `DOM` updates by integrating with the framework’s `virtual DOM` and component system.
6. **Reliability**: Handles edge cases like `unmatched` routes, empty hashes, and cleanup on unmount.

### Architecture Overview
- **`router.js`**: Defines the `HashRouter` class for managing routes, navigation, and subscriptions, and the `NoopRouter` for non-routing applications.
- **`router-components.js`**: Provides `RouterLink` for navigable links and `RouterOutlet` for rendering route-specific components.
- **`route-matchers.js`**: Handles route matching logic, including static routes, dynamic routes with parameters, and query string parsing.
- **Integration with `app.js`**: The router is passed to `createApp` as an option, and its `init` and `destroy` methods are called during application lifecycle.

The routing system integrates with the framework’s component and virtual DOM systems, using the `Dispatcher` class for event communication and the scheduler for lifecycle management.

---

## Detailed Explanation of Features

Below, each module and its functions/components are explained to demonstrate functionality.

### 1. `router.js`

The `router.js` file defines the `HashRouter` class for client-side routing and the `NoopRouter` class as a fallback for non-routing applications. `HashRouter` manages routes, handles navigation, and notifies subscribers (e.g., `RouterOutlet`) of route changes.

### `HashRouter` Class

##### Constructor
**What it does**: Initializes the router with a list of routes and sets up internal state.

**How it works**:
- Takes an array of route objects (e.g., `{ path, component, redirect, beforeEnter }`).
- Maps each route to a matcher using `makeRouteMatcher` from `route-matchers.js`.
- Initializes private fields for matchers, dispatcher, subscriptions, and state.

**Code**:
```javascript
constructor(routes = []) {
  this.#matchers = routes.map(makeRouteMatcher);
}
```

**Where it’s used**: When creating a router instance, passed to `createApp` as an option.

**Example**:
```javascript
const router = new HashRouter([
  { path: '/', component: Home },
  { path: '/about', component: About },
]);
```

##### `subscribe(handler)`
**What it does**: Registers a callback to be notified of route changes.

**How it works**:
- Uses the `Dispatcher` to subscribe to the `router-event` event.
- Stores the unsubscribe function in `#subscriptions` and the handler in `#subscriberFns`.

**Code**:
```javascript
subscribe(handler) {
  const unsubscribe = this.#dispatcher.subscribe(ROUTER_EVENT, handler);
  this.#subscriptions.set(handler, unsubscribe);
  this.#subscriberFns.add(handler);
}
```

**Where it’s used**: By `RouterOutlet` to update its rendered component when the route changes.

**Example**:
```javascript
router.subscribe(({ to }) => console.log(`Navigated to ${to.path}`));
```

##### `unsubscribe(handler)`
**What it does**: Removes a subscription to route changes.

**How it works**:
- Retrieves the unsubscribe function from `#subscriptions` and calls it.
- Removes the handler from `#subscriptions` and `#subscriberFns`.

**Code**:
```javascript
unsubscribe(handler) {
  const unsubscribe = this.#subscriptions.get(handler);
  if (unsubscribe) {
    unsubscribe();
    this.#subscriptions.delete(handler);
    this.#subscriberFns.delete(handler);
  }
}
```

**Where it’s used**: By `RouterOutlet` in `onUnmounted` to clean up subscriptions.

**Example**:
```javascript
const handler = ({ to }) => console.log(to.path);
router.subscribe(handler);
router.unsubscribe(handler); // Stops notifications
```

##### `init()`
**What it does**: Initializes the router, setting up event listeners and matching the initial route.

**How it works**:
- Checks if already initialized to prevent duplicate setup.
- Sets the default hash to `#/` if empty.
- Listens for `popstate` events to handle browser back/forward navigation.
- Matches the current route using `#matchCurrentRoute`.

**Where it’s used**: Called by `createApp` during `mount`.

**Code**:
```javascript
async init() {
  if (this.#isInitialized) {
    return;
  }
  if (document.location.hash === '') {
    window.history.replaceState({}, '', '#/');
  }
  window.addEventListener('popstate', this.#onPopState);
  await this.#matchCurrentRoute();
  this.#isInitialized = true;
}
```

**Example**:
```javascript
const app = createApp(App, {}, { router });
app.mount(document.getElementById('app')); // Calls router.init()
```

##### `destroy()`
**What it does**: Cleans up the router, removing event listeners and subscriptions.

**How it works**:
- Checks if initialized.
- Removes the `popstate` event listener.
- Unsubscribes all handlers.

**Where it’s used**: Called by `createApp` during `unmount`.

**Code**:
```javascript
destroy() {
  if (!this.#isInitialized) {
    return;
  }
  window.removeEventListener('popstate', this.#onPopState);
  Array.from(this.#subscriberFns.forEach(this.unsubscribe, this));
  this.#isInitialized = false;
}
```

**Example**:
```javascript
app.unmount(); // Calls router.destroy()
```

##### `#currentRouteHash` (Getter)
**What it does**: Returns the current URL hash, defaulting to `/` if empty.

**How it works**:
- Reads `document.location.hash` and removes the leading `#`.

**Code**:
```javascript
get #currentRouteHash() {
  const hash = document.location.hash;
  if (hash === '') {
    return '/';
  }
  return hash.slice(1);
}
```

**Where it’s used**: By `#matchCurrentRoute` to get the current path.

**Example**:
```javascript
// If URL is http://example.com/#/about, returns '/about'
```

##### `#matchCurrentRoute()`
**What it does**: Navigates to the current URL hash.

**How it works**:
- Calls `navigateTo` with the current hash from `#currentRouteHash`.

**Code**:
```javascript
#matchCurrentRoute() {
  return this.navigateTo(this.#currentRouteHash);
}
```

**Where it’s used**: In `init` and `popstate` event handler.

**Example**:
```javascript
// Automatically called during init() to match initial route
```

##### `matchedRoute` (Getter)
**What it does**: Returns the currently matched route object.

**Code**:
```javascript
get matchedRoute() {
  return this.#matchedRoute;
}
```

**Where it’s used**: By `RouterOutlet` to access the current route’s component.

**Example**:
```javascript
console.log(router.matchedRoute); // { path: '/about', component: About }
```

##### `params` (Getter)
**What it does**: Returns the extracted route parameters.

**Code**:
```javascript
get params() {
  return this.#params;
}
```

**Where it’s used**: By components to access dynamic route parameters.

**Example**:
```javascript
// For path '/user/123', returns { id: '123' }
```

##### `query` (Getter)
**What it does**: Returns the parsed query string parameters.

**Code**:
```javascript
get query() {
  return this.#query;
}
```

**Where it’s used**: By components to access query parameters.

**Example**:
```javascript
// For path '/search?q=hello', returns { q: 'hello' }
```

##### `navigateTo(path)`
**What it does**: Navigates to a given path, updating the route and notifying subscribers.

**How it works**:
- Finds a matching route using `checkMatch` from a matcher.
- Handles redirects if the route has a `redirect` property.
- Checks route guards with `#canChangeRoute`.
- Updates `#matchedRoute`, `#params`, and `#query`, pushes the new state, and dispatches a `router-event`.

**Code**:
```javascript
async navigateTo(path) {
  const matcher = this.#matchers.find((matcher) => matcher.checkMatch(path));
  if (matcher === null) {
    console.warn(`[Router] No route matches path "${path}`);
    this.#matchedRoute = null;
    this.#params = {};
    this.#query = {};
    return;
  }
  if (matcher.isRedirect) {
    return this.navigateTo(matcher.route.redirect);
  }
  const from = this.#matchedRoute;
  const to = matcher.route;
  const { shouldNavigate, shouldRedirect, redirectPath } = await this.#canChangeRoute(from, to);
  if (shouldRedirect) {
    return this.navigateTo(redirectPath);
  }
  if (shouldNavigate) {
    this.#matchedRoute = matcher.route;
    this.#params = matcher.extractParams(path);
    this.#query = matcher.extractQuery(path);
    this.#pushState(path);
    this.#dispatcher.dispatch(ROUTER_EVENT, { from, to, router: this});
  }
}
```

**Where it’s used**: By `RouterLink` and `#matchCurrentRoute`.

**Example**:
```javascript
router.navigateTo('/about'); // Navigates to the About page
```

##### `#pushState(path)`
**What it does**: Updates the browser’s URL with the new path.

**Code**:
```javascript
#pushState(path) {
  window.history.pushState({}, '', `#${path}`);
}
```

**Where it’s used**: In `navigateTo` to update the URL.

**Example**:
```javascript
// Changes URL to http://example.com/#/about
```

##### `back()`
**What it does**: Navigates to the previous URL in the browser’s history.

**Code**:
```javascript
back() {
  window.history.back();
}
```

**Example**:
```javascript
router.back(); // Goes to previous page
```

##### `forward()`
**What it does**: Navigates to the next URL in the browser’s history.

**Code**:
```javascript
forward() {
  window.history.forward();
}
```

**Example**:
```javascript
router.forward(); // Goes to next page
```

##### `#canChangeRoute(from, to)`
**What it does**: Checks if navigation to a new route is allowed, using the `beforeEnter` guard.

**How it works**:
- Calls the `beforeEnter` function if defined, which can return `false` (block navigation), a string (redirect), or nothing (allow).
- Returns an object indicating whether to navigate or redirect.

**Code**:
```javascript
async #canChangeRoute(from, to) {
  const guard = to.beforeEnter;
  if (typeof guard !== 'function') {
    return {
      shouldRedirect: false,
      shouldNavigate: true,
      redirectPath: null,
    }
  }
  const result = await guard(from?.path, to?.path);
  if (result === false) {
    return {
      shouldRedirect: false,
      shouldNavigate: false,
      redirectPath: null,
    }
  }
  if (typeof result === 'string') {
    return {
      shouldRedirect: true,
      shouldNavigate: false,
      redirectPath: result,
    }
  }
  return {
    shouldRedirect: false,
    shouldNavigate: true,
    redirectPath: null,
  }
}
```

**Where it’s used**: In `navigateTo` to validate navigation.

**Example**:
```javascript
const router = new HashRouter([
  {
    path: '/protected',
    component: ProtectedPage,
    beforeEnter: async (from, to) => {
      return false; // Blocks navigation
    },
  },
]);
```

##### `NoopRouter` Class
**What it does**: A dummy router with empty methods, used when no routing is needed.

**How it works**:
- Provides empty implementations for `init`, `destroy`, `navigateTo`, `back`, `forward`, `subscribe`, and `unsubscribe`.

**Code**:
```javascript
export class NoopRouter {
  init () {};
  destroy () {};
  navigateTo () {};
  back () {};
  forward () {};
  subscribe () {};
  unsubscribe () {};
}
```

**Where it’s used**: As the default router in `createApp` if no router is provided.

**Example**:
```javascript
const app = createApp(App); // Uses NoopRouter
```

---

### 2. `router-components.js`

This file defines `RouterLink` and `RouterOutlet`, components for navigation and rendering route-specific content.

#### `RouterLink` Component
**What it does**: Creates a clickable link that navigates to a route without reloading the page.

**How it works**:
- Renders an `<a>` element with an `href` from the `to` prop.
- Prevents default link behavior and calls `router.navigateTo`.
- Uses a slot for custom link content.

**Code**:
```javascript
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
}
```

**Where it’s used**: In navigation menus or links.

**Example**:
```javascript
h(RouterLink, { to: '/about' }, ['Go to About']);
```

#### `RouterOutlet` Component
**What it does**: Renders the component associated with the current route.

**How it works**:
- Subscribes to route changes in `onMounted`.
- Updates state with the matched route and renders its component.
- Unsubscribes in `onUnmounted`.

**Code**:
```javascript
onMounted() {
  const subscription = this.appContext.router.subscribe(({ to }) => {
    this.handleRouteChange(to);
  })
  this.updateState({ subscription });
}
render() {
  const { matchedRoute } = this.state;
  return h('div', { id: 'router-outlen' }, [
    matchedRoute ? h(matchedRoute.componenet) : null,
  ])
}
```

**Where it’s used**: As the container for route-specific content.

**Example**:
```javascript
h(RouterOutlet);
```

---

### 3. `route-matchers.js`

This file handles route matching logic for static and dynamic routes.

#### `makeRouteMatcher(route)`
**What it does**: Creates a matcher object for a route.

**How it works**:
- Checks if the route has parameters (e.g., `:id`) and creates a matcher accordingly.

**Code**:
```javascript
export function makeRouteMatcher(route) {
  return routeHasParams(route)
    ? makeMatcherWithParams(route)
    : makeMatcherWithoutParams(route);
}
```

**Example**:
```javascript
const matcher = makeRouteMatcher({ path: '/user/:id' });
```

#### `routeHasParams({ path })`
**What it does**: Checks if a route path contains parameters.

**Code**:
```javascript
function routeHasParams({ path }) {
  return path.includes(':');
}
```

**Example**:
```javascript
routeHasParams({ path: '/user/:id' }); // true
```

#### `makeRouteWithoutParamsRegex({ path })`
**What it does**: Creates a regex for static routes.

**Code**:
```javascript
function makeRouteWithoutParamsRegex({ path }) {
  if (path === CATCH_ALL_ROUTE) {
    return new RegExp('^.*$');
  }
  return new RegExp(`^${path}$`);
}
```

**Example**:
```javascript
makeRouteWithoutParamsRegex({ path: '/about' }); // /^\/about$/
```

#### `makeMatcherWithoutParams(route)`
**What it does**: Creates a matcher for static routes.

**Code**:
```javascript
function makeMatcherWithoutParams(route) {
  const regex = makeRouteWithoutParamsRegex(route);
  const isRedirect = typeof route.redirect === 'string';
  return {
    route,
    isRedirect,
    checkMatch(path) {
      return regex.test(path);
    },
    extractParams() {
      return {};
    },
    extractQuery,
  }
}
```

**Example**:
```javascript
const matcher = makeMatcherWithoutParams({ path: '/about' });
matcher.checkMatch('/about'); // true
```

#### `extractQuery(path)`
**What it does**: Parses query string parameters from a path.

**Code**:
```javascript
function extractQuery(path) {
  const queryIndex = path.indexOf('?');
  if (queryIndex === -1) {
    return {};
  }
  const search = new URLSearchParams(path.slice(queryIndex + 1));
  return Object.fromEntries(search.entries());
}
```

**Example**:
```javascript
extractQuery('/search?q=hello'); // { q: 'hello' }
```

#### `makeRouteWithParamsRegex({ path })`
**What it does**: Creates a regex for routes with parameters.

**Code**:
```javascript
function makeRouteWithParamsRegex({ path }) {
  const regex = path.replace(/:([^/]+)/g, (_, paramName) => `(?<${paramName}>[^/]+)`);
  return new RegExp(`^${regex}$`);
}
```

**Example**:
```javascript
makeRouteWithParamsRegex({ path: '/user/:id' }); // /^\/user\/(?<id>[^/]+)$/
```

#### `makeMatcherWithParams(route)`
**What it does**: Creates a matcher for dynamic routes.

**Code**:
```javascript
function makeMatcherWithParams(route) {
  const regex = makeRouteWithParamsRegex(route);
  const isRedirect = typeof route.redirect === 'string';
  return {
    route,
    isRedirect,
    checkMatch(path) {
      return regex.test(path);
    },
    extractParams(path) {
      const { groups } = regex.exec(path);
      return groups;
    },
    extractQuery,
  }
}
```

**Example**:
```javascript
const matcher = makeMatcherWithParams({ path: '/user/:id' });
matcher.extractParams('/user/123'); // { id: '123' }
```

---

## Best Practices and Guidelines

1. **Route Configuration**:
    - Define routes with paths.
    - Use parameters (`:id`) for dynamic routes and query strings for optional data.
    - Implement `beforeEnter` guards for authentication or validation.

2. **Navigation**:
    - Use `RouterLink` for user-initiated navigation.
    - Call `router.navigateTo` for programmatic navigation (e.g., after form submission).

3. **Component Integration**:
    - Place `RouterOutlet` where route components should render.
    - Access route data (`router.params`, `router.query`) in components.

4. **Cleanup**:
    - Ensure `router.destroy` is called via `app.unmount` to prevent memory leaks.
    - Unsubscribe from route changes in `RouterOutlet`’s `onUnmounted`.

5. **Error Handling**:
    - Handle unmatched routes gracefully (e.g., show a 404 component).
    - Log warnings for unmatched routes using `console.warn`.

6. **Performance**:
    - Minimize route changes by avoiding unnecessary `navigateTo` calls.
    - Use static routes for simple pages and dynamic routes only when needed.

7. **Testing**:
    - Test routes individually by calling `router.navigateTo` and checking `matchedRoute`.
    - Verify `beforeEnter` guards block or redirect as expected.

---

## Example: Building a Routing Application

```javascript
import { createApp, defineComponent, h, RouterLink, RouterOutlet, HashRouter } from './framework';

const Home = defineComponent({
  render() {
    return h('h1', {}, ['Home Page']);
  },
});

const UserProfile = defineComponent({
  render() {
    return h('div', {}, [
      h('h1', {}, [`User: ${this.appContext.router.params.id}`]),
      h('p', {}, [`Query: ${JSON.stringify(this.appContext.router.query)}`]),
    ]);
  },
});

const App = defineComponent({
  render() {
    return h('div', {}, [
      h(RouterLink, { to: '/' }, ['Home']),
      h(RouterLink, { to: '/user/123?name=John' }, ['User Profile']),
      h(RouterOutlet),
    ]);
  },
});

const router = new HashRouter([
  { path: '/', component: Home },
  { path: '/user/:id', component: UserProfile, beforeEnter: async (from, to) => {
    return to === '/user/123' ? true : '/'; // Redirect unless ID is 123
  } },
]);

const app = createApp(App, {}, { router });
app.mount(document.getElementById('app'));
```

**Explanation**:
- `Home` renders a simple page.
- `UserProfile` displays the user ID from `router.params` and query parameters.
- `App` includes navigation links and a `RouterOutlet`.
- The router redirects to `/` if the user ID isn’t `123`.

---

## Conclusion

The routing system, comprising `HashRouter`, `RouterLink`, `RouterOutlet` and `route matchers`, provides a solution for client-side navigation.