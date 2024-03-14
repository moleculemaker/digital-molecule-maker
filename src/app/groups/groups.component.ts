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

  joinCode = Array(5).fill(' ');
  curIndex = 0;

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
      this.joinCode = Array(5).fill(' ');
      this.curIndex = 0;
      this.joinCodeCreated = false;
    }
  }

  joinCodeCreated = false;

  constructor(
    private userService: UserService,
    private blockService: BlockService,
    private workspaceService: WorkspaceService,
    private router: Router,
  ) {
    this.fetchGroups();
  }

  @HostListener('document:keyup', ['$event'])
  onKeyUp(e: KeyboardEvent) {
    if (this.joinCodeCreated) return;
    if (this.curIndex > 0 && e.key === 'Backspace') {
      this.joinCode[--this.curIndex] = ' ';
    } else if (this.curIndex < 5 && /^[A-Za-z0-9]$/.test(e.key)) {
      this.joinCode[this.curIndex++] = e.key;
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
    this.userService.joinGroup(this.joinCode.join('')).subscribe(
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
    if (this.joinCode.every((digit) => /^[A-Za-z0-9]$/.test(digit))) {
      this.joinCodeCreated = true;
    } else {
      this.errorMessages = [
        { severity: 'error', detail: `Join code must be 5 characters` },
      ];
    }
  }

  createGroup() {
    this.userService
      .createGroup(
        this.joinCode.join(''),
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
    navigator.clipboard.writeText(this.joinCode.join(''));
  }
}
