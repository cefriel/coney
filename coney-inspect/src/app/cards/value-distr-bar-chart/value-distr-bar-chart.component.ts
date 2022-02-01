import { Component, OnInit, Input, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import * as d3 from 'd3';
import { filter } from 'rxjs/operators';
import { QuestionsCheckboxComponent } from '../questions-checkbox/questions-checkbox.component';


@Component({
  selector: 'app-value-distr-bar-chart',
  templateUrl: './value-distr-bar-chart.component.html',
  styleUrls: ['./value-distr-bar-chart.component.css']
})
export class ValueDistrBarChart implements OnInit {

  @Input() data: [{ txtLabel: string, value: number, tag: string, question: string, questionType: string, user: string, session: string }];
  @Input() selectedQs: [any];
  @Output() tagChosen = new EventEmitter<string>();

  @ViewChild('valueDistrChart', { static: true })
  private chartContainer: ElementRef;

  public barChartData: any;

  tagStringList = [];

  chosenTag = "";

  colors = d3.schemeSet2;

  min = 0;
  max = 0;
  maxAmount = 0;

  dataToUse = [];
  totalEntries = 0;
  noData = false;

  constructor() {
  }

  ngOnInit() {
    this.prepareTags();
  }

  setTag(selectedTag: string) {
    if (this.chosenTag != selectedTag) {
      this.chosenTag = selectedTag;
      this.tagChosen.emit(this.chosenTag);
    }
  }
  removeTag() {
    this.chosenTag = "";
    this.tagChosen.emit(this.chosenTag);
  }

  ngOnChanges() {
    this.prepareData();
  }

  prepareTags(){
    this.tagStringList = [];
    for (var i = 0; i < this.data.length; i++) {
      var element = this.data[i];
      if(element.questionType == "checkbox" || element.questionType == "text"){continue;}
      var tagToAdd = "";
      if (element.tag == "" || element.tag == "null" || element.tag == undefined) {
        var tagToAdd = "untagged";
      } else {
        tagToAdd = element.tag;
      }

      if(!this.tagStringList.includes(tagToAdd)){
        this.tagStringList.push(element.tag);
      }
    }
  }

  prepareData(){
    this.totalEntries = 0;
    this.dataToUse = [];
    
    for (var i = 0; i < this.data.length; i++) {
      var element = this.data[i];

      //not a selected question, skip
      if ( this.selectedQs[0] != undefined && !this.selectedQs.includes(element.question)) { continue; }
      //not the chosen tag, skip
      if ( this.chosenTag != "" && element.tag != this.chosenTag) { continue; }

      var index = this.dataToUse.findIndex(obj => obj.label == element.value);

      if (index == -1) {
        //add entry
        var tmp = {
          label: element.value,
          amount: 0,
          value: element.value,
          percentage: 0,
          color: "black"
        }

        //if the user is not null
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

    for (var i = 0; i < this.dataToUse.length; i++) {
      this.dataToUse[i].color = this.colors[i];
      var perc = this.dataToUse[i].amount*100/this.totalEntries;
      this.dataToUse[i].percentage = Math.floor(perc*100)/100;
    }

    if(this.dataToUse.length < 0){
      this.noData = true;
      return;
    }
   
    this.noData = false;
    this.maxAmount = Math.max.apply(Math, this.dataToUse.map(function (o) { return o.amount; }));
    this.dataToUse.sort((a, b) => (a.value > b.value) ? 1 : -1);
    this.min = this.dataToUse[0].value;
    this.max = this.dataToUse[this.dataToUse.length-1].value;

    this.createChart();

  }

  createChart(){

    let data = this.dataToUse;

    var prev = document.getElementById('valueDistrBarChart');
    if (prev != undefined && prev != null) {
      prev.remove();
    }

    const element = this.chartContainer.nativeElement;

    const svg = d3.select(element).append('svg')
      .attr('width', element.offsetWidth)
      .attr('height', element.offsetHeight)
      .attr('id', 'valueDistrBarChart');

    const contentWidth = element.offsetWidth -20;
    const contentHeight = element.offsetHeight -40;

    const x = d3
      .scaleBand()
      .rangeRound([0, contentWidth])
      .padding(0.1)
      .domain(data.map(d => d.label));

    const y = d3
      .scaleLinear()
      .rangeRound([contentHeight, 0])
      .domain([0, this.maxAmount*1.2]);

      const g = svg.append('g')
      .attr('transform', 'translate(0,10)');


      g.append('g').attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + (contentHeight) + ')')
      .call(d3.axisBottom(x).scale(x));

      var bar = g.selectAll('.bar')
      .data(data)
      .enter().append('g');
      bar.append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.label)) //TODO prova - davanti
        .attr('y', d => y(d.amount))
        .attr('height', d => contentHeight - y(d.amount))
        .attr('width',x.bandwidth())
        .attr('fill', d => d.color);
  
        g.selectAll('.rect')
        .data(data)
        .enter().append('text')
        .attr('x', d => x(d.value + ""))
        .attr('y', d => y(d.amount) - (0.1*y(d.amount)))
        .text(function (d: any) {
          if (d.amount != 0) {
            return d.amount + "";
          } else {
            return "";
          }
        });
  
  }
}