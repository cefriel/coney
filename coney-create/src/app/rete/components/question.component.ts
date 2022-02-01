import {Component, Input, Output} from 'rete';
import { QuestionAnswerType, TalkType } from '../sockets';
import {TextAreaControl} from '../controls/text-area.control';
import {TagFieldControl} from '../controls/tag-field.control';
import {MatDialog} from '@angular/material';
import {ENUM_RETE_COMPONENT} from '../../model/conversational.model';
import VueRender from 'rete-vue-render-plugin';


var CustomNode = {
  template: `<div class="node questionNode" :class="[selected(), node.name] | kebab">
    <div class="title"><h6>{{node.data.type}}</h6></div>
    <!-- Outputs-->
    <div class="output" v-for="output in outputs()" :key="output.key">
      <div class="output-title">{{output.name}}</div>
      <Socket v-socket:output="output" type="output" :socket="output.socket"></Socket>
    </div>
    <!-- Controls-->
    <div class="control" v-for="control in controls()" v-control="control"></div>
    <!-- Inputs-->
    <div class="input" v-for="input in inputs()" :key="input.key">
      <Socket v-socket:input="input" type="input" :socket="input.socket"></Socket>
      <div class="input-title" v-show="!input.showControl()">{{input.name}}</div>
      <div class="input-control" v-show="input.showControl()" v-control="input.control"></div>
    </div>
</div>`,
  mixins: [VueRender.mixin],
  components: {
    Socket: VueRender.Socket
  }
}

export class QuestionComponent extends Component {

  data: any;
  constructor(public dialog: MatDialog) {
    super(ENUM_RETE_COMPONENT.QUESTION_TEXT);
    this.data.component = CustomNode;
  }

  builder(node) {

    node.data.type = "Question";
    node.data.subtype = "";

    const in1 = new Input('in', 'Talk/Answer', TalkType, true);
    const out1 = new Output('out', 'Answer', QuestionAnswerType, true);
    
    const cont = new TextAreaControl(this.editor, "text");

    return node
      .addInput(in1)
      .addControl(new TagFieldControl(this.editor, "tag", this.dialog))
      .addControl(cont)
      .addOutput(out1);
  }

  worker(node, inputs, outputs) { }

}