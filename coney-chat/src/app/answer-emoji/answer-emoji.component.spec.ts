import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnswerEmojiComponent } from './answer-emoji.component';

describe('AnswerEmojiComponent', () => {
  let component: AnswerEmojiComponent;
  let fixture: ComponentFixture<AnswerEmojiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnswerEmojiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnswerEmojiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
