import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnswerTextComponent } from './answer-text.component';

describe('AnswerTextComponent', () => {
  let component: AnswerTextComponent;
  let fixture: ComponentFixture<AnswerTextComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnswerTextComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnswerTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
