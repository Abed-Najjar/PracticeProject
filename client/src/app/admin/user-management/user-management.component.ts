import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../_services/admin.service';
import { User } from '../../_models/user';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { RolesModalComponent } from '../../modals/roles-modal/roles-modal.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent implements OnInit {
  private adminService = inject(AdminService);
  private modalService = inject(BsModalService);
  
  users: User[] = [];
  filteredUsers: User[] = [];
  selectedFilter = 'all';
  searchTerm = '';
  loading = false;
  
  bsModalRef: BsModalRef<RolesModalComponent> = new BsModalRef<RolesModalComponent>();

  ngOnInit(): void {
    this.getUsersWithRoles();
  }

  openRolesModal(user: User) {
    const initialState: ModalOptions = {
      class: 'modal-lg',
      initialState: {
        title: 'User roles',
        username: user.username,
        selectedRoles: [...user.roles],
        users: this.users,
        availableRoles: ['Admin', 'Moderator', 'Member'],
        rolesUpdated: false
      }
    }
    this.bsModalRef = this.modalService.show(RolesModalComponent, initialState);
    this.bsModalRef.onHide?.subscribe({
      next: () => {
        if (this.bsModalRef.content && this.bsModalRef.content.rolesUpdated) {
          const selectedRoles = this.bsModalRef.content.selectedRoles;
          this.adminService.updateUserRoles(user.username, selectedRoles).subscribe({
            next: roles => {
              user.roles = roles;
              this.applyFilters();
            }
          })
        }
      }
    })
  }

  getUsersWithRoles() {
    this.loading = true;
    console.log('Fetching users with roles...');
    this.adminService.getUserWithRoles().subscribe({
      next: users => {
        console.log('Received users:', users);
        this.users = users;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching users:', error);
        this.loading = false;
      }
    });
  }

  onSearch(searchTerm: string) {
    this.searchTerm = searchTerm;
    this.applyFilters();
  }

  setFilter(filter: string) {
    this.selectedFilter = filter;
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.users];
    console.log('Applying filters to users:', this.users.length, 'users');
    console.log('Search term:', this.searchTerm, 'Filter:', this.selectedFilter);

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(term) ||
        (user.knownAs && user.knownAs.toLowerCase().includes(term)) ||
        user.roles.some(role => role.toLowerCase().includes(term))
      );
    }

    // Apply role filter
    if (this.selectedFilter !== 'all') {
      filtered = filtered.filter(user => {
        if (this.selectedFilter === 'admin') {
          return user.roles.includes('Admin');
        } else if (this.selectedFilter === 'moderator') {
          return user.roles.includes('Moderator');
        } else if (this.selectedFilter === 'user') {
          return !user.roles.includes('Admin') && !user.roles.includes('Moderator');
        }
        return true;
      });
    }

    this.filteredUsers = filtered;
    console.log('Filtered users result:', this.filteredUsers.length, 'users');
  }

  getRoleIcon(role: string): string {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'fas fa-crown';
      case 'moderator':
        return 'fas fa-shield-alt';
      default:
        return 'fas fa-user';
    }
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return 'Unknown';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }

  viewUserProfile(user: User) {
    // TODO: Implement view user profile functionality
    console.log('View profile for:', user.username);
  }

  suspendUser(user: User) {
    // TODO: Implement suspend user functionality
    if (confirm(`Are you sure you want to suspend ${user.username}?`)) {
      console.log('Suspend user:', user.username);
    }
  }

  clearFilters() {
    this.selectedFilter = 'all';
    this.searchTerm = '';
    this.applyFilters();
  }
}
