import { RenderMode, ServerRoute } from '@angular/ssr';
import { POSTS_INDEX } from './data/generated/posts-index';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'posts/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => POSTS_INDEX.map((post) => ({ slug: post.slug })),
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
