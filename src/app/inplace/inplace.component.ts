import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  AfterContentInit,
  Output,
  ElementRef,
  ViewChild,
} from '@angular/core';
import {
  TemplateRef,
  ContentChild,
  ContentChildren,
  Directive,
  QueryList,
} from '@angular/core';

@Directive({ selector: '[templateName]' })
export class Template {
  @Input() templateName!: string;
}

@Component({
  selector: 'inplace',
  templateUrl: './inplace.component.html',
  styleUrls: ['./inplace.component.scss'],
})
export class InplaceComponent implements AfterContentInit {
  @Input()
  value: String = 'test';

  //  @Output()
  //  onClose = new EventEmitter();

  @ContentChild('display') displayTemplate!: TemplateRef<any>;
  @ContentChild('content') contentTemplate!: TemplateRef<any>;

  isEditing = false;

  //********************************************
  constructor() {}

  //********************************************
  ngOnInit(): void {}

  //********************************************
  ngAfterViewInit() {}

  //********************************************
  ngAfterContentInit() {}

  //********************************************
  toggleEditing(): void {
    this.isEditing = !this.isEditing;
  }
}
