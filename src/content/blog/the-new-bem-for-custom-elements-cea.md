---
title: The new BEM for Custom Elements, CEA
date: 2022-09-08
author: Hasani Rogers
tags: 
- post
- bem 
- cea 
- web components 
- custom elements 
- css
excerpt: Custom Elements is an overlooked technology in the Front End world. It's time we adopt this tech to make it go mainstream. Say hi to CEA, the BEM replacement for Custom Elements.
---

Web Components have been around for a while. But with the plethora of tech out there, like React and Angular, the average developer simply doesn't have that much experience with them. So best practices and methodologies are lacking. We definitely need some formal approaches to developing with Web Components. They are designed to work together with, and not replace, Front End libraries. Developers need more exposure to web components and [custom elements](https://web.dev/custom-elements-v1/) in general.

The thing I've notice that developers struggle with the most when being introduced to Web Components is the concept of the Shadow Dom. Developers are used to tools that fake what a Shadow Down does naturally. You find this in all sorts of technology. Take styling in React for example. React has something called [CSS Modules](https://github.com/css-modules/css-modules) which allows you to scope CSS to a component. It's cool but the issue it solves for is a non-issue in the Web Component world. Constructed style sheets are *inherently* scoped. Then there is SCSS. SCSS is nice but it assumes the perspective of working in one massive light DOM tree. The "light DOM" is the regular DOM that developers are used to. SCSS is based on this. Think of nesting selectors for example. You create a kind of "scope" by putting once selector as a child of another. This was incredibly popular and useful when BEM emerged.

If you've been living under a rock BEM is an acronym for Block, Element, Modifier. Developed by Yandex almost a decade ago, BEM is a naming convention that "componenitizes" styles (yes I just made the word componentizes). BEM was brilliant. But like SCSS it assumed one light DOM. In the world of the light DOM BEM and SCSS makes sense. But in the Web Component world we have *native* encapsulation. Naming conventions like BEM aren't nearly as useful and it takes developers a while to understand this. Hell it took me a while. Just two years ago when I wrote the drawer component for my UI Library I still used BEM. But over time I started to learn my own methodology that makes more sense for Web Components. Well today I'm here to name that methodology and formalize it in writing so that others may have the same insight as me! 

## CEA is my BEM replacement for Custom Elements.

CEA is an acronym for Component, Element, Attribute. It sorta has a correspondence with BEM but with one major difference. *Use attributes to style the state of a component.* This is huge because we're so used to styling with classes that a lot of us don't know how to think outside the box on this one. However the primary thing I've noticed is that your component will usually have some kind of state, represented by a property, which can be reflected as an attribute. Your style "modifiers" thus correspond to this state that you access via attributes. I'll demonstrate this more clearly in a second. For now, let me define some terms.

**Component**: This is your main scope. Think of it as Block in BEM. Instead of a establishing a class name for a block, you simply select by host element or custom element name however. 

**Element**: This is any element that lives in the Shadow Dom of your component or a child of your component. You may select by class name if you wish. You'll often find that literally selecting the element works just as well however.

**Atrribute**: These are attributes on your host component. They represent a *state* of the component such as `disabled` on a button or `opened` on a dialog. 

