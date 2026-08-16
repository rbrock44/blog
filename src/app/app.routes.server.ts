import { RenderMode, ServerRoute } from '@angular/ssr';
import { POSTS } from './data/posts';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'posts/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => POSTS.map((post) => ({ slug: post.slug })),
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
