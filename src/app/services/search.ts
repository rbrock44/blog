import { Injectable } from '@angular/core';

export interface SearchEntry {
  slug: string;
  title: string;
  date: string;
  description: string;
  categories: string[];
  tags: string[];
  readingTime: number;
  body: string;
}

const WEIGHTS = { title: 8, category: 6, tag: 5, description: 3, body: 1 };

@Injectable({ providedIn: 'root' })
export class Search {
  private entries: SearchEntry[] | null = null;
  private pending: Promise<SearchEntry[]> | null = null;

  /** Fetched once, on first use, so the index never lands in the initial bundle. */
  load(): Promise<SearchEntry[]> {
    if (this.entries) {
      return Promise.resolve(this.entries);
    }

    this.pending ??= fetch('/search-index.json')
      .then((response) => (response.ok ? response.json() : []))
      .then((entries: SearchEntry[]) => {
        this.entries = entries;
        return entries;
      })
      .catch(() => {
        this.pending = null;
        return [];
      });

    return this.pending;
  }

  query(entries: SearchEntry[], term: string): SearchEntry[] {
    const words = term.toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) {
      return [];
    }

    return entries
      .map((entry) => ({ entry, score: this.score(entry, words) }))
      .filter((result) => result.score > 0)
      .sort((a, b) => b.score - a.score || b.entry.date.localeCompare(a.entry.date))
      .map((result) => result.entry);
  }

  /** Every word has to appear somewhere, so multi-word searches narrow rather than widen. */
  private score(entry: SearchEntry, words: string[]): number {
    const title = entry.title.toLowerCase();
    const description = entry.description.toLowerCase();
    const body = entry.body.toLowerCase();
    const tags = entry.tags.map((tag) => tag.toLowerCase());
    const categories = entry.categories.map((category) => category.toLowerCase());

    let total = 0;

    for (const word of words) {
      let wordScore = 0;

      if (title.includes(word)) {
        wordScore += WEIGHTS.title;
      }
      if (categories.some((category) => category.includes(word))) {
        wordScore += WEIGHTS.category;
      }
      if (tags.some((tag) => tag.includes(word))) {
        wordScore += WEIGHTS.tag;
      }
      if (description.includes(word)) {
        wordScore += WEIGHTS.description;
      }
      if (body.includes(word)) {
        wordScore += WEIGHTS.body;
      }

      if (wordScore === 0) {
        return 0;
      }

      total += wordScore;
    }

    return total;
  }
}
