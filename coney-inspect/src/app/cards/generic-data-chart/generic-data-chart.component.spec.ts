import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericDataChartComponent } from './generic-data-chart.component';

describe('GenericDataChartComponent', () => {
  let component: GenericDataChartComponent;
  let fixture: ComponentFixture<GenericDataChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenericDataChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenericDataChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
