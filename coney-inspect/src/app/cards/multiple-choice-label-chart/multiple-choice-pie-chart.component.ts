import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-multiple-choice-pie-chart',
  templateUrl: './multiple-choice-pie-chart.component.html',
  styleUrls: ['./multiple-choice-pie-chart.component.css']
})
export class MultipleChoicePieChartComponent {

  @Input() data: any;
  @Input() currentTag: string;
  
  displayBoxes = true;
  noData = false;
  questions = [];
  sessions = [];
  dataToUse: any = [];
  dataToVisualize = [];

  totalSessions = 0;
  totalEntries = 0;

  divWidth = 0;
  selectedQuestion = "";

  containerHeight = 0;
  colors = d3.schemeSet2;

  init = 0;
  type = "gen";


  constructor() { }

  ngOnChanges() {
    this.prepareQuestions();
  }

  prepareQuestions() {
    for (var i = 0; i < this.data.length; i++) {

      var element = this.data[i];
      // if(this.currentTag != "" && this.currentTag!=element.tab){
      // continue;
      //}

      if (-1 == this.questions.findIndex(obj => obj.question == element.question)) {
        var tmp = {
          question: element.question,
          tag: element.tag
        }
        this.questions.push(tmp);
      }
    }
    if (this.init == 0) {
      this.selectedQuestion = this.questions[0].question;
      this.init = 1;

    }
    this.prepareData();
  }

  prepareData() {
    this.dataToUse = [];
    this.totalEntries = 0;

    for (var i = 0; i < this.data.length; i++) {
      var element = this.data[i];
      if (element.question != this.selectedQuestion) { continue; }
      this.type="gen";
      if (!this.sessions.includes(element.session) && element.session != "") {
        this.sessions.push(element.session);
      }

      var textLabel = element.txtLabel;
      if(element.questionType.includes("star") || element.txtLabel==""){
        textLabel = ""+element.value;
        this.type="values"
      }

      var index = this.dataToUse.findIndex(obj => obj.label == textLabel);

      if (index == -1) {
        //add entry
        var tmp = {
          label: textLabel,
          amount: 0,
          value: 0,
          codedVal: element.value,
          percentage: 0,
          color: "black"
        }
        //is the user is not null
        if (element.session != "") {
          tmp.amount = 1;
          this.totalEntries += 1;
        }
        this.dataToUse.push(tmp);
      } else if (index != -1 && element.session != "") {
        //increment amount
        this.dataToUse[index].amount += 1;
        this.totalEntries += 1;
      }
    }

    this.totalSessions = this.sessions.length;
    for (var i = 0; i < this.dataToUse.length; i++) {
      this.dataToUse[i].color = this.colors[i];
      var perc = this.dataToUse[i].amount*100/this.totalEntries;
      this.dataToUse[i].percentage = Math.floor(perc*100)/100;
    }

    this.createChart();
  }

  createChart() {

    
    var widthSquares = 20;
    let contentWidth =0;

    this.dataToUse.sort((a, b) => (a.codedVal > b.codedVal) ? 1 : -1);
    this.dataToVisualize = [];

    if (this.totalEntries < 100) {
      
      this.dataToUse.sort((a, b) => (a.amount < b.amount) ? 1 : -1);

      this.displayBoxes = true;

      var boxElement = document.getElementById('multipleChoiceBoxContainer');

      if(boxElement!=null){
        contentWidth = boxElement.offsetWidth;
      }
      
    
      var widthSquares = 20;

      var prev = document.getElementsByClassName('chartBox');
      for (var i = 0; i < prev.length; i++) {
        prev.item(i).remove()
      }

      this.containerHeight = (contentWidth / widthSquares) * 5;
      for (var i = 0; i < this.dataToUse.length; i++) {
        for(var j = 0; j < this.dataToUse[i].amount; j++)
          this.dataToVisualize.push({ color: this.dataToUse[i].color, length: contentWidth / widthSquares });
      }

      this.dataToUse.sort((a, b) => (a.codedVal > b.codedVal) ? 1 : -1);

    } else {//bar chart

      var chartElement = document.getElementById('multipleChoiceChartContainer');

      this.displayBoxes = false;
      var prevChart = document.getElementById('multipleBarChart');
     
      if (prevChart != undefined && prevChart != null) {
        prevChart.remove();
      }

      const contentWidth = chartElement.offsetWidth;
      const contentHeight = chartElement.offsetHeight*0.8;


      let data: [{ label: string, amount: number, value: number, color: string }];
      data = this.dataToUse;

      const svg = d3.select(chartElement).append('svg')
        .attr('width', chartElement.offsetWidth)
        .attr('height', chartElement.offsetHeight)
        .attr('id', 'multipleBarChart');
     
      const maxValue = Math.max.apply
        (Math, data.map(function (o) { return o.amount; }));


      const x = d3
      .scaleLinear()
      .rangeRound([0, contentWidth])
      .domain([0, maxValue*1.2]);

      const y = d3
        .scaleBand()
        .rangeRound([contentHeight, 0])
        .padding(0.1)
        .domain(data.map(d => d.label));

      

      const g = svg.append('g');
      g.append('g').attr('class', 'axis axis--y').attr('transform', 'translate(0,' + contentHeight + ')')
      .call(d3.axisLeft(y).scale(y).tickValues([]).tickSize(0));


      var bar = g.selectAll('.bar')
      .data(data)
      .enter().append('g');
      bar.append('rect')
        .attr('class', 'bar')
        .attr('y', d => y(d.label)) //TODO prova - davanti
        .attr('x', d => x(d.amount))
        .attr('height', y.bandwidth())
        .attr("x", 2)
        .attr('width', d => x(d.amount))
        .attr('fill', d => d.color);
  

      bar.append('text')
      .attr('y', function (d) {
        return y(d.label) + y.bandwidth() / 2 + 4;
      })
      .attr('x', d =>x(d.amount) + 5)
      .text(function (d: any) {
        if (d.codedVal != 0) {
          return "" + d.amount + "";
        } else {
          return "";
        }
      });

      this.dataToUse.sort((a, b) => (a.codedVal < b.codedVal) ? 1 : -1);
    }



  }
}
