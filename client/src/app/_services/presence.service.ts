import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { User } from '../_models/user';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { take } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PresenceService {
  hubUrl = environment.hubsUrl;
  private hubConnection?: HubConnection;
  private toastr = inject(ToastrService);
  private router = inject(Router);
  onlineUsers = signal<string[]>([]);

  createHubConnection(user: User){
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl + 'presence', {
        accessTokenFactory: () => user.token
      })
      .withAutomaticReconnect()
      .build();

  this.hubConnection.start()
    .then(() => console.log('SignalR connected to presence hub'))
    .catch(error => console.log(error));

  this.hubConnection.on('UserIsOnline', username => {
    this.onlineUsers.update(users => [...users, username])
  })

  this.hubConnection.on('UserIsOffline', username => {
    this.onlineUsers.update(users => users.filter(x => x !== username))
  });

  this.hubConnection.on('UserIsOnline', usernames => {
    this.onlineUsers.set(usernames)
  })

  this.hubConnection.on('NewMessageRecieved', ({username, knownAs}) => {
    this.toastr.info(knownAs + 'has sent you a new message! Click me to see it')
      .onTap
      .pipe(take(1))
      .subscribe(() => this.router.navigateByUrl('/members/' + username + '?tab=Messages'))

  })
  
  }


  stopHubConnection() {
    if(this.hubConnection?.state === HubConnectionState.Connected) {
      this.hubConnection.stop().catch(error => console.log(error))
    }
  }
}
