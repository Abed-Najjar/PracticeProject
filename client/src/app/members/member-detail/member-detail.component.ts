import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Member } from '../../_models/member';
import { TabDirective, TabsetComponent, TabsModule } from 'ngx-bootstrap/tabs';
import { TimeagoModule } from 'ngx-timeago';
import { DatePipe } from '@angular/common';
import { MembersMessagesComponent } from "../members-messages/members-messages.component";
import { Message } from '../../_models/message';
import { MessageService } from '../../_services/message.service';
import { PresenceService } from '../../_services/presence.service';
import { AccountService } from '../../_services/account.service';
import { HubConnectionState } from '@microsoft/signalr';


@Component({
    selector: 'app-member-detail',
    standalone: true, // Add this line to make the component standalone
    imports: [TabsModule, TimeagoModule, DatePipe, MembersMessagesComponent],
    templateUrl: './member-detail.component.html',
    styleUrl: './member-detail.component.css'
})
export class MemberDetailComponent implements OnInit, OnDestroy {

  private messageService = inject(MessageService);
  @ViewChild('memberTabs', {static: true}) memberTabs?: TabsetComponent;
  private messeageService =  inject(MessageService);
  private accountService = inject(AccountService);
  presenceService = inject(PresenceService); 
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  member: Member = {} as Member;
  activeTab?: TabDirective;


  ngOnInit(): void {

    this.route.data.subscribe({
      next: data => {
        this.member = data['member'];
      } 
    })

    this.route.paramMap.subscribe({
      next: _ => this.onRouteParamsChange()
    })

    this.route.queryParams.subscribe({  
      next: params => {
        params['tab'] && this.selectTab(params['tab'])
      }
    })
  }

  selectTab(heading: string){
    if(this.memberTabs){
      const messageTab = this.memberTabs.tabs.find(x => x.heading === heading);
      if(messageTab) messageTab.active = true;
    }
  }

  onRouteParamsChange() {
    const user = this.accountService.currentUser();
    if(!user) return;
    
    // Only handle connection if Messages tab is already active
    // This prevents duplicate connections when navigating from toast
    if(this.activeTab?.heading === 'Messages'){
      console.log('Route params changed - reconnecting messages hub');
      this.messageService.stopHubConnection();
      setTimeout(() => {
        this.messageService.createHubConnection(user, this.member.username);
      }, 100);
    }
  }

  onTabActivated(data: TabDirective){
    this.activeTab = data;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {tab: this.activeTab.heading},
      queryParamsHandling: 'merge'
    });

    if(this.activeTab.heading ==='Messages' && this.member){
        const user = this.accountService.currentUser();
        if(!user) return;
        
        console.log('Messages tab activated - creating hub connection');
        // Stop any existing connection before creating new one
        this.messageService.stopHubConnection();
        setTimeout(() => {
          this.messageService.createHubConnection(user, this.member.username);
        }, 100);
      } else {
        console.log('Non-messages tab activated - stopping hub connection');
        this.messageService.stopHubConnection();
      }
  } 
  
  ngOnDestroy(): void {
    this.messageService.stopHubConnection();
  }

}





