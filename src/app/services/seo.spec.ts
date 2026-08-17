import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Seo } from './seo';
import { SITE } from '../config/site';
import { PostMeta } from '../models/post';

const post: PostMeta = {
  slug: 'a-post',
  title: 'A Post',
  date: '2026-01-02',
  description: 'What the post is about.',
  categories: ['tech'],
  tags: ['angular'],
  readingTime: 4,
};

describe('Seo', () => {
  let seo: Seo;
  let meta: Meta;
  let title: Title;
  let document: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    seo = TestBed.inject(Seo);
    meta = TestBed.inject(Meta);
    title = TestBed.inject(Title);
    document = TestBed.inject(DOCUMENT);
  });

  it('should title a post and describe it for search results', () => {
    seo.setPost(post);
    expect(title.getTitle()).toBe(`A Post — ${SITE.title}`);
    expect(meta.getTag("name='description'")?.content).toBe(post.description);
  });

  it('should give a post an absolute canonical url', () => {
    seo.setPost(post);
    const href = document.head.querySelector("link[rel='canonical']")?.getAttribute('href');
    expect(href).toBe(`${SITE.url}/posts/a-post`);
  });

  it('should set a large summary card so shared links unfurl with an image', () => {
    seo.setPost(post);
    expect(meta.getTag("name='twitter:card'")?.content).toBe('summary_large_image');
    expect(meta.getTag("property='og:image'")?.content).toBe(`${SITE.url}/og/a-post.png`);
  });

  it('should prefer an explicit ogImage when the post supplies one', () => {
    seo.setPost({ ...post, ogImage: '/og/custom.png' });
    expect(meta.getTag("property='og:image'")?.content).toBe(`${SITE.url}/og/custom.png`);
  });

  it('should emit BlogPosting structured data for a post', () => {
    seo.setPost(post);
    const script = document.head.querySelector('script#ld-json');
    const data = JSON.parse(script?.textContent ?? '{}');
    expect(data['@type']).toBe('BlogPosting');
    expect(data.headline).toBe('A Post');
    expect(data.dateModified).toBe(post.date);
  });

  it('should drop the modified time when a post has not been updated', () => {
    seo.setPost({ ...post, updated: '2026-03-04' });
    expect(meta.getTag("property='article:modified_time'")?.content).toBe('2026-03-04');

    seo.setPost(post);
    expect(meta.getTag("property='article:modified_time'")).toBeNull();
  });

  it('should describe a category archive with its own description', () => {
    const category = {
      slug: 'woodworking',
      label: 'Woodworking',
      description: 'Projects from the shop.',
    };
    seo.setCategory(category, 3);

    expect(title.getTitle()).toBe(`Woodworking — ${SITE.title}`);
    expect(meta.getTag("name='description'")?.content).toBe(category.description);

    const data = JSON.parse(document.head.querySelector('script#ld-json')?.textContent ?? '{}');
    expect(data['@type']).toBe('CollectionPage');
    expect(data.numberOfItems).toBe(3);
  });

  it('should switch back to site-level tags on the home page', () => {
    seo.setPost(post);
    seo.setDefault();

    expect(meta.getTag("property='og:type'")?.content).toBe('website');
    const data = JSON.parse(document.head.querySelector('script#ld-json')?.textContent ?? '{}');
    expect(data['@type']).toBe('Blog');
  });

  it('should only ever keep one canonical link and one ld+json block', () => {
    seo.setPost(post);
    seo.setDefault();
    seo.setPost(post);

    expect(document.head.querySelectorAll("link[rel='canonical']").length).toBe(1);
    expect(document.head.querySelectorAll('script#ld-json').length).toBe(1);
  });
});
