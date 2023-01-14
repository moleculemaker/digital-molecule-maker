import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { Observable, of } from 'rxjs';

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

import { OverlayModule } from '@angular/cdk/overlay';
import { OverlayComponent } from './overlay/overlay.component';

import { DraggableDirective } from './drag-drop-utilities/draggable/draggable.directive';
import { DraggableHelperDirective } from './drag-drop-utilities/draggable/draggable-helper.directive';

import { DroppableDirective } from './drag-drop-utilities/droppable/droppable.directive';
import { DropZoneDirective } from './drag-drop-utilities/droppable/drop-zone.directive';
import { DroppableService } from './drag-drop-utilities/droppable/droppable.service';
import { BlockSvgComponent } from './block-svg/block-svg.component';
import { MoleculeSvgComponent } from './molecule-svg/molecule-svg.component';

import { TrackingService } from './services/tracking.service';

// placeholder implementation
function initializeAppFactory(): () => Observable<null> {
  return () => of(null);
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

    BlockComponent,
    InplaceComponent,
    PanelComponent,
    SplashComponent,
    BlockSvgComponent,
    OverlayComponent,
    MoleculeSvgComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    NgxMatomoTrackerModule.forRoot({
      siteId: 1,
      trackerUrl: 'https://moleculemaker.matomo.cloud/'
    }),
    DragDropModule,
    OverlayModule
  ],
  providers: [
    DroppableService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAppFactory,
      deps: [TrackingService], // ensures the TrackingService constructor runs immediately
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
