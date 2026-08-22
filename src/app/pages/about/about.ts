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
  // Matches the rule under a post header: the title is chrome, what follows is the
  // article. The global h1 margin is tuned for the home page, where a search box
  // follows it and no rule is wanted.
  styles: `
    h1 {
      max-width: var(--wide);
      margin-bottom: 3.25rem;
      padding-bottom: 1.75rem;
      border-bottom: 1px solid var(--line);
    }
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
