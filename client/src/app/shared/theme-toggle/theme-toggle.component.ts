import { Component, inject } from '@angular/core';
import { ThemeService } from '../../_services/theme.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      class="theme-toggle-btn"
      (click)="toggleTheme()"
      [attr.aria-label]="themeService.isDarkMode() ? 'Switch to light mode' : 'Switch to dark mode'"
      title="Toggle theme">
      <i class="fas" [class.fa-sun]="themeService.isDarkMode()" [class.fa-moon]="!themeService.isDarkMode()"></i>
    </button>
  `,
  styles: [`
    .theme-toggle-btn {
      background: var(--glass-bg);
      backdrop-filter: var(--glass-backdrop);
      border: 1px solid var(--glass-border);
      border-radius: 50%;
      width: 45px;
      height: 45px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      color: var(--text-primary);
      box-shadow: var(--glass-shadow);
    }

    .theme-toggle-btn:hover {
      transform: scale(1.1);
      background: var(--glass-border);
    }

    .theme-toggle-btn i {
      font-size: 1.2rem;
      transition: all 0.3s ease;
    }

    .theme-toggle-btn:hover i {
      transform: rotate(180deg);
    }
  `]
})
export class ThemeToggleComponent {
  themeService = inject(ThemeService);

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
