import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'bypassSanitizer',
})
export class BypassSanitizerPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string, ...args: unknown[]): unknown {
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }
}
