---
title: The MEWN Stack with Shoelace
date: 2022-04-10
author: Hasani Rogers
tags: 
- post
- mewn 
- web components
- shoelace
- express.js 
- node.js
- mongodb
excerpt: Ladies and Gentlemen I present to you the MEWN stack. MongoDB, Express, Web Components, and Node.
---

I'm surprised. Before writing this article I googled "MEWN stack" and got zero relevant results. I mean I know someone out there has probably create something on a MEWN stack but nobody is using the term? Funny. Anyways, first there was MEAN who's primary front end technology was Angular. Then MERN came around once React got popular. Now there's MEWN with web components. I'll let the internet decide how to pronounce it. Now on on the meat.

I recently was asked to do a simple landing page generator app. The app will be used for users who will scan a QR code and get taken to a page with audio or video that plays. The client needs to manage the landing pages via a dashboard. Since I'm a Front End Developer with a lot of experience in WordPress I tend to go to WordPress when I need server side tech. WordPress was overkill for this project though. Each landing page only need a small amount of info. I do have experience with Express.js and MongoDB though. So I said screw it, I'm gonna build an app with Express, MongoDB, Web Components, and Node.

You can [find a work in progress repo for the entire app at my Github](https://github.com/hasanirogers/indelible-landing). However since the client needs exclusive access to it to manage the pages I won't be posting a link to the live app. Instead in this article I'll review concepts with examples of how to execute the code. Read on to learn how to:

1. [Roll out an generated Express app](#generate-express)
2. [Configure Express to connect to a remote MongoBD on Atlas](#database-connection)
3. [Setup a database model with Mongoose](#database-model)
4. [Add server side routes](#routes)
5. [Use EJS templating to render the server side page](#templates)
6. [Review various web components that make up the front end](#web-components)
7. [Setup a front end build chain with Rollup](#build)



{:#generate-express}
## Roll out an generated Express app

Generating an Express.js app is easy. Just run `npx express-generator --view=ejs`. EJS is the name of the view engine we're gonna use to render pages. More on that later. After you run the generator do a `npm install`. You'll then be able to start the app with `npm start`. But we want to take things a little further. Lets install something called Nodemon with `npm i -D nodemon`. Nodemon will watch for changes in our Express and reload the app when we make a change to it. After you've installed Nodemon replace `node` in the start script with `nodemon`. Your script should look like:

```json
...
"scripts": {
  "start": "nodemon ./bin/www"
},
...
```

Run `npm start` again and this time you'll start with an auto refreshing server.

At this point you'll have these files and directories:

* `bin/www` - Starts the server
* `public/` - Serves up static assets for the front end
* `routes/` - Backend routes
* `view/` - Templates for the front end
* `app.js` - The main server config file

This is a standard Express.js install. Most of this stuff you can leave intact unless other wise noted. 


{:#database-connection}
## Configure Express to connect to a remote MongoBD on Atlas

Instead of setting up MongoDB ourselves, we're gonna to defer to a service called [Atlas](https://www.mongodb.com/atlas). Our application is simple so we can use the free account. Once you create an account select a project and look off to the left sidebar. You should see a link named "Databases". Click on it and it should take you to an "Overview" tab. While on the Overview tab there should be button with the label "Connect". Click on it and you'll get a modal. Next click on the option that says "Connect your application." You should see a script that looks something like:

```javascript
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://<username>:<password>@cluster0.glgp5.mongodb.net/<database-name>?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});
```

In the root of your project create a file called `.env`. Copy the value of the const uri and paste it inside `.env`. Prefix the value with `DB_DSN=`. Your `.env` file should look like:

```conf
DSN_DB=mongodb+srv://your_username:your_password@cluster0.glgp5.mongodb.net/your_database_name?retryWrites=true&w=majority
```

Replace the strings that begin with `your_` with your actual username, password, and database name.

We're putting our authentication to the database in an `.env` for security reasons. Node.js has a library called dotenv that will read this file and create environment variables from them. This is what we want so install dotenv with `npm i -D dotenv`. Open up `bin/www` and place this line of code on line 2, `require('dotenv').config();`. We should now be able to access this in Express with `process.env.DB_DSN`.

Create a file in the root of the project named `database.js` place this in it:

```javascript
const mongoose = require('mongoose');

module.exports.connect = async dsn => mongoose.connect(dsn, {useNewUrlParser: true});
```

Since we'll be using something called Mongoose to interface with our Database, go ahead an install it with `npm i mongoose`. This script setups mongoose to connect to our database. Next open up `www/bin` again and add the following: 

```javascript
var db = require('../database');
...
db.connect(process.env.DB_DSN)
  .then(() => {
    console.log('connected');
    server.listen(port);
  })
  .catch((error) => {
    console.error(error);
  });
```

This makes the actual connection to our Database using the DB_DSN credentials we've provided.


{:#database-model}
## Setup a database model with Mongoose

Now that we have a connection to our database we need to setup a model for how data will be entered into the database. We do this using Schemas with Mongoose. Create a file directory named `models` and place a file called `page.js` in it. Inside `page.js` add the following:

```javascript
const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const emailValidator = require('email-validator');

const PageSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2
  },
  email: {
    type: String,
    required: false,
    trim: true,
    lowercase: true,
    index: { unique: false },
    validate: {
      validator: (email) => {
        return emailValidator.validate(email) || email === '';
      },
      message: props => `${props.value} is not a valid email address`
    }
  },
  mediaType: {
    type: String,
    required: true,
    trim: true
  },
  mediaURL: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
  },
  message: {
    type: String,
  },
  websiteLink: {
    type: String,
  },
  websiteLinkLabel: {
    type: String,
  }
}, {
  timestamps: true,
});

PageSchema.plugin(AutoIncrement, {inc_field: 'id'});

module.exports = mongoose.model('Pages', PageSchema);
```

We're using two packages to assist Mongoose here so lets install them. Run `npm i mongoose-sequence email-validator`. 

Mongoose Sequence allows us to auto increment a database field. We want to do that with the id because we want a unique id auto generated every time a record is created. The code for this can be found on line 55. We take our schema object and run the plugin on it. Use the property `inc_field` in the object as options. The value of `inc_field` should be the name of the field you want to auto increment. In our case that's id.

The other package we're using is Email Validator. This allows us to have the server reject emails that don't match valid email validation. In our app emails are actually optional. So you'll see in the code that the email can return either a valid email or an empty string. Checkout line 24 in the code. Mongoose allows us to setup custom validators on any field. To do so use the `validate` property. The `validate` property should be an object with two properties, `validator` and `message`. Validator is a function that returns a boolean. It also passes the data used in the field as an arg. This way we can use EmailValidator to run validation on what the user entered. Since its optional we can also return true if the email is an empty string.

The rest of the properties for the fields controls predefined rules such as should white space to be trimmed or the minimum length of the data that was inputted. You can find more about all the options you have in [mongoose's schema types documentation](https://mongoosejs.com/docs/schematypes.html).


{:#routes}
## Add server side routes

With our model in place we need to add a way to actually send data to the database. We also need to display that data back to the user. We do this with routes. Routes allows us to handle both `POST` and `GET` on the server. When the user has submitted data we want to handle it as a post request and save that data through our model. When a user wants to see data (view a page), we handle it as a GET request.

We need plenty of routes for our app.

1. `/create` - handles creating a new page
2. `/dashboard` - displays all the pages that have been created
3. `/delete` - deletes the specified page
4. `/edit` - edits the specified page
5. `/page` - view the specified page

I'm not going to go over all the code in the routes here. After all you can [checkout it out on at my repo](https://github.com/hasanirogers/indelible-landing/tree/main/routes). What I do want to cover though is the basic concept of handling `POST` and `GET` requests.

### Handling POST

A `POST` request happens when the front end makes submits a form. Typically an AJAX call through fetch, axios, or maybe even jQuery is made. In Express, the data sent in this call is accessible through the request body parameter. So to handle a post request you need to use the post method of router and do something with the data by accessing `request.body`. In our create route for example first we import router:

```javascript
const router = express.Router();
```

Then we use post.

```javascript
router.post('/', async (request, response, next) => {
  try {
    const page = new PageModel({
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      email: request.body.email,
      mediaType: request.body.mediaType,
      mediaURL: request.body.mediaURL,
      message: request.body.message,
      websiteLink: request.body.websiteLink,
      websiteLinkLabel: request.body.websiteLinkLabel,
    });

    const savedPage = await page.save();

    if (savedPage) {
      return response.status(200).json({ message: 'SUCCESS', code: 200 });
    } else {
      return response.status(500).json({ message: 'ERROR', code: 500 });
    }
  } catch (error) {
    const responseData = {
      message: 'ERROR',
      code: 500,
      body: error
    };

    return response.status(500).json(responseData);
  }
});
```

One line 3 we create a PageModel with Mongoose. That model is an object that represents all the data we've collected from the form. Mongoose takes that data and stores it in the database so as long as it passes validation and saves correctly. Speaking of saving, notice how we have conditional logic on line 16 that handles the save. IF the save fails we need to return an error the front end can handle. We also have it in a try/catch block. If for some reason something goes wrong with the process of saving to the database we catch that error and give it to the front end.

### Handling GET

Get requests require us to send a page when the user access a particular url in a browser. To do this we render a template. That template can receive data from the server to display dynamic information such as a user name. For example:

```javascript
router.get('/:pageId', async (request, response, next) => {
  const page = await PageModel.find({ id: request.params.pageId });
  const templateInfo = {
    title: 'Error',
    bodyClass: `body--error`
  };

  if (page.length > 0) {
    const mediaType = page[0].mediaType;

    templateInfo.title = `${page[0].firstName}'s ${mediaType}`;
    templateInfo.page = page[0];
    templateInfo.bodyClass = 'body--landing';

    response.render('page', templateInfo);
  } else {
    response.render('error', templateInfo);
  }
});
```

This is the code used to gender the unique landing page in our app. Notice on line 1 we have `/:pageId` as a parameter of `get`. This allows us to collect information from the url that was entered. In our case `/page/99` would mean that the `pageId` is `99`. You can access this page id via request params or `request.params.pageId`. On line 2 we grab information specific to the page that was requested via `pageId`. We then use that information later on to generate a unique landing page. On line 15 we actually render our page. The page comes with `templateInfo` or an object that contains information from the page that was returned. If the page is not found we default to an error page.

### Configure the routes in app.js

You may have notice that there is no `/page` given as an argument for `get` in the code above. That's because the path to our routes is actually configured in `app.js`.

On line 28 of `app.js` we have:

```javascript
app.use('/page', pageRouter);
```

...and `pageRouter` is an import of our router in `routes/page.js`; This allows us to only have to specify the route param when writing the logic of our page router.


{:#templates}
## Use EJS templating to render the server side page

With our routes in place we now need to render a page when users want to view some data from the server. In the beginning of this article I had you generate an express app using the switch `--view=ejs`. EJS is the name of the templating engine we're going to use to render pages. In a EJS file we have access to all the info we stored in our `templateInfo` object. [We have many views](https://github.com/hasanirogers/indelible-landing/tree/main/views) but I'm going to be covering [dashboard.ejs](https://github.com/hasanirogers/indelible-landing/blob/main/views/dashboard.ejs). You can take the concepts here and run with them.

The dashboard needs to:

1. Include the header and footer
2. Loop through all the pages and display links and actions associated with them.
3. Handle pagination.

Be sure to [checkout the route that renders dashboard.ejs](https://github.com/hasanirogers/indelible-landing/blob/main/routes/dashboard.js) to get clarity on where all this data comes from. 

Our [header](https://github.com/hasanirogers/indelible-landing/blob/main/views/partials/head.ejs) and [footer](https://github.com/hasanirogers/indelible-landing/blob/main/views/partials/footer.ejs) is in a partial that's a separate file. So we need to use include to embed them in our view.

```javascript
<%- include('partials/head.ejs', { title: title, bodyClass: bodyClass }) %>
...
<%- include('partials/footer.ejs', { title: title }) %>
```

The first argument is the location of the partial. The second is an object containing data for the template. We don't really need to pass the title down to the footer. I was probably in a rush when I did that.

Next we need to loop through all of our pages. Our dashboard route sends down an array of objects named `pageData`. This page data is aware of pagination rules so we can just loop through what's sent from the server.

```javascript
<ul class="pages">
  <% for (var i = 0; i < pages.length; i++) { %>
    <li>/* actions concerning the page go here */</li>
  <% } %>
</ul>
```

It's a simple for loop to achieve this. We loop through the pages variable which is found in the dashboard's `templateInfo` object. Every property on this object will be available to us as a variable here.

Finally we need the pagination. In this app I've created a pagination web component. The pagination web component has a number of properties most of which are straight forward to figure out. We do want to build some logic in our template though. For example, we only want to display the pagination component if the pages are actually paginated.

```javascript
<% if (pagination.currentPage && pagination.limit) { %>
  // pagination component goes here
<% } %>
```

We can do this by checking the `currentPage` and `limit` properties of pagination object. Limit is something we use to tell mongoose to limit the number of records to fetch from the database. If these properties aren't truthy then we don't have any pagination. We also need to provide values to our pagination component's properties and even conditionally add some properties such as last. Last shouldn't display if the user is on the last page because it's unnecessary at that point.

```javascript
<indelible-pagination
  link="/dashboard?page=[[current]]&limit=<%= pagination.limit %>"
  link-previous="/dashboard?page=[[previous]]&limit=<%= pagination.limit %>"
  link-next="/dashboard?page=[[next]]&limit=<%= pagination.limit %>"
  link-first="/dashboard?page=[[first]]&limit=<%= pagination.limit %>"
  link-last="/dashboard?page=[[last]]&limit=<%= pagination.limit %>"
  total="<%= pagination.totalPages %>"
  current="<%= pagination.currentPage %>"
  <% if (pagination.previousPage) { %> previous="<%= pagination.previousPage %>"<% } else { %> previous="disabled" <% } %>
  <% if (pagination.nextPage) { %> next="<%= pagination.nextPage %>"<% } else { %> next="disabled" <% } %>
  <% if (pagination.currentPage !== 1) { %> first="1" <% } %>
  <% if (pagination.currentPage !== pagination.totalPages) { %> last="<%= pagination.totalPages %>" <% } %>
>
</indelible-pagination>
```

If you're interested to know how the pagination component was written [you can checkout its code here](https://github.com/hasanirogers/indelible-landing/blob/main/src/javascript/components/indelible-pagination.js). It's basically a bunch of dynamically generated links.


{:#web-components}
## Review various web components that make up the front end

This app uses various components from [Shoelace](https://shoelace.style/) and custom components written by me. You can find all the [custom component here](https://github.com/hasanirogers/indelible-landing/tree/main/src/javascript/components). I'm going to discuss the delete component because it also contains Shoelace components. The delete component is a form that sends a POST request to our [delete route](https://github.com/hasanirogers/indelible-landing/blob/main/routes/delete.js). When the users initially click the delete button we don't immediately send the request. Instead we pop open a dialog asking them to confirm the deletion. This is where Shoelace comes in. [Shoelace has a dialog component](https://shoelace.style/components/dialog) that we're using inside of delete.

```html
<sl-dialog label="Delete this page?">
  Are you sure you want to delete this page?
  <sl-button slot="footer" variant="primary" type="submit">Yes</sl-button>
</sl-dialog>
```

We have a method on our delete component that will handle what happens when delete is clicked.

```javascript
handleClick() {
  const dialog = this.shadowRoot.querySelector('sl-dialog');
  dialog.show();
}
```

When the delete button is click, we just need to call `show()` on the dialog element. You'll notice that the button in our `sl-dialog` and has a type of `submit`. This means that it'll work like a submit button for a form. The real deletion happens when we submit the form with the `sl-button`. On the form we have a submit handler.

```html
<form action="/delete" @submit=${(event) => this.submitForm(event)}>
  <!-- form -->
</form>
```

The `submitForm()` method needs to do a POST request to `/delete`.

```javascript
submitForm(event) {
    event.preventDefault();

    const form = this.shadowRoot.querySelector('form');
    const formData = new FormData(form);

    const config = {
      method: 'POST',
      body: JSON.stringify(Object.fromEntries(formData)),
      headers: {
        "Content-Type": "application/json"
      }
    };

    fetch(form.action, config)
      .then(response => response.text())
      .then(text => {
        try {
          const response = JSON.parse(text);

          if (response.code == 200) {
            window.location.reload();
          } else {
            alert('There was a problem deleting the page.');
          }
        } catch (error) {
          console.error(error);
        }
      })
      .catch(error => {
        console.error(error);
      });
  }
}
```

We use the [formData API](https://developer.mozilla.org/en-US/docs/Web/API/FormData) to get data from the form. In this case the only thing we need to collect is the `pageID` of the page that needs to be deleted. The user doesn't need actually enter the `pageID` since our template knows it. So we use a hidden form field to collect the data. If the deletion is successful we reload the page. If not we pop up an alert explaining to the user that there was a problem. Btw we're sending the data as JSON so be sure to set the headers to `application/json` as shown in the snippet above.


{:#build}
## Setup a front end build chain with Rollup

The last thing we need to cover for building a MEWN stack application is bundling front end assets. These days I prefer Rollup for this. Install Rollup with `npm i -D rollup`. We also want to install a couple of Rollup plugins.

```bash
npm i -D @rollup/plugin-commonjs @rollup/plugin-node-resolve rollup-plugin-copy rollup-plugin-scss
```

We have an npm script named `build` that runs the `rollup` command with a config file flag.

```json
"scripts": {
  "build": "rollup -c",
}
```

The `-c` in the command means use a config while. You can specify where this config file lives but the default location Rollup will look for is a file in the root of the project named `rollup.config.js`. We're using the default.

Our Rollup config file looks like this:

./rollup.config.js {.filepath}
```javascript
import path from 'path';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';
import scss from 'rollup-plugin-scss';

export default {
  input: 'src/javascript/index.js',
  output: {
    file: 'public/bundle.js',
    format: 'es'
  },
  plugins: [
    resolve(),
    commonjs(),
    scss({
      output: 'public/bundle.css',
      sass: require('sass'),
    }),
    copy({
      targets: [
        {
          src: path.resolve(__dirname, 'node_modules/@shoelace-style/shoelace/dist/assets'),
          dest: path.resolve(__dirname, 'public/vendors/shoelace')
        },
        {
          src: path.resolve(__dirname, 'src/assets'),
          dest: path.resolve(__dirname, 'public')
        }
      ]
    })
  ]
};
```

The starting point for our bundle output is [src/javascript/index.js](https://github.com/hasanirogers/indelible-landing/blob/main/src/javascript/index.js). This is a file that contains a bunch of imports including our custom web components and Shoelace components. Rollup is going to take all the files here bundle them to a file called `public/bundle.js`. Our application then loads the bundle file.

We're also using the scss plugin. This means that Rollup is going to handle any `.scss` files we import in `index.js`. We've configured the plugin to output a complied scss file to a css file called `public/bundle.css`. Like the JS we load this CSS file on the front end of the application.

Some Shoelace components such as `sl-icon` has assets associated with them. We need to copy those assets from the `node_modules` directory to a directory in our app so that we can load them. I've chosen to copy them to `public/vendors/shoelace`. We also use the copy plugin to copy everything in `src/assets` to `public` since public is our static assets directory. Think of it as a build directory. We don't version it.

And that sums up the MEWN stack application folks. I know I didn't cover all the code but I've provided plenty of links to my repo with the application. I hope I've demonstrated that working with web components in an Node/Express/Mongo context is really straight forward. I hope to see the term MEWN catch on one day!. 
