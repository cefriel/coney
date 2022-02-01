import { Control } from 'rete';
import Vue from 'vue';

const VueVisualizationControl = Vue.component('txt-field', {
  props: ['readonly', 'emitter', 'ikey', 'getData', 'putData'],
  template: '<div style="width:100%">'+
  '<p style="width:100%"> {{ error }} </p>'+
    '<select @input="change($event)" :value="text" class="custom-select">' + 
      '<option value="star">⭐ Star rating</option>' + 
      '<option value="emoji">😄 Emoji</option>' + 
      '<option value="slider">➖ Slide</option>' + 
      '<option value="options">🔘 Options</option>' + 
      '<option value="select">🔽 Select</option>' + 
    '</select></div>',
  data() {
    return {
      text: '',
      error: ''
    }
  },
  methods: {
    change(e) {


      var answers = this.emitter.selected.list[0].outputs.get("out").connections.length;
      
      if(e.target.value == "emoji"){
        if(answers>5){
          this.error = "Max of 5 answers for "+e.target.value;
          e.target.value = this.text;
          return;
        }
      } else if(e.target.value == "options"){
        if(answers>6){
          this.error = "Max of 6 answers for "+e.target.value;
          e.target.value = this.text;
          return;
        }
      } else if(e.target.value == "slider"){
        if(answers>9){
          this.error = "Max of 9 answers for "+e.target.value;
          e.target.value = this.text;
          return;
        }
      } else if(e.target.value == "star"){
        if(answers>10){
          this.error = "Max of 10 answers for "+e.target.value;
          e.target.value = this.text;
          return;
        }
      } else {
        if(answers>25){
          this.error = "Max of 25 answers for "+e.target.value;
          e.target.value = this.text;
          return;
        }
      }
      this.error = "";

      this.text = e.target.value;
      this.update();
    },
    update() {

      if (this.ikey) {
        this.putData(this.ikey, this.text);
      }

      this.emitter.trigger('process');
    }
  },
  mounted() {
    
    if (this.getData(this.ikey) == undefined || this.getData(this.ikey) == "") {
      this.text = "star";
      this.update();
    } else {
      this.text = this.getData(this.ikey);
    }
  }
})

export class VisualizationControl extends Control {
  component: any;
  props: any;
  vueContext: any;

  constructor(
    public emitter, public key, readonly = false) {
    super(key);

    this.component = VueVisualizationControl;
    this.props = { emitter, ikey: key, readonly };
  }

  setValue(val) {
    this.vueContext.value = val;
  }
}