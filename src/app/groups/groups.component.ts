import { Component, HostListener } from '@angular/core';
import { UserService } from '../services/user.service';
import { UserGroup } from '../models';
import { BlockService, BlockSetId } from '../services/block.service';
import { Router } from '@angular/router';
import { WorkspaceService } from '../services/workspace.service';
import { Message } from 'primeng/api';

@Component({
  selector: 'dmm-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss'],
})
export class GroupsComponent {
  errorMessages: Message[] = [];

  groups: UserGroup[] = [];

  indices = [...Array(5).fill(0).keys()];
  joinCode = ''

  newGroupName: string = '';
  availableBlockSets = [BlockSetId.ColorWheel, BlockSetId.OPV];
  newGroupBlockSetId: BlockSetId = BlockSetId.ColorWheel;

  _joinCodePopupVisible = false;
  get joinCodePopupVisible() {
    return this._joinCodePopupVisible;
  }

  set joinCodePopupVisible(v) {
    this._joinCodePopupVisible = v;
    if (!v) {
      this.joinCode = ''
      this.joinCodeCreated = false;
    }
  }

  joinCodeCreated = false;

  constructor(
    private userService: UserService,
    private router: Router,
  ) {
    this.fetchGroups();
  }

  @HostListener('document:keydown', ['$event'])
  onKeyUp(e: KeyboardEvent) {
    if (this.joinCodeCreated) return;
    if (this.joinCode.length && e.key === 'Backspace') {
      this.joinCode = this.joinCode.slice(0, -1);
    } else if (this.joinCode.length < 5 && /^[a-z0-9]$/.test(e.key)) {
      this.joinCode = this.joinCode + e.key.toUpperCase()
    }
  }

  enterWorkspace(groupId: number) {
    this.router.navigateByUrl(`groups/${groupId}/build`);
  }

  fetchGroups() {
    this.userService
      .getUserGroups()
      .subscribe((groups) => (this.groups = groups));
  }

  joinGroup() {
    this.userService.joinGroup(this.joinCode).subscribe(
      () => {
        this.fetchGroups();
        this.joinCodePopupVisible = false;
      },
      () => {
        this.errorMessages = [
          { severity: 'error', detail: `Group doesn't exist` },
        ];
      },
    );
  }

  createJoinCode() {
    this.userService.generateCode().subscribe(({code}) => {
      this.joinCode = code;
      this.joinCodeCreated = true;
    })
  }

  createGroup() {
    this.userService
      .createGroup(
        this.joinCode,
        this.newGroupName,
        this.newGroupBlockSetId,
      )
      .subscribe(
        () => {
          this.fetchGroups();
          this.joinCodePopupVisible = false;
        },
        ({ error }) => {
          this.errorMessages = [{ severity: 'error', detail: error?.detail }];
        },
      );
  }

  copyJoinCode() {
    navigator.clipboard.writeText(this.joinCode);
  }
}
