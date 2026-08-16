import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { PostStore } from '../../services/post-store';
import { Post } from '../../models/post';

/**
 * Resolves the post before the route activates so its HTML is present in the
 * prerendered output rather than appearing after hydration.
 */
export const postResolver: ResolveFn<Post | undefined> = (route) => {
  const slug = route.paramMap.get('slug') ?? '';
  return inject(PostStore).bySlug(slug);
};
