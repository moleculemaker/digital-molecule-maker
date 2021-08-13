import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-build',
  templateUrl: './app-build.component.html',
  styleUrls: ['./app-build.component.scss']
})
export class AppBuildComponent implements OnInit {
  isShowingAnalysis:Boolean = false;
  isShowingSendToLab:Boolean = false;

  blockList:any = [];
  maxBlockListQuantity:Number = 3; //controls where start, middle, and end blocks can be added

  currentTab:String = 'start';

  constructor() { }

  //********************************************
  ngOnInit(): void {
    //start with a blank block
    this.addBlankBlock();
  }

  //********************************************
  toggleAnalysisPanel() {
    this.isShowingAnalysis = !this.isShowingAnalysis;
  }

  //********************************************
  toggleSendToLabModal() {
    this.isShowingSendToLab = !this.isShowingSendToLab;
  }

  //********************************************
  selectTab(newTab:String) {
    this.currentTab = newTab;
  }

  //********************************************
  addBlock(block:any, addIndex:any) {
    //todo - allow adding at various points in the array
//    if (typeof addIndex == 'undefined') {addIndex = this.blockList.length;}

//for now, only allow data in the 3 different spots in the array
    if (block.type == 'start') {
      addIndex = 0;
    } else if (block.type == 'middle') {
      addIndex = 1;
    } else {
      addIndex = 2;
    }

    //determine if this is an add or update
    let isAddingAtEnd = (addIndex == this.blockList.length - 1 && !this.blockList[addIndex].svgUrl) ? true : false;

    //update the current block
    this.blockList[addIndex] = block;

    //if inserted, and not at the end, then add the next block
    if (isAddingAtEnd) {this.addBlankBlock();}

    //make sure isShowingAnalysis is closed
    if (this.isShowingAnalysis) {this.toggleAnalysisPanel();}
  }

  //********************************************
  addBlankBlock() {
    //if not full yet, add a blank block at the end
    if (this.blockList.length < this.maxBlockListQuantity) {
      let blockLength = this.blockList.length;
      let type = 'start';

      if (blockLength == 0) {
        type = 'start';
      } else if (blockLength > 0 && blockLength < this.maxBlockListQuantity) {
        type = 'middle';
      } else {
        type = 'end';
      }

      this.blockList.push({
        type: type,
        label: '',
        svgUrl: '',
      });

      //determine which tab should be shown
      let newTab = 'end';
      if (this.blockList.length < this.maxBlockListQuantity && this.blockList.length != 1) {
        newTab = 'middle';
      } else if (this.blockList.length == 1) {
        newTab = 'start';
      }

      this.selectTab(newTab);
    }
  }
}
