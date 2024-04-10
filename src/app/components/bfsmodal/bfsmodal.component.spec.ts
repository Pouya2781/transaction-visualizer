import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BFSModalComponent } from './bfsmodal.component';

describe('BFSModalComponent', () => {
  let component: BFSModalComponent;
  let fixture: ComponentFixture<BFSModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BFSModalComponent]
    });
    fixture = TestBed.createComponent(BFSModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
