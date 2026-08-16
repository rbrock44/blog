import { Component, computed, effect, inject, input } from '@angular/core';
import { PostList } from '../../components/post-list/post-list';
import { PostStore } from '../../services/post-store';
import { Seo } from '../../services/seo';

@Component({
  selector: 'app-tag',
  imports: [PostList],
  templateUrl: './tag.html',
})
export class TagPage {
  private readonly store = inject(PostStore);

  readonly tag = input.required<string>();

  protected readonly posts = computed(() => this.store.byTag(this.tag()));

  constructor() {
    const seo = inject(Seo);
    effect(() => seo.setTag(this.tag(), this.posts().length));
  }
}
