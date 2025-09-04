// Theme Service Interface - ISP: Focused interface for theme management
export interface IThemeService {
  getCurrentTheme(): string;
  setTheme(themeName: string): void;
  getAvailableThemes(): string[];
  isDarkMode(): boolean;
  toggleDarkMode(): void;
  subscribeToThemeChanges(): import('rxjs').Observable<string>;
}

// Layout Service Interface - ISP: Focused interface for layout management  
export interface ILayoutService {
  getCurrentLayout(): string;
  setLayout(layoutName: string): void;
  getAvailableLayouts(): string[];
  isMobileView(): boolean;
  subscribeToLayoutChanges(): import('rxjs').Observable<string>;
}

// Animation Service Interface - ISP: Focused interface for animations
export interface IAnimationService {
  fadeIn(element: HTMLElement, duration?: number): Promise<void>;
  fadeOut(element: HTMLElement, duration?: number): Promise<void>;
  slideIn(element: HTMLElement, direction?: 'left' | 'right' | 'up' | 'down'): Promise<void>;
  slideOut(element: HTMLElement, direction?: 'left' | 'right' | 'up' | 'down'): Promise<void>;
  bounce(element: HTMLElement): Promise<void>;
  pulse(element: HTMLElement): Promise<void>;
}

// Notification Service Interface - ISP: Focused interface for notifications
export interface INotificationService {
  showSuccess(message: string, title?: string): void;
  showError(message: string, title?: string): void;
  showWarning(message: string, title?: string): void;
  showInfo(message: string, title?: string): void;
  clear(): void;
  clearToast(toastId: number): void;
}

// Storage Service Interface - ISP: Focused interface for storage operations
export interface IStorageService {
  setItem(key: string, value: any): void;
  getItem<T>(key: string): T | null;
  removeItem(key: string): void;
  clear(): void;
  hasItem(key: string): boolean;
}

// Utility Service Interface - ISP: Focused interface for common utilities
export interface IUtilityService {
  generateId(): string;
  formatDate(date: Date, format: string): string;
  debounce<T extends (...args: any[]) => any>(fn: T, delay: number): T;
  throttle<T extends (...args: any[]) => any>(fn: T, delay: number): T;
  deepClone<T>(obj: T): T;
  isEmpty(value: any): boolean;
}
