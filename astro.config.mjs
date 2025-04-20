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
  }
});