Of course this can all be illustrated better by example, so lets dive into it. FYI the following example is going to use [Google Lit](https://lit.dev/) which I highly recommend if you're writing web components.

## Learn by example

Let say you're working on a button. Your button has two styles to it. Standard and outlined. Now you could write a modifier class for the outline version of the button based on an outlined property like this.

```javascript
  static get styles() {
    return [
      css`
        .button {
          ...
        }

        .button--outlined {
          ...
        }
      `
    ]
  }
  render() {
    return html`
      <a href=${this.link} class="button ${this.outlined ? 'button--outlined' : ''}" role="button">
        <slot></slot>
      </a>
    `;
  }
```

Or, you could simplify the code under CEA and *style the outlined attribute directly*.

```javascript
  static get styles() {
    return [
      css`
        a {
          ...
        }

        :host([outlined]) a {
          ...
        }
      `
    ]
  }
  render() {
    return html`
      <a href=${this.link} role="button">
        <slot></slot>
      </a>
    `;
  }
```

Notice that in CEA we take advantage of the `:host` selector. We also don't really need a class for the button. We can simply select it by the *element* as we're not going to have more than one `a` in the component. The result is that the markup in our template is much cleaner and easier to read and maintain. In my opinion the styles become easier to read too. That's the primary of benefit of CEA. 

# Reflecting Attributes with Lit

Lit has a nice feature that allows you to reflect the value of property as an attribute on your host component. CEA becomes very useful when engaging in this practice. Instead of the user of the component controlling for an attribute like *opened* you can have Lit automatically apply the attribute when something opens or closes. Let's take a modal for example. The following modal will close when the user clicks outside of the modal. To close the modal we control the `opened` property by setting it to `false`. This will automatically remove the `opened` attribute from the custom element.

```javascript
export default class ExampleModal extends LitElement {
  static get styles() {
    return [
      css`
        *,
        *::before,
        *::after {
          box-sizing: border-box;
        }

        :host {
          position: fixed;
          display: flex;
          top: 0;
          left: 0;
          z-index: 99;
          width: 100%;
          height: 100vh;
          visibility: hidden;
          backface-visibility: hidden;
        }

        /* in CEA we style for attributes on the host element as they correspond to "state"
        :host([opened]) {
          visibility: visible;
        }

        /* .content and .overlay elements where given class names because they are both 
         * divs and we need to distinguish between them
         */ 
        .content {
          position: relative;
          z-index: 3;
          margin: auto;
        }

        :host([mobile]) .content {
          padding: 1rem;
        }

        .overlay {
          position: fixed;
          width: 100%;
          height: 100%;
          visibility: hidden;
          top: 0;
          left: 0;
          z-index: 1;
          opacity: 0;
          background: rgba(0,0,0,0.2);
          transition: all 0.3s;
        }

        :host([opened]) .overlay {
          opacity: 1;
          visibility: visible;
        }
      `
    ];
  }

  static get properties() {
    return {
      opened: {
        type: Boolean,
        // set reflect to true so you may style the attribute
        reflect: true, 
      },
      breakpoint: {
        type: String,
      },
      mobile: {
        type: Boolean,
        reflect: true,
      },
    };
  }

  constructor() {
    super();
    this.opened = false;
    this.breakpoint = '600px';
  }

  firstUpdated() {
    this.addEventListener('click', (event) => {
      if (this.opened && event.target.tagName.toLowerCase() === 'example-modal') {
        // this will automatically remove the opened attribute from the host element 
        this.opened = false;
      }
    });

    window.addEventListener('resize', () => {
      this.isMobile();
    });
  }

  updated(prevProps) {
    if (!prevProps.get('opened') && this.opened === true) {
      // Fires when the modal opens
      this.dispatchEvent(
        new CustomEvent('example-modal-opened', {
          bubbles: true,
          composed: true,
          detail: this,
        }),
      );
    }

    if (prevProps.get('opened') && this.opened === false) {
      // Fires when the modal closes
      this.dispatchEvent(
        new CustomEvent('example-modal-closed', {
          bubbles: true,
          composed: true,
          detail: this,
        }),
      );
    }

    this.isMobile();
  }

  render() {
    return html`
      <div class="content">
        <slot></slot>
      </div>
      <div class="overlay"></div>
    `;
  }

  isMobile() {
    /* 
     * here we represent mobile as state. this way users can easily 
     * control the breakpoint where the modal is considered to be mobile 
     */
    const mediaQuery = window.matchMedia(`(max-width: ${this.breakpoint})`);
    this.mobile = mediaQuery.matches;
  }
}
```

On line 89 we manually close the modal by setting `opened` to `false`. With CEA, instead of writing logic to toggle classes, we simply write a selector for the `opened` attribute. Since it's a boolean if `opened` is not on the component it's automatically considered closed.


## You can write CEA without Web Components

CEA works even when you're not writing formal Web Components with a Shadow Dom. It works with custom elements in general. The most groundbreaking thing about this is thinking in terms of Custom Elements. Custom Elements is a standard browser API, so they work with Vanilla JavaScript and even React. Unlike when BEM was created, we now have the ability to make up our own HTML and attributes. [All modern browser support autonomous custom elements](https://caniuse.com/?search=custom%20elements). So CEA still applies, you'll just need to write more JavaScript for your components. Here's an example Pen that I wrote using CEA in Vanilla JavaScript.

<iframe style="width:100%; aspect-ratio:16/9;" title="CEA | Vanilla" src="https://stackblitz.com/edit/cea-vanilla?embed=1&file=index.html"></iframe>

You'll see that the methodology is the same while working with Vanilla components. The code is just a little bit more complex. Instead of using the `host` selector we style our custom element directly. That is the *Component* part of CEA. We then style our children under the scope of the component element, that is the *Element* part of CEA. Finally we write JavaScript to manually handle the status (opened/closed) of the component as an attribute, that is the *attribute* part of CEA. It's super straight forward when you get pass a class being the primary way you style something. You can even use CEA in React if you wanted too, although you'd have to manually handle the attributes like with Vanilla components.

If you're working with React, the CEA methodology is the same. You'll simply need to use custom elements and attributes. The syntax for toggling an boolean attribute is a little weird. But it works. Here's an example:

<iframe style="width:100%; aspect-ratio:16/9;" title="CEA | React" src="https://stackblitz.com/edit/cea-react?embed=1&file=src/components/PopUp.js"></iframe>

Notice how the attribute corresponds to state.

I'm gonna end this article with a note. CEA is pronounced (See - ah). It's actually wordplay for the Egyptian god [Sia](https://en.wikipedia.org/wiki/Sia_(god)). I thought it was fitting because Sia is the deification of *perception* which thinking in CEA takes a shift in *perception*. Ha!
