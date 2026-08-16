import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <h1>Not found</h1>
    <p>That page does not exist. <a routerLink="/">Back to the posts</a>.</p>
  `,
})
export class NotFound {}
