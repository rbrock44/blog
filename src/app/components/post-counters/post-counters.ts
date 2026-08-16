import { Component, PLATFORM_ID, inject, input, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SITE } from '../../config/site';

interface Counts {
  views: number;
  likes: number;
  liked: boolean;
}

/**
 * Views and likes from the Cloudflare worker. Every failure path is silent: an
 * outage, a blocked request or an unconfigured countersApi all render nothing,
 * because a counter problem must never look like a broken post.
 */
@Component({
  selector: 'app-post-counters',
  templateUrl: './post-counters.html',
  styleUrl: './post-counters.scss',
})
export class PostCounters {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly api = SITE.countersApi?.replace(/\/$/, '') ?? '';

  readonly slug = input.required<string>();

  protected readonly counts = signal<Counts | null>(null);
  protected readonly busy = signal(false);

  constructor() {
    if (this.isBrowser && this.api) {
      queueMicrotask(() => void this.registerView());
    }
  }

  private async registerView(): Promise<void> {
    const counts = await this.request(`/api/counts/${this.slug()}`, 'GET');
    if (counts) {
      this.counts.set(counts);
    }

    // Fire and forget — the worker decides whether this visit actually counts.
    const bumped = await this.request(`/api/views/${this.slug()}`, 'POST');
    if (bumped) {
      this.counts.update((current) => (current ? { ...current, views: bumped.views } : current));
    }
  }

  protected async toggleLike(): Promise<void> {
    if (this.busy()) {
      return;
    }

    this.busy.set(true);
    const result = await this.request(`/api/likes/${this.slug()}`, 'POST');
    this.busy.set(false);

    if (result) {
      this.counts.update((current) =>
        current ? { ...current, likes: result.likes, liked: result.liked } : current,
      );
    }
  }

  private async request(path: string, method: 'GET' | 'POST'): Promise<Counts | null> {
    try {
      const response = await fetch(`${this.api}${path}`, { method });
      return response.ok ? await response.json() : null;
    } catch {
      return null;
    }
  }
}
