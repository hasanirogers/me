---
title: How to create a modern web app using WordPress and LitElement
date: 2020-09-16
author: Hasani Rogers
tags: 
- post
- wordpress 
- lit
- web app
excerpt: In this much needed post I'll cover how I created my portfolio site as a modern web app in WordPress using LitElement.
---

<kemet-alert status="warning" opened="" border-status="left">
  <kemet-icon slot="icon" size="48" icon="exclamation-circle"></kemet-icon>
  <h3 kemet-margin="tiny:none">Update 11-20-2020</h3>
  You can continue reading this post, or you can do this the easy way with my <a href="https://www.npmjs.com/package/litpress">LitPress Package</a>.
</kemet-alert>

So if you do a google search for ["build spa in wordpress with litelement"](https://www.google.com/search?q=build+spa+in+wordpress+with+litelement&oq=build+spa+in+wordpress+with+litelement) the first hit that comes up is [a talk I gave at a meetup](https://www.meetup.com/metro-detroit-wordpress-meetup/events/265302697/) discussing the topic. The rest of the hits don't even touch on the topic at hand. They mostly talk about just building with LitElement. Thus, I'm here to shed a light. WordPress is a huge platform and while it may be decreasing in popularity, you should be able to Google how to get LitElement and WordPress working together. In this much needed post I'll cover how I created my portfolio site as a modern web app in WordPress using LitElement.

{:.callout}
I should also note that while I created a SPA, you can use this guide to create a standard WordPress theme with LitElement based Web Components. [We'll talk about that more later](#normal-theme).

In this post we're gonna create the web app in a theme called [Anubis](https://github.com/hasanirogers/portfolio/tree/master/wp-content/themes/anubis). We're not going the completely headless route. While that's an approach that has advantages, it also has disadvantages such as the need to manage a separate frontend and backend. I'll likely cover how to do this in a another blog post. I do have experience doing this. With that in mind, we're primarily concerned about:

1. [Building assets to our theme](#building-assets).
2. [Bootstrapping our web app in the theme](#bootstrap-web-app).
3. [Setting up routes in the web app](#setting-up-routes).
4. [Getting data from WordPress to the web app](#getting-data).
5. [Making sure we serve the single page web app and not WordPress resources via urls](#single-page-app).
6. [Creating a developer friendly environment with browser reloading, linting, etc](#dev-environment).

Before we start, this project will require a lot of dependencies to install. Here's a sample `package.json` file of mind.

```json
{
  "name": "your-name-here",
  "version": "your-version-here",
  "description": "a description",
  "main": "index.js",
  "scripts": {
    "start": "webpack --watch --mode=development",
    "build": "webpack --mode=production",
  },
  "author": "Your Name <yourname@domain.com>",
  "eslintConfig": {
    "extends": [
      "@open-wc/eslint-config",
      "eslint-config-prettier"
    ]
  },
  "prettier": {
    "singleQuote": true,
    "arrowParens": "avoid"
  },
  "dependencies": {
    "@babel/polyfill": "^7.4.3",
    "@vaadin/router": "^1.5.2",
    "@webcomponents/webcomponentsjs": "^2.4.0",
    "lit-element": "2.0.0",
    "lit-html": "1.0.0",
    "pwa-helpers": "0.8.2"
  },
  "devDependencies": {
    "@babel/core": "7.7.5",
    "@babel/plugin-syntax-dynamic-import": "7.7.4",
    "@babel/plugin-syntax-object-rest-spread": "7.7.4",
    "@babel/preset-env": "7.7.6",
    "babel-loader": "8.0.6",
    "babel-preset-env": "1.7.0",
    "eslint": "^6.1.0",
    "@open-wc/eslint-config": "^2.0.0",
    "prettier": "^2.0.4",
    "eslint-config-prettier": "^6.11.0",
    "browser-sync": "^2.26.12",
    "browser-sync-webpack-plugin": "^2.2.2",
    "copy-webpack-plugin": "4.6.0",
    "css-loader": "1.0.1",
    "debug": "2.2.0",
    "dotenv": "^8.2.0",
    "fast-async": "6.3.8",
    "mini-css-extract-plugin": "0.4.4",
    "node-sass": "4.14.1",
    "postcss-loader": "3.0.0",
    "regenerator-runtime": "^0.13.3",
    "sass-loader": "7.1.0",
    "ssh2-sftp-client": "^5.3.1",
    "stylelint": "9.8.0",
    "stylelint-webpack-plugin": "0.10.5",
    "stylelint-config-sass-guidelines": "5.2.0",
    "webpack": "4.41.2",
    "webpack-cli": "^3.3.12"
  }
}
```

We'll cover important parts of this `package.json` later. For now copy and paste it then fill in your info. Do a `npm install` after you've setup it up.

{:#building-assets}
## Building assets to our theme.

We need to create a build configuration that will take our LitElement assets and bundle them up in way that WordPress can enqueue. We'll be doing this with Webpack. Here are some directories to note:

1. `wp-content/themes/anubis/src/packages`: Our LitElement Components
2. `wp-content/themes/anubis/src/styles`: Our global styles which are written in sass.
3. `wp-content/themes/anubis/bundles`: Our generated css and js that WordPress will actually serve.
4. `wp-content/themes/anubis/vendors`: Third party scripts such as webcompoonents.js that WordPress needs to serve.

You can [find the full webpack config here](https://github.com/hasanirogers/portfolio/blob/master/webpack.config.js). Right now I'm gonna cover the parts that are relevant for building the assets.

Import packages:

```javascript
const { resolve, join } = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
```


Setup your directories:
```javascript
const themeDirectory = resolve('wp-content/themes/your-theme-name-here');
const wcJSDirectory = './node_modules/@webcomponents/webcomponentsjs';
```


Setup copying vendor files from node_modules to vendors:
```javascript
const pluginConfigs = {
  copyFiles: [
    {
      from: resolve(`${wcJSDirectory}/webcomponents-*.{js,map}`), // we need this for browsers that don't support web components
      to: join(themeDirectory, 'vendor'),
      flatten: true
    },
    {
      from: resolve(`${wcJSDirectory}/custom-elements-es5-adapter.js`), // we need this since we're transpiling to es5
      to: join(themeDirectory, 'vendor'),
      flatten: true
    }
  ],
}
```


Config miniCSSExtract to output a bundle.css file:
```javascript 
...
miniCSSExtract: {
  filename: "bundle.css" // this is what actually get served after sass is compiled
},
...
```


Setup the css loaders:
```javascript
...
miniCSSExtract: [
  MiniCssExtractPlugin.loader,
  {
    loader: "css-loader",
    options: {sourceMap: true}
  },
  {
    loader: "postcss-loader",
    options: {sourceMap: true}
  },
  {
    loader: "sass-loader",
    options: {sourceMap: true}
  }
]
...
```


Setup babel to transpile our js:
```javascript
babel: [{
  loader: 'babel-loader',
  options: {
    presets: [
      [
        '@babel/preset-env',
        {
          modules: 'false',
          targets: {
            browsers: '> 1%, IE 11, not dead'
          }
        }
      ]
    ],
    plugins: [
      '@babel/syntax-dynamic-import', // this is needed to support dynamic imports
      '@babel/syntax-object-rest-spread' // this is needed to support the spread  operator
    ]
  }
}],
```


Handle the input and out of our js:
```javascript
module.exports = {
  entry: [
    'regenerator-runtime/runtime', // is needed for async/await
    themeDirectory + '/src/packages/me-app/me-app.js', // this file bootstraps our LitElement PWA
    themeDirectory + '/src/styles/app.scss' // use this file for any global styles
  ],

  output: {
    path: join(__dirname, 'wp-content/themes/anubis/bundles'),
    filename: 'bundle.js',
    publicPath: 'http://hasanirogers.local:8080/wp-content/themes/anubis/bundles'
  },
}
```


Include js and scss configs:
```javascript
...
module: {
  rules: [
    {
      test: /\.js$/,
      use: loaderConfigs.babel
    },

    {
      test: /\.scss$/,
      exclude: /node_modules/,
      use: loaderConfigs.miniCSSExtract
    }
  ]
},
...
```


Setup our plugins:
```javascript
...
plugins: [
  new CopyWebpackPlugin(pluginConfigs.copyFiles),
  new MiniCssExtractPlugin(pluginConfigs.miniCSSExtract),
  new webpack.optimize.LimitChunkCountPlugin({maxChunks: 1}), // we only want to produce 1 bundle.js file
]
...
```

Phew! Done with that. At this point you should be able to run `npm run watch`. The watcher will watch for changes in our LitElement app and styles then compile a new `bundle.css` and `bundle.js`. Since these files are generated I recommend that you don't commit them by adding them to `.gitignore`.


{:#bootstrap-web-app}
## Bootstrapping our web app in the theme

There three key WordPress theme files for bootstrapping our web app.

1. `index.php`: This is the page contains our LitElement app.
2. `functions.php`: This is where we configure the head and inject scripts and styles.
3. `style.css`: WordPress requires [this file](https://github.com/hasanirogers/portfolio/blob/master/wp-content/themes/anubis/style.css). Leave it blank with the comments.

### Index.php

This file is simple. We only need to include a reference to our main LitElement app element. I've called this `<me-app>`;

```php
<?php
/**
 * The main template file
 *
 * This is the most generic template file in a WordPress theme
 * and one of the two required files for a theme (the other being style.css).
 * It is used to display a page when nothing more specific matches a query.
 * E.g., it puts together the home page when no home.php file exists.
 *
 * @link https://codex.wordpress.org/Template_Hierarchy
 *
 * @package WordPress
 * @subpackage Anubis
 * @since 1.0
 * @version 1.1
 */

wp_head(); ?>

<body>
  <me-app></me-app>
</body>

<?php wp_footer();
```

### functions.php

[This file](https://github.com/hasanirogers/portfolio/blob/master/wp-content/themes/anubis/functions.php) is where a lot of magic happens. I've decided to disable a lot of things like the admin bar. I also enabled post thumbnails and added custom posts. You are not required to do so. It depends on what you want your app to support. However, the most important take away from this file is enqueuing the right styles and scripts. This is required.

First, you need to add an es5 adapter. This is because our LitElement code is written using classes but we transpile them to older es5 code. An adapter is required for them to work in this case:

```javascript
// es5 adapter
function add_es5_adapter() {
  if (!is_admin()) {
    echo '<script>
      if (!window.customElements) {
        document.write(\'<!--\');
      }
    </script>
    <script src="'. get_theme_file_uri('vendor/custom-elements-es5-adapter.js') .'"></script>
    <!-- DO NOT REMOVE THIS COMMENT -->';
  }
}
add_action('wp_head', 'add_es5_adapter', '1');
```

Next, you need to enqueue the bundles that we created. We also need to polyfill webcomponents for older browsers.

```php
if (!is_admin()) {
    wp_enqueue_script('webcomponent-loader', get_theme_file_uri('/vendor/webcomponents-loader.js'), [], false, true);
    wp_enqueue_script('bundle-js', get_theme_file_uri('/bundles/bundle.js'), [], false, true);
    wp_enqueue_style('bundle-css', get_theme_file_uri('/bundles/bundle.css'));
}
```

The file `webcomponents-loader.js` will intelligently figure out if web components are supported and only load polyfills if they aren't. Finally, I needed to include this line of code for reasons I still don't understand. lol

```php
# not having this causes a redirect loop on prod for some reason
remove_filter('template_redirect', 'redirect_canonical');
```

That takes care of the theme files. Now, remember that `<me-app>` element we used? We need to create that [file](https://github.com/hasanirogers/portfolio/blob/master/wp-content/themes/anubis/src/packages/me-app/src/MeApp.js). I'll provide a skeleton of this app file for you to use. This file is going to vary depending your app's needs however.

```javascript
import { LitElement, html, css } from 'lit-element';

export class MeApp extends LitElement {

  static get styles() {
    return [
      css`
        /* your styles here */
      `,
    ];
  }

  static get properties() {
    return {
      // your props here
    };
  }

  constructor() {
    super();

    // property defaults etc here
  }

  render() {
    return html`
      <h1>Hello LitElement App!</h1>
    `;
  }
```

We've created the class for our `<me-app>` but we need to define it as a custom element. Do that in a [separate file called me-app.js](https://github.com/hasanirogers/portfolio/blob/master/wp-content/themes/anubis/src/packages/me-app/me-app.js).

```javascript
import { MeApp } from './src/MeApp.js';

window.customElements.define('me-app', MeApp);
```

We now have a super basic LitElement web app that should work in your WordPress site. I'm not going to cover setting up a WordPress site here as that's out of scope for this post. However so as long as you have one running on your machine, if you set the theme to Anubis (or whatever decided to call your theme), you should see the app running. Awesome? I indeed it is. Lets look at routing next.

{:#setting-up-routes}
## Setting up routes in the web app.

Routes are a basic feature of web apps so I want to cover them. There are many plenty of routing methods that can be used with LitElement apps. However I like to use [Vaadin's router](https://vaadin.com/router). It's simple but offers a lot of power.

To get a router to work, you need to configure routes in your root app element. This is the `<me-app>` in my app.

```javascript
import { LitElement, html, css } from 'lit-element';
import { Router } from '@vaadin/router';

// you need to import your page components
import 'path/to/your/components/your-home-page.js';
import 'path/to/your/components/your-second-page.js';

export class MeApp extends LitElement {
  static get styles() {
    return [
      css`
        /* your styles here */
      `,
    ];
  }

  static get properties() {
    return {
      page: {
        type: String
      }
    };
  }

  constructor() {
    super();

    // if we're on the home page set page to home, other wise set it to /whatever-your-route-is
    this.page = window.location.pathname === '/' 
      ? 'home' 
      : window.location.pathname.replace('/', '');;
  }

  render() {
    return html`
      <header>My header!</header>
      <main data-outlet></main>
      <aside>My sidebar!</aside>
      <footer>My footer!</footer>
    `;
  }
  
  // firstUpdated() is a life cycle method and is called when the first time a component is rendered
  firstUpdated() {
    // the router needs an outlet. 
    // this is where the components defined in router will render
    // note that you need the .shadowRoot property to access element inside this component

    const outlet = this.shadowRoot.querySelector('[data-outlet]');
    const router = new Router(outlet);

    router.setRoutes([
      {
        path: '/',
        component: 'your-home-page'
      },
      {
        path: '/second',
        component: 'your-second-page'
      },
      
      // this is a catch all route
      // redirect to the home page if a match above is not found
      // note that order is important here and this should be last
      {
        path: '(.*)',
        redirect: '/',
        action: () => { 
          this.switchRoute('home'); 
        }
      }
    ]);
  }

  switchRoute(route) {
    this.page = route;

    // set our page property home if the route / or is blank
    if (route === '' || route === '/') {
      this.page = 'home';
    } 

    // the actual switching of a router
    Router.go(`/${route}`);
  }
}
```

See what I mean? Routes with Vaadin are super easy, especially if you've worked with other routers before. It kinda reminds of routing in Angular. Which I like.


{:#getting-data}
## Getting data from WordPress to the web app

Because we're using a single element for our web app, we can't just open a `php` tag and use something like `WP_Query` to get data to our app. It's also impractical to pass down data to our app via properties. This is where WordPress Rest API comes in. We're gonna fetch data using `fetch`. I'll provide a sample how I achieved this. We're gonna cover the [skills](http://hasanirogers.me/skills) section of my portfolio as an example. Here's an annotated example of the code:


```javascript
import { html, css, LitElement } from 'lit-element';

export class PageSkills extends LitElement {
  static get styles() {
    return [
      css`
        /* your styles here */
      `
    ]
  }

  static get properties() {
    return {
      skillsData: { 
        type: Array 
      },
      skillsDesc: { 
        type: String 
      },
    }
  }

  constructor() {
    super();

    // we generally want our properties to have default values.
    this.skillsData = [];
    this.skillsDesc = '';
  }

  render() {
    // if our skills description is empty (they haven't clicked or hovered) display a generic message,
    // otherwise display the skill description obtained from the fetch
    const skillsDesc = this.skillsDesc || 'Hover or tap on any of my skills for a brief description.';

    return html`
      <h3>Skills</h3>
      <section class="page">
        <ul>
          ${this.displaySkillsList()}
        </ul>
        <p class="skills-desc">${skillsDesc}</p>
      </section>
    `
  }

  firstUpdated() {
    // first thing want to do is get the data
    this.fetchSkillsData();
  }

  displaySkillsList() {
    // holds the template result we're gonna return
    let skillList;

    // as long as we have some skills (lolz) map through them
    if (this.skillsData.length > 0) {
      skillList = this.skillsData.map((skill) => {
        // return a collection of <li> for each skill
        // call setDesc on click
        return html `
          <li>
            <a
              class="round-btn"
              @click="${this.setDesc}"
              @mouseover="${this.setDesc}"
              data-desc="${skill.description}">
              ${skill.name}
            </a>
          </li>
        `;
      });
    } else {
      // if we don't have any skills (lolz) say so
      skillList = html`Hmmmm. Looks like you don't have any skills.`;
    }

    return skillList;
  }

  setDesc(event) {
    // set the skillsDesc to equal data-desc we've stored on each skill
    this.skillsDesc = event.target.dataset.desc;
  }

  // here we make a call to the rest api
  // where using async/await to make it easier to read

  async fetchSkillsData() {
    // notice that we aren't using permalinks for the call, we're using ?rest_route=/wp/v2
    // this is because we need to have permalinks turned off so that WordPress' templating engine doesn't interfere with our frontend routes 
    // for example, we want /my-page to load a component called 'my-page' instead of having WP look for a page/post with a slug of 'my-page'
    // ?rest_route is officially mentioned here: https://developer.wordpress.org/rest-api/extending-the-rest-api/routes-and-endpoints/
    // you can learn more about the WP Rest API using this guide

    // skills is a custom taxonomy I've created and the max that can be fetched without pagination 99
    // we convert our response to text, then in a try block parse it to json. this way if it fails we know something is wrong
    const skills = await fetch("/?rest_route=/wp/v2/skills/&per_page=99") 
    .then(response => response.text())
    .then(text => {
      try {
        return JSON.parse(text);
      } catch (error) {
        console.log(error);
      }
    });

    // after we fetched the data assign it to our skillsData property
    this.skillsData = skills;
  }
}
```

As you can see, the only gotcha with fetching is that we can't use permalinks while requesting data. I've explained why in the comments of the code. You can find [my PageSkill.js file here](https://github.com/hasanirogers/portfolio/blob/master/wp-content/themes/anubis/src/packages/page-skills/src/PageSkills.js). Be sure to remember to create a [page-skills.js](https://github.com/hasanirogers/portfolio/blob/master/wp-content/themes/anubis/src/packages/page-skills/page-skills.js) where you define the element too.


{:#single-page-app}
## Making sure we serve the single page web app and not WordPress resources via urls.

Since this is a single page web app, we need to make sure our frontend routes take priority over requests that WordPress would normally handle, like `/your-page`. I've touched on this with fetching data. You need to turn off permalinks to ensure this is the case. You also need to create an .htaccess file that ensure WordPress is requested via the root:

```conf
<IfModule mod_rewrite.c>
    # enable rewriting
    RewriteEngine on

    # don't rewrite files that exist in the file system
    RewriteCond %{REQUEST_FILENAME} !-f

    # don't rewrite directories that exist in the file system
    RewriteCond %{REQUEST_FILENAME} !-d

    # rewrite the request to index.php
    RewriteRule ^ index.php [QSA,L]
</IfModule>
```

We don't want WordPress messing with this `.htaccess` file so it's a good ideas to revoke write access via permissions: 

```bash
chmod 444 .htaccess
```

{:#dev-environment}
## Creating a developer friendly environment with browser reloading, linting, etc.

This step is completely optional. If you've been following along this far you should have a basic app with routing that can make requests to WordPress to get post data and such. However, part of the modern experience with web apps is also the development experience. I'll walk through setting up auto page reloads with BrowserSync, both es and style linting, and formatting with prettier here.

### Auto page reloading

You may have noticed that I had you install `browser-sync-webpack-plugin` from my sample `package.json`. We're gonna extend webpack to config BrowserSync and setup a proxy to our php site.

Add this to your package imports:
```javascript
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
```

Add this to your `pluginConfigs` object:
```javascript
browserSync: {
  files: '**/*.php', // we have to tell browserSync to reload when we change php files
  proxy: 'http://hasanirogers.local' // this address your WordPress site runs on locally
}
```

Setup your BrowserSync in your plugins config:
```javascript
new BrowserSyncPlugin(pluginConfigs.browserSync, { reload: false })
```

That's it. Auto reloading is configured. When you run a webpack watcher, you'll start the BrowserSync server. My sample `package.json` has this as a start task so simply run `npm start` to start the server.


## Linting

We lint via the command line. Here's how to setup the lint scripts. Add these to your "scripts" in `package.json`. 

```json
"stylelint": "npx stylelint 'wp-content/themes/**/*.scss'",
"eslint": "eslint --ext .js,.html wp-content/themes/anubis/src/packages/** --ignore-path .gitignore",
"eslint:fix": "eslint --ext .js,.html wp-content/themes/anubis/src/packages/** --fix --ignore-path .gitignore",
"prettier": "prettier \"wp-content/themes/anubis/src/packages/**/*.js\" --check --ignore-path .gitignore",
"prettier:fix": "prettier \"wp-content/themes/anubis/src/packages/**/*.js\" --check --ignore-path .gitignore"
```

1. `stylelint`: Runs stylelint. 
2. `eslint`: Run eslint.
3. `eslint:fix`: Fixes issues found with eslint if possible.
4. `prettier`: Runs prettier.
5. `prettier:fix`: Fixes issues found with prettier.

Note that the path to my theme is `wp-content/themes/anubis` so you'll find that in my sample `package.json`. Obviously you'll want to update the paths if you change the theme name. The configs for these linters are mostly done for you. You do need to add a `.stylelintrc` in the root of your project though:

```json
{
  "extends": "stylelint-config-sass-guidelines",
  "rules": {
    "order/properties-alphabetical-order": null
  }
}
```

Put that in the `.stylelintrc` file. The stylelint config uses the [stylelint-config-sass-guidelines](https://www.npmjs.com/package/stylelint-config-sass-guidelines). I turned off alphabetical ordering though. Use the rules property to turn off other rules by setting them to `null`. Eslint uses the [open-wc linting config](https://www.npmjs.com/package/@open-wc/eslint-config). [Open-wc](https://open-wc.org) is awesome project that you should checkout for Web Component standards! I also stole my prettier config from their generator too. You'll find those in the `package.json` file:

```json
"eslintConfig": {
  "extends": [
    "@open-wc/eslint-config",
    "eslint-config-prettier"
  ]
},
"prettier": {
  "singleQuote": true,
  "arrowParens": "avoid"
},
```

Config as you please as this one is for you.

{:#normal-theme}
## A word on developing a "normal" theme but with web components.

If you've followed this guide you should have a modern single page web app working in your WordPress theme. I understand though that you might not want a SPA. After all part of the power of WordPress is creating pages on the fly. That or you might just be stuck in your ways and are more comfortable with standard WordPress theme-ing. In any case if this is you read on.

It's possible to simply use Web Components where desired in your standard WordPress theme. For example, you may want to do something like this for `index.php`:

```php
<?php wp_head(); ?>

<body>
  <my-header-component><my-header-component>
  <main>
    <?php 
      // The Query
      query_posts( $args );
      
      // The Loop
      while ( have_posts() ) : the_post();
          echo '<my-custom-post-component title="'. the_title()  .'">
                '. the_content() .'
                </my-custom-post-component>';
      endwhile;
 
      // Reset Query
      wp_reset_query();
    ?>
  </main>
  <aside>
    <?php get_sidebar(); ?>
  </aside>
  <my-footer-component>
    <?php
      // some logic that output links
    ?>
  <my-footer-component>
</body>

<?php wp_footer();
```

If you want to do this, all you need to do is change the entry point for your js in your webpack config. Instead of this:

```javascript
themeDirectory + '/src/packages/me-app/me-app.js', // this file bootstraps our LitElement PWA
```

Do something like this:

```javascript
themeDirectory + '/src/scripts/app.js', // import all our custom elements here
```

Then use `app.js` to import all of you custom element. So for our example above:

```
import './components/my-header-component/my-header-component.js';
import './components/my-custom-post-component/my-custom-post-component.js';
import './components/my-footer-component/my-footer-component.js';
```

Do this for every custom component you create. This way you can create complex WordPress themes the traditional way with Web Components! If you go this route you can ignore everything I said in [Making sure we serve the single page web app and not WordPress resources via urls](#single-page-app). So feel free to use permalinks.

Thanks for reading. Don't be scared to take your WordPress theme development to the next level using LitElement and Web Components!
