import { Component, inject, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TraffiquizService } from './traffiquiz.service';

/**
 * The root component of the application.
 * This component is the main entry point for the application's UI.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'TrafQuiz';
  service = inject(TraffiquizService);

  constructor() {
    effect(() => {
      if (this.service.darkMode()) {
        document.body.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
      }
    });
  }
}
