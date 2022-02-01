import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnswerSlideComponent } from './answer-slide.component';

describe('AnswerSlideComponent', () => {
  let component: AnswerSlideComponent;
  let fixture: ComponentFixture<AnswerSlideComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnswerSlideComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnswerSlideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
