import { DOCUMENT, Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { SITE } from '../config/site';
import { PostMeta } from '../models/post';

const JSON_LD_ID = 'ld-json';

@Injectable({ providedIn: 'root' })
export class Seo {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  /** Head tags for the home page and anything else that is not a single post. */
  setDefault(path = '/'): void {
    this.apply({
      title: `${SITE.title} — ${SITE.tagline}`,
      description: SITE.description,
      path,
      type: 'website',
      image: `${SITE.url}/og/default.png`,
    });
    this.setJsonLd({
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: SITE.title,
      description: SITE.description,
      url: SITE.url,
      author: { '@type': 'Person', name: SITE.author },
    });
  }

  /** Head tags for a tag archive. Indexable, but never the canonical home of a post. */
  setTag(tag: string, count: number): void {
    this.apply({
      title: `Posts tagged “${tag}” — ${SITE.title}`,
      description: `${count} post${count === 1 ? '' : 's'} tagged “${tag}” on ${SITE.title}.`,
      path: `/tags/${tag}`,
      type: 'website',
      image: `${SITE.url}/og/default.png`,
    });
    this.setJsonLd({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `Posts tagged “${tag}”`,
      url: `${SITE.url}/tags/${tag}`,
    });
  }

  /** Head tags for a single post, including the card a shared link unfurls into. */
  setPost(post: PostMeta): void {
    const url = `${SITE.url}/posts/${post.slug}`;
    const image = post.ogImage
      ? new URL(post.ogImage, `${SITE.url}/`).toString()
      : `${SITE.url}/og/${post.slug}.png`;

    this.apply({
      title: `${post.title} — ${SITE.title}`,
      description: post.description,
      path: `/posts/${post.slug}`,
      type: 'article',
      image,
    });

    this.meta.updateTag({ property: 'article:published_time', content: post.date });
    if (post.updated) {
      this.meta.updateTag({ property: 'article:modified_time', content: post.updated });
    } else {
      this.meta.removeTag("property='article:modified_time'");
    }
    this.meta.updateTag({ property: 'article:author', content: SITE.author });

    this.setJsonLd({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      dateModified: post.updated ?? post.date,
      keywords: post.tags.join(', '),
      image,
      url,
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      author: { '@type': 'Person', name: SITE.author },
      publisher: { '@type': 'Person', name: SITE.author },
    });
  }

  private apply(options: {
    title: string;
    description: string;
    path: string;
    type: string;
    image: string;
  }): void {
    const url = `${SITE.url}${options.path}`;

    this.title.setTitle(options.title);
    this.meta.updateTag({ name: 'description', content: options.description });

    this.meta.updateTag({ property: 'og:site_name', content: SITE.title });
    this.meta.updateTag({ property: 'og:type', content: options.type });
    this.meta.updateTag({ property: 'og:title', content: options.title });
    this.meta.updateTag({ property: 'og:description', content: options.description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:image', content: options.image });
    this.meta.updateTag({ property: 'og:locale', content: SITE.locale });

    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: options.title });
    this.meta.updateTag({ name: 'twitter:description', content: options.description });
    this.meta.updateTag({ name: 'twitter:image', content: options.image });

    this.setCanonical(url);
  }

  private setCanonical(url: string): void {
    const head = this.document.head;
    let link = head.querySelector<HTMLLinkElement>("link[rel='canonical']");

    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      head.appendChild(link);
    }

    link.setAttribute('href', url);
  }

  private setJsonLd(data: unknown): void {
    const head = this.document.head;
    let script = head.querySelector<HTMLScriptElement>(`script#${JSON_LD_ID}`);

    if (!script) {
      script = this.document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('id', JSON_LD_ID);
      head.appendChild(script);
    }

    script.textContent = JSON.stringify(data);
  }
}
