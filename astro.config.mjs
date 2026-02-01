// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	site: 'https://hasanirogers.me',
	integrations: [mdx(), sitemap()],
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  server: {
    port: 4322
  },
  redirects: {
    '/blog/its-time-to-get-comfortable-with-web-standards-again/': 'https://deificarts.com/blog/its-time-to-get-comfortable-with-web-standards-again',
    '/blog/web-components-and-ssr-with-nextjs/': 'https://deificarts.com/blog/web-components-and-ssr-with-nextjs',
    '/blog/lit-and-state-management-with-zustand/': 'https://deificarts.com/blog/lit-and-state-management-with-zustand',
    '/blog/new-blog-design/': 'https://deificarts.com/blog/new-blog-design',
    '/blog/the-new-bem-for-custom-elements-cea/': 'https://deificarts.com/blog/the-new-bem-for-custom-elements-cea',
    '/blog/mewn-stack-with-shoelace/': 'https://deificarts.com/blog/mewn-stack-with-shoelace',
    '/blog/material-web-components-building-forms/': 'https://deificarts.com/blog/material-web-components-building-forms',
    '/blog/how-to-integrate-tailwind-in-a-litelement-app/': 'https://deificarts.com/blog/how-to-integrate-tailwind-in-a-litelement-app',
    '/blog/css-grid-templates/': 'https://deificarts.com/blog/css-grid-templates',
    '/blog/using-redux-with-litelement/': 'https://deificarts.com/blog/using-redux-with-litelement',
    '/blog/web-app-with-wordpress-and-litelement/': 'https://deificarts.com/blog/web-app-with-wordpress-and-litelement',
    '/blog/react-and-web-components/': 'https://deificarts.com/blog/react-and-web-components',
    '/blog/adding-search-functionality-with-lit-element-and-algolia/': 'https://deificarts.com/blog/adding-search-functionality-with-lit-element-and-algolia',
    '/blog/automating-jekyll-deploys-through-sftp-and-travis-ci/': 'https://deificarts.com/blog/automating-jekyll-deploys-through-sftp-and-travis-ci',
    '/blog/how-to-create-dark-mode-using-lit-element/': 'https://deificarts.com/blog/how-to-create-dark-mode-using-lit-element',
    '/blog/': 'https://deificarts.com/blog/'
  }
});
