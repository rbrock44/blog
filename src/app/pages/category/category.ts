import { Component, computed, effect, inject, input } from '@angular/core';
import { PostList } from '../../components/post-list/post-list';
import { PostStore } from '../../services/post-store';
import { Seo } from '../../services/seo';

@Component({
  selector: 'app-category',
  imports: [PostList],
  templateUrl: './category.html',
  styleUrl: './category.scss',
})
export class CategoryPage {
  private readonly store = inject(PostStore);

  readonly category = input.required<string>();

  protected readonly details = computed(() => this.store.category(this.category()));
  protected readonly posts = computed(() => this.store.byCategory(this.category()));

  constructor() {
    const seo = inject(Seo);

    effect(() => {
      const details = this.details();
      if (details) {
        seo.setCategory(details, this.posts().length);
      }
    });
  }
}
