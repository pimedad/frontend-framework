# The dispatcher

If the application developer wants to update the state when a particular event is `dispatched`, first they need to determine what that `event` means in terms of the application domain. 
Then the developer maps the event to a `command` that the framework can understand. A `command` is a request to do something, as opposed to an `event`, which is a notification of something that has happened. 
These `commands` ask the `framework` to update the `state`; they are expressed in the domain language of the application.

# Events vs. Commands

This table explains the difference between **events** and **commands** in a web framework. Understanding this difference is important for managing how your app responds to user actions or system changes.

| **Aspect**            | **Events**                                                                 | **Commands**                                                              |
|-----------------------|---------------------------------------------------------------------------|---------------------------------------------------------------------------|
| **Definition**        | Notifications that something has happened, like a button click or a key press. | Requests to perform an action, like adding or editing an item.            |
| **Purpose**           | Inform the framework or app about an occurrence without expecting an action. | Tell the framework or app to do something specific in a given context.    |
| **Naming Convention** | Written in past tense, e.g., `button-clicked`, `key-pressed`, `network-request-completed`. | Written in imperative tense, e.g., `add-todo`, `edit-todo`, `remove-todo`. |
| **Examples**          | “A button was clicked,” “A key was pressed,” “A network request was completed.” | “Add todo,” “Edit todo,” “Remove todo.”                                  |

# The reducer functions
Reducer functions can be implemented in a few ways. 
But if we decide to stick to the functional programming principles of using pure functions and making data immutable, instead of updating the state by mutating it, these functions should create a new one passed to them (mutation would be a side effect, so the function wouldn’t be pure); instead, they create a new state.
Consider an example based on the TODOs application. To create a new version of the state when the user removes a to-do item from the list, the reducer function associated with this 'remove-todo' command would look like this:
```
function removeTodo(state, todoIndex) {
return state.toSpliced(todoIndex, 1)
}
```
If we had the state: 
```
let todos = ['Walk the dog', 'Water the plants', 'Sand the chairs']
```
and wanted to remove the to-do item at index 1, we would compute the new state by using the `removeTodo()` `reducer`, as follows:
```
todos = removeTodo(todos, 1)
// todos = ['Walk the dog', 'Sand the chairs']
```
In this case, the payload associated with the 'remove-todo' command is the index of the to-do item to remove.

The association between `commands` and `reducer` functions is performed by an entity we’ll call the `dispatcher`. 
The name reflects the fact that this entity is responsible for `dispatching` the `commands` to the functions that handle the command—that is, for executing the corresponding handler functions in response to commands. 
To do this, the application developer must specify which handler function (or functions) the system should execute in response to each command.


# Assigning Handlers to Commands

dispatcher needs to have a `subscribe()` method that `registers` a consumer function—`the handler`—to respond to commands with a given name. 
The same way that we can register a handler for a command, we can unregister it when it doesn’t need to be executed anymore (because the relevant view has been removed from the DOM, for example). 
To accomplish this task, the `subscribe()` method should return a function that can be called to unregister the handler.

Your `dispatcher` also needs to have a `dispatch()` method that executes the handler functions associated with a command.

# The Dispatcher Class

The `Dispatcher` class is the core of the state management system. It keeps track of which handler functions should run for each command and ensures the renderer is notified about state changes. It uses a private `Map` called `#subs` to store handlers for specific commands and a private array called `#afterHandlers` for functions that run after every command. Here’s how its methods work:

## The subscribe() Method

The `subscribe()` method lets you register a handler function for a specific command. It’s like signing up a function to handle a certain task, such as removing a to-do item when the `remove-todo` command is sent.

This method is important because it allows developers to connect commands to their handlers. For example, a handler might wrap a reducer like `removeTodo()` to update the state. The method checks if the command already has handlers; if not, it creates an empty list. It then adds the handler to the list (if it’s not already there) and returns a function to unregister the handler later. This unregister function is useful when a view is removed, preventing unnecessary handlers from running and saving memory.

## The afterEveryCommand() Method

The `afterEveryCommand()` method registers a handler that runs after *every* command is processed. It’s like setting up a notification system that tells the renderer, “Hey, the state might have changed, so update the view!”

This method is needed to keep the webpage in sync with the state. Since commands trigger state changes through reducers, the renderer needs to know when to refresh the view. This method adds the handler to a private list (`#afterHandlers`) and returns a function to unregister it, similar to `subscribe()`. Allowing multiple registrations of the same handler is okay here, as these handlers are just for notifications and don’t change the state.

## The dispatch() Method

The `dispatch()` method is the heart of the `Dispatcher`. It takes a command name and its payload (extra data, like the index of a to-do item) and runs all the handlers registered for that command. It’s like a mail carrier delivering a message to the right recipients.

This method is crucial because it triggers the actual work of updating the state. It looks up the handlers for the given command in the `#subs` Map, calls each one with the payload, and then runs all the `afterEveryCommand` handlers to notify the renderer. If no handlers are found for a command, it shows a warning in the console to help developers catch mistakes, like misspelling a command name.

Here’s the complete `Dispatcher` class implementation:

```
export class Dispatcher {
  #subs = new Map();
  #afterHandlers = [];

  subscribe(commandName, handler) {
    if (!this.#subs.has(commandName)) {
      this.#subs.set(commandName, []); // Creates an empty list for new commands
    }

    const handlers = this.#subs.get(commandName);
    if (handlers.includes(handler)) {
      return () => {}; // Returns an empty function if handler is already registered
    }

    handlers.push(handler); // Adds the handler to the list

    return () => {
      const idx = handlers.indexOf(handler);
      handlers.splice(idx, 1); // Returns a function to unregister the handler
    };
  }

  afterEveryCommand(handler) {
    this.#afterHandlers.push(handler); // Adds handler to run after every command

    return () => {
      const idx = this.#afterHandlers.indexOf(handler);
      this.#afterHandlers.splice(idx, 1); // Returns a function to unregister the handler
    };
  }

  dispatch(commandName, payload) {
    if (this.#subs.has(commandName)) {
      this.#subs.get(commandName).forEach((handler) => handler(payload)); // Runs all handlers for the command
    } else {
      console.warn(`No handlers for command: ${commandName}`); // Warns if no handlers are found
    }
    
    this.#afterHandlers.forEach((handler) => handler()); // Runs all after-command handlers
  }
}
```