import { Component, computed, inject, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { Post } from '../../models/post';

@Component({
  selector: 'app-post',
  imports: [DatePipe],
  templateUrl: './post.html',
  styleUrl: './post.scss',
})
export class PostPage {
  private readonly sanitizer = inject(DomSanitizer);

  /** Bound from the route resolver by withComponentInputBinding(). */
  readonly post = input<Post | undefined>();

  // Post HTML is rendered by our own build script from markdown we author, never
  // from user input. If that ever changes, this has to be sanitized properly.
  protected readonly body = computed(() => {
    const html = this.post()?.html;
    return html ? this.sanitizer.bypassSecurityTrustHtml(html) : null;
  });
}
