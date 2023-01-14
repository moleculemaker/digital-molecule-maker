import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CanActivateSurveyCode } from './guards/survey-code.guard';
import { UserService } from './services/user.service';

import { AppBuildComponent } from './app-build/app-build.component';
import { PromptType, SplashComponent } from './splash/splash.component';

const routes: Routes = [
  { path: '',
    component: SplashComponent,
    data: {
      promptType: PromptType.None
    }
  },
  { path: 'activity',
    component: SplashComponent,
    data: {
      promptType: PromptType.Code
    }
  },
  {
    path: 'build',
    component: AppBuildComponent,
    canActivate: [CanActivateSurveyCode]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [CanActivateSurveyCode, UserService]
})
export class AppRoutingModule { }
