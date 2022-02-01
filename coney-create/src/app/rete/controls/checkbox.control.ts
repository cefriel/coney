import { Control } from 'rete';
import Vue from 'vue';

const VueCheckboxControl = Vue.component('text', {
  props: ['readonly', 'emitter', 'ikey', 'getData', 'putData'],
  template: `<div class="input-group mt-2">
              <div id="inContainer" style="width: 100%">
                <div class="row m-1" v-for="(value, index) in values">
                  <div class="row" v-if="value.n == undefined" style="position: relative">
                    <div class="col-12 p-0">
                      <textarea rows="2" class="pr-2 checkboxInput" :id="index" @input="update()" type="text" placeholder="Add answer" v-model="value.v" v-on:keyup.enter="addRow('enter')" maxlength="100"></textarea>
                      <button class="del-cb-line-btn" @click="deleteRow(index)">X</button>
                    </div>
                  </div>
                </div>
              </div>
              <div id="inline-checkbox-controls" class="col-12 mb-2 pr-0 text-right">
                  <button class="add-checkbox" @click="addRow(undefined)">
                  +
                  </button>
              </div>
              <div style="width: 100%; position: relative" class="row m-0 checkbox">
              <input v-model="noOpChecked" type="checkbox" @input="manageNone()" id="noneCheckbox" > 
              <input v-model="noOpText" :disabled="!noOpChecked" @input="manageNone()" class="customInput col-12" style="padding-left: 36px;" maxlength="30" type="text" id="noneInput" placeholder="Add 'none of the above'">
              
              <div class="m-0 mt-1 row" style="position: relative;" v-if="noOpChecked" >
                <span class="input-group-text p-0" style="position: absolute;z-index: 1;left: 10px;top: 3px; color: #7c7c7c"> Value of no answer </span>
                <input @input="manageNone()" id="noneValue" type="number" class="customInput" :readonly="readonly" 
                style="display: inline-block; text-align: right"  min="0" v-model="noOpValue"/>
              </div>

              </div>
            </div>`,
  data() {
    return {
      noOpValue: 0,
      noOpText: "None of the above",
      noOpChecked: false,
      values: []
    };
  },
  methods: {
    change() {
    },
    update() {

      if (this.ikey) {
        this.putData(this.ikey, this.values);
      }
      this.emitter.trigger('process');

      var n = this.emitter.selected.list[0];
      return new Promise(resolve => {
        setTimeout(() => {
          this.emitter.view.updateConnections({ node: n });
        }, 10);
      });
    },
    addRow(e) {

      if(this.values.length == 15){
        return;
      }
      this.values.push({ v: "" });

      if (e == undefined) {
        return;
      }
      var index = this.values.length - 1;

      var n = this.emitter.selected.list[0];
      return new Promise(resolve => {
        setTimeout(() => {
          var x = document.getElementById(index + "");
          if (x != undefined) {
            document.getElementById(index + "").focus();
          } else {
            index--;
            document.getElementById(index + "").focus();
          }
          this.emitter.view.updateConnections({ node: n });
        }, 10);
      });

    },
    deleteRow(index) {
      if (this.values.length > 1) {
        this.values.splice(index, 1);

        var n = this.emitter.selected.list[0];
        return new Promise(resolve => {
          setTimeout(() => {
            this.emitter.view.updateConnections({ node: n });
          }, 10);
        });
      }
    },
    insertData() {
      for (var i = 0; i < this.values.length; i++) {
        if (this.values[i].n != undefined) {
         this.noOpChecked = true;
         this.noOpText = this.values[i].v;
         this.noOpValue = this.values[i].value;

        }
      }
    },
    manageNone() {
      return new Promise(resolve => {
        setTimeout(() => {

          var text = this.noOpText;
          if (this.noOpText == "") {
            text = "None of the above";
          } 
    
          var isPresent = false;
          var position = 0;
          for (var i = 0; i < this.values.length; i++) {
            if (this.values[i].n != undefined) {
              isPresent = true;
              position = i;
              this.values[i].value = this.noOpValue;
              this.values[i].v = text;
            }
          }
    
          if (isPresent && !this.noOpChecked) {
            this.values.splice(position, 1);
          }
          if (!isPresent && this.noOpChecked) {
            var it = { v: this.noOpText, value: this.noOpValue, n: 1 };
            this.values.push(it);
          }
        }, 20);
      });

    }
  },
  mounted() {

    this.values = this.getData(this.ikey);
    if (this.values == undefined) {
      this.values = [];
      this.values.push({ v: "" });
    }
    this.insertData();
  }
})

export class CheckboxControl extends Control {
  component: any;
  props: any;
  vueContext: any;

  constructor(public emitter, public key, readonly = false) {
    super(key);
    this.component = VueCheckboxControl;
    this.props = { emitter, ikey: key, readonly };
  }

  setValue(val) {
    this.vueContext.values = val;
  }
}
