import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiniGameComponent } from './mini-game.component';

describe('MiniGameComponent', () => {
  let component: MiniGameComponent;
  let fixture: ComponentFixture<MiniGameComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MiniGameComponent]
    });
    fixture = TestBed.createComponent(MiniGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
