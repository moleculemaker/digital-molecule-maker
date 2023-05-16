import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from "@angular/platform-browser";

@Pipe({
  name: 'chemicalFormula'
})
export class ChemicalFormulaPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) { }

  transform(formula: string): unknown {
    return this.sanitizer.bypassSecurityTrustHtml(formula.replace(/(\d+)/g, "<sub>$1</sub>"));
  }

}
