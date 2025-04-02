import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MembersService } from '../../_services/members.service';
import { ActivatedRoute } from '@angular/router';
import { Member } from '../../_models/member';
import { TabDirective, TabsetComponent, TabsModule } from 'ngx-bootstrap/tabs';
import { TimeagoModule } from 'ngx-timeago';
import { DatePipe } from '@angular/common';
import { MembersMessagesComponent } from "../members-messages/members-messages.component";
import { Message } from '../../_models/message';
import { MessageService } from '../../_services/message.service';


@Component({
    selector: 'app-member-detail',
    standalone: true, // Add this line to make the component standalone
    imports: [TabsModule, TimeagoModule, DatePipe, MembersMessagesComponent],
    templateUrl: './member-detail.component.html',
    styleUrl: './member-detail.component.css'
})
export class MemberDetailComponent implements OnInit {
  private messageService = inject(MessageService);
  @ViewChild('memberTabs', {static: true}) memberTabs?: TabsetComponent;
  private memberService = inject(MembersService); 
  private route = inject(ActivatedRoute);
  member: Member = {} as Member;
  activeTab?: TabDirective;
  messages: Message[] = [];

  ngOnInit(): void {

    this.route.data.subscribe({
      next: data => {
        this.member = data['member'];
      } 
    })

    this.route.queryParams.subscribe({  
      next: params => {
        params['tab'] && this.selectTab(params['tab'])
      }
    })
  }

  onUpdateMessages(event: Message){
    this.messages.push(event);
  }

  selectTab(heading: string){
    if(this.memberTabs){
      const messageTab = this.memberTabs.tabs.find(x => x.heading === heading);
      if(messageTab) messageTab.active = true;
    }
  }

  onTabActivated(data: TabDirective){
    this.activeTab = data;
    if(this.activeTab.heading ==='Messages' && this.messages.length === 0 && this.member){
      this.messageService.getMessageThread(this.member.username).subscribe({
        next:messages => this.messages = messages
      })
    }
  }

  // loadMember(){
  //   const username = this.route.snapshot.paramMap.get('username');
  //   if(!username) return;
  //   this.memberService.getMember(username).subscribe({
  //     next: member => { 
  //       this.member = member
  //     }
  //   })
  // }


}
