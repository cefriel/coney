import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckboxBarChartComponent } from './checkbox-bar-chart.component';

describe('CheckboxBarChartComponent', () => {
  let component: CheckboxBarChartComponent;
  let fixture: ComponentFixture<CheckboxBarChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckboxBarChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckboxBarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
