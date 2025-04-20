---
title: CSS Grid Templates
date: 2020-11-26
author: Hasani Rogers
tags: 
- post
- css 
- grid 
- flexbox 
- bem 
- web components 
- responsive design
excerpt: Here's a collection of eight modern css layouts.
---

So in my blogs so far I've been doing CSS an injustice. I've been skipping over it for the most part. Which is funny because I actually love CSS. A lot. I started off as a Web Designer and doing the design part of Front End development is still really rewarding to me. So in this post I've decided to focus on primarily HTML & CSS. Here's a collection of eight modern css layouts.

<iframe style="width:100%; aspect-ratio:16/9;"  src="https://stackblitz.com/edit/css-grid-templates?embed=1&file=index.html"></iframe>

Before we start I want to note a couple of things. I'm not going to break down every template line by line. I'm only gonna cover certain things in the template. Also I want to state that this is not necessarily how you would build a template in a production site. These are prototypes. The point of these template are to illustrate how to achieve complex layout with ease using grid and flexbox. I'm of the belief that grid and flexbox are so powerful that they make frameworks such as Bootstrap, Bulma, Foundation, etc obsolete. The only exception to this is [Tailwind](https://tailwindcss.com/). Tailwind is less a framework and more a library of utilities though. 

There are advantages to using a library like Tailwind. But there's disadvantages too. One of the disadvantages is that you mix presentation and semantics together in your HTML, which makes it harder to read. I'm using BEM (although I do take liberties with it) because it conveys information to developers clearly. Your presentation is then handled entirely in your CSS. Which is cake with the power of grid. There was once upon a time on the web where Front Developers cared about separation of presentation, semantics, and behavior. Modern javascript frameworks have muddled up this concept up a lot but it can still be achieved using modern technology.

* Presentation = CSS
* Semantics = HTML
* Behavior = Web Components

That is the approach these templates take. 

Finally I want to note that this post is not a introduction to CSS Grid, Flexbox, BEM, or anything. It's meant to discuss the strategy and technique of building layouts. There are plenty of tools out there that teach these things from the beginning. This is for Senior Developers who understand their code should be as simple as possible. With that said, lets begin.

