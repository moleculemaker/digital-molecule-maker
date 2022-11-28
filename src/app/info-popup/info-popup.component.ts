import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { PopupType } from '../models';

@Component({
  selector: 'dmm-info-popup',
  templateUrl: './info-popup.component.html',
  styleUrls: ['./info-popup.component.scss']
})
export class InfoPopupComponent implements OnInit {
  @ViewChild('childComponentTemplate') childComponentTemplate: TemplateRef<any>|null = null;

  @Input()
  popupType = PopupType.Molecule;

  tags = ["High Luninance", "Medical"];

  properties = [
    {name: "ID", value: "DB_24"},
    {name: "Chemical Formula", value: "C18H28O2"},
    {name: "Molecular Weight", value: "267.4 g/mol"},
  ];

  verified = true;

  constructor() { }

  ngOnInit(): void {
  }

}
