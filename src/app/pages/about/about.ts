import { Component, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ABOUT } from '../../data/generated/about';
import { Seo } from '../../services/seo';

@Component({
  selector: 'app-about',
  template: `
    <h1>{{ title }}</h1>
    <div class="post-body" [innerHTML]="body"></div>
  `,
})
export class About {
  protected readonly title = ABOUT.title;

  // Same reasoning as the post body: this HTML comes from our own build script.
  protected readonly body = inject(DomSanitizer).bypassSecurityTrustHtml(ABOUT.html);

  constructor() {
    inject(Seo).setPage(ABOUT.title, ABOUT.description, '/about');
  }
}
