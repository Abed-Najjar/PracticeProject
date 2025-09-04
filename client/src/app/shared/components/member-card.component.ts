import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Member } from '../../_models/member';
import { ThemeService } from '../../core/design-system/services/theme.service';
import { AnimationService } from '../../core/design-system/services/animation.service';

// Member Card Configuration Interface - SRP: Define card behavior
export interface MemberCardConfig {
  showAge: boolean;
  showLocation: boolean;
  showOnlineStatus: boolean;
  showQuickActions: boolean;
  showPhotos: boolean;
  imageHeight: string;
  borderRadius: string;
}

// Default configuration
const DEFAULT_CONFIG: MemberCardConfig = {
  showAge: true,
  showLocation: true,
  showOnlineStatus: true,
  showQuickActions: true,
  showPhotos: true,
  imageHeight: '300px',
  borderRadius: '1rem',
};

/**
 * Modern Member Card Component
 * 
 * Follows SOLID Principles:
 * - SRP: Handles only member card display and interaction
 * - OCP: Configurable through MemberCardConfig interface
 * - LSP: Can be replaced with other card implementations
 * - ISP: Uses focused service interfaces
 * - DIP: Depends on service abstractions, not implementations
 */
@Component({
  selector: 'app-member-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="member-card card hover-lift cursor-pointer"
      [class.theme-dark]="themeService.isDarkMode()"
      (click)="onCardClick()"
      (mouseenter)="onCardHover()"
      #cardElement
    >
      <!-- Photo Section -->
      <div class="photo-container" [style.height]="config.imageHeight">
        <img 
          [src]="member.photoUrl || 'assets/user.png'"
          [alt]="member.knownAs"
          class="member-photo"
          [style.border-radius]="config.borderRadius + ' ' + config.borderRadius + ' 0 0'"
          loading="lazy"
        />
        
        <!-- Online Status Indicator -->
        <div 
          *ngIf="config.showOnlineStatus"
          class="online-status"
          [class.online]="isOnline"
          [class.offline]="!isOnline"
        >
          <div class="status-dot"></div>
          <span class="status-text">{{ getOnlineStatusText() }}</span>
        </div>
        
        <!-- Photo Count Badge -->
        <div 
          *ngIf="config.showPhotos && member.photos?.length > 1"
          class="photo-count-badge"
        >
          <i class="fa fa-camera"></i>
          {{ member.photos.length }}
        </div>
        
        <!-- Quick Actions Overlay -->
        <div 
          *ngIf="config.showQuickActions"
          class="quick-actions"
        >
          <button 
            class="action-btn like-btn"
            (click)="onLike($event)"
            [class.liked]="isLiked"
            title="Like"
          >
            <i class="fa fa-heart"></i>
          </button>
          
          <button 
            class="action-btn message-btn"
            (click)="onMessage($event)"
            title="Send Message"
          >
            <i class="fa fa-comment"></i>
          </button>
          
          <button 
            class="action-btn more-btn"
            (click)="onMore($event)"
            title="More Options"
          >
            <i class="fa fa-ellipsis-v"></i>
          </button>
        </div>
      </div>
      
      <!-- Content Section -->
      <div class="card-content">
        <!-- Header -->
        <div class="member-header">
          <h3 class="member-name gradient-text">{{ member.knownAs }}</h3>
          <span 
            *ngIf="config.showAge"
            class="member-age text-sm text-secondary"
          >
            {{ member.age }} years old
          </span>
        </div>
        
        <!-- Location -->
        <div 
          *ngIf="config.showLocation && (member.city || member.country)"
          class="member-location"
        >
          <i class="fa fa-map-marker-alt location-icon"></i>
          <span class="location-text">
            {{ formatLocation() }}
          </span>
        </div>
        
        <!-- Introduction Preview -->
        <p 
          *ngIf="member.introduction"
          class="member-intro line-clamp-2"
        >
          {{ member.introduction }}
        </p>
        
        <!-- Interests Tags -->
        <div 
          *ngIf="member.interests"
          class="interests-container"
        >
          <span 
            *ngFor="let interest of getInterestsList()"
            class="interest-tag"
          >
            {{ interest }}
          </span>
        </div>
        
        <!-- Action Footer -->
        <div class="card-footer">
          <div class="activity-info">
            <i class="fa fa-clock activity-icon"></i>
            <span class="activity-text">{{ getLastActiveText() }}</span>
          </div>
          
          <button 
            class="btn btn-primary view-profile-btn"
            (click)="onViewProfile($event)"
          >
            View Profile
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .member-card {
      position: relative;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      max-width: 320px;
      margin: 0 auto;
    }
    
    .photo-container {
      position: relative;
      overflow: hidden;
    }
    
    .member-photo {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    
    .member-card:hover .member-photo {
      transform: scale(1.05);
    }
    
    .online-status {
      position: absolute;
      top: 1rem;
      right: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 0.75rem;
      border-radius: 2rem;
      backdrop-filter: blur(10px);
      font-size: 0.75rem;
      font-weight: 600;
    }
    
    .online-status.online {
      background: rgba(34, 197, 94, 0.9);
      color: white;
    }
    
    .online-status.offline {
      background: rgba(107, 114, 128, 0.9);
      color: white;
    }
    
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
      animation: pulse 2s infinite;
    }
    
    .photo-count-badge {
      position: absolute;
      top: 1rem;
      left: 1rem;
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.375rem 0.75rem;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      border-radius: 1rem;
      font-size: 0.75rem;
      font-weight: 600;
    }
    
    .quick-actions {
      position: absolute;
      bottom: 1rem;
      right: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      opacity: 0;
      transform: translateX(20px);
      transition: all 0.3s ease;
    }
    
    .member-card:hover .quick-actions {
      opacity: 1;
      transform: translateX(0);
    }
    
    .action-btn {
      width: 40px;
      height: 40px;
      border: none;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      backdrop-filter: blur(10px);
      color: white;
      font-size: 1rem;
    }
    
    .like-btn {
      background: rgba(239, 68, 68, 0.9);
    }
    
    .like-btn.liked {
      background: rgba(220, 38, 38, 1);
      transform: scale(1.1);
    }
    
    .message-btn {
      background: rgba(59, 130, 246, 0.9);
    }
    
    .more-btn {
      background: rgba(107, 114, 128, 0.9);
    }
    
    .action-btn:hover {
      transform: scale(1.1);
    }
    
    .card-content {
      padding: 1.5rem;
    }
    
    .member-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 0.75rem;
    }
    
    .member-name {
      font-size: 1.25rem;
      font-weight: 700;
      margin: 0;
    }
    
    .member-age {
      font-size: 0.875rem;
      opacity: 0.7;
    }
    
    .member-location {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      color: var(--color-gray-600);
      font-size: 0.875rem;
    }
    
    .location-icon {
      color: var(--color-primary-600);
    }
    
    .member-intro {
      color: var(--color-gray-700);
      font-size: 0.875rem;
      line-height: 1.5;
      margin-bottom: 1rem;
    }
    
    .interests-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    
    .interest-tag {
      padding: 0.25rem 0.75rem;
      background: var(--color-primary-100);
      color: var(--color-primary-700);
      border-radius: 1rem;
      font-size: 0.75rem;
      font-weight: 500;
    }
    
    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1rem;
      border-top: 1px solid var(--color-gray-200);
    }
    
    .activity-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--color-gray-500);
      font-size: 0.75rem;
    }
    
    .activity-icon {
      color: var(--color-primary-500);
    }
    
    .view-profile-btn {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      border-radius: 0.5rem;
    }
    
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
    
    /* Dark theme adjustments */
    .theme-dark .member-intro {
      color: var(--color-gray-300);
    }
    
    .theme-dark .card-footer {
      border-color: var(--color-gray-700);
    }
    
    .theme-dark .interest-tag {
      background: var(--color-primary-900);
      color: var(--color-primary-300);
    }
  `]
})
export class MemberCardComponent {
  @Input() member!: Member;
  @Input() config: MemberCardConfig = DEFAULT_CONFIG;
  @Input() isLiked: boolean = false;
  @Input() isOnline: boolean = false;
  
  @Output() cardClick = new EventEmitter<Member>();
  @Output() like = new EventEmitter<Member>();
  @Output() message = new EventEmitter<Member>();
  @Output() more = new EventEmitter<Member>();
  @Output() viewProfile = new EventEmitter<Member>();
  
  // Inject services following DIP
  protected themeService = inject(ThemeService);
  private animationService = inject(AnimationService);
  
  onCardClick(): void {
    this.cardClick.emit(this.member);
  }
  
  onCardHover(): void {
    // Add subtle animation on hover
    // This could be made configurable in the future (OCP)
  }
  
  onLike(event: Event): void {
    event.stopPropagation();
    this.like.emit(this.member);
  }
  
  onMessage(event: Event): void {
    event.stopPropagation();
    this.message.emit(this.member);
  }
  
  onMore(event: Event): void {
    event.stopPropagation();
    this.more.emit(this.member);
  }
  
  onViewProfile(event: Event): void {
    event.stopPropagation();
    this.viewProfile.emit(this.member);
  }
  
  formatLocation(): string {
    const parts = [this.member.city, this.member.country].filter(Boolean);
    return parts.join(', ');
  }
  
  getInterestsList(): string[] {
    if (!this.member.interests) return [];
    return this.member.interests.split(',').map(i => i.trim()).slice(0, 3);
  }
  
  getOnlineStatusText(): string {
    return this.isOnline ? 'Online' : 'Offline';
  }
  
  getLastActiveText(): string {
    if (!this.member.lastActive) return 'Recently active';
    
    const lastActive = new Date(this.member.lastActive);
    const now = new Date();
    const diffMs = now.getTime() - lastActive.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return 'Active now';
    if (diffHours < 24) return `Active ${diffHours}h ago`;
    if (diffDays < 7) return `Active ${diffDays}d ago`;
    
    return 'Active recently';
  }
}
