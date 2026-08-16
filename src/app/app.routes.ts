import { Routes } from '@angular/router';
import { postResolver } from './pages/post/post.resolver';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'posts/:slug',
    loadComponent: () => import('./pages/post/post').then((m) => m.PostPage),
    resolve: { post: postResolver },
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
  },
];
