import { Component, HostListener, inject, ViewChild } from '@angular/core';
import { Member } from '../../_models/member';
import { AccountService } from '../../_services/account.service';
import { MembersService } from '../../_services/members.service';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { FormsModule, NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { PhotoEditorComponent } from "../photo-editor/photo-editor.component";
import { DatePipe } from '@angular/common';
import { TimeagoModule } from 'ngx-timeago';

@Component({
  selector: 'app-member-edit',
  standalone: true,
  imports: [TabsModule, FormsModule, PhotoEditorComponent, DatePipe, TimeagoModule],
  templateUrl: './member-edit.component.html',
  styleUrl: './member-edit.component.css'
})
export class MemberEditComponent {
  @ViewChild('editForm') editForm?: NgForm;
  @HostListener('window:beforeunload', ['$event']) notify($event:any){
    if(this.editForm?.dirty)
    {
      $event.returnValue = true;
    }
  }

  member?: Member;
  private accountService = inject(AccountService);
  private memberService = inject(MembersService);
  private toastr = inject(ToastrService);


  ngOnInit(): void{
    this.loadMember();
  }

  loadMember(){
    const user = this.accountService.currentUser();
    if(!user) return;
    console.log('Loading member data for:', user.username);
    this.memberService.getMemberFresh(user.username).subscribe({
      next: member => {
        console.log('Member data loaded:', member);
        this.member = member;
      },
      error: error => {
        console.error('Error loading member:', error);
      }
    })
  }

  updateMember(){
    // Extract only the fields that the API expects
    const updateData = {
      introduction: this.editForm?.value.introduction,
      lookingFor: this.editForm?.value.lookingFor,
      interests: this.editForm?.value.interests,
      city: this.editForm?.value.city,
      country: this.editForm?.value.country
    };

    console.log('Updating member with data:', updateData);
    console.log('Current form values:', this.editForm?.value);

    this.memberService.updateMember(updateData).subscribe({
      next: _ => {
        console.log('Update successful, reloading member data...');
        this.toastr.success("Profile updated successfully");
        
        // Add a small delay before reloading to ensure DB is updated
        setTimeout(() => {
          this.loadMember();
        }, 300);
        
        // Mark form as pristine after successful update
        setTimeout(() => {
          if (this.editForm) {
            this.editForm.form.markAsPristine();
          }
        }, 500);
      },
      error: error => {
        console.error('Update error:', error);
        this.toastr.error("Failed to update profile");
      }
    })
  }


  onMemberChange(event: Member){
    this.member = event;
  }



}
