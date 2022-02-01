import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultipleChoicePieChartComponent } from './multiple-choice-pie-chart.component';

describe('MultipleChoicePieChartComponent', () => {
  let component: MultipleChoicePieChartComponent;
  let fixture: ComponentFixture<MultipleChoicePieChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultipleChoicePieChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultipleChoicePieChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
