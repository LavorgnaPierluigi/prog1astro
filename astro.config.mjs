// @ts-check
import { defineConfig } from 'astro/config';

const suGitHubPages = Boolean(process.env.GITHUB_ACTIONS);

// https://astro.build/config
export default defineConfig({
  site: 'https://lavorgnapierluigi.github.io',
  base: suGitHubPages ? '/prog1astro' : '/',
  devToolbar: {
    enabled: false,
  },
});
