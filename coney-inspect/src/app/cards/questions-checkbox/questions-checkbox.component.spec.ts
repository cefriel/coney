import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionsCheckboxComponent } from './questions-checkbox.component';

describe('PieChartComponent', () => {
  let component: QuestionsCheckboxComponent;
  let fixture: ComponentFixture<QuestionsCheckboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuestionsCheckboxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionsCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
