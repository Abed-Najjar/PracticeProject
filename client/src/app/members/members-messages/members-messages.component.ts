import { AfterViewChecked, Component, inject, input, ViewChild, ElementRef, OnInit, effect } from '@angular/core';
import { MessageService } from '../../_services/message.service';
import { TimeagoModule } from 'ngx-timeago';
import { FormsModule, NgForm } from '@angular/forms';
import { Message } from '../../_models/message';
import { AccountService } from '../../_services/account.service';

@Component({
  selector: 'app-members-messages',
  standalone: true,
  imports: [TimeagoModule, FormsModule],
  templateUrl: './members-messages.component.html',
  styleUrl: './members-messages.component.css'
})
export class MembersMessagesComponent implements OnInit, AfterViewChecked {
  
  @ViewChild('messageForm') messageForm?: NgForm;
  @ViewChild('scrollMe') scrollContainer?: any;
  @ViewChild('editTextarea') editTextarea?: ElementRef;
  messageService = inject(MessageService);
  accountService = inject(AccountService);
  username = input.required<string>();
  messageContent = '';
  isSending = false; // Add sending state
  
  // Edit functionality
  editingMessageId: number | null = null;
  editMessageContent = '';
  
  // Scroll management
  private lastMessageCount = 0;
  private shouldAutoScroll = true;

  constructor() {
    // Auto-scroll when new messages are added
    effect(() => {
      const messages = this.messageService.messageThread();
      if (messages.length > this.lastMessageCount) {
        this.lastMessageCount = messages.length;
        setTimeout(() => {
          if (this.shouldAutoScroll) {
            this.scrollToBottom();
          }
        }, 100);
      }
    });
  }

  ngOnInit(): void {
    this.setupScrollListener();
  }

  private setupScrollListener(): void {
    setTimeout(() => {
      if (this.scrollContainer) {
        const element = this.scrollContainer.nativeElement;
        
        element.addEventListener('scroll', () => {
          const isAtBottom = element.scrollHeight - element.clientHeight <= element.scrollTop + 100;
          this.shouldAutoScroll = isAtBottom;
        });
      }
    }, 100);
  }

  get currentUsername(): string {
    return this.accountService.currentUser()?.username || '';
  }

  onInputEnterKey(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    // Prevent default to avoid double submission
    keyboardEvent.preventDefault();
    // Only submit if the form is valid and message is not empty and not currently sending
    if (this.messageForm?.valid && this.messageContent.trim() && !this.isSending) {
      this.sendMessage();
    }
  }

  sendMessage(){
    // Prevent sending empty messages or sending while already sending
    if (!this.messageContent.trim() || this.isSending) {
      return;
    }
    
    this.isSending = true;
    this.messageService.sendMessage(this.username(), this.messageContent).then(() => {
      this.messageForm?.reset();
      this.scrollToBottom();
      this.isSending = false;
    }).catch(() => {
      this.isSending = false;
    })
  }

  canEditMessage(message: Message): boolean {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const messageSentDate = new Date(message.messageSent);
    return messageSentDate > oneMinuteAgo;
  }

  startEdit(message: Message): void {
    this.editingMessageId = message.id;
    this.editMessageContent = message.content;
    
    // Focus the textarea after the view updates
    setTimeout(() => {
      if (this.editTextarea) {
        this.editTextarea.nativeElement.focus();
        this.editTextarea.nativeElement.select();
      }
    }, 100);
  }

  cancelEdit(): void {
    this.editingMessageId = null;
    this.editMessageContent = '';
  }

  onTextareaKeydown(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.key === 'Enter' && !keyboardEvent.shiftKey) {
      event.preventDefault();
      this.saveMessageEdit();
    }
  }

  saveMessageEdit(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    
    if (!this.editMessageContent.trim() || !this.editingMessageId) {
      return;
    }

    this.messageService.editMessage(this.editingMessageId, this.editMessageContent.trim()).then(() => {
      this.editingMessageId = null;
      this.editMessageContent = '';
    }).catch((error: any) => {
      console.error('Failed to edit message:', error);
      // Optionally show error message to user
    });
  }

  ngAfterViewChecked(): void {
    // Only auto-scroll on initial load, not on every change detection cycle
    if (this.lastMessageCount === 0 && this.messageService.messageThread().length > 0) {
      this.lastMessageCount = this.messageService.messageThread().length;
      this.scrollToBottom();
    }
  }

  private scrollToBottom(){
    if(this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    }
  }

}
