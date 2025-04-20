---
title: Lit and State Management with Zustand
date: 2024-07-07
tags:
  - post
  - lit
  - zustand
  - state management
  - web components
author: Hasani Rogers
excerpt: Did you know what you can build entire applications with Lit and Web Components? You can. An important part of any application UI is state management. Follow along as I dive into using Zustand with Lit.
---

I come across a lot of developers who think that web components are for trivial things like buttons and input components. The reality is that you can build an entire application with web components. One of the most important pieces to an application's UI is state management. There are a lot of state management tools out there, like redux and mobx, that work perfectly fine with web components. These tools are a bit cumbersome though and many developers prefer more simple solutions for more simple applications. Enter Zustand, a "bare necessities" state management tool that's making strides in the React world.

I was (sorta) recently introduced to Zustand on a React project I'm working on. I thought it was pretty neat. So naturally I was curious about how you would use it with an application built with Lit and web components. I new it was possible because the Zustand docs has a "Using Zustand without React" section. But I found absolutely no resources out there on how to accomplish using it with Lit. Thus I decided to experiment with an [Stackblitz todo app](https://stackblitz.com/edit/zustand-lit-todo). I had a lot of fun! Since I could find no resources out there I also decided this would be a good topic to blog about.

## Getting the basics down

The first thing to know about using Zustand outside of React is that instead of hooks, which is a React thing, you'll be working with it's API utilities. These are:

1. `getState`
2. `setState`
3. `subscribe`
4. `getInitialState`

I found that `getInitialState` and `subcribe` was the most critical for working with Lit. I've put together [a basic demo app illustrating how to work with Lit and Zustand](https://stackblitz.com/edit/zustand-lit).

This app only has one store and one Lit component. All it does is count bears and remove the count. I made this because I want to demonstrate the basic principals behind using Lit and Zustand. The most important thing to know in this app is lines 75-83 of my-element.ts, the constructor.

```javascript
constructor() {
  super();

  // we need to subscribe to appStore state changes to rerender the UI when state has been updated
  appStore.subscribe((state, prevState) => {
    // update bears locally
    this.bears = state.bears;
  });
}
```

In the constructor you are going to want to listen to your store by subscribing to it. From there you want to update data in Lit based off state changes. In this example we update the bears count in Lit (`this.bears`) with the bears count in state (`state.bears`) on lines 81. We want to do this because as state changes we need to render a new UI by triggering an update.

The next thing to know is that we want to store the state of the store in a Lit property. In my case I've called this `appState` here and I've used `getInitialState` from Zustand API utilities to populate it. This way we can run methods in our store by simply referencing our `appState` like I've done with the `handleAdd` method.

```javascript
handleAdd() {
  this.appState.increasePopulation();
}
```

Here, `increasePopulation` is a method in the store taken directly from Zustand docs. As for the Store itself, we don't need to do anything special for Lit here. Set this up as you would setup Zustand in an vanilla JavaScript app according to the Zustand docs.

Everything else in this app should be self explanatory if you know Lit.

## The Todo App

My todo app takes the principals I've outlined above and extend upon them a bit. In this app we're using the subscribe and appState pattenrs I've shown you. And example of the appState can be found in `todo-app.ts` on lines 59-60.

```javascript
@property()
todoState: ITodoStore = todoStore.getInitialState();
```

Here we call it `todoState`. In the constructor you'll also see our subscribe.

```javascript
constructor() {
  super();
  todoStore.subscribe((state) => {
    this.numberOfItems = state.todoList.length;
  });
}
```

In this app though we're keeping track of the number of todo items by getting the length of `todoList`.

### Adding a todo

The responsibility of adding todos is handled by the `todo-input` component. This component makes use of the `addTodo` method in the store to add a todo. In our app a todo is represented by an object that has two properties, value and checked. They're self explanatory. To add the todo we turn to our store. The code looks like:

```javascript
addTodo: (newTodo) => set(state => ({ todoList: [...state.todoList, newTodo] })),
```

On line 20 of `store/todo.ts`. Adding the todo is mostly standard Zustand stuff. We use `set`, which gives us state and we then return the new state of `todoList` by spreading in the current state + `newTodo`.

### Updating State

Where things get interesting is handling how to update state. An example of updating state is updating the checked state of a todo. I've opted to use lodash for this. So lets look at the `todoToggle` method on line 26 to understand how to achieve this:

```javascript
todoToggle: (index) => set((state) => lodashSet(state, `todoList[${index}].checked`, !state.todoList[index].checked)),
```

Once again we're using `set`. But this time we also have `lodashSet` which takes an object, a path to thing you want to set, and a value. In our case we give state, a path to the checked property, and value to be the opposite of the last checked state for a toggle effect. We then return the new state object.

But there's a catch, we've updated state and Lit doesn't know about it. The state has been updated but when we do this we need to tell Lit to update the UI because the state is different. You can do that by using `requestUpdate`. Turn to lines 87-90 in `todo-list.ts`.

```javascript
handleChecked(index: number) {
  this.todoState.todoToggle(index);
  this.requestUpdate();
}
```

When we call `todoToggle` we also need to request an update in Lit to re-render the UI. The same is true for `removeTodo` which uses lodash's `pullAt` to remove a todo in the todoList array.

That's about it folks. I hope you build something more cool than my Todo app with Lit and Zustand. Here's the Todo app for reference:

<iframe style="width:100%; height:720px;"  src="https://stackblitz.com/edit/zustand-lit-todo?embed=1&file=src%2Ftodo-app.ts&view=editor"></iframe>
