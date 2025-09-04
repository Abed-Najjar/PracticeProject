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
        console.log('Received photos for moderation:', photos);
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
    // Generate mock photo data for demonstration when no real data is available
    const samplePhotos = [
      'https://randomuser.me/api/portraits/men/1.jpg',
      'https://randomuser.me/api/portraits/women/1.jpg',
      'https://randomuser.me/api/portraits/men/2.jpg',
      'https://randomuser.me/api/portraits/women/2.jpg',
    ];

    const usernames = ['john_doe', 'jane_smith', 'mike_wilson', 'sarah_jones'];

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
    // For now, show all photos as pending since we're getting unapproved photos from API
    this.filteredPhotos = [...this.photos];
  }

  approvePhoto(photo: Photo) {
    // TODO: Implement actual API call to approve photo
    console.log('Approved photo:', photo.id);
    // Remove from pending list
    this.photos = this.photos.filter(p => p.id !== photo.id);
    this.setFilter(this.activeFilter);
  }

  rejectPhoto(photo: Photo) {
    // TODO: Implement actual API call to reject photo
    console.log('Rejected photo:', photo.id);
    // Remove from pending list
    this.photos = this.photos.filter(p => p.id !== photo.id);
    this.setFilter(this.activeFilter);
  }

  deletePhoto(photo: Photo) {
    if (confirm('Are you sure you want to permanently delete this photo?')) {
      // TODO: Implement actual API call to delete photo
      console.log('Deleted photo:', photo.id);
      this.photos = this.photos.filter(p => p.id !== photo.id);
      this.setFilter(this.activeFilter);
    }
  }

  viewFullSize(photo: Photo) {
    window.open(photo.url, '_blank');
  }

  clearFilters() {
    this.setFilter('pending');
  }
}
