import "../assets/app.css";
import Store from "./store.js";
import { createApp, HashRouter } from "frontend-framework";
import AppRoot from "./components/AppRoot.js";
import TodoPageComponent from "./components/TodoPageComponent.js";
import AboutPageComponent from "./components/AboutPageComponent.js";

const store = new Store("blind-todo-app-storage");

const routes = [
  { path: "/", component: TodoPageComponent, name: "All" },
  { path: "/active", component: TodoPageComponent, name: "Active" },
  { path: "/completed", component: TodoPageComponent, name: "Completed" },
  { path: "/about", component: AboutPageComponent, name: "About" },
];
const router = new HashRouter(routes);

const app = createApp(AppRoot, { context: { store: store } }, { router });
app.mount(document.querySelector(".todoapp"));
