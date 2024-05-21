import { SafeUrlPipe } from './safe-url.pipe';
import { TestBed } from '@angular/core/testing';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';

describe('SafeUrlPipe', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BrowserModule],
    });
  });
  it('create an instance', () => {
    const sanitizer = TestBed.get(DomSanitizer);
    const pipe = new SafeUrlPipe(sanitizer);
    expect(pipe).toBeTruthy();
  });
});
