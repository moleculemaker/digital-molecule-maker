import { ChemicalPropertyPipe } from './chemical-property.pipe';
import { TestBed } from '@angular/core/testing';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';

describe('ChemicalFormulaPipe', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BrowserModule],
    });
  });
  it('create an instance', () => {
    const sanitizer = TestBed.get(DomSanitizer);
    const pipe = new ChemicalPropertyPipe(sanitizer);
    expect(pipe).toBeTruthy();
  });
});
