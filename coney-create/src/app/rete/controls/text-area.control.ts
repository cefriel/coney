import { Control } from 'rete';
import Vue from 'vue';;

const VueTextAreaControl = Vue.component('txt-area', {
  props: ['readonly', 'emitter', 'ikey', 'getData', 'putData'],
  template: '<textarea :value="text" @input="change($event)"' +
    'style="width:100%; height:100px; border-radius: 4px; font-size: 18px; outline-width: 0; padding: 5px"></textarea>',
  data() {
    return {
      text: ''
    }
  },
  methods: {
    change(e) {
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
    this.text = this.getData(this.ikey);
  }
})

export class TextAreaControl extends Control {
  component: any;
  props: any;
  vueContext: any;
  remChar = "asd";

  constructor(public emitter, public key, readonly = false) {
    super(key);

    this.component = VueTextAreaControl;
    this.props = { emitter, ikey: key, readonly };
  }

  setValue(val) {
    this.vueContext.value = val;
  }
}
