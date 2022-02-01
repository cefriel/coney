import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-checkbox-bar-chart',
  templateUrl: './checkbox-bar-chart.component.html',
  styleUrls: ['./checkbox-bar-chart.component.css']
})
export class CheckboxBarChartComponent implements OnInit{

  @Input() data: any;
  @ViewChild('checkboxChartContainer', { static: true })
  private chartContainer: ElementRef;

  noData = false;
  questions = [];
  sessions = [];
  dataToUse: any = [];

  totalSessions = 0;
  selectedQuestion = "";


  margin = { top: 20, right: 20, bottom: 30, left: 40 };
  colors = d3.schemeSet2;

  constructor() { }

  ngOnInit(){
    this.prepareQuestions();
  }

  //viene chiamata onInit, quando cambiano gli imput e quando cambia la select
  ngOnChanges() {
    this.prepareData();
  }

  //adds the questions
  prepareQuestions() {
    for (var i = 0; i < this.data.length; i++) {
      var element = this.data[i];


      if (-1 == this.questions.findIndex(obj => obj.question == element.question)) {
        var tmp = {
          question: element.question,
          tag: element.tag
        }
        this.questions.push(tmp);
      }


    }
    if(this.questions[0] == undefined){
      this.noData = true;
    } else {
      this.selectedQuestion = this.questions[0].question;
      this.prepareData();
    }
    
  }

  //format the data
  prepareData() {
    
    this.dataToUse = [];
    this.sessions = [];

    for (var i = 0; i < this.data.length; i++) {
      var element = this.data[i];
      if (element.question != this.selectedQuestion) { continue; }

      //only count users that answered this question
      if (!this.sessions.includes(element.session) && element.session != "") {
        this.sessions.push(element.session);
      }

      var index = this.dataToUse.findIndex(obj => obj.label == element.txtLabel);

      if (index == -1) {
        //add entry
        var tmp = {
          label: element.txtLabel,
          amount: 0,
          value: 0,
          color: "black"
        }
        //is the user is not null
        if (element.session != "") { tmp.amount = 1 }
        this.dataToUse.push(tmp);
      } else if (index != -1 && element.session != "") {
        //increment amount
        this.dataToUse[index].amount += 1;
      }
    }
    this.totalSessions = this.sessions.length;
    //console.log(this.dataToUse);
    for (var i = 0; i < this.dataToUse.length; i++) {
      var answersPercentage = (100 * this.dataToUse[i].amount) / this.totalSessions;
      //rounds the number, adds epsilon to properly round boundary values
      var answerRounded = Math.round((answersPercentage + Number.EPSILON) * 100) / 100
      this.dataToUse[i].value = answerRounded;
      this.dataToUse[i].color = this.colors[i];
    }
    if(this.dataToUse.length < 1){
      this.noData = true;
      return;
    }
    this.noData = false;
    this.createChart();
  }

  //draws the chart
  createChart() {
    let data: [{ label: string, amount: number, value:number, color: string }];
    data = this.dataToUse;

    var prev = document.getElementById('checkboxBarChart');
    if (prev != undefined && prev != null) {
      prev.remove();
    }

    if(this.chartContainer== undefined){return;}
    const element = this.chartContainer.nativeElement;

    const svg = d3.select(element).append('svg')
      .attr('width', element.offsetWidth)
      .attr('height', element.offsetHeight)
      .attr('id', 'checkboxBarChart');

    const contentWidth = element.offsetWidth;
    const contentHeight = element.offsetHeight;

    const x = d3
      .scaleLinear()
      .rangeRound([0, contentWidth])
      .domain([0, 100]);

    const y = d3
      .scaleBand()
      .rangeRound([contentHeight, 0])
      .padding(0.1)
      .domain(data.map(d => d.label));

    const g = svg.append('g');

    g.append('g')
      .attr('class', 'axis axis--y')
      .call(d3.axisLeft(y).scale(y).tickValues([]).tickSize(0)); //cerca reverse

    var bar = g.selectAll('.bar').data(function(){return data})
      .enter().append('g');
    bar.append('rect')
      .attr('class', 'bar')
      .attr('y', d => y(d.label)) //TODO prova - davanti
      .attr('x', d => x(d.value))
      .attr('height', y.bandwidth())
      .attr("x", 2)
      .attr('width', d => x(d.value))
      .attr('fill', d => d.color);

    bar.append('text')
      .attr('y', function (d) {
        return y(d.label) + y.bandwidth() / 2 + 4;
      })
      .attr('x', d => d.value > 90 ? (x(d.value) - 60) : (x(d.value) + 3))
      .text(function (d: any) {
        if (d.value != 0) {
          return " (" + d.amount + ") " + d.value + "%";
        } else {
          return "";
        }
      });
  }
}
