import { inject, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CanActivateSurveyCode } from './guards/survey-code.guard';
import { UserService } from './services/user.service';

import { AppBuildComponent } from './app-build/app-build.component';
import { PromptType, SplashComponent } from './splash/splash.component';
import { LoginComponent } from './login/login.component';
import { GroupsComponent } from './groups/groups.component';
import { GroupCartComponent } from './group-cart/group-cart.component';
import { BlockLibraryComponent } from './block-library/block-library.component';
import {AdminComponent} from "./admin/admin.component";

const routes: Routes = [
  {
    path: '',
    component: SplashComponent,
    data: {
      promptType: PromptType.None,
    },
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [
      () => {
        return inject(UserService).isAdmin();
      },
    ],
  },
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
    component: BlockLibraryComponent,
    canActivate: [
      () => {
        return inject(UserService).isLoggedIn();
      },
    ],
  },
  {
    path: 'library/:blockSetId/build',
    component: AppBuildComponent,
    canActivate: [
      () => {
        return inject(UserService).isLoggedIn();
      },
    ],
  },
  {
    path: 'groups',
    component: GroupsComponent,
    canActivate: [
      () => {
        const userService = inject(UserService);
        return userService.isLoggedIn() && !userService.isGuest();
      },
    ],
  },
  {
    path: 'groups/:groupId/build',
    component: AppBuildComponent,
    canActivate: [
      () => {
        const userService = inject(UserService);
        return userService.isLoggedIn() && !userService.isGuest();
      },
    ],
  },
  {
    path: 'groups/:groupId/cart',
    component: GroupCartComponent,
    canActivate: [
      () => {
        const userService = inject(UserService);
        return userService.isLoggedIn() && !userService.isGuest();
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
