import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnswerScaleComponent } from './answer-scale.component';

describe('AnswerScaleComponent', () => {
  let component: AnswerScaleComponent;
  let fixture: ComponentFixture<AnswerScaleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnswerScaleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnswerScaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
