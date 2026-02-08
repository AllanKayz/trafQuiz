import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="skeleton-item shimmer"
      [style.width]="width()"
      [style.height]="height()"
      [style.border-radius]="borderRadius()">
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
      vertical-align: middle;
      line-height: 1;
    }
    .skeleton-item {
      display: block;
    }
  `]
})
export class SkeletonLoaderComponent {
  width = input<string>('100%');
  height = input<string>('1rem');
  borderRadius = input<string>('4px');
}
