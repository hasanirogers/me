---
title: It’s time to get comfortable with web standards again
date: 2024-09-08 
author: Hasani Rogers
tags: 
- post
- web components
- custom elements
- web standards
excerpt: I'm not saying ditch React or Next completely. Just here me out.
---

Typescript is ok though.

The point of this blog is to highlight some mentalities I’ve noticed amongst developers. Especially React developers. React has become so ubiquitous that a lot of developers do not know how to think outside its model for developing components. Sometimes, developers are also wholly dependent on its eco system as well. I saw the term “React Brain” used the other day and it made me chuckle.

This reminds me of the days when jQuery was king. jQuery was great for its time but it solved a problem browsers eventually caught up with. It took 10 something years but eventually people realized they didn’t need jQuery anymore. Not only that, jQuery was actually bloated and convoluted compared to standard JavaScript. Browsers could eventually do the things we relied on jQuery to do. Querying the dom became easy with querySelector. Fetching data with ajax was replaced by the Fetch API. The cross browser issues it solved for were mostly hammered out by fairly consistent browser standards.

Now let's look at React. React was released by Facebook (now Meta) in 2013. Its goal was to reduce UI complexity. It did this by introducing a declarative UI based component architecture. This was revolutionary at the time. Nowadays a declarative component based architecture is the standard amongst UI libraries. So much so that many developers make the mistake of thinking of Web Component as “another UI library” with “extra flavors they aren’t used to or need to learn”. They do this because to them, React is the standard and “other” component architectures are just “alternatives” to them like Angular or Svelte or something.

This thinking behind UI development is as mistaken as thinking of jQuery as the “standard”. jQuery may have felt like the standard, because it was so common, but the reality is that in its time it had “alternatives” too like Prototype and MooTools. They all fell to something superior, browser standards. React will eventually do the same. At least when it comes to component architecture. Let me highlight a practical example of how the component architecture of Web Components is simpler to work with than React.

I was working with Swiper JS to display some real estate properties. I had a pagination component control the main swiper container from children nested multiple levels deep. Typically in React if you want communication between components nested deep in a component you use something like context or some state management tool to avoid prop drilling. With web components, you don’t need any of this. All I had to do was use `.closest` to find the closest swiper-container in the dom within my web component. I was then able to access the swiper instance in my component and control the pagination by this alone. This is one of many examples of how web component APIs make things in the React world non issues inherently. 

Another thing is styling. Web Components have a shadow dom and thus your styles are scoped to that shadow dom by default. You can write simple contextual styles without the need of utility libs like tailwind, styled components, or css modules, etc. You don’t even need any JavaScript to use a custom element. Just write the custom html tag, it's ok to make up your own html now. This approach automatically creates a scope (like a block in bem), for you to select your styles against. For example, write the tag `<blog-header>` and then select it with:

```css
blog-header {
  /* your styles */
}
``` 

The beauty of a custom element is that it’s like selecting a low specificity ID that supports multiple instances. It’s unique but safe from specificity problems. This approach to styling is so revolutionary that I’ve created my own styling methodology around it called [CEA](https://hasanirogers.me/blog/the-new-bem-for-custom-elements-cea). 

Web Components should be thought of in the context of standard JS with progressive enhancements. You can use any JavaScript lib that supports standard JS with Web Components. This includes state management tools like Zustand or animation libs like Motion. You don’t need a web component version of any of these libraries because Web Components **is standard JavaScript**. 

With Web Components there’s another intrinsic advantage. A return to focusing on describing the document semantically. Like my `<blog-header>` example, a well described accessible UI can use any html you make up along with HTML5 semantics. The browsers will treat your custom elements generically like a div. Consider this, you have a structure that looks like something like:

``` html
<main>
  <header>
    <blog-header>…content</blog-header>
  </header>
  <article>…content<article>
</main>
```

This improves DX because the semantics alone describes exactly what you mean. You don’t need to write wrapper classes for `<blog-header>`, the element is your wrapper. Better yet you don’t need to write a bunch of utility classes either. Classes have semantic meaning and were never intended to be magic strings for just styling. 

Because a web component’s architecture is bound to a custom element, they are also perfect for content management systems like AEM or WordPress. In AEM, simply write the HTML of your custom element in your AEM component’s HTL. There is no need for more complex archetypes with slow and problematic webpack configurations that try to marry React and AEM components. In WordPress just write your custom element as HTML in your Gutenberg blocks or templates in PHP, or both.

Since Web Components don’t use a virtual dom they are often faster. Take Lit for example, a library that makes writing Web Components simple, when it renders it only renders changes in the dom directly. You don’t need to think about component trees and re-rendering issues with things like context in React.

Finally, you don’t even have to completely ditch React. You can use web components with React. Doing this is pretty simple these days now that React 19 and Next 15 finally added support for custom elements. I’m on a project at my day job where we used web components in a Next JS app to write some custom animations with motion. We did this so that our web components could be reused in a variety of tech stacks.

Almost every complaint I have ever seen about web components comes from the dev having the wrong mental model of web components because they think of them as if they were components in one of their frameworks or libraries. It's either that or framework makers themselves complaining because their framework deviates from using the DOM as a model for a component. 

All the typical complaints like “web components aren't composable” or “doesn’t support rich data as property values” or “you have to use shadow dom” are false. They come from people who are inexperienced with working with web components. As loud as this voice is, it's wrong.

As far as framework makers goes, how many devs are actually trying to create their own framework? A framework will never trump standards implemented in a browser. Your job is to serve the browser because that's what end users actually interact with. Not your framework. Why fight this?

Web Components are a return to basics and web standards. You should be thinking of the document semantically again and enhancing it with custom elements. Write a web component when you need to have some behavior around a custom element. Style them appropriately with CEA. Web components bring a clear and standards based component architecture to the front end when working with content management systems with little tooling outside of JS Module support. 

Libraries and Frameworks like Next/React are great with handling data driven applications. However I’ve found that Libraries like Lit offer simple approaches to building data driven UIs with web components as well, especially when combined with tools like Zustand and Astro.
