---
title: 'Material Web Components: Building Forms'
date: 2021-03-02 
author: Hasani Rogers
tags: 
- post
- material web components 
- mwc 
- forms 
- lit
- web components
excerpt: Although a still in prerelease, Material Web Components give you powerful input controls for building awesome forms.
---

My most viewed and forked StackBlitz is one I did on using [using material webcomponents with LitElement](https://stackblitz.com/edit/material-web-components). It's simple app that has a route for each component and demo on how to use it. It's popular though so I figured there's a lot of interest in using [Material Web Components](https://github.com/material-components/material-components-web-components). So I'll be doing a series of posts that cover using these components. In this post I'm gonna cover working with forms. I recreated Bootstrap's form example with Material Web Components and modern CSS. Checkout it out:


<iframe style="width:100%; aspect-ratio:16/9;"  src="https://stackblitz.com/edit/material-web-components-form?embed=1&file=index.js"></iframe>

There are four components on this page:

1. checkout-header
2. checkout-summary
3. checkout-form
4. checkout-footer

The header, summary, and footer components are just presentational components without a lot of logic. Feel free to check them out if you're interested in how I styled them. The meat of this page lies in the `checkout-form` component though. There are three things to consider to build this page.

1. [Customizing the input fields](#customizing)
2. [Adding validation](#validation)
3. [Collecting the data](#collection) 

{:#customizing}
## Customizing the input fields

The default look and field for an input field differs from the approach we used here. I used the `outlined` attribute on the component to get it to look more like Bootstrap's form. I also Bootstrap has icon associated with some fields. To add an icon to our field you can use the `icon` attribute. The markup should look something like this:

```html
<mwc-textfield outlined icon="person"></mwc-textfield>
```

If you want to know what strings you can use for the `icon` attribute, [checkout material.io icon page](https://material.io/resources/icons/?style=baseline). Just use the string under the icon you want. The next thing we need to do to customize the input fields is adjust the color. We use css variables to change MWC theme to achieve this.

index.css {.filepath}
```css
html {
  ...
  --mdc-theme-primary: #134563;
  --mdc-theme-secondary: #134563;
}
```

This will handle the ink color on the text field and also the color for checkbox/radio buttons. We also want to change the border color for the text field and select to lighten it up some. We do that with css variables again:

components/checkout-form/checkout-form.js {.filepath}
```css
mwc-textfield {
  --mdc-text-field-outlined-idle-border-color: rgba(0,0,0,0.125);
}

mwc-select {
  --mdc-select-outlined-idle-border-color: rgba(0,0,0,0.125);
}
```

That's it for customizing. It's super simple right?


{:#validation}
## Adding validation

There are couple of attributes associated with validation on Material Web Components.

1. `required` - This means that the field is indeed required.
2. `pattern` - A regEx to validate against.
3. `validationMessage` - A message to display to the user when the form fails validation.

Material Web Components are designed to validate on blur. This differs from bootstrap but it's a design pattern inherent to MWC so I went with it. I like it better anyways. Another pattern I like is disabling the submit button until a form is valid. Therefor, every time a field blurs we need to keep track of the form's over all validation state. We do this by adding a handler called `checkFormValidity` on blur for each required field. 

components/checkout-form/checkout-form.js {.filepath}
```js
checkFormValidity() {
  // collect all the required field by attribute
  const requiredFields = this.shadowRoot.querySelectorAll('[required]');

  // stores the validity of all required fields
  const validFields = []; 

  // loop through all required fields
  requiredFields.forEach((field) => {
    // every field has a valid property that we can use to store a 
    // true or false boolean in our validFields array
    validFields.push(field.validity.valid);
  });

  // if false is not in the array of validFields, then the form is valid
  this.isFormValid = !validFields.includes(false);
}
```

Basically, we loop through the required fields and store whether or not that field is false or true. If we find even one false for our fields, then the form is not valid. We also have a LitElement property `isFormValid` that keeps track of the validity of the form. We use this in our button to determine whether or not to apply the disabled attribute. Here's how.

components/checkout-form/checkout-form.js {.filepath}
```html
<mwc-button 
  ?disabled=${!this.isFormValid} 
  unelevated 
  label="Continue to checkout" 
  @click=${() => this.handleSubmit()}>
</mwc-button>
```

Simply put a `?` (as shown on line 2) in front of an attribute followed by an expression. This will determine whether or not to apply the attribute.


{:#collection}
## Collecting the data

How you actually collect data will just depend on how you need to send the payload in an actual form. However I wanted to cover this to get some principals down. Here we create an object called `payload`. How we add data to that object depends on the type of form field we're dealing with. So we have conditions for that.

components/checkout-form/checkout-form.js {.filepath}
```js
handleSubmit() {
  const payload = {};
  const fields = this.shadowRoot.querySelectorAll('mwc-textfield, mwc-select, mwc-checkbox, mwc-radio');

  fields.forEach((field) => {
    // if it's a textfield or select, store the name and value
    if (field.tagName === 'MWC-TEXTFIELD' || field.tagName === 'MWC-SELECT') {
      payload[field.name] = field.value;
    }

    // if it's a checkbox, store whether or not it's checked
    if (field.tagName === 'MWC-CHECKBOX') {
      payload[field.name] = field.checked;
    }

    // if it's a radio button and only if it's checked, store the name and value
    if (field.tagName === 'MWC-RADIO' && field.checked) {
      payload[field.name] = field.value;
    }
  });

  if (this.isFormValid) {
    console.log(payload); // when the form is submitted you'll see a log of the data. 
    alert('Your submission logic goes here!');
  }
}
```

That's all for building a basic form with Material Web Components. Hope you found this useful as there's not many articles on working with Material Web Components out there. If you require something more complex be sure to checkout out the documentation for the component you're working with!
