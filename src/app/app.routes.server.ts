import { RenderMode, ServerRoute } from '@angular/ssr';
import { POSTS_INDEX } from './data/generated/posts-index';

const tags = [...new Set(POSTS_INDEX.flatMap((post) => post.tags))].sort();
const categories = [...new Set(POSTS_INDEX.flatMap((post) => post.categories))].sort();

export const serverRoutes: ServerRoute[] = [
  {
    path: 'posts/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => POSTS_INDEX.map((post) => ({ slug: post.slug })),
  },
  {
    path: 'categories/:category',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => categories.map((category) => ({ category })),
  },
  {
    path: 'tags/:tag',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => tags.map((tag) => ({ tag })),
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
