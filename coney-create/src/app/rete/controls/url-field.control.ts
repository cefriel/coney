import { Control } from 'rete';
import Vue from 'vue';

const VueUrlFieldControl = Vue.component('url', {
  props: ['readonly', 'emitter', 'ikey', 'getData', 'putData'],
  template: '<input :value="text" class="customInput pl-2" style="outline-width: 0; width:100%;" @input="change($event)" ' + 
  'placeholder="http://www.example.com"/>',
  data() {
    return {
      text: ''
    };
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
});

export class UrlFieldControl extends Control {
  component: any;
  props: any;
  vueContext: any;

  constructor(public emitter, public key, readonly = false) {
    super(key);
    this.component = VueUrlFieldControl;
    this.props = { emitter, ikey: key, readonly };
  }

  setValue(val) {
    this.vueContext.value = val;
  }
}