1. [News](#news)
2. [Travel](#travel)
3. [Ecommerce](#ecommerce)
4. [Agency](#agency)
5. [Blog](#blog)
6. [Blog Single Column](#single)
7. [Portfolio](#portfolio)
8. [Product](#product)

{:#news}
## [News](https://css-grid-templates.stackblitz.io/templates/news.html)

The news template is broken up into several blocks. Each block has it's own grid as opposed to using a 12 column style approach. The structure of the page looks like this:

```html
<body>
  <nav>...</nav>
  <header>...<header>
  <nav>...</nav>
  <main>...</main>
  <footer>...</footer>
</body>
```

We have 2 navigation (nav) elements. A masthead (header) element. A main. And a footer. You want your HTML to be as semantic as possible. Each primary element corresponds to a BEM block. We can then style the blocks to look like whatever we want.

The `hero-articles` block is a `section` of `main`. It's using an interesting technique. With grid you can use `span [number]` in side of the `grid-column` or `grid-row` properties. It works like `colspan` does on tables. The promoted article area needs to span 2 rows (on tablet and up) so you'll find this rule for it:

```css
@media only screen and (min-width: 768px) {
  ...

  .hero-articles__promoted {
    grid-row: span 2;
  }
}
```

This way our HTML can just describe the semantics without the need of special classes or markup. It looks like this.

```html
<section>
  <article>[panel]</article>
  <article>[panel]</article>
  <article>[panel]</article>
<section>
```

{:#travel}
## [Travel](https://css-grid-templates.stackblitz.io/templates/travel.html)

There's not much to note with the travel template. Except I do want to say something about the liberties I took with BEM. In the `destinations` block you'll notice I'm selecting elements like `figure` instead giving it an element class like `destinations__figure`.  I'm of the opinion that _too many classes names are a distraction_. You don't want to just assign classes because you want to style something. _**Your classes should describe information**_. That's what being semantic means. Since we have a unique tag to describe a figure we don't need another class for it. We can just select the tag. This is often frowned upon by developers because they're under this idea that the element shouldn't matter. But like I explained the element is a piece of semantic information. It _does_ matter. And it _should_ be a figure. So select that bitch. You're gonna see me select tags where it makes sense through out all these templates. Guess I'm a rebel.


{:#ecommerce}
## [Ecommerce](https://css-grid-templates.stackblitz.io/templates/ecommerce.html)

This template is where things get fun. We have behavior. We have both a carousel and drawer. We can't achieve this with just HTML & CSS. We could have wrote some javascript that manipulates the DOM to achieve the behavior we want. After all this is what Bootstrap does. But there's a better approach. What if we had a HTML element that represent what we want to achieve? Well we can do that with Web Components. Web Components allow us to encapsulate functionality and use them with standard HTML. In this ecommerce example I'm using [components from a library I maintain called Kemet](http://kemet.dev). The carousel requires no javascript at all. Simply markup a carousel along with its slides.


```html
<kemet-carousel>
  <div slot="slides">
    <kemet-carousel-slide transition="fade">
      <span>1st</span>
      <div>Space, the final frontier.</div>
    </kemet-carousel-slide>
    <kemet-carousel-slide transition="fade">
      <span>2nd</span>
      <div>Lets Rocket!</div>
    </kemet-carousel-slide>
    <kemet-carousel-slide transition="fade">
      <span>3rd</span>
      <div>Encapsulating</div>
    </kemet-carousel-slide>
    <kemet-carousel-slide transition="fade">
      <span>4th</span>
      <div>Outta This World</div>
    </kemet-carousel-slide>
  </div>
  <div slot="pagination">
    <kemet-carousel-prev><span>◀</span></kemet-carousel-prev>
    <kemet-carousel-link slide="0"><span></span></kemet-carousel-link>
    <kemet-carousel-link slide="1"><span></span></kemet-carousel-link>
    <kemet-carousel-link slide="2"><span></span></kemet-carousel-link>
    <kemet-carousel-link slide="3"><span></span></kemet-carousel-link>
    <kemet-carousel-next><span>▶</span></kemet-carousel-next>
  </div>
</kemet-carousel>
```
If you're interested in the carousel's API, [checkout it's documentation](https://storybook.kemet.dev/?path=/docs/components-carousel--documentation). Here I'm gonna cover the styles. Kemet is a designless system. This means it was created to capture behavior only. The styles are up to you. So we can style our HTML however we see fit. Here's how I styled it.

```css
kemet-carousel {
  height: 33vw;
  min-height: 240px;
  max-height: 640px;
  background: var(--gray);
}

kemet-carousel [slot="pagination"] {
  text-align: center;
}

kemet-carousel-slide {
  display: flex;
}

kemet-carousel-slide > span {
  margin: auto;
  font-size: 6rem;
  opacity: 0.25;
}

kemet-carousel-slide > div {
  color: var(--rich-white);
  width: 100%;
  position: absolute;
  bottom: 0;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.5);
}

kemet-carousel-next,
kemet-carousel-prev {
  position: absolute;
  top: 50%;
  z-index: 1;
  transform: translateY(-50%);
}

kemet-carousel-prev {
  left: 0;
}

kemet-carousel-next {
  right: 0;
}

kemet-carousel-next span,
kemet-carousel-prev span {
  color: var(--rich-white);
  font-size: 2rem;
  cursor: pointer;
  display: inline-block;
  padding: 1rem;
  transition: background-color ease 300ms;
}

kemet-carousel-next:hover span,
kemet-carousel-prev:hover span {
  background: rgba(0, 0, 0, 0.5);
}

kemet-carousel-link span {
  display: inline-block;
  width: 1.5rem;
  height: 1.5rem;
  margin: 1rem 0.5rem;
  border-radius: 50%;
  background: var(--light-gray);
  transition: background-color ease 300ms;
}

kemet-carousel-link:hover span,
kemet-carousel-link[selected] span {
  background: var(--gray);
}
```

As you can see, you can style it with standard CSS to make it appear however you want. Next is the drawer. It requries a little bit of javascript because we need to open it when the menu icon is clicked. Other than that, it's straight HTML. Here's the structure.

```html
<kemet-drawer effect="scale" side="left">
  <nav slot="navigation">
   [off canvas nav here]
  </nav>
  <section slot="content">
    [content here]
  </section>
<kemet-drawer>
```

And to handle the click...

```javascript
(() => {
  const drawer = document.querySelector('kemet-drawer');
  const menuIcon = document.querySelector('.fa-bars');

  menuIcon.addEventListener('click', () => {
  drawer.toggle();
});
})();

```


{:#agency}
## [Agency](https://css-grid-templates.stackblitz.io/templates/agency.html)

In the agency template we setup a 12 column grid. This is trivial with CSS Grid.

```css
@media only screen and (min-width: 768px) {
  .main {
    grid-template-columns: repeat(12, minmax(1px, 1fr));
  }

  ...
}
```

`grid-template-columns` is where we set the number of columns on a grid. We use `repeat` to set it. The first arg is the number of times to repeat. The second is the size to repeat it at. I used minmax here to note that at minium it should be 1px and at maximum it should be 1 fractional unit. This mean "distribute the space evenly".  Notice that it's in a media query. The layout is simple enough where on mobile it just needs to stack. This means we only need the grid on a tablet size and up. Since we're using a 12 column grid, in our blocks we can just span the grid columns. I mentioned doing this with a row already. You can also do it with columns. For example:

```css
  .main__counts,
  .main__footer,
  .main__recent-heading {
    grid-column: span 12;
  }
```

We want the counts, footer, and recent-heading elements to span all 12 columns.


{:#blog}
## [Blog](https://css-grid-templates.stackblitz.io/templates/blog.html)
This is one of my favorites because it's so dead simple. Less than 50 lines of CSS achieves this layout.

```css
body > section {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: 100px 1fr 200px auto;
  grid-gap: 1rem;

  grid-template-areas:
    "header"
    "main"
    "aside"
    "footer"
}

body > section > * {
  padding: 1rem;
  background: rgba(0,0,0,0.2);
}

header {
  grid-area: header;
}

main {
  grid-area: main;
}

aside {
  grid-area: aside;
}

footer {
  grid-area: footer;
}

@media only screen and (min-width: 768px) {
  body > section {
    display: grid;
    grid-template-columns: auto 340px;
    grid-template-rows: 200px 1fr auto;
    grid-gap: 1rem;

    grid-template-areas: 
      "header header"
      "main aside"
      "footer footer";  
  }
}
```

It's so simple we don't even use classes. The _structure_ of the html is what we style. It's also a great example of the awesome power behind `grid-template-areas`. Use this property to name areas in a grid. We then assign an area with a selector. Header is header. Main is main. Etc. It's beautiful in it's simplicity. We can make the header "span" columns on tablet and up simply by redefining the area to take up two columns as seen on line 44.


{:#single}
## [Single](https://css-grid-templates.stackblitz.io/templates/single.html)

This one is a little too simple. We don't even need grid for it. Check it out though if you want to see some generic styles.


{:#portfolio}
## [Portfolio](https://css-grid-templates.stackblitz.io/templates/portfolio.html)

This one is tricky. We have what's essentially an off-canvas drawer that should be open on tablet and up and closed on mobile. `kemet-drawer` doesn't support a feature like this. But you can fake it. Just hide a drawer nav on mobile and show it on tablet and up. Then use `kemet-drawer` like you normally would on mobile. It works out. In fact on Kemet's site I use this approach. To make things even simpler I reused the same nav component in both places and gave them a location property to style differently depending on context. I'd show you how to do that but it's outside the scope of this post.


{:#product}
## [Product](https://css-grid-templates.stackblitz.io/templates/product.html)

Here's another one with Web Components. This time we use tabs, or [kemet-tabs](https://storybook.kemet.dev/?path=/docs/components-tabs--documentation). You'll notice that we have two different usages of tab. One has tabs on the bottom, the other has tabs on the top. They also look completely different. This is the power of a designless system. You can style the tabs how you so choose. To get the tabs on the bottom (they appear on the top by default) we simply use the order property in Flexbox. This means that our container has to be a flex container and we give it a direction of column for the swap.


```css
.product-tabs {
  display: flex;
  flex-direction: column;
}

...

.product-tabs [slot="panels"] {
  order: -1;
  margin-bottom: 1rem;
}

```

The rest of the tab styles are just standard stuff. No javascript required. Just simple markup. 

That's all the templates folks. I hope you enjoyed this. More importantly though I hope this inspires you to abandon CSS frameworks and just use grid! Between it and Flexbox everything you need is built in the browser. Trust me, it's a lot easier writing standard css for our component driven world in web development these days. As for Tailwind, I can see why you might opt to keep using it. Particularly for large CMS driven apps. But hey, that's your choice.
