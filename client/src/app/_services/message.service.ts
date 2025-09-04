import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { PaginatedResults } from '../_models/pagination';
import { Message } from '../_models/message';
import { setPaginatedResponse, setPaginationHeaders } from './paginationHelper';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { User } from '../_models/user';
import { Group } from '../_models/group';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  baseUrl = environment.apiUrl;
  hubUrl = environment.hubsUrl;
  private http = inject(HttpClient);
  hubConnection?: HubConnection;
  paginatedResult = signal<PaginatedResults<Message[]> | null>(null);
  messageThread = signal<Message[]>([]);
  private currentUser?: User;

  createHubConnection(user: User, otherUsername: string){
    // Stop any existing connection first and clear messages
    this.stopHubConnection();
    
    this.currentUser = user; // Store current user
    console.log('Creating new hub connection for conversation with:', otherUsername);
    
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl + 'message?user=' + otherUsername ,{
        accessTokenFactory: () => user.token || ''
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start().catch(error => console.log(error))
    
    this.hubConnection.on('RecieveMessageThread', messages => {
      console.log('Received message thread with', messages.length, 'messages');
      this.messageThread.set(messages)
    })

    this.hubConnection.on('NewMessage', message => {
      // Check if this message already exists to prevent duplicates
      this.messageThread.update(messages => {
        // Primary check: exact ID match
        if (messages.some(m => m.id === message.id)) {
          console.log('Duplicate message detected by ID:', message.id);
          return messages;
        }
        
        // Secondary check: content, sender, recipient match (for edge cases)
        const isDuplicate = messages.some(m => 
          m.senderUsername === message.senderUsername && 
          m.recipientUsername === message.recipientUsername &&
          m.content === message.content &&
          // More precise timing check
          Math.abs(new Date(m.messageSent).getTime() - new Date(message.messageSent).getTime()) < 5000 // 5 second window
        );
        
        if (isDuplicate) {
          console.log('Duplicate message detected by content/timing:', message.content);
          return messages;
        }
        
        console.log('Adding new message:', message.content);
        return [...messages, message];
      });
    })

    this.hubConnection.on('MessageEdited', editedMessage => {
      this.messageThread.update(messages => 
        messages.map(m => m.id === editedMessage.id ? editedMessage : m)
      );
    })

    this.hubConnection.on('UpdatedGroup', (group: Group) => {
      if(group.connections.some(x => x.username === otherUsername)){
        this.messageThread.update(messages => {
          messages.forEach(message => {
            if(!message.dateRead){
              message.dateRead = new Date(Date.now());
            }
          })
          return messages;
        })
      }
    })
  
  }

  stopHubConnection(){
    if(this.hubConnection?.state === HubConnectionState.Connected){
      console.log('Stopping hub connection and clearing message thread');
      this.hubConnection.stop().catch(error => console.log(error))
    }
    // Clear the message thread when disconnecting to prevent stale data
    this.messageThread.set([]);
    console.log('Message thread cleared');
  }

  getMessages(pageNumber: number, pageSize: number, container: string){
    let params = setPaginationHeaders(pageNumber, pageSize);

    params = params.append('Container', container);

    return this.http.get<Message[]>(this.baseUrl + 'messages', {observe: 'response', params}).subscribe({
      next: response => setPaginatedResponse(response, this.paginatedResult)
    })
  }

  getMessageThread(username: string){
    return this.http.get<Message[]>(this.baseUrl + 'messages/thread/' + username);
  }

  async sendMessage(username: string, content: string){
    return this.hubConnection?.invoke('SendMessage', {recipientUsername: username, content})
  }

  async editMessage(messageId: number, newContent: string){
    // Update message locally first (optimistic update)
    this.messageThread.update(messages => 
      messages.map(m => m.id === messageId ? {...m, content: newContent, dateEdited: new Date()} : m)
    );

    try {
      return await this.hubConnection?.invoke('EditMessage', {messageId, newContent});
    } catch (error) {
      // Revert the optimistic update if it fails
      this.messageThread.update(messages => 
        messages.map(m => m.id === messageId ? {...m, content: m.content, dateEdited: undefined} : m)
      );
      throw error;
    }
  }

  deleteMessage(id: number){
    return this.http.delete(this.baseUrl + 'messages/' + id);
  }
  
}
