import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeanPerTagComponent } from './mean-per-tag.component';

describe('MeanPerTagComponent', () => {
  let component: MeanPerTagComponent;
  let fixture: ComponentFixture<MeanPerTagComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeanPerTagComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeanPerTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
