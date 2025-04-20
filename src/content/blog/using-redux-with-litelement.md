---
title: Using Redux with LitElement
author: Hasani Rogers
date: 2020-11-17
tags: 
- post
- redux 
- lit
excerpt: I am not an expert at redux. I don't even really like it. But state management is important and there's little material out there that demonstrates Redux and LitElement in a sandbox. So here we go.
---

I think redux is kinda of a pain. There's a lot of boilerplate involved and other state management tools are starting to rise in favor it. But redux is useful, especially if you're working with a large application. There's not a lot of material out there that covers using redux with LitElement so I've decided to give it a shot. In this blog post I'll break down [a Todo App](https://stackblitz.com/edit/lit-element-redux-todo) I've put together. It's based on the series [How to build apps with LitElement and redux tutorial](https://vaadin.com/learn/tutorials/lit-element) by Vaadin. I've made small changes though. This app doesn't use Vaadin components.


For this app you'll need 4 npm dependencies so install them.

``` bash
npm install --save lit-element redux nanoid pwa-helpers
```

The first thing we want do is create our `index.html` file.


/index.html {.filepath}
``` html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>LitElement Redux: Todo App</title>

    <script src="https://unpkg.com/@webcomponents/webcomponentsjs@latest/custom-elements-es5-adapter.js"></script>
    <script src="https://unpkg.com/@webcomponents/webcomponentsjs@latest/webcomponents-loader.js"></script>
  </head>

  <body>
    <header>
      <h1>Todo app</h1>
    </header>

    <main>
      <todo-view></todo-view>
    </main>
  </body>
</html>
```

Since our app is on Stackblitz, which transpiles the javascript to es5, we need to load our es5 adapter. I've also thrown in the web component polyfill for browsers that don't support them. Next thing we need to do is create our view. I'll start off with a skeleton.

