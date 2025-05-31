# The scheduler.js Documentation

This document explains the `scheduler.js` file, which manages the execution of tasks (called "jobs") in a web application, specifically for lifecycle hooks like `onMounted()` and `onUnmounted()`. The scheduler ensures these tasks run in the correct order and at the right time, using the browser's **microtask queue**. It also handles cases where tasks might be asynchronous (like promises) and prevents errors from stopping the application.

The code is used in a frontend framework to schedule tasks when components are added to or removed from the DOM (Document Object Model). Below, we describe each function, how it works, and where it’s used.

---
## Overview

The scheduler is like a to-do list manager for the framework. It collects tasks (jobs) that need to be done, such as running `onMounted()` when a component is added to the page or `onUnmounted()` when it’s removed. These tasks are stored in a list and executed in order when the browser is ready, using the **microtask queue**. This ensures tasks run after the main code (like `mountDOM()`) finishes, keeping everything organized and efficient.

The scheduler also prevents scheduling the same task multiple times and handles errors if a task fails, so the application doesn’t crash.

---
## Functions in `scheduler.js`

### State Variables

**What they do**: Define the scheduler’s internal state to track jobs and scheduling status.

**How they work**:
- `isScheduled`: A boolean flag to prevent multiple scheduling of the same task batch.
- `jobs`: An array to store queued tasks for ordered execution.

**Code**:
```javascript
let isScheduled = false; // Tracks if jobs are scheduled to avoid duplicate scheduling
const jobs = []; // Stores jobs (functions) to be executed in order
```

**Where they’re used**: Across all scheduler functions to manage task queuing and execution.

>**Why they’re important**: These variables ensure jobs are queued and processed only once, maintaining efficiency and order.

### `enqueueJob(job)`

#### What it does
This function adds a task (called a "job") to a list and tells the scheduler to process the list soon.

#### How it works
- It takes a `job` (a function, like `onMounted()` or `onUnmounted()`) and adds it to an array called `jobs`.
- It calls `scheduleUpdate()` to plan when the jobs should run.
- The `jobs` array acts like a queue, where tasks are added to the end and processed in order.

#### Where it’s used
- In `mountDOM()` (in the `createComponentNode` function), it schedules the `onMounted()` hook for a component after it’s added to the DOM. For example:
  ```javascript
  enqueueJob(() => vdom.component.onMounted());
  ```
- In `destroyDOM()` (in the `DOM_TYPES.COMPONENT` case), it schedules the `onUnmounted()` hook when a component is removed:
  ```javascript
  enqueueJob(() => vdom.component.onUnmounted());
  ```

**Code**:
```javascript
export function enqueueJob(job) {
  jobs.push(job); // Adds the job to the end of the queue for ordered execution
  scheduleUpdate(); // Triggers scheduling of job processing
}
```

**Example**:
```javascript
enqueueJob(() => component.onMounted()); // Queues onMounted hook
```

>**Why it’s important**: Ensures lifecycle hooks are queued for execution after DOM updates, maintaining proper component lifecycle timing.

### `scheduleUpdate()`

#### What it does
This function plans when the jobs in the queue should run by scheduling them in the browser’s **microtask queue**.

#### How it works
- It checks a flag called `isScheduled` to see if the scheduler is already waiting to process jobs.
- If `isScheduled` is `true`, it does nothing to avoid scheduling the same task multiple times.
- If `isScheduled` is `false`, it sets `isScheduled` to `true` and uses `queueMicrotask()` to schedule the `processJobs()` function.
- The **microtask queue** ensures `processJobs()` runs after the current code (like `mountDOM()`) finishes, but before the browser updates the screen.

#### Where it’s used
- It’s called by `enqueueJob()` every time a new job is added to the queue.
- It’s also called by `nextTick()` to force the scheduler to process jobs immediately.

**Code**:
```javascript
function scheduleUpdate() {
  if (isScheduled) return; // Prevents scheduling if already queued
  isScheduled = true; // Marks scheduler as active
  queueMicrotask(processJobs); // Schedules processJobs in microtask queue
}
```

**Example**:
```javascript
enqueueJob(() => console.log('Mounted')); // Triggers scheduleUpdate
```

>**Why it’s important**: Prevents duplicate scheduling and ensures jobs run after the current task (e.g., DOM updates), using the microtask queue for optimal timing.

### `processJobs()`

#### What it does
This function runs all the jobs in the queue one by one.

#### How it works
- It loops through the `jobs` array while it’s not empty.
- For each job:
    - It removes the job from the front of the queue using `jobs.shift()`.
    - It runs the job by calling it as a function (`job()`).
    - It wraps the job’s result in a `Promise` using `Promise.resolve()`. This handles cases where the job is asynchronous (like a promise).
    - If the job succeeds, nothing extra happens.
    - If the job fails, it logs an error to the console (e.g., `[scheduler]: error message`).
- After all jobs are processed, it sets `isScheduled` to `false` so new jobs can be scheduled again.

#### Where it’s used
- It’s called automatically by the browser’s microtask queue when `scheduleUpdate()` uses `queueMicrotask(processJobs)`.
- It processes jobs like `onMounted()` and `onUnmounted()` added by `enqueueJob()`.

