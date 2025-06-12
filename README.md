# Front-end Framework
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)
![DotJs](https://img.shields.io/badge/dot-JS-blueviolet)

![frontend framework](./framework/packages/runtime/src/documentation/img/front-end-framework.jpeg)

**DotJS Framework** is a component-based frontend framework for building dynamic single-page applications (SPAs) using vanilla JavaScript. It provides a minimal API, virtual DOM rendering, state management, client-side routing, and task scheduling, all built on standard browser APIs without external dependencies.

This README serves as the entry point to the framework, guiding you through its architecture, features, and setup. Use the table of contents to navigate quickly or explore the sections below for an overview.

---

## Table of Contents

- [Architecture](#architecture)
- [Design Principles](#design-principles)
- [Getting Started](#getting-started)
    - [Installation](#installation)
    - [Quick Start](#quick-start)
- [Documentation](#documentation)
    - [Core Features](#core-features)
    - [Utility Helpers](#utility-helpers)
- [Best Practices](#best-practices)


## Architecture

DotJS Framework is modular, with each module handling a specific responsibility. Below is an overview of the core modules:

- **`index.js` (Public API)**: The entry point, exporting functions like `createApp`, `defineComponent`, `h`, and routing components for building applications.
- **`app.js` (Application Lifecycle)**: Manages mounting and unmounting the root component, integrating with the router and virtual DOM.
- **`component.js` (Components)**: Defines reusable components with state, props, and lifecycle hooks (`onMounted`, `onUnmounted`).
- **`h.js` (Virtual DOM)**: Creates virtual DOM nodes (`h`, `hString`, `hFragment`, `hSlot`) for efficient rendering.
- **`router.js` (Routing)**: Implements hash-based client-side routing with `HashRouter`, supporting dynamic routes and guards.
- **`scheduler.js` (Task Scheduling)**: Manages asynchronous tasks, ensuring lifecycle hooks run in order using the microtask queue.
- **Utility Modules** (`utils/`): Helper functions for arrays, objects, props, and strings, used internally by the framework.

> **Details**: For a deeper dive, see the [Framework Documentation](#core-features) section, which links to individual module guides.

---

## Design Principles

DotJS is guided by these core ideas:

1.  **Simplicity:** A minimal and intuitive API. We favor clarity over feature bloat.
2.  **Developer Control:** Understandable and predictable behavior. No hidden magic, what you see is what you get.
3.  **Vanilla First:** Built on standard browser APIs, avoiding external framework dependencies.
4.  **Inversion of Control:** As a framework, DotJS calls your code (like component functions) to construct the application.
5.  **Progressive Enhancement:** Start with the basics and build up complexity as needed.

## Getting Started

## [Installation example](./example/README.md)
### Prerequisites

Before installing the DotJS framework, ensure you have the following tools installed:

- **Node.js**: Version `18.x` or higher (includes npm). Download from [nodejs.org](https://nodejs.org/).
- **Java Development Kit (JDK)**: Version `21` or higher (for the backend of the example Todo app). Download from [oracle.com](https://www.oracle.com/java/technologies/downloads/) or use an OpenJDK distribution.
- **PostgreSQL**: Version `13` or higher (for the example Todo app's database). Download from [postgresql.org](https://www.postgresql.org/download/).
- **Git**: To clone the `repository`. Download from [git-scm.com](https://git-scm.com/downloads).
- **A code editor**: Such as `Visual Studio Code` or `IntelliJ IDEA` for editing project files.

> Ensure these tools are properly installed and accessible from your terminal or command prompt.

> See the [Installation Instructions](./example/README.md) for detailed setup steps from the example.


## [Quick Start](./framework/packages/runtime/src/documentation/QuickStart.md)
> **Note**: This framework is for **educational purposes only** and not intended for production use.

---

## Documentation

The framework’s documentation is split into core features and utility helpers, each with detailed guides and examples. Use the links below to explore specific modules.

### Core Features

- **[Framework Overview (`appDocumentation.md`)](./framework/packages/runtime/src/documentation/appDocumentation.md)**: Learn about the framework’s architecture, design principles, and API.
- **[Public API: `index.js` (`publicAPIDocumentation.md`)](./framework/packages/runtime/src/documentation/publicAPIDocumentation.md)**: Details the entry point, exporting `createApp`, `defineComponent`, and more.
- **[Virtual DOM: `h.js` (`hFunctionDocumentation.md`)](./framework/packages/runtime/src/documentation/hFunctionDocumentation.md)**: Explains `h`, `hString`, `hFragment`, and `hSlot` for creating virtual DOM nodes.
- **[Mounting Virtual DOM (`mountingVirtualDomDocumentation.md`)](./framework/packages/runtime/src/documentation/mountingVirtualNodesDocumentation.md)**: Covers how the framework mounts virtual nodes to the DOM.
- **[Destroying Virtual DOM (`destroyingDomDocumentation.md`)](./framework/packages/runtime/src/documentation/destroyingDomDocumentation.md)**: Explains cleanup of virtual DOM nodes.
- **[Event Listeners (`eventListenerDocumentation.md`)](./framework/packages/runtime/src/documentation/eventListenerDocumentation.md)**: Describes how to handle events in components.
- **[Attributes (`attributesDocumentation.md`)](./framework/packages/runtime/src/documentation/attributesDocumentation.md)**: Details attribute management for DOM elements.
- **[Dispatcher (`dispatcherDocumentation.md`)](./framework/packages/runtime/src/documentation/dispatcherDocumentation.md)**: Explains the event dispatcher for component communication.
- **[Nodes Equality (`nodeEqualityDocumentation.md`)](./framework/packages/runtime/src/documentation/nodeEqualityDocumentation.md)**: Covers how the framework compares virtual DOM nodes.
- **[Patching the DOM (`pathcingTheDomDocumentation.md`)](./framework/packages/runtime/src/documentation/pathcingTheDomDocumentation.md)**: Describes efficient DOM updates.
- **[Stateful Components (`componentDocumentation.md`)](./framework/packages/runtime/src/documentation/componentDocumentation.md)**: Details component creation with state and lifecycle hooks.
- **[Scheduler (`schedulerDocumentation.md`)](./framework/packages/runtime/src/documentation/schedulerDocumentation.md)**: Explains task scheduling for lifecycle hooks.
- **[Routing (`routingDocumentation.md`)](./framework/packages/runtime/src/documentation/routingDocumentation.md)**: Covers `HashRouter`, `RouterLink`, and `RouterOutlet` for client-side routing.

### Utility Helpers

- **[Objects (`diffingObjectsDocumentation.md`)](./framework/packages/runtime/src/utils/documentation/diffingObjectsDocumentation.md)**: Utilities for object manipulation.
- **[Arrays (`diffingArraysDocumentation.md`)](./framework/packages/runtime/src/utils/documentation/diffingArraysDocumentation.md)**: Utilities for array operations.
- **[Props (`propsDocumentation.md`)](./framework/packages/runtime/src/utils/documentation/propsDocumentation.md)**: Utilities for managing component props.
- **[Strings (`stringsDocumentation.md`)](./framework/packages/runtime/src/utils/documentation/stringsDocumentation.md)**: Utilities for string operations.
- **[Traverse DOM & Slots (`traverseDomAndSotsDocumentation.md`)](./framework/packages/runtime/src/utils/documentation/traverseDomAndSotsDocumentation.md)**: Utilities for managing the Virtual DOM and component architecture through slots.

> **Tip**: Each [Documentation](#documentation) file includes code examples and best practices to help you implement features effectively.

---
## Best Practices

To build applications with DotJS, follow these guidelines:

1. **Modular Components**: Create small, reusable components with clear responsibilities.
2. **State Management**: Use `updateState` for state changes to trigger efficient re-renders.
3. **Routing**: Define clear routes with `HashRouter` and use `RouterLink` for navigation.
4. **Virtual DOM**: Leverage `h`, `hFragment`, and `hSlot` for flexible UI composition.
5. **Cleanup**: Use `onUnmounted` to clean up resources like event listeners or subscriptions.
6. **Error Handling**: Monitor console logs for scheduler errors and handle unmatched routes.
7. **Performance**: Minimize re-renders by updating only necessary state or props.
8. **Project Structure**: Organize components, routes, and utilities in separate folders (e.g., `components/`, `routes/`).
9. **Testing**: Test components in isolation and verify routing behavior with `navigateTo`.

> **Details**: Each [Documentation](#documentation) file includes module-specific best practices.

---

## Installation Instructions

See the [example/README.md](./example/README.md) for detailed setup instructions.

If you want to actually develop the framework, it isn't really different, make changes to the framework files, and run pnpm build to rebuild it.

---

*Built by the Blind Dating App Team. Start building your next web app today!*
