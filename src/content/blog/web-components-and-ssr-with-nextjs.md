---
title: Web Components and SSR with Next.js
date: 2024-08-07
tags:
  - post
  - web components
  - next.js
  - ssr
author: Hasani Rogers
excerpt: One of the pitfalls of Web Components is there support for Server Side Rendering. But with a little ingenuity you can get Web Components to work with SSR frameworks like Next.js.
---

I'm an advocate of Web Components because I believe presentational components should be written once and used through any tech stack. This has been a dream of mine for years. Web Components achieve this but not without caveats. I've written about using Web Components in libraries like [React](https://kemet.dev/libraries/react/) and [Angular](https://kemet.dev/libraries/angular/) before. The most complicated caveat tends to be React but React 19 is adding native support for them. One thing I have yet to write about is how to handle Web Components in an SSR framework like Next.js. This is a tricky subject because SSR support for a Web Components are weak at the moment.

## The Problem

SSR has html rendered server side. That html is then served to the browser. Web Components typically make use of a custom Shadow Dom that's initialized by JavaScript. This is a process that takes place on the client. How does the server then know how to render the Shadow Dom of a component? The short answer is that it can't. The long answer is that there is an emerging technology called [Declarative Shadow Dom](https://developer.chrome.com/docs/css-ui/declarative-shadow-dom) that solves the problem. DSD is in its early stages and support for it is buggy at best in a real application. Definitely not ready for use in production applications in my opinion.

So how do we reliably use Web Components in an SSR framework now in 2024 then? The answer to that is that you need to avoid trying to render the Shadow Dom of a component on the server and have the client do the work. This is totally achievable. I found examples of doing this lacking though, hence why I'm writing this blog. In this article I'll be detailing how I did this with Next.js, but the principals here can be used theoretically in any SSR framework.

## The Main Idea

The main idea is that we need to generate a JavaScript bundle that will execute only on the client so that the Shadow Dom of an Web Component will be hydrated on the client. We don't want the server trying to do it. It's not that complicated as we dive into it more. We'll need:

1. A bundler that takes components and bundle them into a JavaScript file used in our build
2. A way to load that bundle as a standard script rather than with the rest of the JavaScript modules that get executed server side
3. This is optional but if you're using TypeScript you'll need a way to tell your app to recognize the custom Web Components in JSX.

## Breaking it down in Next.js

I put together a [repo that demonstrates how to achieve the three steps in Next.js](https://github.com/hasanirogers/web-components-with-nextjs).

### The Bundler

My bundler of choice is [Rollup.js](https://rollupjs.org/). It's the thing that powers [Vite](https://vitejs.dev/) and I think it's great. So in my repo you'll find the following `rollup.config.mjs` file in the app root [here](https://github.com/hasanirogers/web-components-with-nextjs/blob/main/rollup.config.mjs).

```javascript
import resolve from "@rollup/plugin-node-resolve";
import multi from "@rollup/plugin-multi-entry";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";

// You'll need to create an object per library bundle
const config = [
  {
    input: ["src/app/bundles/shoelace.ts"],
    output: [
      {
        file: "public/shoelace/shoelace.bundle.js",
        name: "shoelace-bundle",
        format: "umd",
        sourcemap: true,
      },
    ],
    plugins: [resolve(), commonjs(), multi(), terser()],
  },
  {
    input: ["src/app/bundles/kemet.ts"],
    output: [
      {
        file: "public/kemet/kemet.bundle.js",
        name: "kemet-bundle",
        format: "umd",
        sourcemap: true,
      },
    ],
    plugins: [resolve(), commonjs(), multi(), terser()],
  },
];

export default config;
```

This file creates two bundles. One is for [the popular Shoelace component library](https://shoelace.style). The other is for [my design system Kemet UI](https://kemet.dev). The file is pretty simple and should be mostly self explanatory if you've worked with bundlers before. The most important thing here is that you place your bundle in the public directory so that it can be loaded as a static assets on the front end.

### Loading the Script

The reason for creating the bundle is to include it as a script when the page is rendered on the client. SSR frameworks like Next.js _should_ do a shallow render of the Web Component. This means that it'll render the Light Dom of the Web Component. This is enough for our bundle to find the light dom, execute, then hydrate it with its corresponding Shadow Dom.

In my Next.js repo I have a default layout file called `default.tsx` [here](https://github.com/hasanirogers/web-components-with-nextjs/blob/main/src/app/layouts/default.tsx). It looks like this.

```javascript
import Script from "next/script";
import paths from "../shared/paths";
import "../shared/styles";
import "../styles/shared.scss";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode,
}>) {
  return (
    <>
      {children}
      <Script src={paths.shoelaceBundle} />
      <Script src={paths.kemetBundle} />
    </>
  );
}
```

Notice the `<Script />` components. Their `src` prop is set to paths can be found in the [paths.ts](https://github.com/hasanirogers/web-components-with-nextjs/blob/main/src/app/shared/paths.ts) file. This path should match the output of the bundle file created in your bundler.

So as long as you're generating a bundle and calling it on the front end, you're good and your Web Components should work.

### Supporting JSX in TypeScript

Great. We got Web Components to work in the browser. At this point you'll notice that your editor is probably complaining about the Web Components. This is because TypeScript doesn't know what the components are. Even if the library you're using ships with declarations for Typescript, since we're loading the bundle on the front end your editor has no access to this information. A not so ideal work around is to simply declare each web component to Typescript. In my repo I do this with `declarations.d.ts`.

```javascript
declare namespace JSX {
  interface IntrinsicElements {
    "kemet-button": any;
  }
}
```

### A Note on React 19

Before React 19 you needed a wrapper to get Web Components to fully work in React. This is no longer the case in React 19. My demo repo uses Next.js 15, which comes with React 19 but is in beta at the time of this writing. So the code there, specifically in `layouts/default.tsx`, is written in the style of React but doesn't use a wrapper. You'll probably want to use a stable version of Next.js. That unfortunately means you can't follow this code using a `useState` for the `opened` prop and handling events declaratively such as with `onkemet-drawer-opened`. On top of that wrappers don't work with SSR.

All is not lost though, to work with events and rich data with Web Components in Next.js you'll need to do it the classic way and get a ref to the Web Component. From there you can use `addEventListener` and assign objects/arrays/booleans directly to the component. You can find example of this in the [legacy.tsx file](https://github.com/hasanirogers/web-components-with-nextjs/blob/main/src/app/layouts/legacy.tsx)

## Final Thoughts

There's more to the repo but these points are what you really need to know for now. Feel free to reach out with questions! Personally I can't wait for the day we see an SSR Frameworks built on top of [this](https://www.npmjs.com/package/@lit-labs/ssr) for Web Components. But we're not quite there yet.
