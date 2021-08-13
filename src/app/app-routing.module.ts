import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppBuildComponent } from './app-build/app-build.component';

const routes: Routes = [
  { path: '',   redirectTo: '/build', pathMatch: 'full' },
  {
    path: 'build',
    component: AppBuildComponent,
  },
//  { path: '',   redirectTo: '/first-component', pathMatch: 'full' },
//  { path: '**', component:  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
