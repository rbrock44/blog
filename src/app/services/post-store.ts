import { Injectable } from '@angular/core';
import { POSTS_INDEX } from '../data/generated/posts-index';
import { POST_BODIES } from '../data/generated/post-bodies';
import { Post, PostMeta } from '../models/post';

@Injectable({ providedIn: 'root' })
export class PostStore {
  all(): PostMeta[] {
    return POSTS_INDEX;
  }

  metaBySlug(slug: string): PostMeta | undefined {
    return POSTS_INDEX.find((post) => post.slug === slug);
  }

  tags(): string[] {
    return [...new Set(POSTS_INDEX.flatMap((post) => post.tags))].sort();
  }

  /** Pulls in the post's body chunk. Resolves to undefined for an unknown slug. */
  async bySlug(slug: string): Promise<Post | undefined> {
    const meta = this.metaBySlug(slug);
    const loadBody = POST_BODIES[slug];
    if (!meta || !loadBody) {
      return undefined;
    }

    return { ...meta, html: (await loadBody()).default };
  }
}
