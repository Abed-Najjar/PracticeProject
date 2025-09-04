import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { inject, Injectable, model, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { Member } from '../_models/member';
import { Photo } from '../_models/photo';
import { PaginatedResults } from '../_models/pagination';
import { UserParams } from '../_models/userParams';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AccountService } from './account.service';
import { setPaginatedResponse, setPaginationHeaders } from './paginationHelper';

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  private http = inject(HttpClient);
  private accountService = inject(AccountService);
  baseUrl = environment.apiUrl;
  paginatedResult = signal<PaginatedResults<Member[]> | null>(null);
  memberCache = new Map();
  user = this.accountService.currentUser();
  userParams = signal(new UserParams(this.user));

  resetUserParams(){
    console.log('API URL:', environment.apiUrl);
    this.userParams.set(new UserParams(this.user));
  }

  getMembers(){
    const response = this.memberCache.get(Object.values(this.userParams()).join('-'));

    if(response) return setPaginatedResponse(response, this.paginatedResult);

    let params = setPaginationHeaders(this.userParams().pageNumber, this.userParams().pageSize);

    params = params.append('minAge', this.userParams().minAge);
    params = params.append('maxAge', this.userParams().maxAge);
    params = params.append('gender', this.userParams().gender);
    params = params.append('orderBy', this.userParams().orderBy);

    return this.http.get<Member[]>(this.baseUrl + 'users', {observe: 'response', params}).subscribe({
      next: response => {
        setPaginatedResponse(response, this.paginatedResult);
        this.memberCache.set(Object.values(this.userParams()).join('-'), response);
      }
    })
  }

  getMember(username: string){
    const member: Member = [...this.memberCache.values()]
          .reduce((arr, elem) => arr.concat(elem.body), [])
          .find((m: Member) => m.username === username)
    
    if(member) return of(member);

    console.log(member);

    return this.http.get<Member>(this.baseUrl + 'users/' + username);
  }

  // Force refresh member data from server (bypasses cache)
  getMemberFresh(username: string){
    console.log('Fetching fresh member data for:', username);
    return this.http.get<Member>(this.baseUrl + 'users/' + username).pipe(
      tap(member => {
        console.log('Fresh member data received:', member);
      })
    );
  }

  updateMember(memberUpdate: any){
    console.log('API URL:', environment.apiUrl);
    return this.http.put(this.baseUrl + 'users', memberUpdate).pipe(
      tap(() => {
        // Clear the cache to force fresh data on next request
        this.memberCache.clear();
      })
    )
  }

  setMainPhoto(photo: Photo){
    console.log('API URL:', environment.apiUrl);
    return this.http.put(this.baseUrl + 'users/set-main-photo/' + photo.id, {}).pipe(
      // tap(() => {
      //   this.members.update(members => members.map(m => {
      //     if(m.photos.includes(photo)){
      //       m.photoUrl = photo.url
      //     }
      //     return m;
      //   }))
      // })
    )
  }

  deletePhoto(photo: Photo){
    console.log('API URL:', environment.apiUrl);
    return this.http.delete(this.baseUrl + 'users/delete-photo/' + photo.id).pipe(
      // tap(() => {
      //   this.members.update(members => members.map(m => {
      //     if(m.photos.includes(photo)){
      //       m.photos = m.photos.filter(x => x.id !== photo.id)
      //     }
      //     return m;
      //   }))
      // })
    )
  }


}
