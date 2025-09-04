import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserManagementComponent } from "../user-management/user-management.component";
import { HasRoleDirective } from '../../_directives/has-role.directive';
import { PhotoManagementComponent } from "../photo-management/photo-management.component";
import { AccountService } from '../../_services/account.service';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, UserManagementComponent, HasRoleDirective, PhotoManagementComponent],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.css'
})
export class AdminPanelComponent implements OnInit {
  private accountService = inject(AccountService);
  
  activeTab = 'users';
  totalUsers = 0;
  pendingPhotos = 0;

  ngOnInit() {
    // Initialize with default tab based on user roles
    const currentUser = this.accountService.currentUser();
    console.log('Current user in admin panel:', currentUser);
    console.log('User roles:', currentUser?.roles);
    
    if (this.hasRole(['Admin'])) {
      this.activeTab = 'users';
      console.log('User has Admin role, setting active tab to users');
    } else if (this.hasRole(['Admin', 'Moderator'])) {
      this.activeTab = 'photos';
      console.log('User has Moderator role, setting active tab to photos');
    }
    
    // Load statistics
    this.loadStatistics();
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  hasRole(roles: string[]): boolean {
    const userRoles = this.accountService.currentUser()?.roles;
    console.log('Checking roles. Required:', roles, 'User has:', userRoles);
    if (!userRoles) return false;
    
    const hasRequiredRole = roles.some(role => userRoles.includes(role));
    console.log('Has required role:', hasRequiredRole);
    return hasRequiredRole;
  }

  private loadStatistics() {
    // TODO: Implement actual API calls to get statistics
    // For now, using mock data
    this.totalUsers = 125; // This would come from an API call
    this.pendingPhotos = 8; // This would come from an API call
  }
}
