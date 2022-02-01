import { Control } from 'rete';
import Vue from 'vue';;

const VueTextTypeControl = Vue.component('txt-field', {
  props: ['readonly', 'emitter', 'ikey', 'getData', 'putData'],
  template: '<div style="width:100%">'+
    '<select @input="change($event)" :value="text" class="custom-select">' +
      '<option value="text">📝 Text</option>' +
      '<option value="number">🔢 Numbers</option>' +
      '<option value="date">📆 Date</option>' +
      '<option value="time">⏱️ Time</option>' +
      '<option value="url">🔗 Link</option>' +
    '</select></div>',
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
    
    if (this.getData(this.ikey) == undefined || this.getData(this.ikey) == "") {
      this.text = "text";
      this.update();
    } else {
      this.text = this.getData(this.ikey);
    }
  }
})

export class TextTypeControl extends Control {
  component: any;
  props: any;
  vueContext: any;

  constructor(public emitter, public key, readonly = false) {
    super(key);

    this.component = VueTextTypeControl;
    this.props = { emitter, ikey: key, readonly };
  }

  setValue(val) {
    this.vueContext.value = val;
  }
}