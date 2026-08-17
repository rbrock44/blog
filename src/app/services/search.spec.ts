import { TestBed } from '@angular/core/testing';
import { Search, SearchEntry } from './search';

const entries: SearchEntry[] = [
  {
    slug: 'angular-prerendering',
    title: 'Angular Prerendering',
    date: '2026-02-01',
    description: 'Turning a SPA into static HTML.',
    categories: ['tech'],
    tags: ['angular', 'ssg'],
    readingTime: 6,
    body: 'Prerendering writes an index.html per route at build time.',
  },
  {
    slug: 'cloudflare-workers',
    title: 'Counting Views',
    date: '2026-01-01',
    description: 'A tiny worker and a KV namespace.',
    categories: ['tech'],
    tags: ['cloudflare'],
    readingTime: 3,
    body: 'Workers run at the edge with no cold start worth worrying about.',
  },
];

describe('Search', () => {
  let search: Search;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    search = TestBed.inject(Search);
  });

  it('should return nothing for an empty term', () => {
    expect(search.query(entries, '   ')).toEqual([]);
  });

  it('should match on title', () => {
    expect(search.query(entries, 'prerendering').map((e) => e.slug)).toEqual([
      'angular-prerendering',
    ]);
  });

  it('should match on tag', () => {
    expect(search.query(entries, 'cloudflare').map((e) => e.slug)).toEqual(['cloudflare-workers']);
  });

  it('should match on body text', () => {
    expect(search.query(entries, 'edge').map((e) => e.slug)).toEqual(['cloudflare-workers']);
  });

  it('should rank a title hit above a body-only hit', () => {
    const results = search.query(entries, 'views workers');
    expect(results[0].slug).toBe('cloudflare-workers');
  });

  it('should require every word to appear somewhere', () => {
    expect(search.query(entries, 'angular kubernetes')).toEqual([]);
  });

  it('should ignore case', () => {
    expect(search.query(entries, 'ANGULAR').length).toBe(1);
  });

  it('should match on category', () => {
    expect(search.query(entries, 'tech').length).toBe(2);
  });
});
