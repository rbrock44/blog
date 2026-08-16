import { Component, computed, inject, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { PostStore } from '../../services/post-store';

@Component({
  selector: 'app-post',
  imports: [DatePipe],
  templateUrl: './post.html',
  styleUrl: './post.scss',
})
export class PostPage {
  private readonly store = inject(PostStore);
  private readonly sanitizer = inject(DomSanitizer);

  readonly slug = input.required<string>();

  protected readonly post = computed(() => this.store.bySlug(this.slug()));

  // Post HTML is rendered by our own build script from markdown we author, never
  // from user input. If that ever changes, this has to be sanitized properly.
  protected readonly body = computed(() => {
    const html = this.post()?.html;
    return html ? this.sanitizer.bypassSecurityTrustHtml(html) : null;
  });
}
