import { Post } from '../models/post';

// Placeholder content. Replaced by the generated posts.json in the content pipeline.
export const POSTS: Post[] = [
  {
    slug: 'hello-world',
    title: 'Hello World',
    date: '2026-08-16',
    description: 'First post, mostly here to prove the prerender pipeline puts real HTML on disk.',
    tags: ['meta'],
    readingTime: 1,
    html: '<p>If you can read this in view-source without JavaScript running, the build is doing its job.</p>',
  },
];
