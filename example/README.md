# example application documentation

## overview

this is a todo list application built to demonstrate the custom frontend framework developed. the application is a todo manager that showcases the frameworks routing, state managemement, component system, and backend integration capabilities through a spring boot api.

## prerequisites

- node.js (version 16 or higher)
- pnpm (for workspace management)
- java 21 (for backend)
- maven (for backend build and dependency management)

## setup instructions

### 1. install dependencies and build framework

from the project root directory:

```bash
# install workspace dependencies and build the framework
pnpm install
pnpm build
```

### 2. start the backend server

the application requires the spring boot backend to be running:

```bash
cd example/backend
mvn clean install
mvn spring-boot:run
```

the backend api will be available at `http://localhost:8080/api/todos`

### 3. start the frontend development server

```bash
cd example/frontend
npm run dev
```

the application will be available at the development server url (typically `http://localhost:3000/` for frontend).

## application features

### core functionality

the todo list application provides:

- task management: create, read, update, and delete todo items
- status tracking: mark tasks as completed or active
- filtering: view all tasks, only active tasks, or only completed tasks
- bulk operations: toggle all tasks or clear all completed tasks
- inline editing: double-click to edit task titles
- persistent storage: data is stored in the backend database
- real-time updates: ui updates immediately reflect backend changes

### technical demonstrations

the app showcases the custom framework's capabilities:

- component architecture: modular components (`todopagecomponent`, `todoitemcomponent`, `headercomponent`, `footercomponent`)
- state management: reactive state updates with loading states and error handling
- routing: client-side navigation between different task views (all/active/completed/about)
- event handling: custom event system for user interactions
- virtual dom: efficient rendering with virtual dom implementation
- lifecycle hooks: component mounting with async data loading
- context system: shared state and handlers across components
- http integration: restful api communication with proper error handling

### api endpoints

the backend provides the following rest endpoints:

- `get /api/todos` - retrieve all todos
- `post /api/todos` - create a new todo
- `put /api/todos/{id}` - update an existing todo
- `delete /api/todos/{id}` - delete a specific todo
- `delete /api/todos/completed` - delete all completed todos
