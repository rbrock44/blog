import { Component, computed, inject, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PostList } from '../../components/post-list/post-list';
import { PostSearch } from '../../components/post-search/post-search';
import { PostStore } from '../../services/post-store';
import { Seo } from '../../services/seo';

@Component({
  selector: 'app-home',
  imports: [PostList, PostSearch, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly store = inject(PostStore);
  private readonly search = viewChild(PostSearch);

  protected readonly tags = this.store.tags();

  /**
   * Falls back to every post whenever the search box is empty, which is also the
   * state the page prerenders in — so the full list is in the static HTML.
   */
  protected readonly posts = computed(() => this.search()?.results() ?? this.store.all());

  constructor() {
    inject(Seo).setDefault();
  }
}
