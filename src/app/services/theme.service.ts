import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'trafquiz-theme';
  isDarkMode = signal<boolean>(this.loadTheme());

  constructor() {
    // Apply theme whenever isDarkMode changes
    effect(() => {
      const dark = this.isDarkMode();
      if (dark) {
        document.body.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
      }
      this.saveTheme(dark);
    });
  }

  toggleTheme() {
    this.isDarkMode.update(v => !v);
  }

  private saveTheme(isDark: boolean) {
    localStorage.setItem(this.THEME_KEY, isDark ? 'dark' : 'light');
  }

  private loadTheme(): boolean {
    const saved = localStorage.getItem(this.THEME_KEY);
    if (saved) {
      return saved === 'dark';
    }
    // Default to system preference or light
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
}
