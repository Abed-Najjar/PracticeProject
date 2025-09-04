import { Injectable, signal, computed, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IThemeService, IStorageService } from './design-system.interfaces';
import { ColorTokens } from '../tokens/color.tokens';
import { TypographyTokens } from '../tokens/typography.tokens';
import { SpacingTokens, BreakpointTokens } from '../tokens/spacing.tokens';

// Theme Configuration Interface - SRP: Define theme structure
export interface ThemeConfig {
  name: string;
  displayName: string;
  colors: typeof ColorTokens;
  typography: typeof TypographyTokens;
  spacing: typeof SpacingTokens;
  breakpoints: typeof BreakpointTokens;
  isDark: boolean;
}

// Default Light Theme
const LightTheme: ThemeConfig = {
  name: 'light',
  displayName: 'Light Theme',
  colors: ColorTokens,
  typography: TypographyTokens,
  spacing: SpacingTokens,
  breakpoints: BreakpointTokens,
  isDark: false,
};

// Dark Theme with adjusted colors
const DarkTheme: ThemeConfig = {
  name: 'dark',
  displayName: 'Dark Theme',
  colors: {
    ...ColorTokens,
    gray: {
      50: '#111827',
      100: '#1f2937',
      200: '#374151',
      300: '#4b5563',
      400: '#6b7280',
      500: '#9ca3af',
      600: '#d1d5db',
      700: '#e5e7eb',
      800: '#f3f4f6',
      900: '#f9fafb',
    },
  },
  typography: TypographyTokens,
  spacing: SpacingTokens,
  breakpoints: BreakpointTokens,
  isDark: true,
};

// Modern Theme with updated colors
const ModernTheme: ThemeConfig = {
  name: 'modern',
  displayName: 'Modern Theme',
  colors: {
    ...ColorTokens,
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',  // Modern blue
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    secondary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',  // Slate gray
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
  },
  typography: TypographyTokens,
  spacing: SpacingTokens,
  breakpoints: BreakpointTokens,
  isDark: false,
};

@Injectable({
  providedIn: 'root'
})
export class ThemeService implements IThemeService {
  private storageService = inject(StorageService);
  private readonly THEME_STORAGE_KEY = 'selected-theme';
  
  // Available themes
  private themes = new Map<string, ThemeConfig>([
    ['light', LightTheme],
    ['dark', DarkTheme],
    ['modern', ModernTheme],
  ]);
  
  // Current theme state using Angular signals
  private currentThemeSignal = signal<ThemeConfig>(LightTheme);
  private themeSubject = new BehaviorSubject<string>('light');
  
  // Computed properties
  public currentTheme = computed(() => this.currentThemeSignal());
  public isDarkModeSignal = computed(() => this.currentThemeSignal().isDark);
  
  constructor() {
    this.initializeTheme();
  }
  
  getCurrentTheme(): string {
    return this.currentThemeSignal().name;
  }
  
  setTheme(themeName: string): void {
    const theme = this.themes.get(themeName);
    if (theme) {
      this.currentThemeSignal.set(theme);
      this.themeSubject.next(themeName);
      this.storageService.setItem(this.THEME_STORAGE_KEY, themeName);
      this.applyThemeToDOM(theme);
    }
  }
  
  getAvailableThemes(): string[] {
    return Array.from(this.themes.keys());
  }
  
  isDarkMode(): boolean {
    return this.currentThemeSignal().isDark;
  }
  
  toggleDarkMode(): void {
    const currentIsDark = this.isDarkMode();
    const newTheme = currentIsDark ? 'light' : 'dark';
    this.setTheme(newTheme);
  }
  
  subscribeToThemeChanges(): Observable<string> {
    return this.themeSubject.asObservable();
  }
  
  // Get theme configuration for components
  getThemeConfig(): ThemeConfig {
    return this.currentThemeSignal();
  }
  
  private initializeTheme(): void {
    const savedTheme = this.storageService.getItem<string>(this.THEME_STORAGE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    this.setTheme(initialTheme);
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (e) => {
        if (!savedTheme) {
          this.setTheme(e.matches ? 'dark' : 'light');
        }
      });
  }
  
  private applyThemeToDOM(theme: ThemeConfig): void {
    const root = document.documentElement;
    
    // Apply CSS custom properties
    Object.entries(theme.colors.primary).forEach(([key, value]) => {
      root.style.setProperty(`--color-primary-${key}`, value);
    });
    
    Object.entries(theme.colors.secondary).forEach(([key, value]) => {
      root.style.setProperty(`--color-secondary-${key}`, value);
    });
    
    Object.entries(theme.colors.gray).forEach(([key, value]) => {
      root.style.setProperty(`--color-gray-${key}`, value);
    });
    
    // Apply semantic colors
    root.style.setProperty('--color-success', theme.colors.success[500]);
    root.style.setProperty('--color-warning', theme.colors.warning[500]);
    root.style.setProperty('--color-danger', theme.colors.danger[500]);
    
    // Apply typography
    root.style.setProperty('--font-family-sans', theme.typography.fontFamily.sans);
    root.style.setProperty('--font-family-serif', theme.typography.fontFamily.serif);
    root.style.setProperty('--font-family-mono', theme.typography.fontFamily.mono);
    
    // Add theme class to body
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${theme.name}`);
  }
}

// Storage Service Implementation - SRP: Handle only storage operations
@Injectable({
  providedIn: 'root'
})
export class StorageService implements IStorageService {
  setItem(key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }
  
  getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return null;
    }
  }
  
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  }
  
  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }
  
  hasItem(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }
}
