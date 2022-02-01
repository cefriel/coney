import { Component, Input, Output } from 'rete';
import { QuestionAnswerType, TalkType } from '../sockets';
import { NumControl } from '../controls/number.control';
import { ValueControl } from '../controls/value.control';
import { TextAreaLimitedControl } from '../controls/text-area-limited.control';
import { ENUM_RETE_COMPONENT } from '../../model/conversational.model';
import { PointsFieldControl } from '../controls/points-field.control';
import VueRender from 'rete-vue-render-plugin';

var CustomNode = {
  template: `<div class="node answerNode" :class="[selected(), node.name] | kebab">
  <div class="title">
  <h6 class="m-0">{{node.data.type}}</h6>
  <small style="color: #777">{{node.data.subtype}}</small>
  </div>
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

export class AnswerMultipleComponent extends Component {
  data: any;
  constructor() {
    super(ENUM_RETE_COMPONENT.ANSWER_MULTIPLE);
    this.data.component = CustomNode;
  }

  builder(node) {

    node.data.type = "Answer";
    node.data.subtype = "multiple";

    const in1 = new Input('in', 'Question', QuestionAnswerType, false);
    const out1 = new Output('out', 'Talk/Question', TalkType, false);
    return node.addInput(in1)
      .addControl(new NumControl(this.editor, 'sort'))
      .addControl(new ValueControl(this.editor, 'value'))
      .addControl(new TextAreaLimitedControl(this.editor, 'text'))
      .addControl(new PointsFieldControl(this.editor, "points"))
      .addOutput(out1);
  }

  worker(node, inputs, outputs) {

  }

}
