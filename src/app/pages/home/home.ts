import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PostList } from '../../components/post-list/post-list';
import { PostStore } from '../../services/post-store';
import { Seo } from '../../services/seo';

@Component({
  selector: 'app-home',
  imports: [PostList, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly store = inject(PostStore);

  protected readonly posts = this.store.all();
  protected readonly tags = this.store.tags();

  constructor() {
    inject(Seo).setDefault();
  }
}
