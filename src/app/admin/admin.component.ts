import { Component, OnInit } from '@angular/core';
import { MoleculeDTO } from '../models';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { EnvironmentService } from '../services/environment.service';
import { UserService } from '../services/user.service';
import { Message } from 'primeng/api';

@Component({
  selector: 'dmm-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit {
  messages: Message[] = [];
  molecules: MoleculeDTO[] = [];

  constructor(
    private userService: UserService,
    private envService: EnvironmentService,
    private http: HttpClient,
  ) {}

  ngOnInit() {
    const { hostname } = this.envService.getEnvConfig();
    this.http
      .get<MoleculeDTO[]>(`${hostname}/synthesis/`, {
        headers: {
          authorization: `Bearer ${this.userService.user$.value?.access_token}`,
        },
      })
      .subscribe((molecules) => {
        this.molecules = molecules;
      });
  }

  synthesize(moleculeId: number) {
    const { hostname } = this.envService.getEnvConfig();
    this.messages = [
      { severity: 'info', detail: 'Sending synthesis request...' },
    ];
    this.http
      .post(`${hostname}/synthesis/${moleculeId}`, null, {
        headers: {
          authorization: `Bearer ${this.userService.user$.value?.access_token}`,
        },
      })
      .subscribe(
        () => {
          this.messages = [
            { severity: 'success', detail: 'Synthesis request accepted!' },
          ];
        },
        (error: HttpErrorResponse) => {
          this.messages = [{ severity: 'error', detail: error.error.detail }];
        },
      );
  }
}
