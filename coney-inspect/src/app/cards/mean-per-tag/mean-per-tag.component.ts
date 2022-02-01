import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-mean-per-tag',
  templateUrl: './mean-per-tag.component.html',
  styleUrls: ['./mean-per-tag.component.css']
})
export class MeanPerTagComponent implements OnInit {

  @Input() data: any;

  dataToShow: any;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(){
    this.loadData()
  }

  loadData(){
    this.dataToShow = [];
    for(var i = 0; i<this.data.length; i++){
      var tmpMean;
      if (this.data[i].amount != 0)
        tmpMean = (this.data[i].total/this.data[i].amount).toFixed(2);
      else
        tmpMean = 0.00;
      var tmpObj = {
        tag: this.data[i].tag, 
        mean: tmpMean, 
        min: this.data[i].min, 
        max: this.data[i].max, 
        step: (this.data[i].max-this.data[i].min)/5
      };
      this.dataToShow.push(tmpObj);
    }
  }

}
