import { TestBed } from '@angular/core/testing';
import { PostStore } from './post-store';

describe('PostStore', () => {
  let store: PostStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(PostStore);
  });

  it('should return posts newest first', () => {
    const dates = store.all().map((post) => post.date);
    const sorted = [...dates].sort((a, b) => b.localeCompare(a));
    expect(dates).toEqual(sorted);
  });

  it('should find a post by slug', () => {
    const first = store.all()[0];
    expect(store.bySlug(first.slug)).toBe(first);
  });

  it('should return undefined for an unknown slug', () => {
    expect(store.bySlug('does-not-exist')).toBeUndefined();
  });
});
