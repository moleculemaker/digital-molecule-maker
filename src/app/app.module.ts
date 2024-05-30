import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NgxMatomoTrackerModule } from '@ngx-matomo/tracker';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { AppBuildComponent } from './app-build/app-build.component';
import { AppHeaderComponent } from './app-header/app-header.component';
import { AppSidebarComponent } from './app-sidebar/app-sidebar.component';

import { BlockComponent } from './block/block.component';
import { InplaceComponent } from './inplace/inplace.component';
import { PanelComponent } from './panel/panel.component';
import { SplashComponent } from './splash/splash.component';
import { TutorialComponent } from './tutorial/tutorial.component';

import { OverlayModule } from '@angular/cdk/overlay';

import { DraggableDirective } from './drag-drop-utilities/draggable/draggable.directive';
import { DraggableHelperDirective } from './drag-drop-utilities/draggable/draggable-helper.directive';

import { DroppableDirective } from './drag-drop-utilities/droppable/droppable.directive';
import { DropZoneDirective } from './drag-drop-utilities/droppable/drop-zone.directive';
import { BlockSvgComponent } from './block-svg/block-svg.component';
import { MoleculeSvgComponent } from './molecule-svg/molecule-svg.component';
import { ScatterPlotComponent } from './scatterplot/scatter-plot.component';

import { SliderModule } from 'primeng/slider';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { DialogModule } from 'primeng/dialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { MessagesModule } from 'primeng/messages';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';

import { TrackingService } from './services/tracking.service';
import { EnvironmentService } from './services/environment.service';
import { ChemicalPropertyPipe } from './pipes/chemical-property.pipe';
import { LoginComponent } from './login/login.component';
import { GroupsComponent } from './groups/groups.component';
import { GroupCartComponent } from './group-cart/group-cart.component';
import { MoleculeSummaryComponent } from './molecule-summary/molecule-summary.component';
import { BlockLibraryComponent } from './block-library/block-library.component';
import { DetailPanelComponent } from './detail-panel/detail-panel.component';
import { MoleculeDetailComponent } from './molecule-detail/molecule-detail.component';
import { NgOptimizedImage } from '@angular/common';
import { SafeUrlPipe } from './pipes/safe-url.pipe';
import { AdminComponent } from './admin/admin.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { MiniGameComponent } from './mini-game/mini-game.component';

// The arguments to this function are injected based on the `deps` field next to `useFactory`
function initializeAppFactory(
  trackingService: TrackingService,
  envService: EnvironmentService,
) {
  return () => {
    return envService.loadEnvConfig('/assets/config/envvars.json');
  };
}

@NgModule({
  declarations: [
    AppComponent,
    AppBuildComponent,
    AppHeaderComponent,
    AppSidebarComponent,

    DraggableDirective,
    DraggableHelperDirective,
    DroppableDirective,
    DropZoneDirective,

    ChemicalPropertyPipe,

    BlockComponent,
    InplaceComponent,
    PanelComponent,
    SplashComponent,
    TutorialComponent,
    BlockSvgComponent,
    MoleculeSvgComponent,
    ScatterPlotComponent,
    LoginComponent,
    GroupsComponent,
    GroupCartComponent,
    MoleculeSummaryComponent,
    BlockLibraryComponent,
    DetailPanelComponent,
    MoleculeDetailComponent,
    SafeUrlPipe,
    AdminComponent,
    MiniGameComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    NgxMatomoTrackerModule.forRoot({
      siteId: 2,
      trackerUrl: 'https://matomo.mmli1.ncsa.illinois.edu/',
    }),
    DragDropModule,
    OverlayModule,
    SliderModule,
    InputTextModule,
    ButtonModule,
    PasswordModule,
    DialogModule,
    RadioButtonModule,
    MessagesModule,
    DropdownModule,
    TableModule,
    NgOptimizedImage,
  ],
  providers: [
    {
      // we need an APP_INITIALIZER in order to force the TrackingService constructor
      // to run immediately. that'll ensure we're recording all changes of route.
      provide: APP_INITIALIZER,
      useFactory: initializeAppFactory,
      deps: [TrackingService, EnvironmentService],
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
