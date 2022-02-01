import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnswerSelectComponent } from './answer-select.component';

describe('AnswerSelectComponent', () => {
  let component: AnswerSelectComponent;
  let fixture: ComponentFixture<AnswerSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnswerSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnswerSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
