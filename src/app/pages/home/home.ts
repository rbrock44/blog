import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PostStore } from '../../services/post-store';
import { Seo } from '../../services/seo';

@Component({
  selector: 'app-home',
  imports: [RouterLink, DatePipe],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected readonly posts = inject(PostStore).all();

  constructor() {
    inject(Seo).setDefault();
  }
}
