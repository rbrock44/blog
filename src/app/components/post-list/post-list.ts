import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PostMeta } from '../../models/post';

@Component({
  selector: 'app-post-list',
  imports: [RouterLink, DatePipe],
  templateUrl: './post-list.html',
  styleUrl: './post-list.scss',
})
export class PostList {
  readonly posts = input.required<PostMeta[]>();
  readonly emptyMessage = input('Nothing published yet.');
}
