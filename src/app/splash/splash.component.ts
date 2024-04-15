import {
  Component,
  HostListener,
  OnInit,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { UserService } from '../services/user.service';

export enum PromptType {
  Code = 'Code',
  // TODO: will username and password be entered here, or will we redirect to another screen?
  UsernameAndPassword = 'UsernameAndPassword',
  None = 'None',
}

@Component({
  selector: 'splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss'],
})
export class SplashComponent implements OnInit {
  @ViewChild('blueLeftEye') blueLeftEye: ElementRef | null = null;
  @ViewChild('blueRightEye') blueRightEye: ElementRef | null = null;

  @HostListener('document:pointermove', ['$event']) onPointerMove(e: PointerEvent) {
    this.pointerMove(e);
  }

  promptType$: Observable<PromptType>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
  ) {
    this.promptType$ = this.route.data.pipe(
      map((data) => data?.promptType || PromptType.None),
    );
  }

  //********************************************
  ngOnInit(): void {}

  //********************************************
  ngAfterViewInit() {
    //setup eye movements
  }

  //********************************************
  pointerMove(e: PointerEvent) {
    const eyeOffset = -135;

    if (this.blueLeftEye) {
      const rect = this.blueLeftEye.nativeElement.getBoundingClientRect();

      const pointer = {
        x: rect.left + rect.width / 2 - e.clientX,
        y: rect.top + rect.height / 2 - e.clientY,
      };

      const rotation = (Math.atan2(pointer.x, pointer.y) * 180) / Math.PI;

      this.blueLeftEye.nativeElement.style.setProperty(
        '--deg',
        -rotation + eyeOffset + 'deg',
      );
    }

    if (this.blueRightEye) {
      const rect = this.blueRightEye.nativeElement.getBoundingClientRect();

      const pointer = {
        x: rect.left + rect.width / 2 - e.clientX,
        y: rect.top + rect.height / 2 - e.clientY,
      };

      const rotation = (Math.atan2(pointer.x, pointer.y) * 180) / Math.PI;

      this.blueRightEye.nativeElement.style.setProperty(
        '--deg',
        -rotation + eyeOffset + 'deg',
      );
    }
  }

  //********************************************

  onEnterCode(code: string): void {
    // TODO: validate code and display any error messages in template
    // this.userService.setUser({ surveyCode: code.trim() });
    this.navigateToLogin(true);
  }

  navigateToLogin(code = false): void {
    this.router.navigate(['login']);
  }

  // accessor to allow using the PromptType enum in the template
  public get PromptType() {
    return PromptType;
  }
}
