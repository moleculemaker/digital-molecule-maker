import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
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
import { OverlayComponent } from './overlay/overlay.component';

import { DraggableDirective } from './drag-drop-utilities/draggable/draggable.directive';
import { DraggableHelperDirective } from './drag-drop-utilities/draggable/draggable-helper.directive';

import { DroppableDirective } from './drag-drop-utilities/droppable/droppable.directive';
import { DropZoneDirective } from './drag-drop-utilities/droppable/drop-zone.directive';
import { BlockSvgComponent } from './block-svg/block-svg.component';
import { MoleculeSvgComponent } from './molecule-svg/molecule-svg.component';

import { TrackingService } from './services/tracking.service';
import { EnvironmentService } from './services/environment.service';
import { ChemicalPropertyPipe } from './pipes/chemical-property.pipe';
import { CWBlockTypeFilterComponent } from './block-sets/color-wheel/cw-block-type-filter/cw-block-type-filter.component';

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
    OverlayComponent,
    MoleculeSvgComponent,
    CWBlockTypeFilterComponent,
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
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
