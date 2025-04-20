---
title: Search functionality with LitElement and Algolia
date: 2020-09-08
author: Hasani Rogers
tags:
- post 
- lit
- algolia
- search
excerpt: Adding search functionality to your site might seem like a complicated feature. With LitElement and Algolia working together however, it's pretty easy. Lets break down how to do this!
---

What is Algolia? Algolia is a [service](https://www.algolia.com/users/sign_up) you sign up for that handles search data. Don't worry they have a [free plan](https://www.algolia.com/pricing/) for those of you with simple needs. The Algolia service is used along side of [algoliasearch](https://www.npmjs.com/package/algoliasearch) and [instantsearch](https://www.npmjs.com/package/instantsearch.js) plugins. Instantsearch.js is part of a library of plugins that can be used with React, Angular, Vue, etc. In this post, we'll be using LitElement without Instantsearch.js.

Before we start I need to state that this blog is built with Jekyll. My experience with Algolia is a in a Jekyll environment. So I'm going to write from the perspective of using Jekyll. Regardless, before we dive into the code, you should know that you are responsible for getting data from your site to Algolia. In Algolia this is called indexing. To index content for Jekyll, [follow this guide](https://community.algolia.com/jekyll-algolia/getting-started.html). If you're not using Jekyll, you need to find the appropriate way to [send your data to Algolia](https://www.algolia.com/doc/guides/sending-and-managing-data/send-and-update-your-data/). For example, there is an [Algolia Gatsby plugin](https://github.com/algolia/gatsby-plugin-algolia) for you Gatsby users (although at the time of this writting it's in beta). Algolia also [walks you through using it with WordPress](https://www.algolia.com/doc/integration/wordpress/getting-started/quick-start/?language=php).

With that said lets begin.

We're going to be creating search functionality that behaves like this blog. This blog uses [kemet-modal](https://storybook.kemet.dev/?path=/docs/components-modal--documentation) to display a search box when users click on the search icon. I won't break down the modal here (read the Kemet docs if interested) but we'll be starting with a LitElement component called `blog-searchmodal`.

The skeleton of our component looks like this:

```javascript
import { LitElement, html, css } from 'lit-element';
import algoliasearch from 'algoliasearch';

export class BlogSearchmodal extends LitElement {
  static get properties() {
    return {
      hits: {
        // the number of hits returned from algoliasearch
        type: Array,
      },
      hasSearched: {
        // a flag that stores whether or not the user has started searching
        type: Boolean
      },
      currentPage: {
        // the current page in the algoliasearch
        type: Number
      },
      totalPages: {
        // the total amount of pages in the algoliasearch
        type: Number
      }
    }
  }

  constructor() {
    super();

    // default values
    this.hits = [];
    this.hasSearched = false;
    this.currentPage = 0;
  }

  static styles = [
    css`
      // We won't cover styles here. They are super basic. Style it however you like.
    `
  ];

  render() {
    return html`
      <form @submit=${(event) => this.handleSearch(event)}>
        <label for="searchposts">Search:</label>
        <div>
          <input
            type="search"
            id="searchposts"
            name="searchposts"
            placeholder="Search for posts here"
            @keydown=${(event) => this.handleSearch(event)}
            @blur=${(event) => this.handleSearch(event)}/>
        </div>
      </form>
      <section>
        ${this.makePosts()}
        ${this.morePostsBtn()}
      </section>
    `;
  }

  handleSearch(event, isLoadMore = false) {
    // the meat of our search, perform and Algolia search and assign data to our hits property
  }

  formatDate(timestamp) {
    // formats the timestamp give by Algolia into a human readable date
  }

  makePosts() {
    // generated each post based on hit data from Algolia
  }

  makeTagLinks(tags) {
    // generates a list of tags based on Aloglia data
  }

  tagLink(event, tag) {
    // generates a link to a tag page and pushes to history state
  }

  loadMorePosts(event) {
    // handles what happens when load more post button is clicked
  }

  morePostsBtn() {
    // conditionally display the load more post button
  }
}
```

Before you start be sure to install alogliasearch as a npm dependency.

```bash
npm install algoliasearch --save
```

The most important method here is our `handleSearch` method. This is what actually makes the call to Algolia's API and return data. You handle this much like you'd handle a fetch. You get data returned to you from a promise. That data contains things like the total number of pages, an array of objects for our hits, etc. Lets break it down.

```javascript
handleSearch(event, isLoadMore = false) {
  // we want to stop the reloading behavior of submit if the search is triggered by the submit event
  if (event.type === 'submit') event.preventDefault();

  const searchTerm = this.shadowRoot.getElementById('searchposts').value;
  const client = algoliasearch('YOUR APP ID HERE', 'YOUR SEARCH-ONLY API Key Here');
  const index = client.initIndex('YOUR INDEX HERE');
  const attributes = [
    'headings',
    'content',
    'author',
    'title',
    'tags',
    'type',
    'date',
    'url'
  ];

  index.search(searchTerm, {
    // you can find these attributes in your 'indices' page at Algolia
    attributesToRetrieve: attributes,

    // change this to whatever you like
    hitsPerPage: 5,

    // we keep track of what page we're on with our currentPage property
    page: this.currentPage
  }).then((data) => { // we get back data from the search
    // nbPages is the total number of pages the search has
    this.totalPages = data.nbPages;
    
    if (searchTerm.length > 1) {
      // consider it a search if the user typed two or more characters
      this.hasSearched = true;

      if (isLoadMore) {
        // load more means to add to the array of hits
        this.hits = this.hits.concat(data.hits);
      } else {
        // if it's not load more then reset the hits to what's return from Algolia
        this.hits = data.hits;
      }
    } else {
      this.hasSearched = false;
      this.hits = [];
    }
  });
}
```

I've decided to explain most of this with comments in the code. I think it's just clearer that way. The most important thing to know is what `isLoadMore` is for. We set it to false by default, however when we call our `loadMorePosts` method we set it to true. The reason is because while fetching more posts we `concat` to our existing hits because we want to keep building on the hits. But if it's a regular search we want to reset the hits to whatever Algolia returns. That leads use to our `loadMorePosts` method. It's easy:

```javascript
loadMorePosts(event) {
  // only load more posts if the current page is less than or equal to the total number of pages
  if (this.currentPage <= this.totalPages) {
    // increase currentPage by 1 every time this is called
    this.currentPage = this.currentPage += 1;

    // this is where we set isLoadMore to true
    this.handleSearch(event, true);
  }
}
```

The `loadMorePosts` method is a click handler for our button, which is generated with `morePostsBtn`; 

```javascript
morePostsBtn() {
  if (this.hasSearched && this.currentPage < this.totalPages - 1) {
    return html`
      <a class="more-posts" @click=${(event) => this.loadMorePosts(event)}>More Posts</a>
    `;
  }

  // if the above condition is not met, return nothing
  return null;
}
```

We only want to show the button under two conditions. 

1. The user has started a search.
2. There's more posts to load.

This is what our condition on line 2 handles.

Now that we have hits stored in our `hits` property we can map through them and generate the markup for each posts with a method called `makePosts`.

```javascript
makePosts() {
  // if we have hits...
  if (this.hits.length > 0) {
    return this.hits.map((hit) =>{
      // and if the hit is a post...
      if (hit.type === 'post') {
        return html`
          <article>
            <a href=${hit.url}>
              <h2>${hit.title}</h2>
              by ${hit.author} on ${this.formatDate(hit.date)}.
            </a>
            <ul>
              <li>tags:</li>
              ${this.makeTagLinks(hit.tags)}
            </ul>
          </article>
        `
      }
    });
  }

  // if length (implicitly) is less than 0 and they've searched for something show an error message
  if (this.hasSearched) {
    return html`<p>What was that? Try searching again.</p>`;
  }
}
```

Remember those attributes from earlier? They're in our hit object now as properties so we can do things like `hit.type` because we requested to include it. In my blog we only want to search posts. Hence line 6. You don't have to include this on your site however. You can show pages, collections, or any type if you wish. Notice that we have the methods `formatDate` and `makeTagLinks` here. Algolia gives us back a timestamp which needs to be converted to a date. It also gives us an array of tags associated with the post which need to have a template generated for it.

```javascript
formatDate(timestamp) {
  // note that the timestamp is in seconds, which we convert to milliseconds by multiplying it by 1000
  const postdate = new Date(timestamp*1000);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  const month = months[postdate.getMonth()];
  const day = postdate.getUTCDay();
  const year = postdate.getUTCFullYear();

  return `${month} ${day}, ${year}`;
}

makeTagLinks(tags) {
  if (tags.length > 0) {
    return tags.map((tag) => {
      return html`
        <li><a @click=${(event) => this.tagLink(event, tag)}>${tag}</a></li>
      `;
    })
  }

  return html`<li>no tags</li>`;
}
```

The date formatting is [standard date stuff in Javascript](https://www.w3schools.com/jsref/jsref_obj_date.asp). As for the tags, we map through them and return an `<li>` with an anchor for each tag. Notice that instead of generating a url for the href attribute we have a click handler? Thought that was weird? I do too. But it's necessary because of how tags work in Jekyll. To summarize, when we go to a tag page in Jekyll we're actually listing posts for all tags then filtering them by hash with javascript since Jekyll can't do this itself. Since this operation works by hash links, if you're on a tag page while searching, you need to manually reload the page. It's hacky but it's the only solution I could come up with. Anyways, this is our `tagLink` method:

```javascript
tagLink(event, tag) {
  event.preventDefault();
  history.pushState(null, null, `/tag/#${tag}`);

  // if we're on a tag page, manually reload after pushing history
  if (location.pathname === '/tag/') location.reload();
}
```

And there you go. Search functionality with LitElement and Algolia. Checkout my repo if you want to see [the full implementation](https://github.com/hasanirogers/blog/blob/master/components/blog-searchmodal/src/BlogSearchmodal.js).
