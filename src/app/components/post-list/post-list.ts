import { Component, inject, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PostMeta } from '../../models/post';
import { PostStore } from '../../services/post-store';

@Component({
  selector: 'app-post-list',
  imports: [RouterLink, DatePipe],
  templateUrl: './post-list.html',
  styleUrl: './post-list.scss',
})
export class PostList {
  private readonly store = inject(PostStore);

  readonly posts = input.required<PostMeta[]>();
  readonly emptyMessage = input('Nothing published yet.');

  /** Hidden on a category archive, where every post would repeat the same label. */
  readonly showCategories = input(true);

  protected label(slug: string): string {
    return this.store.category(slug)?.label ?? slug;
  }
}
