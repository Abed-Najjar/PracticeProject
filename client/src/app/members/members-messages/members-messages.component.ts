import { Component, inject, input, ViewChild } from '@angular/core';
import { MessageService } from '../../_services/message.service';
import { TimeagoModule } from 'ngx-timeago';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-members-messages',
  standalone: true,
  imports: [TimeagoModule, FormsModule],
  templateUrl: './members-messages.component.html',
  styleUrl: './members-messages.component.css'
})
export class MembersMessagesComponent {
  @ViewChild('messageForm') messageForm?: NgForm
  messageService = inject(MessageService);
  username = input.required<string>();
  messageContent = '';

  sendMessage(){
    this.messageService.sendMessage(this.username(), this.messageContent).then(() => {
      this.messageForm?.reset();
    })
  }

}
