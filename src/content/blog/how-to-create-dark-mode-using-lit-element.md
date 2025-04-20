---
title: How to create Dark Mode in a LitElement App
date: 2020-09-03
author: Hasani Rogers
tags: 
- post
- lit
- dark mode
- theme
- css variables
excerpt: Thanks to themes, creating a dark mode with LitElement is a lot easier than one might imagine.
---


A developer at my day job was inspired by the design of the [Stripe API](https://stripe.com/docs/api) documentation site. One of the thing she liked was the dark mode. She wanted to use it to toggle themes based on what content a user was looking at. Since at [Ford Member Account](https://sso.ci.ford.com/) our internal documentation site is build using LitElement, I was given the opportunity to implement a dark mode with LitElement. Thanks to themes, creating a dark mode with LitElement is a lot easier than one might imagine. Our docs site is internal but this blog's dark mode uses LitElement too! In this post I'll break down how to create dark mode using LitElement.

First things first. There two primary thing we'll focus on:

1. [Creating a component to toggle the theme](#creating-a-component-to-toggle-the-theme).
2. [Theme-ing with LitElement](#themeing-with-lit-element).

{:#creating-a-component-to-toggle-the-theme}
## Creating a component to toggle the theme.

The purpose of the component we're about to create is to add an `theme="[our mode]"` to the `html` tag of the document. We will use this for theme-ing later on. But for now lets focus on the component. We want to create a `blog-theme-toggle` component and we can do so with the following skeleton code:

``` javascript
import { LitElement, html, css } from 'lit-element';

export class BlogThemeToggle extends LitElement {
  static get properties() {
    return {
      theme: {
        type: String,
        reflect: true
      }
    }
  }

  render() {
    return html`
      <input type="checkbox" />
      <div class="slider"></div>
    `;
  }
}

window.customElements.define('blog-theme-toggle', BlogThemeToggle);
```

Nothing to fancy here yet. It's a standard LitElement class with some markup and a `theme` property. Notice how on line 8 we have `reflect` set to `true`. This is going to be important later on. If you don't know already, reflect means to observe the value of a property and update it automatically as an attribute on the component.

Next we want to focus on styling first. Notice that my blog has an icon for light and dark modes. Lets make that. First we need to import some SVGs for the icon.

``` javascript
import { svgSun, svgMoon } from 'your/path/to/svg.js';
```

I suggest your `svg.js` exports the icons as templateLiterals like my `svg.js` file:

``` javascript
import { html } from 'lit-element';

export const svgSun = html`[svg code here]`;
export const svgMoon = html `[svg code here]`;
```

For the sake of brevity i'm excluding my svg code here but you can pick up some free ones at [Icon Finder](https://www.iconfinder.com). Next we add the svg to our render method:

``` javascript
render() {
    return html`
      <input type="checkbox" />
      <div class="slider"></div>
      <div class="icon">
        <span class="sun">${svgSun}</span>
        <span class="moon">${svgMoon}</span>
      </div>
    `;
  }
```

Once we have the icons in place we can add styles to our component:
``` javascript
static styles = [
    css`
      :host {
        display: inline-block;
        position: relative;
        width: 54px;
        height: 32px;
        transform: translateY(-2px);
      }

      svg {
        width: 32px;
        height: 32px;
      }

      input {
        cursor: pointer;
        position: absolute;
        z-index: 1;
        opacity: 0;
        width: 100%;
        height: 100%;
      }

      .slider {
        position: absolute;
        cursor: pointer;

        width: 100%;
        height: 16px;
        top: 50%;
        transform: translateY(-50%);

        border-radius: 1rem;
        background-color: var(--white);
        transition: all .4s ease;
      }

      .icon {
        width: 32px;
        height: 32px;
        display: inline-block;

        position: absolute;
        top: 50%;
        background: var(--primary-color);
        border: 2px solid var(--white);
        border-radius: 50%;

        transition: transform 300ms ease;
      }

      :host([theme="light"]) .icon {
        transform: translate(0, -50%);
      }

      input:checked ~ .icon,
      :host([theme="dark"]) .icon {
        transform: translate(calc(100% - 18px), -50%);
      }

      .moon {
        display: none;
      }

      .moon svg {
        transform: scale(0.6);
      }

      :host([theme="dark"]) .sun {
        display: none;
      }

      :host([theme="dark"]) .moon {
        display: inline-block;
      }
    `
  ];
```

The styles are pretty straight forward. Notice how we're using `:host([theme="dark"])` to hide and show the sun and moon. This is because we reflected our theme property, which we'll get to in a minute. We're also using some css variables such as `var(--white)`. We'll cover that more while discussing theme-ing.

The important thing here is that we keep track of what theme we're using. To do this we bind to `@change` event of our input element (which isn't visible but is clickable).

``` javascript
<input type="checkbox" @change=${() => this.toggleTheme()} />
```

Our `toggleTheme` method looks like this:

```javascript
toggleTheme() {
  if (this.theme === 'light') {
    this.theme = 'dark';
  } else {
    this.theme = 'light';
  }

  window.localStorage.setItem('hasanirogersblog-theme', this.theme);
  this.initTheme();
}
```

If the theme is `light`, we change it to `dark`. If it's `dark` we change it to `light`. On line 8 you'll notice we're using local storage. This is because we want the theme to persist across pages and visits to the site. On line 9 we're calling a method named `initTheme`. More on that in a second.

We need to add an constructor that sets our `theme` property to whatever is in local storage. That's simple.

``` javascript
constructor() {
  super();
  this.theme = localStorage.getItem('hasanirogersblog-theme') ? localStorage.getItem('hasanirogersblog-theme') : 'light';
}
```

If it exists in local storage use it, otherwise set the theme to `light` by default.

With that out of the way, we need to initialize our theme when the component is created. This way the main document knows about the theme.

``` javascript
firstUpdated() {
  this.initTheme();
}

initTheme() {
  document.querySelector('html').setAttribute('theme', this.theme);
}
```

And there you have it. A switch toggle that will toggle our theme from light to dark every time a user clicks it. Now on to theme-ing.

{:#themeing-with-lit-element}
## Theme-ing with LitElement

Now that we're dynamically setting the `theme` attribute on the `html` tag of the document, we can use attribute selectors to swap out the values for variables we have used inside of our components. This is why instead of having `#fff` our toggle component used `var(--white)`. The white css variable is going to be a different value in dark mode!

This blog has a `styles.css` file where we setting a color pallet based on light or dark mode.

``` css
html {
  /* color pallet */
  --white: #f8f8f8;
  --black: #080808;
  --primary-color: #05161f;
  --secondary-color: #e5c116;
  --tertiary-color: #101010;
  --text-color: #5d5d5d;
  --link-color: #007dc1;

  /* specific areas */
  --background-color: var(--white);
  --text-color-header: var(--white);
  --header-background-color: var(--primary-color);
  --heading-color: var(--primary-color);
  --blog-tag-background-color: var(--primary-color);
  --blog-tag-current-text-color: var(--primary-color);
  --thick-border-color: var(--primary-color);
}

html[theme="dark"] {
  /* dark mode overwrites */
  --white: #a1a1a1;

  --background-color: var(--tertiary-color);
  --header-background-color: var(--black);
  --heading-color: var(--text-color);
  --blog-tag-background-color: var(--text-color);
  --blog-tag-current-text-color: var(--text-color);
  --thick-border-color: var(--text-color);
}
```

The trick here is creating a color pallet and some variables for specific areas (like the background). You then overwrite those colors with the `html[theme="dark"]` attribute selector which is set by our component. And that's it! Go wild with the variables. Just be sure to use them in your components so they inherit the right colors. 

You can checkout the full implementation of this on [my blog's github](https://github.com/hasanirogers/blog).
