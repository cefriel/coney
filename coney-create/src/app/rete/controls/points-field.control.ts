import { Control } from 'rete';
import Vue from 'vue';;
const VueNumControl = Vue.component('num', {
  props: ['readonly', 'emitter', 'ikey', 'getData', 'putData'],
  template: `<div id="pointsFieldInputGr" class="input-group">
  <span style="font-size: 10px;position: absolute;z-index: 1;left: 8px; top:9px; color: #7c7c7c">PT: </span>
  <input @input="change($event)" type="number" min="0" max="100" class="customInput text-right" style="font-size: 12px; padding-left: 36px;" :readonly="readonly" :value="value">
  </div>`,
  data() {
    return {
      value: 0
    };
  },
  methods: {
    change(e) {
      this.value = +e.target.value;
      this.update();
    },
    update() {
      if (this.ikey) {
        this.putData(this.ikey, this.value);
      }
      this.emitter.trigger('process');
    }
  },
  mounted() {
    var tmp = this.getData(this.ikey);
    if(tmp == undefined){
      tmp = 0;
    }
    this.value = tmp;
    this.update();
  }
})


export class PointsFieldControl extends Control {
  component: any;
  props: any;
  vueContext: any;
  
  constructor(public emitter, public key, readonly = false) {
    super(key);

    this.component = VueNumControl;
    this.props = { emitter, ikey: key, readonly };
  }

  setValue(val) {
    this.vueContext.value = val;
  }
}
