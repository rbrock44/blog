import { Component, computed, effect, inject, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { Comments } from '../../components/comments/comments';
import { PostCounters } from '../../components/post-counters/post-counters';
import { Post } from '../../models/post';
import { Seo } from '../../services/seo';

@Component({
  selector: 'app-post',
  imports: [DatePipe, RouterLink, Comments, PostCounters],
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

  constructor() {
    const seo = inject(Seo);

    effect(() => {
      const post = this.post();
      if (post) {
        seo.setPost(post);
      } else {
        seo.setDefault();
      }
    });
  }
}
