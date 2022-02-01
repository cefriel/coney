import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-duration-bar-chart',
  templateUrl: './duration-bar-chart.component.html',
  styleUrls: ['./duration-bar-chart.component.css']
})
export class DurationBarChartComponent implements OnInit {

  @Input() data: { max: number, array: any };

  @ViewChild('durationChart', { static: true })
  private chartContainer: ElementRef;

  public colors = ['rgb(141, 160, 203)'];
  barChartData;
  tempMax;
  margin = { top: 20, right: 20, bottom: 30, left: 40 };

  constructor() {
  }

  onResize() {
    this.createChart();
  }

  onChanges() {
    this.createChart();
  }

  ngOnInit() {

    this.barChartData = [];
    var dataToFilter = this.data.array;
    var atom = (this.data.max + (this.data.max * 0.1)) / 15;
   
    for (var i = 1; i <= 15; i++) {
      var step = {
        value: Math.floor(atom * i),
        amount: 0,
        color: this.colors[0]
      };
      for (var j = 0; j < dataToFilter.length; j++) {

        if (dataToFilter[j] < (atom * i)) {
          step.amount++;
          dataToFilter.splice(j, 1);
          j--;
        }
      }
      this.barChartData.push(step);
    }
    this.tempMax = Math.max.apply(Math, this.barChartData.map(function (o) { return o.amount; }));
    this.createChart();
  }

  private createChart(): void {
   
    let data: [{ value: number, amount: number, color: string }];
    data = this.barChartData;
    
    var prev = document.getElementById('durationBarChart');
    if (prev != undefined && prev != null) {
      prev.remove();
    }

    const element = this.chartContainer.nativeElement;

    const svg = d3.select(element).append('svg')
      .attr('width', element.offsetWidth)
      .attr('height', element.offsetHeight)
      .attr('id', 'durationBarChart');

    const contentWidth = element.offsetWidth - this.margin.left - this.margin.right;
    const contentHeight = element.offsetHeight - this.margin.top - this.margin.bottom;

    const x = d3
      .scaleBand()
      .rangeRound([0, contentWidth])
      .padding(0.1)
      .domain(data.map(d => d.value + ""));

    const y = d3
      .scaleLinear()
      .rangeRound([contentHeight, 0])
      .domain([0, this.tempMax]);

    const g = svg.append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

    g.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + contentHeight + ')')
      .call(d3.axisBottom(x));

    g.append('g')
      .attr('class', 'axis axis--y')
      .call(d3.axisLeft(y).ticks(5))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 10)
      .attr('dy', '0.71em')
      .attr('text-anchor', 'end')
      .text('Frequency');

    g.selectAll('.bar')
      .data(data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.value + ""))
      .attr('y', d => y(d.amount))
      .attr('width', x.bandwidth())
      .attr('height', d => contentHeight - y(d.amount))
      .attr('fill', d => d.color);
  }

}