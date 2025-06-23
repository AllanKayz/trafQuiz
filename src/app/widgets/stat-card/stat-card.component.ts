import { Component, input } from '@angular/core';

@Component({
    selector: 'app-stat-card',
    imports: [],
    template: `
    <section>
      <p>{{header()}}</p>
      <p>{{data()}}</p>
      <p>{{footer()}}</p>
    </section>
  `,
    styles: ``
})
export class StatCardComponent {
  header = input.required();
  data = input.required();
  footer = input.required();
}
