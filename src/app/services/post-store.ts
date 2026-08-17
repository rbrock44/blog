import { Injectable } from '@angular/core';
import { POSTS_INDEX } from '../data/generated/posts-index';
import { POST_BODIES } from '../data/generated/post-bodies';
import { SITE } from '../config/site';
import { Category, Post, PostMeta } from '../models/post';

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

  byTag(tag: string): PostMeta[] {
    return POSTS_INDEX.filter((post) => post.tags.includes(tag));
  }

  /** Only categories that actually have posts, in the order site.config.json lists them. */
  categories(): Category[] {
    return SITE.categories.filter((category) =>
      POSTS_INDEX.some((post) => post.categories.includes(category.slug)),
    );
  }

  category(slug: string): Category | undefined {
    return SITE.categories.find((category) => category.slug === slug);
  }

  byCategory(slug: string): PostMeta[] {
    return POSTS_INDEX.filter((post) => post.categories.includes(slug));
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
