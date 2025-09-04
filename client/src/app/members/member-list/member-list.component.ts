import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MembersService } from '../../_services/members.service';
import { MemberCardComponent } from '../member-card/member-card.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { ThemeService } from '../../core/design-system/services/theme.service';
import { LayoutService } from '../../core/design-system/services/layout.service';
import { AnimationService } from '../../core/design-system/services/animation.service';
import { Member } from '../../_models/member';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';

@Component({
    selector: 'app-member-list',
    standalone: true,
    imports: [CommonModule, MemberCardComponent, PaginationModule, FormsModule, ButtonsModule],
    templateUrl: './member-list.component.html',
    styleUrl: './member-list.component.css'
})
export class MemberListComponent implements OnInit {
  // Inject services following DIP
  memberService = inject(MembersService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  protected themeService = inject(ThemeService);
  protected layoutService = inject(LayoutService);
  private animationService = inject(AnimationService);
  
  // Filter options
  genderList = [
    {value: 'male', display: 'Males'}, 
    {value: 'female', display: 'Females'}
  ];
  
  // View configuration
  viewMode: 'grid' | 'list' = 'grid';

  ngOnInit(): void {
    if(!this.memberService.paginatedResult()) this.loadMembers();
    this.animatePageLoad();
  }

  loadMembers(){
    this.memberService.getMembers();
  }

  resetFilters(){
    this.memberService.resetUserParams();
    this.loadMembers();
    this.toastr.info('Filters reset to default');
  }

  pageChanged(event: PageChangedEvent){
    if(this.memberService.userParams().pageNumber != event.page){
      this.memberService.userParams().pageNumber = event.page;
      this.loadMembers();
    }
  }
  
  // Modern design methods with proper implementations
  onMemberLike(member: Member): void {
    // Implementation will depend on like service
    this.toastr.success(`You liked ${member.knownAs}!`);
    // Find the element and animate it
    const memberElement = document.querySelector(`[data-member-id="${member.id}"]`) as HTMLElement;
    if (memberElement) {
      this.animationService.pulse(memberElement);
    }
  }
  
  onMemberMessage(member: Member): void {
    this.router.navigate(['/members', member.username], { 
      queryParams: { tab: 'Messages' } 
    });
  }
  
  onMemberMore(member: Member): void {
    // Future: implement context menu with options
    console.log('More options for:', member.knownAs);
  }
  
  onMemberView(member: Member): void {
    this.router.navigate(['/members', member.username]);
  }
  
  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }
  
  getGridColumns(): number {
    const screenSize = this.layoutService.getCurrentScreenSize();
    switch (screenSize) {
      case 'mobile': return 1;
      case 'tablet': return 2;
      case 'desktop': return 3;
      default: return 3;
    }
  }

  /**
   * Animate page load elements
   */
  private animatePageLoad(): void {
    // Animate elements when they exist
    setTimeout(() => {
      const headerElement = document.querySelector('.page-header') as HTMLElement;
      if (headerElement) {
        this.animationService.fadeIn(headerElement, 600);
      }

      const filtersElement = document.querySelector('.filters-section') as HTMLElement;
      if (filtersElement) {
        this.animationService.slideIn(filtersElement, 'up');
      }

      // Animate member cards with stagger
      const memberCards = document.querySelectorAll('.member-card-wrapper');
      memberCards.forEach((card, index) => {
        setTimeout(() => {
          this.animationService.slideIn(card as HTMLElement, 'up');
        }, index * 50);
      });
    }, 100);
  }
}
