import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';

@Component({
  selector: 'dmm-molecule',
  templateUrl: './molecule.component.html',
  styleUrls: ['./molecule.component.scss']
})
export class MoleculeComponent implements OnInit {
  @ViewChild('childComponentTemplate') childComponentTemplate: TemplateRef<any>|null = null;

  @Input()
  name?: string;

  constructor() { }

  ngOnInit(): void {
  }

  onClick(): void {
    alert(this.name);
  }

}
