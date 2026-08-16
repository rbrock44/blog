import {
  AfterViewInit,
  Component,
  ElementRef,
  PLATFORM_ID,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SITE } from '../../config/site';

/**
 * giscus stores comments as GitHub Discussions, so there is no backend and no spam
 * to moderate — the tradeoff is that commenting requires a GitHub account.
 *
 * Renders nothing until giscus.repoId and giscus.categoryId are filled in from
 * https://giscus.app, and never runs during prerendering.
 */
@Component({
  selector: 'app-comments',
  template: `
    @if (configured) {
      <section class="comments">
        <h2>Comments</h2>
        <div #container></div>
      </section>
    }
  `,
  styleUrl: './comments.scss',
})
export class Comments implements AfterViewInit {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly container = viewChild<ElementRef<HTMLElement>>('container');

  readonly slug = input.required<string>();

  protected readonly configured = Boolean(SITE.giscus?.repoId && SITE.giscus?.categoryId);

  ngAfterViewInit(): void {
    const host = this.container()?.nativeElement;
    if (!this.isBrowser || !this.configured || !host || host.childElementCount) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.crossOrigin = 'anonymous';

    Object.entries({
      'data-repo': SITE.giscus.repo,
      'data-repo-id': SITE.giscus.repoId,
      'data-category': SITE.giscus.category,
      'data-category-id': SITE.giscus.categoryId,
      'data-mapping': 'specific',
      'data-term': this.slug(),
      'data-reactions-enabled': '1',
      'data-emit-metadata': '0',
      'data-input-position': 'top',
      'data-theme': 'preferred_color_scheme',
      'data-lang': SITE.language,
      'data-loading': 'lazy',
    }).forEach(([key, value]) => script.setAttribute(key, value));

    host.appendChild(script);
  }
}