views/todo-view.js {.filepath}
```javascript
import { LitElement, html, css } from 'lit-element';

export const VisibilityFilters = {
  SHOW_ALL: 'All',
  SHOW_ACTIVE: 'Active',
  SHOW_COMPLETED: 'Completed'
};

class TodoView extends LitElement {
  static get properties() {
    return {
      todos: { 
        type: Array 
      },
      filter: { 
        type: String 
      },
      task: { 
        type: String 
      }
    };
  }

  static get styles() {
    return [
      css`
        /* style it how you want! /*
      `
    ];
  }

  render() {
    return html`
      <h1>Hello Todo!</h1>
    `;
  }

  addTodo() {
    // we'll add our todos here
  }

  shortcutListener(event) {
    // when a user hits enter, add a todo
  }

  updateTask(event) {
    // keeps track of changing tasks
  }

  updateTodoStatus(updatedTodo, complete) {
    // called when a status is updated as complete or not complete
  }

  filterChanged(event) {
    // keep track of the current filter type
  }

  clearCompleted() {
    // clears all completed todo items
  }

  applyFilter(todos) {    
    // determines what kinds of todos to show
  }

  makeTodos() {
    // list the todos
}

// define the <todo-view> if it's not already defined
customElements.get('todo-view') || customElements.define('todo-view', TodoView);
```

At this point you should have a working todo component that simply spits out some large text that says "Hello Todo!" Verify that that's the case. After that, we update our render method with some markup. Update the render method with the following:

views/todo-view.js {.filepath}
```javascript
render() {
  return html`
    <div class="input-layout" @keyup="${this.shortcutListener}">
      <input
        type="text"
        placeholder="Task"
        @change="${this.updateTask}" 
      />
      <button @click="${this.addTodo}">Add Todo</button>
    </div>
    
    <div class="todos-list">
      ${this.makeTodos()}
    </div>

    <div class="visibility-filters">
      ${
        Object.values(VisibilityFilters).map(filter => html`
          <input
            type="radio"
            name="filters" 
            value="${filter}"
            @change=${this.filterChanged}
          />
          ${filter}
        `)
      }
    </div>

    <button @click="${this.clearCompleted}">Clear Completed</button>
  `;
}
```

This will give us the layout for the view. I'm not going to cover the styles here. They're really simple. If you're lazy just copy and paste them from my [Stackblitz](https://stackblitz.com/edit/lit-element-redux-todo?file=views%2Ftodo-view.js). Notice that we've binded to some methods. Lets leave those alone for the time being as they're are going to use a redux store. So, the next thing we need to do is hookup our component to the store. First, import the store.

## Creating the Store

views/todo-view.js {.filepath}
```javascript
import { connect } from 'pwa-helpers';
import { store } from '../redux/store.js';

...

class TodoView extends connect(store)(LitElement) {
  ...
}
```

You'll see that we're importing a file, `store.js`, that we haven't created yet. Lets create that file.

redux/store.js {.filepath}
```javascript
import { createStore } from 'redux';
import { reducer } from './reducer.js';

export const store = createStore(
  reducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);
```

We use `createStore` to create the store. It's a simple function that takes some arguments. The first argument is a reducer, which we'll create in a moment. The second argument allows us to hook up our store to redux dev tools. Since we imported a file that doesn't exist yet, lets create that reducer file.


## Creating the Reducer

redux/reducer.js {.filepath}
```javascript
import {
  ADD_TODO,
  UPDATE_FILTER,
  UPDATE_TODO_STATUS,
  CLEAR_COMPLETED,
} from './actions.js'

export const VisibilityFilters = {
  SHOW_ALL: 'All',
  SHOW_ACTIVE: 'Active',
  SHOW_COMPLETED: 'Completed'
};

const INITIAL_STATE = {
  todos: [],
  filter: VisibilityFilters.SHOW_ALL
};

export const reducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ADD_TODO:
      return {
        ...state,
        todos: [...state.todos, action.todo]
      };
    
    case UPDATE_TODO_STATUS:
      return {
        ...state,
        todos: state.todos.map(todo => {
          return todo.id === action.todo.id 
            ? {...action.todo, complete: action.complete} 
            : todo
        })
      };

    case UPDATE_FILTER:
      return {
        ...state,
        filter: action.filter
      };

    case CLEAR_COMPLETED: 
      return {
        ...state,
        todos: state.todos.filter(todo => !todo.complete)
      }

    default:
      return state;
  }
}
```

First, let's ignore the actions. We'll create those later. For now what's important is that we have reference to some actions. A reducer is basically a giant switch statement in a function. It takes in a state and an action and returns new state as an object. The `type` is a standard property of an action, so you always look at the type of action in your switch statement. From there you handle the different actions with cases.

Remember that state is an object, so for each case we spread in the current state. We then overwrite a property, such as todo, with the new state. Lets look at the case of `ADD_TODO` more closely. 

redux/reducer.js {.filepath}
```javascript
case ADD_TODO:
  return {
    ...state,
    todos: [...state.todos, action.todo]
  };
```
We spread in state on line 3. On line 4 we then add a todos property that the updates state. This works because todos is an array of objects. So on line 4, in the array, we spread in the current state and our new entries comes from `action.todo` since `todo` is a property on our action. It'll make more since once we create our actions, which is coming soon.


Finally, we've added the `VsibilityFilters` here, so we can delete them in `views/todo-view.js`.

views/todo-view.js {.filepath}
```javascript
+ import { VisibilityFilters } from '../redux/reducer.js';

- export const VisibilityFilters = {
-   SHOW_ALL: 'All',
-   SHOW_ACTIVE: 'Active',
-   SHOW_COMPLETED: 'Completed'
- };
```


## Creating Actions

Our reducer references actions. We need to create and understand those. So lets get crackin'. Create a new file.

redux/actions.js {.filepath}

```javascript
import { nanoid } from 'nanoid';

export const ADD_TODO = 'ADD_TODO';
export const UPDATE_TODO_STATUS = 'UPDATE_TODO_STATUS';
export const UPDATE_FILTER = 'UPDATE_FILTER';
export const CLEAR_COMPLETED = 'CLEAR_COMPLETED';

export const addTodo = (task) => {
  return {
    type: ADD_TODO,
    todo : {
      id: nanoid(),
      task,
      complete: false
    }
  };
};

export const updateTodoStatus = (todo, complete) => {
  return {
    type: UPDATE_TODO_STATUS,
    todo,
    complete
  }
}

export const updateFilter = (filter) => {
  return {
    type: UPDATE_FILTER,
    filter
  };
};

export const clearCompleted = () => {
  return {
    type: CLEAR_COMPLETED
  }
}
```

At it's core, an action is just an object. But it's common practice to use action creators. An action creator is just a function that returns an action object. It's so common that most people just call the action creator an action itself. I'm gonna do that too. When we write reducers, like we just did, the object we return gets passed as an action in the reducer function. Let's take a look a `addTodo` more closely.

redux/actions.js {.filepath}
```javascript
export const addTodo = (task) => {
  return {
    type: ADD_TODO,
    todo : {
      id: nanoid(),
      task,
      complete: false
    }
  };
};
```

On line 3 we have our mandatory type property that you should recognize from the reducer's switch statement. On line 4 we have our todo property. The todo property is the payload. It contains 3 things:

1. An ID. The id is a unique string generated by nanoid.
2. A task. We pass the task in when we dispatch the action (more on that later).
3. A complete flag. This flag will always be false when we first add a TODO.


## Dispatching Actions

Now that we have some actions, it's time we actually dispatch the action. We do that by calling the `dispatch` method on our `store`.

```javascript
store.dispatch(yourAction(yourArgs));
```

Lets update our class methods to dispatch our actions. Update the following class methods:

views/todo-view.js {.filepath}
```javascript
addTodo() {
  if (this.task) {
    store.dispatch(addTodo(this.task));
    this.task = '';
  }
}

updateTodoStatus(updatedTodo, complete) {
  store.dispatch(updateTodoStatus(updatedTodo, complete));
}

filterChanged(event) {
  store.dispatch(updateFilter(event.target.value));
}

clearCompleted() {
  store.dispatch(clearCompleted());
}
```

When creating our actions I mentioned that `addTodo` was passed a `task`. We can see that on line 3 here when we dispatch the action we're also sending it `this.task`. Now that we're able to dispatch actions finish off the following class methods by updating them:

views/todo-view.js {.filepath}
```javascript
updateTask(event) {
  this.task = event.target.value;
}

applyFilter(todos) {    
  switch (this.filter) {
    case VisibilityFilters.SHOW_ACTIVE:
      return todos.filter(todo => !todo.complete);
    case VisibilityFilters.SHOW_COMPLETED:
      return todos.filter(todo => todo.complete);
    default:
      return todos;
  }
}

makeTodos() {
  if (this.applyFilter(this.todos)) {
    const tasklist = this.applyFilter(this.todos).map(todo => html`
      <p>
        <label class="todo-item">
          <input
            type="checkbox"
            ?checked="${todo.complete}"
            @change=${event => this.updateTodoStatus(todo, event.target.checked)}
          />
          ${todo.task}
        </label>
      </p>
    `);

    return tasklist.length > 0
      ? tasklist
      : null;
  }
  
  return null;
}
```

## Persisting State

At this point we have enough logic in place where our app should work. However it doesn't persist the todo list between visits, which makes it impractical. We can maintain the todo list by using local storage. To do that, update the `store.js` file.

redux/store.js {.filepath}
```javascript
import { createStore } from 'redux';
import { reducer } from './reducer.js';

const STORAGE_KEY = '__todo_app__';

const saveState = (state) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const loadState = () => {
  const json = localStorage.getItem(STORAGE_KEY);
  
  return json
    ? JSON.parse(json)
    : undefined;
}

export const store = createStore(
  reducer,
  loadState(),
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

store.subscribe(() => {
  saveState(store.getState());
});
```

On line 24 we use a new method of `store` called `subscribe`. This method is called every time the store is updated. Inside of `subscribe` we may use `getState` to read the current redux tree. So on line 25 we pass the state of our app to a function we created called `saveState` every time it's updated. This function stringifies the state which is necessary for saving it to local storage. We also updated `createStore`, which technically can accept 3 arguments. We've added a `preloadedState` argument. We pass it `loadState` which is a simple function that returns the state as an object from local storage.

And there you have it folks. Redux with LitElement. I know this app is virtually identical to the one put together by Vaadin. But I figured having a [stackblitz](https://stackblitz.com/edit/lit-element-redux-todo) of it available will help new comers understand better. 
