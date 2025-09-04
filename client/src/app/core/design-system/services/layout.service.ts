import { Injectable, signal, computed, inject } from '@angular/core';
import { BehaviorSubject, Observable, fromEvent } from 'rxjs';
import { map, startWith, distinctUntilChanged } from 'rxjs/operators';
import { ILayoutService, IStorageService } from './design-system.interfaces';
import { BreakpointTokens } from '../tokens/spacing.tokens';

// Layout Configuration Interface - SRP: Define layout structure
export interface LayoutConfig {
  name: string;
  displayName: string;
  sidebarWidth: string;
  headerHeight: string;
  footerHeight: string;
  containerMaxWidth: string;
  gridColumns: number;
  gridGap: string;
}

// Available Layouts
const ClassicLayout: LayoutConfig = {
  name: 'classic',
  displayName: 'Classic Layout',
  sidebarWidth: '16rem',
  headerHeight: '4rem',
  footerHeight: '3rem',
  containerMaxWidth: '1200px',
  gridColumns: 12,
  gridGap: '1.5rem',
};

const ModernLayout: LayoutConfig = {
  name: 'modern',
  displayName: 'Modern Layout',
  sidebarWidth: '18rem',
  headerHeight: '5rem',
  footerHeight: '4rem',
  containerMaxWidth: '1400px',
  gridColumns: 12,
  gridGap: '2rem',
};

const CompactLayout: LayoutConfig = {
  name: 'compact',
  displayName: 'Compact Layout',
  sidebarWidth: '14rem',
  headerHeight: '3.5rem',
  footerHeight: '2.5rem',
  containerMaxWidth: '1000px',
  gridColumns: 12,
  gridGap: '1rem',
};

@Injectable({
  providedIn: 'root'
})
export class LayoutService implements ILayoutService {
  private storageService = inject(StorageService);
  private readonly LAYOUT_STORAGE_KEY = 'selected-layout';
  
  // Available layouts
  private layouts = new Map<string, LayoutConfig>([
    ['classic', ClassicLayout],
    ['modern', ModernLayout],
    ['compact', CompactLayout],
  ]);
  
  // Current layout state
  private currentLayoutSignal = signal<LayoutConfig>(ModernLayout);
  private layoutSubject = new BehaviorSubject<string>('modern');
  
  // Responsive breakpoints
  private readonly breakpoints = BreakpointTokens;
  
  // Screen size observables
  private screenWidth$ = fromEvent(window, 'resize').pipe(
    startWith(null),
    map(() => window.innerWidth),
    distinctUntilChanged()
  );
  
  // Computed properties
  public currentLayout = computed(() => this.currentLayoutSignal());
  public isMobileSignal = computed(() => this.getCurrentScreenSize() === 'mobile');
  public isTabletSignal = computed(() => this.getCurrentScreenSize() === 'tablet');
  public isDesktopSignal = computed(() => this.getCurrentScreenSize() === 'desktop');
  
  constructor() {
    this.initializeLayout();
    this.setupResponsiveHandling();
  }
  
  getCurrentLayout(): string {
    return this.currentLayoutSignal().name;
  }
  
  setLayout(layoutName: string): void {
    const layout = this.layouts.get(layoutName);
    if (layout) {
      this.currentLayoutSignal.set(layout);
      this.layoutSubject.next(layoutName);
      this.storageService.setItem(this.LAYOUT_STORAGE_KEY, layoutName);
      this.applyLayoutToDOM(layout);
    }
  }
  
  getAvailableLayouts(): string[] {
    return Array.from(this.layouts.keys());
  }
  
  isMobileView(): boolean {
    return window.innerWidth < parseInt(this.breakpoints.md);
  }
  
  isTabletView(): boolean {
    const width = window.innerWidth;
    return width >= parseInt(this.breakpoints.md) && width < parseInt(this.breakpoints.lg);
  }
  
  isDesktopView(): boolean {
    return window.innerWidth >= parseInt(this.breakpoints.lg);
  }
  
  subscribeToLayoutChanges(): Observable<string> {
    return this.layoutSubject.asObservable();
  }
  
  subscribeToScreenChanges(): Observable<number> {
    return this.screenWidth$;
  }
  
  // Get layout configuration for components
  getLayoutConfig(): LayoutConfig {
    return this.currentLayoutSignal();
  }
  
  // Get current screen size category
  getCurrentScreenSize(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    if (width < parseInt(this.breakpoints.md)) return 'mobile';
    if (width < parseInt(this.breakpoints.lg)) return 'tablet';
    return 'desktop';
  }
  
  // Calculate responsive columns based on screen size
  getResponsiveColumns(mobile: number = 1, tablet: number = 2, desktop: number = 3): number {
    const screenSize = this.getCurrentScreenSize();
    switch (screenSize) {
      case 'mobile': return mobile;
      case 'tablet': return tablet;
      case 'desktop': return desktop;
      default: return desktop;
    }
  }
  
  private initializeLayout(): void {
    const savedLayout = this.storageService.getItem<string>(this.LAYOUT_STORAGE_KEY);
    const initialLayout = savedLayout || 'modern';
    this.setLayout(initialLayout);
  }
  
  private setupResponsiveHandling(): void {
    this.screenWidth$.subscribe(() => {
      // Re-apply layout on screen size change
      this.applyLayoutToDOM(this.currentLayoutSignal());
    });
  }
  
  private applyLayoutToDOM(layout: LayoutConfig): void {
    const root = document.documentElement;
    
    // Apply CSS custom properties
    root.style.setProperty('--layout-sidebar-width', layout.sidebarWidth);
    root.style.setProperty('--layout-header-height', layout.headerHeight);
    root.style.setProperty('--layout-footer-height', layout.footerHeight);
    root.style.setProperty('--layout-container-max-width', layout.containerMaxWidth);
    root.style.setProperty('--layout-grid-columns', layout.gridColumns.toString());
    root.style.setProperty('--layout-grid-gap', layout.gridGap);
    
    // Apply responsive breakpoints
    Object.entries(this.breakpoints).forEach(([key, value]) => {
      root.style.setProperty(`--breakpoint-${key}`, value);
    });
    
    // Add layout class to body
    document.body.className = document.body.className.replace(/layout-\w+/g, '');
    document.body.classList.add(`layout-${layout.name}`);
    
    // Add responsive classes
    const screenSize = this.getCurrentScreenSize();
    document.body.className = document.body.className.replace(/screen-\w+/g, '');
    document.body.classList.add(`screen-${screenSize}`);
  }
}

// Import the StorageService from theme.service.ts to avoid duplication
import { StorageService } from './theme.service';
