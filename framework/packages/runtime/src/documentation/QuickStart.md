# Quick Start Guide for DotJS Framework
![Quick Start](https://img.shields.io/badge/Quick-Start-blue)


Welcome to DotJS! 

A frontend framework built from scratch to help you and us included learn how frameworks work. 
This guide will walk you through creating a simple Todo application, showcasing DotJS's core features: reusable components, routing, state management, event handling, and DOM manipulation. 

### Prerequisites

Before installing the DotJS framework, ensure you have the following tools installed:

- **Node.js**: Version `18.x` or higher (includes npm). Download from [nodejs.org](https://nodejs.org/).
- **Java Development Kit (JDK)**: Version `21` or higher (for the backend of the example Todo app). Download from [oracle.com](https://www.oracle.com/java/technologies/downloads/) or use an OpenJDK distribution.
- **PostgreSQL**: Version `13` or higher (for the example Todo app's database). Download from [postgresql.org](https://www.postgresql.org/download/).
- **Git**: To clone the `repository`. Download from [git-scm.com](https://git-scm.com/downloads).
- **A code editor**: Such as `Visual Studio Code` or `IntelliJ IDEA` for editing project files.

> Ensure these tools are properly installed and accessible from your terminal or command prompt.

## Step 1: Set Up Your Project

### 1.1 Create Project Directory
Create a new directory for your Todo app:
```bash
mkdir my-dotjs-todo
cd my-dotjs-todo
npm init -y
```

### 1.2 Install DotJS
Assuming you have built the DotJS framework (see [Installation Instructions](installation.md)), link it to your project:

   ```bash
   cd /path/to/frontend-framework/framework/packages/runtime
   npm link
   cd /path/to/my-dotjs-app
   npm link frontend-framework
   ```

   >   Replace `/path/to/frontend-framework` with the actual path to your DotJS framework directory.

### 1.3 Install Development Dependencies
Install Webpack and related tools for bundling and development:
```bash
npm install --save-dev webpack webpack-cli webpack-dev-server html-webpack-plugin @babel/core @babel/preset-env babel-loader
```

### 1.4 Set Up Webpack Configuration
Create `webpack.config.js` in the project root:
```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
  devServer: {
    port: 3000,
    open: true,
    proxy: {
      '/api': 'http://localhost:8080', // Proxy API requests to backend
    },
  },
};
```

> **Note**: The `proxy` setting forwards API requests to the backend, which is `Optional` if you would like to set up backend implementation.

### 1.5 Create Project Structure
Set up the following directory structure:
```
my-dotjs-todo/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── CustomButton.js
│   │   ├── TodoItem.js
│   │   └── TodoList.js
│   ├── pages/
│   │   ├── HomePage.js
│   │   └── TodoPage.js
│   ├── App.js
│   └── index.js
├── webpack.config.js
└── package.json
```

Run these commands to create the structure:
```bash
mkdir -p src/components src/pages public
touch public/index.html src/index.js src/App.js src/components/CustomButton.js src/components/TodoItem.js src/components/TodoList.js src/pages/HomePage.js src/pages/TodoPage.js
```

### 1.6 Create HTML Template
In `public/index.html`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>DotJS Todo App</title>
</head>
<body>
  <div id="app"></div>
</body>
</html>
```

## Step 2: Create a Custom Button Component

Let’s create a reusable `CustomButton` component to handle actions like adding or deleting Todos. This demonstrates DotJS’s component architecture and event handling.

In `src/components/CustomButton.js`:
```javascript
import { defineComponent, h } from 'frontend-framework';

// Custom Button Component: A reusable button with customizable styles and click events
export const CustomButton = defineComponent({
  render() {
    const { label, onClick, backgroundColor = '#007bff' } = this.props;

    return h('button', {
      on: { click: onClick },
      style: {
        padding: '8px 16px',
        margin: '5px',
        background: backgroundColor,
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
      },
    }, [label]);
  },
});
```

> **Note**: This `CustomButton` component is a reusable UI element with dynamic styling and event handling, showcasing DotJS’s ability to create custom elements.

## Step 3: Create a Todo Item Component

Create a `TodoItem` component to display a single Todo task with a toggle feature.

In `src/components/TodoItem.js`:
```javascript
import { defineComponent, h } from 'frontend-framework';
//Here we import our created custom button component to Re-use it
import { CustomButton } from './CustomButton';

//Custom created TodoItem
export const TodoItem = defineComponent({
  state(props) {
    return { isCompleted: props.completed || false };
  },

  toggleComplete() {
    this.updateState({ isCompleted: !this.state.isCompleted });
    if (this.props.onToggle) {
      this.props.onToggle(this.props.id, this.state.isCompleted);
    }
  },

  render() {
    const { text, onDelete } = this.props;
    const { isCompleted } = this.state;

    return h('li', {
      class: isCompleted ? ['completed'] : [],
      style: { padding: '10px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between' },
    }, [
      h('span', { on: { click: () => this.toggleComplete() } }, [text]),
      // Custom Button: Used for deleting a Todo item
      h(CustomButton, {
        label: 'Delete',
        onClick: () => onDelete(this.props.id),
        backgroundColor: '#dc3545',
      }),
    ]);
  },
});
```

This component:
- Tracks completion state and updates it with `updateState`.
- Supports a click event to toggle completion and a delete action via `CustomButton`.
- Uses `h` for virtual DOM creation and dynamic classes for styling.

## Step 4: Build a Todo List Component with Backend Integration

>**Note:** Back-end Integration is Optional if you would like to make `HTTP` requests to get data from remote sources, and provide response data to the application, since the main focus still lies on the front-end framework capabilities implementation.

Create a `TodoList` component that manages Todos, including fetching and saving them via `HTTP` requests to a backend.

In `src/components/TodoList.js`:
```javascript
import { defineComponent, h } from 'frontend-framework';
//Note that now we import both our custom created components to Re-use them in the new class
import { TodoItem } from './TodoItem';
import { CustomButton } from './CustomButton';

//Custom created TodoList
export const TodoList = defineComponent({
  state() {
    return {
      todos: [],
      newTodo: '',
      isLoading: false,
    };
  },

  async onMounted() {
    await this.fetchTodos();
  },

  async fetchTodos() {
    this.updateState({ isLoading: true });
    try {
      const response = await fetch('/api/todos');
      const todos = await response.json();
      this.updateState({ todos, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch todos:', error);
      this.updateState({ isLoading: false });
    }
  },

  async addTodo() {
    if (this.state.newTodo.trim()) {
      const newTodo = { text: this.state.newTodo, completed: false };
      this.updateState({ isLoading: true });
      try {
        const response = await fetch('/api/todos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTodo),
        });
        const savedTodo = await response.json();
        this.updateState({
          todos: [...this.state.todos, savedTodo],
          newTodo: '',
          isLoading: false,
        });
      } catch (error) {
        console.error('Failed to add todo:', error);
        this.updateState({ isLoading: false });
      }
    }
  },

  async deleteTodo(id) {
    this.updateState({ isLoading: true });
    try {
      await fetch(`/api/todos/${id}`, { method: 'DELETE' });
      this.updateState({
        todos: this.state.todos.filter(todo => todo.id !== id),
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to delete todo:', error);
      this.updateState({ isLoading: false });
    }
  },

  async toggleTodo(id, completed) {
    this.updateState({ isLoading: true });
    try {
      await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      });
      this.updateState({
        todos: this.state.todos.map(todo =>
          todo.id === id ? { ...todo, completed } : todo
        ),
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to update todo:', error);
      this.updateState({ isLoading: false });
    }
  },

  updateNewTodo(e) {
    this.updateState({ newTodo: e.target.value });
  },

  render() {
    const { todos, newTodo, isLoading } = this.state;

    return h('div', { style: { maxWidth: '500px', margin: '20px auto' } }, [
      h('h2', {}, ['Todo List']),
      h('input', {
        type: 'text',
        value: newTodo,
        placeholder: 'Add a new task...',
        on: { input: (e) => this.updateNewTodo(e) },
        style: { padding: '8px', width: '100%', marginBottom: '10px' },
        disabled: isLoading,
      }),
      // Custom Button: Triggers adding a new Todo with backend integration
      h(CustomButton, {
        label: 'Add Todo',
        onClick: () => this.addTodo(),
        backgroundColor: '#28a745',
        disabled: isLoading,
      }),
      isLoading ? h('p', {}, ['Loading...']) : null,
      h('ul', { style: { listStyle: 'none', padding: 0 } },
        todos.map(todo =>
          h(TodoItem, {
            key: todo.id,
            id: todo.id,
            text: todo.text,
            completed: todo.completed,
            onDelete: (id) => this.deleteTodo(id),
            onToggle: (id, completed) => this.toggleTodo(id, completed),
          })
        )
      ),
    ]);
  },
});
```

This component:
- Fetches Todos from the backend on mount using `fetch`.
- Sends `POST`, `PUT`, and `DELETE` requests to add, update, and delete Todos.
- Manages loading state to provide feedback during API calls.
- Uses `CustomButton` for adding Todos, highlighted as a custom element.
- Demonstrates state management, event handling, and HTTP integration.

## Step 5: Set Up Backend (Optional)

To enable backend functionality, set up the provided Spring Boot backend from `/your/path/to/frontend-framework/example/backend`.

### 5.1 Configure PostgreSQL
1. Ensure PostgreSQL is running.
2. Create a database:
   ```bash
   psql -U postgres -c "CREATE DATABASE frameworktodoappdb;"
   ```

3. Verify the configuration in `example/backend/src/main/resources/application.properties`:
   ```properties
   server.port=8080
   spring.datasource.url=jdbc:postgresql://localhost:5432/frameworktodoappdb
   spring.datasource.username=postgres
   spring.datasource.password=123
   spring.jpa.hibernate.ddl-auto=create-drop
   spring.jpa.defer-datasource-initialization=true
   spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
   spring.sql.init.mode=always
   ```

   Update `username` and `password` if your PostgreSQL setup differs.

### 5.2 Run the Backend
1. Navigate to the backend directory:
   ```bash
   cd /your/path/to/frontend-framework/example/backend
   ```

2. Install dependencies and start the server:
   ```bash
   ./mvnw install
   ./mvnw spring-boot:run
   ```

   The backend will run at `http://localhost:8080`, serving endpoints like `/api/todos`.

### 5.3 Backend API Endpoints
The backend (based on `TodoItemController.java`) supports:
- `GET /api/todos`: Fetch all Todos.
- `POST /api/todos`: Create a new Todo (expects `{ text: string, completed: boolean }`).
- `PUT /api/todos/{id}`: Update a Todo’s completion status.
- `DELETE /api/todos/{id}`: Delete a Todo.

> **Note**: Ensure the Webpack proxy (`/api` to `http://localhost:8080`) is configured to route API requests correctly.

## Step 6: Add Routing with Pages

Create two pages to demonstrate DotJS’s routing capabilities.

In `src/pages/HomePage.js`:
```javascript
import { defineComponent, h } from 'frontend-framework';

//Same principle as we created a custom button applies to the page creation
export const HomePage = defineComponent({
  render() {
    return h('div', { style: { textAlign: 'center', marginTop: '50px' } }, [
      h('h1', {}, ['Welcome to DotJS']),
      h('p', {}, ['A lightweight framework for learning frontend development.']),
    ]);
  },
});
```

In `src/pages/TodoPage.js`:
```javascript
import { defineComponent, h } from 'frontend-framework';
import { TodoList } from '../components/TodoList';

export const TodoPage = defineComponent({
  render() {
    return h('div', {}, [h(TodoList)]);
  },
});
```

## Step 7: Set Up Routing

Configure routing to switch between pages.

In `src/App.js`:
```javascript
import { defineComponent, h, HashRouter, RouterLink, RouterOutlet } from 'frontend-framework';
import { HomePage } from './pages/HomePage';
import { TodoPage } from './pages/TodoPage';
import { CustomButton } from './components/CustomButton';

const routes = [
  { path: '/', component: HomePage },
  { path: '/todos', component: TodoPage },
];

export const App = defineComponent({
  render() {
    return h('div', {}, [
      h('nav', { style: { marginBottom: '20px', textAlign: 'center' } }, [
        // Custom Button: Used as navigation links for a consistent UI
        h(CustomButton, { label: 'Home', onClick: () => this.appContext.router.navigateTo('/'), backgroundColor: '#007bff' }),
        h(CustomButton, { label: 'Todos', onClick: () => this.appContext.router.navigateTo('/todos'), backgroundColor: '#007bff', style: { marginLeft: '10px' } }),
      ]),
      h(RouterOutlet),
    ]);
  },
});
```

> **Note**: We use `CustomButton` instead of `RouterLink` for navigation to highlight the flexibility of DotJS’s event handling and component reuse.

## Step 8: Mount the App

In `src/index.js`:
```javascript
import { createApp, HashRouter } from 'frontend-framework';
// Custom created App (acts as the root component/layout)
import { App } from './App';
// Custom created HomePage (for routing)
import { HomePage } from './pages/HomePage';
// Custom created TodoPage (for routing)
import { TodoPage } from './pages/TodoPage';


// Define routes for the main application router
const mainRoutes = [
   { path: '/', component: HomePage },
   { path: '/todos', component: TodoPage },
];

// Create the router instance with the main routes
// The RouterOutlet within App will use this router to render HomePage or TodoPage
const router = new HashRouter(mainRoutes);

// App component is the root UI structure containing navigation and RouterOutlet
// Custom created App
const app = createApp(App, {}, { router });
app.mount(document.getElementById('app'));
```

## Step 9: Run Your App

1. Add a start script to `package.json`:
   ```json
   "scripts": {
     "start": "webpack serve --mode development"
   }
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. If using the backend, ensure it’s running (see Step 5.2).
4. Open `http://localhost:3000` in your browser. You should see:
   - A navigation bar with "Home" and "Todos" buttons (using `CustomButton`).
   - The `HomePage` at `#/` with a welcome message.
   - The `TodoPage` at `#/todos` with a Todo app where you can add, toggle, and delete tasks, synced with the backend if enabled.

## What’s Happening?

This Quick Start showcases DotJS’s features:
- **Components**: `CustomButton`, `TodoItem`, and `TodoList` demonstrate reusable component architecture with `defineComponent`.
- **Routing**: `HashRouter` and `RouterOutlet` enable navigation, with `CustomButton` handling route changes via `navigateTo`.
- **State Management**: `state` and `updateState` manage Todos and loading states, reacting to changes for UI updates.
- **Event Handling**: The `on` prop (e.g., `on: { click: ... }`) handles clicks and inputs, preventing default behavior and bubbling, distinct from `addEventListener`.
- **DOM Manipulation**: The `h` function creates virtual DOM nodes, and `setAttributes`/`setStyle` manage element properties dynamically.
- **HTTP Integration**: The `TodoList` component uses `fetch` to interact with a backend, demonstrating data fetching and updating.
- **Performance**: Efficient diffing (`arraysDiffSequence`) minimizes DOM updates, and lazy rendering is supported via the framework’s scheduler.

## Next Steps

- Explore the [Full Documentation](../../../../../README.md) for in-depth feature explanations.
- Extend the Todo app by adding features like filtering Todos or persisting state locally.
- Create new components or pages to experiment with DotJS’s flexibility.
- Check the backend code in `../../../frontend-framework/example/backend` for more API integration ideas.