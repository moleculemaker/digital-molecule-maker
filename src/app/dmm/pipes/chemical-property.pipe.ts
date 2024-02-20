import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MolecularPropertyDisplayStrategy } from 'app/models';

@Pipe({
  name: 'chemicalProperty',
})
export class ChemicalPropertyPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: any, strategy: MolecularPropertyDisplayStrategy): any {
    let returnVal: any = value;
    if (strategy === 'default') {
      // no need to change anything
    } else if (strategy === 'chemicalFormula') {
      returnVal = this.sanitizer.bypassSecurityTrustHtml(
        value.replace(/(\d+)/g, '<sub>$1</sub>'),
      );
    } else {
      console.warn('Unrecognized display strategy', strategy);
    }
    return returnVal;
  }
}
