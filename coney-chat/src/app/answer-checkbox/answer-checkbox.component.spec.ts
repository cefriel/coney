import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnswerCheckboxComponent } from './answer-checkbox.component';

describe('AnswerCheckboxComponent', () => {
  let component: AnswerCheckboxComponent;
  let fixture: ComponentFixture<AnswerCheckboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnswerCheckboxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnswerCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
