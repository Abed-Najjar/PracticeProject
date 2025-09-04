import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../_services/admin.service';

interface Photo {
  id: number;
  url: string;
  username: string;
  userId: number;
  isMain: boolean;
}

@Component({
  selector: 'app-photo-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './photo-management.component.html',
  styleUrl: './photo-management.component.css'
})
export class PhotoManagementComponent implements OnInit {
  
  private adminService = inject(AdminService);
  
  activeFilter = 'pending';
  photos: Photo[] = [];
  filteredPhotos: Photo[] = [];
  loading = false;

  ngOnInit() {
    this.loadPhotosForModeration();
  }

  loadPhotosForModeration() {
    this.loading = true;
    this.adminService.getPhotosForModeration().subscribe({
      next: photos => {
        this.photos = photos;
        this.setFilter('pending');
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading photos:', error);
        this.loading = false;
        // Fallback to mock data for demonstration
        this.generateMockData();
        this.setFilter('pending');
      }
    });
  }

  generateMockData() {
    // Generate mock photo data for demonstration
    const samplePhotos = [
      'https://randomuser.me/api/portraits/men/1.jpg',
      'https://randomuser.me/api/portraits/women/1.jpg',
      'https://randomuser.me/api/portraits/men/2.jpg',
      'https://randomuser.me/api/portraits/women/2.jpg',
      'https://randomuser.me/api/portraits/men/3.jpg',
      'https://randomuser.me/api/portraits/women/3.jpg',
      'https://randomuser.me/api/portraits/men/4.jpg',
      'https://randomuser.me/api/portraits/women/4.jpg'
    ];

    const usernames = ['john_doe', 'jane_smith', 'mike_wilson', 'sarah_jones', 'alex_brown', 'lisa_davis', 'tom_miller', 'amy_garcia'];

    this.photos = samplePhotos.map((url, index) => ({
      id: index + 1,
      url: url,
      username: usernames[index],
      userId: index + 1,
      isMain: false
    }));
  }

  setFilter(filter: string) {
    this.activeFilter = filter;
    // For now, show all photos since we don't have status in our Photo interface
    this.filteredPhotos = [...this.photos];
  }

  approvePhoto(photo: Photo) {
    console.log('Approved photo:', photo.id);
    // TODO: Implement actual API call
  }

  rejectPhoto(photo: Photo) {
    console.log('Rejected photo:', photo.id);
    // TODO: Implement actual API call
  }

  deletePhoto(photo: Photo) {
    if (confirm('Are you sure you want to permanently delete this photo?')) {
      const index = this.photos.findIndex(p => p.id === photo.id);
      if (index > -1) {
        this.photos.splice(index, 1);
        this.setFilter(this.activeFilter); // Refresh filtered photos
      }
      console.log('Deleted photo:', photo.id);
      // TODO: Implement actual API call
    }
  }

  viewFullSize(photo: Photo) {
    // TODO: Implement full-size photo modal
    window.open(photo.url, '_blank');
  }

  clearFilters() {
    this.setFilter('pending');
  }
}
