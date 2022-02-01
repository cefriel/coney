import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ValueDistrBarChart } from './value-distr-bar-chart.component';

describe('BarChartComponent', () => {
  let component: ValueDistrBarChart;
  let fixture: ComponentFixture<ValueDistrBarChart>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ValueDistrBarChart ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ValueDistrBarChart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
