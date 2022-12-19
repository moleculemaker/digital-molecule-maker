import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

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
    OverlayComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    DragDropModule,
    OverlayModule
  ],
  providers: [DroppableService],
  bootstrap: [AppComponent]
})
export class AppModule { }