**Code**:
```javascript
function processJobs() {
  while (jobs.length > 0) { // Continues until all jobs are processed
    const job = jobs.shift(); // Removes and retrieves the first job
    const result = job(); // Executes the job
    Promise.resolve(result).then( // Wraps result in a promise for async handling
      () => {}, // No action needed on success
      (error) => { console.error(`[scheduler]: ${error}`); } // Logs errors without halting
    );
  }
  isScheduled = false; // Resets scheduler for new jobs
}
```

**Example**:
```javascript
enqueueJob(() => console.log('Job 1')); // Queued and processed by processJobs
```

>**Why it’s important**: This function ensures all jobs run in the correct order and handles errors so the application doesn’t crash if a job fails. It also clears the queue and resets the scheduler for future tasks.


### `nextTick()`

#### What it does
This function schedules an immediate update and returns a promise that resolves after all jobs are processed.

#### How it works
- It calls `scheduleUpdate()` to queue the `processJobs()` function in the microtask queue.
- It calls `flushPromises()`, which returns a promise that resolves after a short delay (using `setTimeout`).
- This ensures the promise resolves after all microtasks (like `processJobs()`) are done.

#### Where it’s used
- It’s not directly used in the provided code, but it’s exported for other parts of the framework. For example, it could be used to wait for all `onMounted()` hooks to finish before running other code.

**Code**:
```javascript
export function nextTick() {
  scheduleUpdate(); // Schedules job processing
  return flushPromises(); // Returns promise resolving after microtasks
}
```

**Example**:
```javascript
nextTick().then(() => console.log('All jobs done')); // Waits for jobs to complete
```

>**Why it’s important**: This function lets developers wait for all scheduled jobs to complete, which is useful for coordinating tasks that depend on lifecycle hooks finishing.


### `flushPromises()`

#### What it does
This function creates a promise that resolves after a short delay, ensuring all microtasks (like jobs in the queue) are done.

#### How it works
- It uses `setTimeout(resolve)` to create a promise that resolves after the browser’s event loop moves to the next cycle.
- This ensures all microtasks (like those scheduled by `queueMicrotask()`) are completed before the promise resolves.

#### Where it’s used
- It’s called by `nextTick()` to ensure the returned promise resolves after all jobs are processed.

**Code**:
```javascript
function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve)); // Resolves after next event loop cycle
}
```

**Example**:
```javascript
flushPromises().then(() => console.log('Microtasks done')); // Waits for microtasks
```

>**Why it’s important**: Ensures `nextTick()` resolves only after all scheduled jobs are processed, enabling proper task coordination.

## How the Scheduler Works Together

1. **Adding a job**: When a component is mounted (`mountDOM`) or unmounted (`destroyDOM`), the framework calls `enqueueJob()` to add lifecycle hooks like `onMounted()` or `onUnmounted()` to the `jobs` array.
2. **Scheduling**: `enqueueJob()` calls `scheduleUpdate()`, which uses `queueMicrotask()` to schedule `processJobs()` to run later, but only if it hasn’t been scheduled already (`isScheduled` is `false`).
3. **Running jobs**: When the browser’s execution stack is empty (e.g., after `mountDOM()` finishes), the microtask queue runs `processJobs()`. This function executes each job in order, handles any errors, and resets the scheduler.
4. **Waiting for completion**: If the framework needs to wait for all jobs to finish, it can use `nextTick()`, which schedules jobs and returns a promise that resolves after everything is done.


## Example Workflow

Imagine a component is added to the page:
1. `mountDOM()` creates the component’s DOM elements.
2. It calls `enqueueJob(() => vdom.component.onMounted())` to schedule the `onMounted()` hook.
3. `enqueueJob()` adds the hook to the `jobs` array and calls `scheduleUpdate()`.
4. `scheduleUpdate()` checks `isScheduled`. If it’s `false`, it sets it to `true` and schedules `processJobs()` using `queueMicrotask()`.
5. After `mountDOM()` finishes, the browser runs `processJobs()` from the microtask queue.
6. `processJobs()` runs the `onMounted()` hook, handles any errors, and sets `isScheduled` to `false`.

The same process happens for `onUnmounted()` when a component is removed in `destroyDOM()`.


## Key Features

- **Orderly execution**: Jobs run in the order they’re added, thanks to the `jobs` array and microtask queue.
- **Error handling**: If a job fails, the error is logged, but the scheduler keeps running other jobs.
- **Efficiency**: The `isScheduled` flag prevents scheduling the same task multiple times.
- **Async support**: The scheduler handles both regular functions and promises, ensuring no "floating promises" cause issues.
- **Coordination**: `nextTick()` lets developers wait for all jobs to finish, making it easier to manage complex tasks.


## Why Use a Scheduler?

Without a scheduler, lifecycle hooks like `onMounted()` might run at the wrong time or in the wrong order, causing bugs. The scheduler ensures:
- Hooks run after the DOM is updated (e.g., after `mountDOM()`).
- Hooks run in the correct order using the microtask queue.
- Errors don’t crash the application.
- Developers can wait for hooks to finish using `nextTick()`.

This makes the framework reliable and predictable when managing components.