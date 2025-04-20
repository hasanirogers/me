---
title: How to integrate Tailwind in a LitElement app
date: 2020-12-05 
author: Hasani Rogers
tags: 
- post
- lit
- tailwind 
- snowpack 
- web components
excerpt: Integrating Tailwind in a LitElement app is really simple if you're using Snowpack.
---

In my [last post](/2020/11/css-grid-templates.html) I mentioned Tailwind, a CSS framework that's gaining a lot of popularity. It's one of the only frameworks that I think is still relevant with the advent of CSS Grid. Even though in that post I sorta downplayed the use of Tailwind. It still has its place however. It's gaining popularity for a reason. There's a lot of power in a utility-first approach to writing CSS.

But In my opinion you'll find that a utility first approach to writing CSS is usually not necessary when writing Web Components, especially singular components. This is because of Shadow Dom. Your CSS is simply encapsulated with the dom of your component. So as long as you design your components right, you generally can write classic CSS and you'll be fine. But if you're writing a large app, particularly one that is heavy on nuance with design variations, Tailwind may be useful.

At the end of the day Tailwind is a CSS framework so working with it in a LitElement app is like working with any other css library. You simply import the final css output as a external dependency. You do that with a `link` tag in your render method's template result. Like this:

```javascript
import { LitElement, html } from 'lit-element';

class MyElement extends LitElement {
  render() {
    return html`
      <link rel="stylesheet" href="/tailwind.css">
      <button class="my tailwind classes here">a button</button>
    `;
  }
}

customElements.define('my-element', MyElement);
```

In this post I'm gonna show you how to setup a build a chain where you can get to the final output using [Snowpack](https://www.snowpack.dev). What's Snowpack? It's awesome sauce. For all you React people think of it as Create React App for any type of technology that you choose. You can even choose React! You get a dev server, a build tool, Hot Module Reloading, all that modern stuff you've come to expect. You can either keep reading to set this up or you can just use [the starter app I put together on GitHub](https://github.com/hasanirogers/lit-tailwind-starter-app).


## Setting up a Create Snowpack App

Since we're using LitElement the first thing you need to do is generate a LitElement app using the following command:

```bash
npx create-snowpack-app lit-tailwind --template @snowpack/app-template-lit-element
```

This will create a directory named `lit-tailwind` in your working directory. Next, install Tailwind.

```bash
npm install tailwindcss
```

To work with Tailwind properly we need to integrate postCSS. You can do that by installing and configuring it along with a few plugins:

```bash
npm install --save-dev @snowpack/plugin-postcss postcss-cli postcss
```

That command gives us postCSS along with Snowpack's postCSS plugin. Now we need to configure postCSS and its Snowpack plugin. Open up the file `snowpack.config.js` and add the following:

snowpack.config.js {.filepath}
```javascript
module.exports = {
  ...
  plugins: [
    '@snowpack/plugin-postcss',
  ],
  ...
};
```

That's it for configuring the plugin. Now create a file called `postcss.config.js` and put this in it:

postcss.config.js {.filepath}
```javascript
module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
  ],
}
```

This configures postCSS. Next, configure Tailwind to include the colors we want. Create a file called `tailwind.config.js` and the following:

{:.tailwind.config.js}
```javascript
const colors = require('tailwindcss/colors');

module.exports = {
  theme: {
    colors: {
      black: colors.black,
      gray: colors.gray,
      white: colors.white,
      blue: colors.blue,
      cyan: colors.cyan
    }
  }
}
```

At this point a basic build should work. Now we want to create the CSS that we will import into LitElement. In your public directory create a file called `tailwind.css`. Add the following to this file.

public/tailwind.css {.filepath}
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .button {
    @apply bg-blue-500 text-white font-bold p-4 rounded transition duration-300 ease-in-out;
  }

  .button:hover {
    @apply bg-blue-700;
  }
}
```

This will create a file at the root of our app named `tailwind.css`.  You can then import it into LitElement simply by including a link tag with a reference to it.

```javascript
...
render() {
  return html`
    <link href="/tailwind.css" rel="stylesheet">
  `;
}
...
```

It's that simple. Easy right? Well keep in mind that you probably want to do some optimizations for production.

## Optimizing for Production

By default Tailwind generates thousands of helpers classes. Its CSS, if left untouched, is a huge 3.5MB. This is by design. It's unacceptably large for production though. Thankfully you can tell Tailwind to purge unused CSS. Open up `tailwind.config.js` and the following:

tailwind.config.js {.filepath}
```javascript
module.exports = {
  ...
  purge: {
    enabled: true,
    mode: 'all',
    preserveHtmlElements: true,
    content: [
      './src/**/*.js'
    ]
  }
  ...
}
```

This tells Tailwind to analyze all the js files in our src directory for Tailwind class usage. If the classes aren't used the css is removed from the build. [Learn more about it here](https://tailwindcss.com/docs/optimizing-for-production). You probably want to minimize your CSS for production. To do that install a optimization plugin for snowpack then configure it.

```bash
npm install --save-dev @snowpack/plugin-optimize
```

Then configure it.

snowpack.config.js {.filepath}
```javascript
module.exports = {
  ...
  plugins: [
    '@snowpack/plugin-optimize',
  ],
  ...
};
```

Now when we run `npm build` our production CSS (JS and HTML too) will be minimized. Snowpack is powerful and you can extend its behavior with [a number of plugins](https://www.snowpack.dev/plugins). If you're creating a LitElement app I suggest you use this tool and customize it to your liking!
