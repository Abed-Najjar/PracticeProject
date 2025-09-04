import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'dating-app-theme';
  
  // Signal for reactive theme state
  currentTheme = signal<Theme>('light');
  isDarkMode = signal<boolean>(false);

  constructor() {
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem(this.THEME_KEY) as Theme;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      this.currentTheme.set(savedTheme);
      this.isDarkMode.set(savedTheme === 'dark');
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.currentTheme.set(prefersDark ? 'dark' : 'light');
      this.isDarkMode.set(prefersDark);
    }

    // Apply theme on initialization
    this.applyTheme(this.currentTheme());

    // Effect to apply theme changes
    effect(() => {
      this.applyTheme(this.currentTheme());
    });

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      // Only auto-switch if no manual preference is saved
      if (!localStorage.getItem(this.THEME_KEY)) {
        this.currentTheme.set(e.matches ? 'dark' : 'light');
        this.isDarkMode.set(e.matches);
      }
    });
  }

  toggleTheme(): void {
    const newTheme: Theme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
    this.isDarkMode.set(theme === 'dark');
    localStorage.setItem(this.THEME_KEY, theme);
  }

  private applyTheme(theme: Theme): void {
    const htmlElement = document.documentElement;
    
    // Remove existing theme classes and attributes
    htmlElement.removeAttribute('data-theme');
    htmlElement.classList.remove('light-theme', 'dark-theme');
    
    // Apply new theme
    htmlElement.setAttribute('data-theme', theme);
    htmlElement.classList.add(`${theme}-theme`);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#1a1a2e' : '#ffffff');
    }
  }

  // Legacy compatibility methods
  private getInitialTheme(): boolean {
    return this.isDarkMode();
  }
}
