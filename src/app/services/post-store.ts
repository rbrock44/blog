import { Injectable } from '@angular/core';
import { POSTS } from '../data/posts';
import { Post } from '../models/post';

@Injectable({ providedIn: 'root' })
export class PostStore {
  private readonly posts = [...POSTS].sort((a, b) => b.date.localeCompare(a.date));

  all(): Post[] {
    return this.posts;
  }

  bySlug(slug: string): Post | undefined {
    return this.posts.find((post) => post.slug === slug);
  }
}
