import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-mean-distr-tag-chart',
  templateUrl: './mean-distr-tag-chart.component.html',
  styleUrls: ['./mean-distr-tag-chart.component.css']
})
export class MeanDistrTagChartComponent implements OnInit {
  @Input() data: [{ txtLabel: string, value: number, tag: string, min: number, max: number, question: string, user: string }];
  @Input() currentTag: string;

  @ViewChild('meanDistrChart', { static: true })
  private chartContainer: ElementRef;

  colors = ['#f33334', '#f29b1d', '#4cba6b', '#9ea8ad', '#74abe2', '#ef8d5d'];
  margin = { top: 20, right: 20, bottom: 30, left: 40 };

  min = 9999;
  max = 0;
  noNumericalData = false;
  differentScaleUsed = false;
  tagStringList: any;
  totalUsers = 0;
  chosenTag = "";
  tempMax = 0;
  tempMin = 0;
  computedMax = 0;

  constructor() { }

  ngOnInit() {
    this.chosenTag = this.currentTag;

  }

  ngOnChanges() {
    this.chosenTag = this.currentTag;
    this.updateData();
  }

  onResize() {
    if (this.data.length > 1) {
      this.noNumericalData = false;
      this.updateData();
    } else {
      var prev = document.getElementById('meanDistrLineChart');
      if (prev != undefined && prev != null) {
        prev.remove();
      }
      this.noNumericalData = true;
    }
  }

  updateData() {

    this.min = 9999;
    this.max = 0;

    this.differentScaleUsed = false;
    var preparedData = [];

    var filteredData:any = [];
    for (var j = 0; j < this.data.length; j++) {
      var element = this.data[j];
      if (element.tag == this.chosenTag || this.chosenTag == "") {
        filteredData.push(element)
      }
    }

    this.max = Math.max.apply(Math, filteredData.map(function(o) { return o.value; }))
    this.min = Math.min.apply(Math, filteredData.map(function(o) { return o.value; }))

    for (var i = 0; i < filteredData.length; i++) {
      
      if (filteredData[i].user != "") {

        var index = preparedData.findIndex(obj => obj.user === filteredData[i].user);

        if (index == -1) {
          //not found
          var tmpUser = { user: filteredData[i].user, value: filteredData[i].value, amount: 1, mean: filteredData[i].value };
          preparedData.push(tmpUser);

        } else {

          //found -> update
          preparedData[index].value += filteredData[i].value;
          preparedData[index].amount += 1;

          var val = preparedData[index].value;
          var am = preparedData[index].amount;

          preparedData[index].mean = val / am;
        }

      }
    }

   

    preparedData.sort((a, b) => (a.mean > b.mean) ? 1 : -1);

    //console.log(preparedData[Math.floor(preparedData.length / 2)]);

    var result = [];
    this.computedMax = 0;
    for (var i = 0; i < (this.max * 4); i++) {
      var lowThreshold = i * 0.25;
      var highThreshold = (i + 1) * 0.25;
      var tempArr = [highThreshold, 0];
      for (var j = 0; j < preparedData.length; j++) {
        if (preparedData[j].mean > lowThreshold && preparedData[j].mean <= highThreshold) { 
          tempArr[1] += 1;
        }
      }

      if (tempArr[1] > this.computedMax) {
        this.computedMax = tempArr[1];
      }
      result.push(tempArr);
    }
   
    if(result.length>1){
      this.createChart(result);
      this.noNumericalData = false;
    } else {
      var prev = document.getElementById('meanDistrLineChart');
      if (prev != undefined && prev != null) {
        prev.remove();
      }
      this.noNumericalData = true;
    }
    


  }

  createChart(filteredData: any) {
    
    
    this.tempMax = this.max;

    var prev = document.getElementById('meanDistrLineChart');
    if (prev != undefined && prev != null) {
      prev.remove();
    }

    const element = this.chartContainer.nativeElement;

    const svg = d3.select(element).append('svg')
      .attr('width', element.offsetWidth)
      .attr('height', element.offsetHeight)
      .attr('id', 'meanDistrLineChart');

    const contentWidth = element.offsetWidth - this.margin.left - this.margin.right;
    const contentHeight = element.offsetHeight - this.margin.top - this.margin.bottom;


    const g = svg.append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

    // add the x Axis
    var x = d3.scaleLinear()
      .domain([0, this.tempMax])
      .range([0, contentWidth])
    g.append("g")
      .attr("transform", "translate(0," + contentHeight + ")")
      .call(d3.axisBottom(x));

    // add the y Axis
    var y = d3.scaleLinear()
      .range([contentHeight, 0])
      .domain([0, Math.floor(this.computedMax * 1.2) +1]);
    g.append("g")
      .attr('class', 'axis axis--y')
      .call(d3.axisLeft(y));

    var columnWidth = (contentWidth - this.margin.left + this.margin.right) / (this.tempMax * 4);
    //bar chart
    g.selectAll('.bar')
      .data(filteredData)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d[0]))
      .attr('y', d => y(d[1]))
      .attr('width', columnWidth)
      .attr('height', d => contentHeight - y(d[1]))
      .attr('fill', 'rgba(141, 160, 203, 0.7)')
      .attr("stroke", "#777777")
      .attr("stroke-width", 1)
      .attr('transform', 'translate(-' + columnWidth / 2 + ',0)');

    // Plot the area
    g.append("path")
      .attr("class", "mypath")
      .datum(filteredData)
      .attr("fill", "transparent")
      .attr("opacity", "1")
      .attr("stroke", "#777777")
      .attr("stroke-width", 3)
      .attr("stroke-linejoin", "round")
      .attr("d", d3.line()
        .curve(d3.curveBasis)
        .x(function (d) { return x(d[0]); })
        .y(function (d) { return y(d[1]); })
      );

    g.selectAll('.rect')
      .data(filteredData)
      .enter().append('text')
      .attr('x', d => x(d[0]))
      .attr('y', d => y(d[1] + (this.tempMax * 0.1)))
      .attr('transform', 'translate(-' + columnWidth / 2 + ',0)')
      .text(function (d: any) {
        if (d[1] != 0) {
          return d[1] + "";
        } else {
          return "";
        }
      });



  }
}
