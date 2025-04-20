---
title: How to use LitElement Components in React by Example
date: 2020-09-14
author: Hasani Rogers
tags: 
- post
- react 
- web components 
- lit
- wrapper
excerpt: Web Components are great. They theoretically can be used with any library or framework. React takes a little bit more effort to work with Web Components however. In this post I'll use Kemet components, which are built with LitElement, in a React application by using wrappers. Although I'm using LitElement, the principals here apply to Web Components built using anything.
---

<kemet-alert status="warning" opened="" border-status="left">
  <kemet-icon slot="icon" size="48" icon="exclamation-circle"></kemet-icon>
  <h3 kemet-margin="tiny:none">This post is obsolete</h3>
  You're better off using the <a href="https://www.npmjs.com/package/@lit-labs/react">React Wrapper maintained by Google</a> then writing your own.
</kemet-alert>

So I love LitElement. I've also come to like React. Every since the advent of Angular.js (that's right, Angular 1.x) I've dreamt of components that were framework agnostic. This is why I invest so much energy in LitElement. It allows me to create those framework agnostic components. It lets me do it in a way that's similar to React as well.

When talking about Web Components though, React is tricky. At the time of this writing it has a score of 71% on [Custom Element Everywhere](https://custom-elements-everywhere.com#react) and it's been that way for a while. Most of the other major frameworks there score much better. Why is that? Well most of the issues involve passing rich data and handling events.

So is my dream dead? Nope. Far from it, with a little bit of extra work you can create wrappers to get your Web Components to work in React. The extra work is not that hard. But it doesn't require you to know the API of the component you're working with. Personally, I think that's why you don't see Web Components in the React world every often. People are too busy with things like Redux, Recoil, Selectors, Thunks and such that they don't learn the API of the Web Components out there. Last thing people want to do is spend time on writing a wrapper.

Well I'm hear to put and end to that. The prospect of framework agnostic functionality is important and developers should think about it. In this post I'll break down how I created wrappers for my collection of components that I call [Kemet](http://kemet.dev). Every component has wrappers available and on [Stackblitz](https://stackblitz.com/edit/react-web-components-examples). I vow to maintain these examples so that Kemet is accessible via React.

Each wrapper is fully documented in the code. Some general rules are that 1. You need a ref to the component you'll be using. 2. You need to emulate your component properties as react props.

1. [The Drawer Wrapper](/#drawer-wrapper)
2. [The Tabs Wrapper](/#tabs-wrapper)
3. [The Accordion Wrapper](/#accordion-wrapper)
4. [The Modal Wrapper](/#modal-wrapper)
5. [The Carousel Wrapper](/#carousel-wrapper)
6. [The Scroll Snap Wrapper](/#scrollsnap-wrapper)

{:#drawer-wrapper}
## The Drawer Wrapper

```javascript
import React, { Component } from 'react';
import '@kemet/kemet-drawer/kemet-drawer.js';

class KemetDrawer extends Component {
  constructor(props) {
    super(props);

    // create a ref
    this.drawerElement = React.createRef();
  }

  componentDidMount() {
    // set the component properties to that of the react props
    this.drawerElement.current.opened = this.props.opened;
    this.drawerElement.current.effect = this.props.effect;
    this.drawerElement.current.side = this.props.side;

    // pass the function given for onClose as a handler for the kemet-modal-close event
    if (this.props.onClose) {
      this.drawerElement.current.addEventListener('kemet-drawer-close', (event) => {
        this.props.onClose(event);
        console.log('"kemet-drawer-close" event was called.');
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // you need to handle dynamic updates to your properties
    // for each property that needs to be handed, check the prevProps and see if it matches with this.props
    // if it doesn't match, it needs to be updated, so up date it

    if (prevProps.opened !== this.props.opened) {
      this.drawerElement.current.opened = this.props.opened;
    }

    if (prevProps.effect !== this.props.effect) {
      this.drawerElement.current.effect = this.props.effect;
    }

    if (prevProps.side !== this.props.side) {
      this.drawerElement.current.side = this.props.side;
    }
  }

  render() {
    return (
      <kemet-drawer ref={this.drawerElement}>
        <nav slot="navigation">
          {this.props.navigation}
        </nav>
        <section slot="content">
          {this.props.children}
        </section>
      </kemet-drawer>
    )
  }
}

export default KemetDrawer;
```

The Drawer wrapper is easy. You emulate your properties and you just have to handle the `kemet-drawer-close` event. You do this by adding an event listener and then passing the event data to a function props that you define on your view.

{:#tabs-wrapper}
## The Tabs Wrapper

```javascript
import React, { Component } from 'react';
import '@kemet/kemet-tabs/kemet-tabs.js';

class KemetTabs extends Component {
  constructor(props) {
    super(props);

    // create a ref
    this.element = React.createRef();
  }

  componentDidMount() {
    // set the component properties to that of the react props
    this.element.current.selected = this.props.selected;

    // pass the function given for onChange as a handler for the kemet-tab-changed event
    if (this.props.onChange) {
      this.element.current.addEventListener('kemet-tab-changed', (event) => {
        this.props.onChange(event);
        console.log('"kemet-tab-changed" event was called.');
      });
    }

    // emulate tab selection because it's broke for some reason
    // probably because of synthetic events in react
    this.element.current.addEventListener('kemet-tab-selected', (event) => {
      const selectedTabSlug = event.detail.link;
      const selectedTabElement = this.element.current.querySelector(`kemet-tab[link="${selectedTabSlug}"]`);
      const selectedTabPanelElement = this.element.current.querySelector(`kemet-tab-panel[panel="${selectedTabSlug}"]`);

      selectedTabElement.setAttribute('selected', true);
      selectedTabPanelElement.setAttribute('selected', true);
    });
  }

  componentDidUpdate(prevProps, prevState) {
    // you need to handle dynamic updates to your properties
    // for each property that needs to be handed, check the prevProps and see if it matches with this.props
    // if it doesn't match, it needs to be updated, so up date it

    if (prevProps.selected !== this.props.selected) {
      this.element.current.selected = this.props.selected;
    }
  }

  render() {
    return (
      <kemet-tabs ref={this.element} class={this.props.className}>
        <nav slot="links">
          {this.props.links}
        </nav>
        <section slot="panels">
          {this.props.panels}
        </section>
      </kemet-tabs>
    )
  }
}

export default KemetTabs;
import React, { Component } from 'react';
import '@kemet/kemet-tabs/kemet-tabs.js';

class KemetTabs extends Component {
  constructor(props) {
    super(props);

    // create a ref
    this.element = React.createRef();
  }

  componentDidMount() {
    // set the component properties to that of the react props
    this.element.current.selected = this.props.selected;

    // pass the function given for onChange as a handler for the kemet-tab-changed event
    if (this.props.onChange) {
      this.element.current.addEventListener('kemet-tab-changed', (event) => {
        this.props.onChange(event);
        console.log('"kemet-tab-changed" event was called.');
      });
    }

    // emulate tab selection because it's broke for some reason
    // probably because of synthetic events in react
    this.element.current.addEventListener('kemet-tab-selected', (event) => {
      const selectedTabSlug = event.detail.link;
      const selectedTabElement = this.element.current.querySelector(`kemet-tab[link="${selectedTabSlug}"]`);
      const selectedTabPanelElement = this.element.current.querySelector(`kemet-tab-panel[panel="${selectedTabSlug}"]`);

      selectedTabElement.setAttribute('selected', true);
      selectedTabPanelElement.setAttribute('selected', true);
    });
  }

  componentDidUpdate(prevProps, prevState) {
    // you need to handle dynamic updates to your properties
    // for each property that needs to be handed, check the prevProps and see if it matches with this.props
    // if it doesn't match, it needs to be updated, so up date it

    if (prevProps.selected !== this.props.selected) {
      this.element.current.selected = this.props.selected;
    }
  }

  render() {
    return (
      <kemet-tabs ref={this.element} class={this.props.className}>
        <nav slot="links">
          {this.props.links}
        </nav>
        <section slot="panels">
          {this.props.panels}
        </section>
      </kemet-tabs>
    )
  }
}

export default KemetTabs;
```

Tabs were a little tricky. For whatever reason (please leave a comment if you know the reason) tab selection broke. I know this is related to events. The tabs figures out what tab to select with the `kemet-tab-selected` event. In any case we need to emulate the selection process. Thankfully this is as simple as setting the selected attribute on the right tab. We know the right tab because it's identified as the `link` property in our `event.details` (which is a ref to the link that was clicked). 

This is what I mean by you need to know the API of the components you're working with. I built Kemet so I know them in and out.

{:#accordion-wrapper}
## The Accordion Wrapper

```javascript
import React, { useRef } from 'react';
import '@kemet/kemet-accordion/kemet-accordion.js';

const KemetAccordion = (props) => {
  const element = useRef(null);

  return (
    <kemet-accordion rel={element}>
      <a slot="trigger">
        {props.trigger}
      </a>
      <div slot="panel">
        {props.children}
      </div>
    </kemet-accordion>
  );
}

export default KemetAccordion;
```

This wrapper is so simple we don't even need life cycle methods for it. A functional component will do. We just need to grab it's children as panel content and set a trigger label.

{:#modal-wrapper}
## The Modal Wrapper

```javascript
import React, { Component } from 'react';
import '@kemet/kemet-modal/kemet-modal.js';
import '@kemet/kemet-modal/kemet-modal-close.js'

class KemetModal extends Component {
  constructor(props) {
    super(props);

    // create a ref to the modal
    this.modalElement = React.createRef();
  }

  componentDidMount() {
    // set the component properties to that of the react props
    this.modalElement.current.opened = this.props.opened;
    this.modalElement.current.effect = this.props.effect;
    this.modalElement.current.closeOnClick = this.props.closeOnClick;

    // pass the function given for onClose as a handler for the kemet-modal-close event
    if (this.props.onClose) {
      this.modalElement.current.addEventListener('kemet-modal-close', (event) => {
        this.props.onClose(event);
        console.log('"kemet-modal-close" event was called.');
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // you need to handle dynamic updates to your properties
    // for each property that needs to be handed, check the prevProps and see if it matches with this.props
    // if it doesn't match, it needs to be updated, so up date it

    if (prevProps.opened !== this.props.opened) {
      this.modalElement.current.opened = this.props.opened;
    }

    if (prevProps.effect !== this.props.effect) {
      this.modalElement.current.effect = this.props.effect;
    }

    if (prevProps.closeOnClick !== this.props.closeOnClick) {
      this.modalElement.current.closeOnClick = this.props.closeOnClick;
    }
  }

  render() {
    return (
      <kemet-modal ref={this.modalElement}>
        <div>{this.props.children}</div>
        <br />
        <kemet-modal-close>
          <button>Close Modal</button>
        </kemet-modal-close>
      </kemet-modal>
    )
  }
}

export default KemetModal;
```

The Modal was similar to the Drawer in that we need to emulate a few properties and handle the close event.

{:#carousel-wrapper}
## The Carousel Wrapper

```javascript
import React, { Component } from 'react';
import '@kemet/kemet-carousel/kemet-carousel.js';


class KemetCarousel extends Component {
  constructor(props) {
    super(props);

    // create a ref
    this.element = React.createRef();
  }

  componentDidMount() {
    // set the component properties to that of the react props
    this.element.current.pagination = this.props.pagination;
    this.element.current.slideshow = this.props.slideShow;

    // we need need call next() from a parent component
    // so bind 'this' to a getElementRef prop and use it in the parent
    if (this.props.getElementRef) {
      this.props.getElementRef(this);
    }

    // pass the function given for onChangeStart as a handler for the kemet-carousel-change-start event
    if (this.props.onChangeStart) {
      this.element.current.addEventListener('kemet-carousel-change-start', (event) => {
        this.props.onChangeStart(event);
        console.log('"kemet-carousel-change-start" event was called.');
      });
    }

    // pass the function given for onChangeFinished as a handler for the kemet-carousel-change-finished event
    if (this.props.onChangeFinished) {
      this.element.current.addEventListener('kemet-carousel-change-finished', (event) => {
        this.props.onChangeFinished(event);
        console.log('"kemet-carousel-change-finished" event was called.');
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // you need to handle dynamic updates to your properties
    // for each property that needs to be handed, check the prevProps and see if it matches with this.props
    // if it doesn't match, it needs to be updated, so up date it

    if (prevProps.slideShow !== this.props.slideShow) {
      this.element.current.slideshow = this.props.slideShow;
    }

    if (prevProps.pagination !== this.props.pagination) {
      this.element.current.pagination = this.props.pagination;
    }
  }

  render() {
    return (
      <kemet-carousel ref={this.element}>
        <div slot="slides">
          {this.props.slides}
        </div>
        <div slot="pagination">
          {this.props.paginator}
        </div>
      </kemet-carousel>
    )
  }

  // this is the method we need to call from our parent
  // create a next() wrapper that will increment the slide by 1
  next() {
    this.element.current.handleNext();
  }
}

export default KemetCarousel;
```

The Carousel is easier than it seems. We do our standard emulation of properties and handling of events. It's just a lot of them. The only gotcha is how to call `handleNext` which is a method that exists on the `kemet-carousel` component. We need to expose this because we want the user to be able to start a slide show. The magic here happens on line 18-22. This way a ref to the element can be gained by passing a function as a prop called `getElementRef`. On line 70-73 we create the actual wrapper for the `handleNext` call.

{:#scrollsnap-wrapper}
## The Scroll Snap Wrapper

```javascript
import React, { Component } from 'react';
import '@kemet/kemet-scroll-snap/kemet-scroll-snap.js';
import '@kemet/kemet-scroll-snap/kemet-scroll-snap-paginator.js';


class KemetScrollsnap extends Component {
  constructor(props) {
    super(props);

    // create a refs
    this.element = React.createRef();
    this.paginator = React.createRef();
  }

  componentDidMount() {
    // for some reason react causes the "kemet-scroll-snap-make-slides" listener to not bind to the closest <kemet-scroll-snap>
    // so we have to emulate it for pagination to work here 
    this.element.current.addEventListener('kemet-scroll-snap-make-slides', (event) => {
      // update the slides when this fires
      this.paginator.current.slides = event.detail;
    });
  }

  render() {
    return (
      <kemet-scroll-snap ref={this.element}>
        <div slot="slides">
          {this.props.children}
        </div>
        <div slot="pagination">
          <kemet-scroll-snap-paginator ref={this.paginator}></kemet-scroll-snap-paginator>
        </div>
      </kemet-scroll-snap>
    )
  }
}

export default KemetScrollsnap;
```

Scroll Snap was one of those "you really need to know the API to create the wrapper" kinda of deals. We need two refs in this one. This is because we need a ref to the paginator as well as the main component. `kemet-scroll-snap-paginator` has a property called `slides` that gets populated via an event. And well, like we seen before, events are weird in React. So we need to manually populate the slides when `kemet-scroll-snap-make-slides` fires.


<hr />

There you have it folks. Practical examples of creating wrappers for Kemet components.
