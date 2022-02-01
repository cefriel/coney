import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenEndedQuestionsComponent } from './open-ended-questions.component';

describe('OpenEndedQuestionsComponent', () => {
  let component: OpenEndedQuestionsComponent;
  let fixture: ComponentFixture<OpenEndedQuestionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenEndedQuestionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenEndedQuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
