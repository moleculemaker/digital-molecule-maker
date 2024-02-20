import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NgxMatomoTrackerModule } from '@ngx-matomo/tracker';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { AppBuildComponent } from './dmm/components/app-build/app-build.component';
import { AppHeaderComponent } from './dmm/components/app-header/app-header.component';
import { AppSidebarComponent } from './dmm/components/app-sidebar/app-sidebar.component';

import { BlockComponent } from './dmm/components/block/block.component';
import { InplaceComponent } from './dmm/components/inplace/inplace.component';
import { PanelComponent } from './dmm/components/panel/panel.component';
import { SplashComponent } from './dmm/components/splash/splash.component';
import { TutorialComponent } from './dmm/components/tutorial/tutorial.component';

import { OverlayModule } from '@angular/cdk/overlay';
import { OverlayComponent } from './dmm/components/overlay/overlay.component';

import { DraggableDirective } from './dmm/drag-drop-utilities/draggable/draggable.directive';
import { DraggableHelperDirective } from './dmm/drag-drop-utilities/draggable/draggable-helper.directive';

import { DroppableDirective } from './dmm/drag-drop-utilities/droppable/droppable.directive';
import { DropZoneDirective } from './dmm/drag-drop-utilities/droppable/drop-zone.directive';
import { BlockSvgComponent } from './dmm/components/block-svg/block-svg.component';
import { MoleculeSvgComponent } from './dmm/components/molecule-svg/molecule-svg.component';

import { TrackingService } from './dmm/services/tracking.service';
import { EnvironmentService } from './dmm/services/environment.service';
import { ChemicalPropertyPipe } from './dmm/pipes/chemical-property.pipe';

import { CWBlockTypeFilterComponent } from './block-sets/color-wheel/cw-block-type-filter/cw-block-type-filter.component';
import { CWColorFilterComponent } from './block-sets/color-wheel/cw-color-filter/cw-color-filter.component';
import { CWSidebarBlockLambdaMaxComponent } from './block-sets/color-wheel/cw-sidebar-block-lambda-max/cw-sidebar-block-lambda-max.component';
import { CWWorkspaceBlockLambdaMaxComponent } from './block-sets/color-wheel/cw-workspace-block-lambda-max/cw-workspace-block-lambda-max.component';
import { OPVSidebarBlockSOComponent } from './block-sets/opv/opv-sidebar-block-so/opv-sidebar-block-so.component';
import { OPVWorkspaceBlockSOComponent } from './block-sets/opv/opv-workspace-block-so/opv-workspace-block-so.component';
import { OpvSoSliderComponent } from './block-sets/opv/opv-so-slider/opv-so-slider.component';

import { SliderModule } from 'primeng/slider';

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
    CWColorFilterComponent,
    CWSidebarBlockLambdaMaxComponent,
    CWWorkspaceBlockLambdaMaxComponent,
    OPVSidebarBlockSOComponent,
    OPVWorkspaceBlockSOComponent,
    OpvSoSliderComponent,
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
