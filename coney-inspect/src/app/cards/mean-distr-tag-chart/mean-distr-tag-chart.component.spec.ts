import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeanDistrTagChartComponent } from './mean-distr-tag-chart.component';

describe('MeanDistrTagChartComponent', () => {
  let component: MeanDistrTagChartComponent;
  let fixture: ComponentFixture<MeanDistrTagChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeanDistrTagChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeanDistrTagChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
