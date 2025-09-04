import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { User } from '../_models/user';
import { AdminUser } from '../_models/admin-user';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  baseUrl = environment.apiUrl;
  private http = inject(HttpClient);

  getUserWithRoles(){
    return this.http.get<any[]>(this.baseUrl + 'admin/users-with-roles').pipe(
      map(apiUsers => apiUsers.map(apiUser => ({
        id: apiUser.Id,
        username: apiUser.Username,
        roles: apiUser.Roles,
        knownAs: apiUser.Username, // Use username as fallback for knownAs
        photoUrl: undefined,
        isOnline: undefined,
        created: undefined,
        lastActive: undefined,
        gender: undefined,
        token: undefined
      } as User)))
    );
  }
  
  updateUserRoles(username: string, roles: string[]){
    return this.http.post<string[]>(this.baseUrl + 'admin/edit-roles/' 
      + username + '?roles=' + roles, {})
  }

  getPhotosForModeration() {
    return this.http.get<any[]>(this.baseUrl + 'admin/photos-to-moderate');
  }
  
}
