import { Component, inject, signal } from '@angular/core';
import { PostMeta } from '../../models/post';
import { Search } from '../../services/search';

@Component({
  selector: 'app-post-search',
  templateUrl: './post-search.html',
  styleUrl: './post-search.scss',
})
export class PostSearch {
  private readonly search = inject(Search);

  /** null means "not searching" — the caller shows its normal list instead. */
  readonly results = signal<PostMeta[] | null>(null);
  protected readonly term = signal('');

  protected async onInput(value: string): Promise<void> {
    this.term.set(value);

    if (!value.trim()) {
      this.results.set(null);
      return;
    }

    const entries = await this.search.load();

    // The box may have moved on while the index was downloading.
    if (this.term() === value) {
      this.results.set(this.search.query(entries, value));
    }
  }

  protected clear(): void {
    this.term.set('');
    this.results.set(null);
  }

  /** Warms the index on focus so the first keystroke feels instant. */
  protected prefetch(): void {
    void this.search.load();
  }
}
