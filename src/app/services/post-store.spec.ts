import { TestBed } from '@angular/core/testing';
import { PostStore } from './post-store';

describe('PostStore', () => {
  let store: PostStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(PostStore);
  });

  it('should publish at least one post', () => {
    expect(store.all().length).toBeGreaterThan(0);
  });

  it('should order posts newest first', () => {
    const dates = store.all().map((post) => post.date);
    expect(dates).toEqual([...dates].sort((a, b) => b.localeCompare(a)));
  });

  it('should give every post the required metadata', () => {
    for (const post of store.all()) {
      expect(post.slug).toBeTruthy();
      expect(post.title).toBeTruthy();
      expect(post.description).toBeTruthy();
      expect(post.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(post.readingTime).toBeGreaterThan(0);
    }
  });

  it('should find metadata by slug', () => {
    const first = store.all()[0];
    expect(store.metaBySlug(first.slug)).toEqual(first);
  });

  it('should load a post body by slug', async () => {
    const first = store.all()[0];
    const post = await store.bySlug(first.slug);
    expect(post?.html).toContain('<');
  });

  it('should resolve undefined for an unknown slug', async () => {
    expect(store.metaBySlug('does-not-exist')).toBeUndefined();
    expect(await store.bySlug('does-not-exist')).toBeUndefined();
  });

  it('should list tags unique and sorted', () => {
    const tags = store.tags();
    expect(tags).toEqual([...new Set(tags)].sort());
  });

  it('should return only posts carrying a tag', () => {
    for (const tag of store.tags()) {
      const tagged = store.byTag(tag);
      expect(tagged.length).toBeGreaterThan(0);
      expect(tagged.every((post) => post.tags.includes(tag))).toBe(true);
    }
  });

  it('should return nothing for an unused tag', () => {
    expect(store.byTag('not-a-real-tag')).toEqual([]);
  });
});
