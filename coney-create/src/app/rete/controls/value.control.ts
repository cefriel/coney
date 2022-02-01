import { Control } from 'rete';
import Vue from 'vue';;

const VueValueControl = Vue.component('num', {
  props: ['readonly', 'emitter', 'ikey', 'getData', 'putData'],
  template: `<div class="m-0 row" style="position: relative;">
  <span class="input-group-text p-0" style="position: absolute;z-index: 1;left: 10px;top: 3px; color: #7c7c7c"> Value </span>
  <input type="number" class="customInput" :readonly="readonly" :value="value" 
  style="display: inline-block; text-align: right" @input="change($event)" min="1" max="5" />
</div>`,
  data() {
    return {
      value: 1
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
    this.value = this.getData(this.ikey);
    if(this.value == undefined){
      this.value = 0;
      this.update();
    }
  }
})


export class ValueControl extends Control {
  component: any;
  props: any;
  vueContext: any;

  constructor(public emitter, public key, readonly = false) {
    super(key);
    this.component = VueValueControl;
    this.props = { emitter, ikey: key, readonly };
  }

  setValue(val) {
    this.vueContext.value = val;
  }
}
