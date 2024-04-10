import { inject, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CanActivateSurveyCode } from './guards/survey-code.guard';
import { UserService } from './services/user.service';

import { AppBuildComponent } from './app-build/app-build.component';
import { PromptType, SplashComponent } from './splash/splash.component';
import { LoginComponent } from './login/login.component';
import { GroupsComponent } from './groups/groups.component';
import { GroupCartComponent } from './group-cart/group-cart.component';
import {BlockLibraryComponent} from "./block-library/block-library.component";

const routes: Routes = [
  {
    path: '',
    component: SplashComponent,
    data: {
      promptType: PromptType.None,
    },
  },
  // {
  //   path: 'activity',
  //   component: SplashComponent,
  //   data: {
  //     promptType: PromptType.Code,
  //   },
  // },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'signup',
    component: LoginComponent,
  },
  {
    path: 'library',
    component: BlockLibraryComponent
  },
  {
    path: 'library/:blockSetId/build',
    component: AppBuildComponent,
    canActivate: [
      () => {
        return inject(UserService).canActivate();
      },
    ],
  },
  {
    path: 'groups',
    component: GroupsComponent,
    canActivate: [
      () => {
        return inject(UserService).canActivate();
      },
    ],
  },
  {
    path: 'groups/:groupId/build',
    component: AppBuildComponent,
    canActivate: [
      () => {
        return inject(UserService).canActivate();
      },
    ],
  },
  {
    path: 'groups/:groupId/cart',
    component: GroupCartComponent,
    canActivate: [
      () => {
        return inject(UserService).canActivate();
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [CanActivateSurveyCode, UserService],
})
export class AppRoutingModule {}
