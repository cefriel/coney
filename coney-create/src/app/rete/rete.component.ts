import {
  AfterViewInit, Component, ElementRef, EventEmitter,
  Input, OnChanges, Output, ViewChild, ViewEncapsulation, NgZone
} from '@angular/core';

import { Engine, NodeEditor, Node } from 'rete';
import ConnectionPlugin from 'rete-connection-plugin';
import VueRenderPlugin from 'rete-vue-render-plugin';
import HistoryPlugin from 'rete-history-plugin';
import AreaPlugin from 'rete-area-plugin';
import ContextMenuPlugin from 'rete-context-menu-plugin';
import ReadonlyPlugin from 'rete-readonly-plugin';
import MinimapPlugin from 'rete-minimap-plugin';


import { MatDialog } from '@angular/material';

import { QuestionComponent } from './components/question.component';
import { AnswerSingleComponent } from './components/answer-open.component';
import { TalkTextComponent } from './components/talk-text.component';
import { AnswerMultipleComponent } from './components/answer-multiple.component';
import { AnswerCheckboxComponent } from './components/answer-checkbox.component';
import { TalkUrlComponent } from './components/talk-url.component';
import { TalkLinkComponent } from './components/talk-link.component';
import { VisualizationControl } from './controls/visualization.control';
import {
  ENUM_CONV_STATUS, ENUM_RETE_COMPONENT,
  RETE_ID, ENUM_INFO, ENUM_OPERATION_FEEDBACK
} from '../model/conversational.model';
import { Transform } from 'rete/types/view/area';
import { TextTypeControl } from './controls/text-type.control';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-rete',
  templateUrl: './rete.component.html',
  styleUrls: ['./rete.component.css']
})
export class ReteComponent implements AfterViewInit, OnChanges {

  static editor: NodeEditor;
  static engine: Engine;

  retePosition = { x: 200, y: 200 };
  readonly = { enabled: false };
  lastNode: Node;
  components;
  createLink;
  checkValue;
  globalPath;
  errorFound: boolean;

  translateCheck = true;
  translateX = 0;
  translateY = 0;

  @ViewChild('nodeEditor', { static: false }) el: ElementRef;
  @Input() sourceJson: any;
  @Output() changedPosition: EventEmitter<Array<number>> = new EventEmitter<Array<number>>();
  @Output() editedJson: EventEmitter<JSON> = new EventEmitter<JSON>();
  @Output() reteObject: EventEmitter<Object> = new EventEmitter<Object>();
  @Output() conversationTags: EventEmitter<any> = new EventEmitter<any>();

  constructor(public dialog: MatDialog, private ngZone: NgZone) { };

  async ngAfterViewInit() {
    const container = this.el.nativeElement;
    this.createLink = true;
    this.checkValue = true;
    this.errorFound = false;

    this.components = [
      new QuestionComponent(this.dialog),
      new AnswerSingleComponent(),
      new AnswerMultipleComponent(),
      new AnswerCheckboxComponent(),
      new TalkTextComponent(),
      new TalkUrlComponent(),
      new TalkLinkComponent()
    ];


    this.ngZone.runOutsideAngular(() => {
      ReteComponent.editor = new NodeEditor(RETE_ID, container);

      ReteComponent.editor.use(ConnectionPlugin);
      ReteComponent.editor.use(VueRenderPlugin);
      ReteComponent.editor.use(ReadonlyPlugin, this.readonly);
      ReteComponent.editor.use(HistoryPlugin, { keyboard: true });
      ReteComponent.editor.use(MinimapPlugin);
      ReteComponent.editor.use(AreaPlugin, { scaleExtent: { min: 0.1, max: 1.5 } });
      ReteComponent.editor.use(ContextMenuPlugin, {
        searchBar: false,
        allocate() {
          return []
        },
      });

    });

    ReteComponent.engine = new Engine(RETE_ID);

    this.components.map(c => {
      ReteComponent.editor.register(c);
      ReteComponent.engine.register(c);
    });

    const n = await this.components[4].createNode({ text: '' });

    n.position = [80, 200];
    ReteComponent.editor.addNode(n);
    ReteComponent.editor.on('connectioncreated', async (connection) => {

      var n: Node;
      n = connection.output.node;
      const outputConnections = connection.output.connections;

      //adds and removes the viz selector and field whenever different types of answers are connected
      if (outputConnections.length == 1 && n.name.includes("Question")) {
        if (connection.input.node.name.includes("multiple")) {
          if(n.controls.get("text_type") != undefined){
            n.data.text_type = "";
            n.controls.delete("text_type");
            await this.delay(100);
          }

          if (n.controls.get("visualization") == undefined) {
            console.log("no visualization found");
            var tmp = n.data.vizualization;
            
            n.addControl(new VisualizationControl(ReteComponent.editor, "visualization"));
            if(tmp!=undefined){
              n.data.visualization = tmp;
            }
            n.data.subtype="multiple";
            await this.delay(200);
            ReteComponent.editor.view.updateConnections({ node: n });
          }

        } else if (connection.input.node.name.includes("open") || connection.input.node.name.includes("checkbox")) {
 
          if (n.controls.get("visualization") != undefined) {
            n.data.visualization = "";
            n.controls.delete("visualization");
            await this.delay(100);
            ReteComponent.editor.view.updateConnections({ node: n });
          }

          if(connection.input.node.name.includes("open")){
            n.data.subtype="single";
            n.data.visualization="text";
            n.addControl(new TextTypeControl(ReteComponent.editor, "text_type"));

          } else {

            if(n.controls.get("text_type") != undefined){
              delete n.data.text_type;
              n.controls.delete("text_type");
            }

            n.data.subtype="checkbox";
            n.data.visualization="checkbox";
            
          }
        }
      }

      //calls the method to automatically set order and value values
      if (connection.input.node.name === ENUM_RETE_COMPONENT.ANSWER_MULTIPLE) {
        if (this.checkValue) {
          this.checkValue = false;
          this.setValue(outputConnections, connection);
        }
      }

      //checks on connections
      if (outputConnections.length > 1) {
        if (outputConnections[0].input.node.name !== connection.input.node.name) {
          ReteComponent.editor.removeConnection(connection);
          this.reteMessage(ENUM_OPERATION_FEEDBACK.INFO, ENUM_INFO.MULTI_TYPE);
        }
        else if (connection.input.node.name === ENUM_RETE_COMPONENT.TALK_TEXT) {
          ReteComponent.editor.removeConnection(connection);
          this.reteMessage(ENUM_OPERATION_FEEDBACK.INFO, ENUM_INFO.MULTI_ELEMENT);
        }
        else if (connection.input.node.name === ENUM_RETE_COMPONENT.TALK_URL) {
          ReteComponent.editor.removeConnection(connection);
          this.reteMessage(ENUM_OPERATION_FEEDBACK.INFO, ENUM_INFO.MULTI_ELEMENT);
        }
        else if (connection.input.node.name === ENUM_RETE_COMPONENT.TALK_LINK) {
          ReteComponent.editor.removeConnection(connection);
          this.reteMessage(ENUM_OPERATION_FEEDBACK.INFO, ENUM_INFO.MULTI_ELEMENT);
        }
        else if (connection.input.node.name !== ENUM_RETE_COMPONENT.ANSWER_MULTIPLE) {
          ReteComponent.editor.removeConnection(connection);
          this.reteMessage(ENUM_OPERATION_FEEDBACK.INFO, ENUM_INFO.MULTI_ELEMENT);
        }
        else if (connection.output.node.data.visualization === "emoji" && outputConnections.length > 5) {
          ReteComponent.editor.removeConnection(connection);
          this.reteMessage(ENUM_OPERATION_FEEDBACK.INFO, ENUM_INFO.MAX_RANGE);
        }
        else if (connection.output.node.data.visualization === "options" && outputConnections.length > 6) {
          ReteComponent.editor.removeConnection(connection);
          this.reteMessage(ENUM_OPERATION_FEEDBACK.INFO, ENUM_INFO.MAX_RANGE);
        }
        else if (connection.output.node.data.visualization === "slider" && outputConnections.length > 9) {
          ReteComponent.editor.removeConnection(connection);
          this.reteMessage(ENUM_OPERATION_FEEDBACK.INFO, ENUM_INFO.MAX_RANGE);
        }
        else if (connection.output.node.data.visualization === "star" && outputConnections.length > 10) {
          ReteComponent.editor.removeConnection(connection);
          this.reteMessage(ENUM_OPERATION_FEEDBACK.INFO, ENUM_INFO.MAX_RANGE);
        }
        else if (connection.input.node.name === ENUM_RETE_COMPONENT.ANSWER_MULTIPLE && outputConnections.length > 25) {
          ReteComponent.editor.removeConnection(connection);
          this.reteMessage(ENUM_OPERATION_FEEDBACK.INFO, ENUM_INFO.MAX_RANGE);
        }
      }
    });

   
    //disables the zoom on double click if the user is focusing an input or textarea
    ReteComponent.editor.on('zoom', ({ source }) => {
      if (this.checkForInputFocus()) {
        return source !== 'dblclick';
      }
    });

    /* disables node translation if the input is focused (HEAVY)
    ReteComponent.editor.on('nodetranslate', ({ node }) => {
        return !this.checkForInputFocus();
    });
    */

    /*ReteComponent.editor.on('translate', ({transform, x, y}) => {
     // var x = document.getElementsByClassName('connection');
      
    });*/

    //saves edits on the "Rete json"
    ReteComponent.editor.on(['process', 'nodecreated', 'connectioncreated', 'noderemoved', 'connectionremoved'], async () => {
      this.reteEditedJson(ReteComponent.editor.toJSON());
    });



    /*
    manages the changes in node selection and the connection creation on node creation:
    - if the new node is created left of the old node, no connections are created
    - if the new node is a answer, the question retaines the selection (in order to keep creating connected answers)
      and they get connected
    - else the new node is connected to the previously selected one and the selection shifts to the new one
    */

    ReteComponent.editor.on('nodecreated', (n: Node) => {

      if(n.name.includes("Talk")){
        if(n.name.includes("link")){
          n.data.type = "Talk";
          n.data.subtype = "link";
        } else if(n.name.includes("imageUrl")){
          n.data.type = "Talk";
          n.data.subtype = "imageUrl";
        } else if(n.name.includes("text")){
          n.data.type = "Talk";
          n.data.subtype = "text";
        }
      }
      
      this.lastNode = n;
      this.reteChangedPosition(n.position);
      if (this.createLink && (ReteComponent.editor.nodes.length > 1)) {
        var sel = []; var selNode: Node;
        sel = ReteComponent.editor.selected["list"];

        if (sel.length == 1) {
          var oldNode = sel[0];

          if (oldNode.position[0] > n.position[0]) {
            sel.pop();
            return;
          }

          selNode = sel.pop();
          ReteComponent.editor.connect(selNode.outputs.get("out"), n.inputs.get("in"));
          var isQuestion = (oldNode.name.includes("Question"));
          if (!isQuestion) {
            sel.push(n);
          } else {
            sel.push(oldNode);
          }
        } else if (sel.length > 1) {
          for (var i = (sel.length - 1); i >= 0; i--) {
            var on = sel[i];
            sel.pop();
            ReteComponent.editor.connect(on.outputs.get("out"), n.inputs.get("in"));
          }
          sel.push(n);
        }
      }
    });

    ReteComponent.editor.on('keyup', e => {

      if (e.key == "Delete" && !this.checkForInputFocus()) {
        var sel = [];
        sel = ReteComponent.editor.selected["list"];
        if (sel.length > 0) {
          sel.forEach(element => {
            ReteComponent.editor.removeNode(element);
          });
        }
      }
    }),

      ReteComponent.editor.view.resize();
    ReteComponent.editor.trigger('process');
  }

  //method to zoom in (i=0) or out (i=1) called by buttons
  public zoom(i) {
    var tmpTransf = ReteComponent.editor.view.area.transform;
    if (i == 0) {
      ReteComponent.editor.view.area.zoom(tmpTransf.k + 0.10, 0, 0, "touch");
    } else {
      ReteComponent.editor.view.area.zoom(tmpTransf.k - 0.10, 0, 0, "touch");
    }
  }


  //fits all the nodes on the screen
  public async resetView() {
    AreaPlugin.zoomAt(ReteComponent.editor);
  }

  //turns the border of the node with an error red and sets the view on it
  public async setViewOnNode(n: Node) {
    var el;
    ReteComponent.editor.selectNode(n);
    var selEl = document.getElementsByClassName("selected");
    await this.delay(700);
    el = selEl[0];
    el.classList.add("errorNode");
    this.errorFound = true;
    var arr = [];
    arr.push(n);
    AreaPlugin.zoomAt(ReteComponent.editor, arr);
  }

  delay(time: any) {
    return new Promise(resolve => setTimeout(resolve, time));
  }

  //sets value and order field in newly created nodes
  async setValue(out, connection) {
    if (connection.input.node.data.sort !== undefined && connection.input.node.data.sort !== 0) {
      this.checkValue = true;
      return;
    }

    var valueList = []; var valueToSet = 1;
    for (var i = 0; i < out.length; i++) {
      var value = out[i].input.node.data.sort;
      valueList.push(value);
    }
    valueList.sort();
    for (var i = 1; i <= valueList.length; i++) {
      if (valueList[i - 1] != i) {
        valueToSet = i;
        break;
      }
    }

    //just to avoid it running 3 times
    await this.delay(10);
    this.checkValue = true;

    connection.input.node.data.sort = valueToSet;
    connection.input.node.data.value = valueToSet;
    var n: Node; n = connection.input.node;
    var control: any;
    control = n.controls.get("sort");
    control.setValue(valueToSet);
    var conntrolValue: any;
    conntrolValue = n.controls.get("value");
    conntrolValue.setValue(valueToSet);
  }

  /*//methods to generate nodes, get the XY coordinates, the first nodes and an array of the answers if any
  public async addTemplateNode(node: any, nextNodes: any, posX: number, posY: number) {

    var firstNode: Node;
    posX += 300;
    if (node.tags == undefined) {
      node.tags = "";
    }
    firstNode = await this.createNode(node.temp_type, node.temp_subtype, node.text, node.tags, node.sort, node.value, node.image_url, node.url, posX, posY);
    await ReteComponent.editor.addNode(firstNode);
    this.createLink = false;
    posY -= 400;
    for (var i = 0; i < nextNodes.length; i++) {
      var temp = nextNodes[i]; var nextNode: Node;
      nextNode = await this.createNode(temp.temp_type, temp.temp_subtype, temp.text, "", temp.sort, temp.value, temp.image_url, temp.url, posX + 300, posY + (i * 200))
      await ReteComponent.editor.addNode(nextNode);
      await ReteComponent.editor.connect(firstNode.outputs.get("out"), nextNode.inputs.get("in"));
    }
    this.createLink = true;
  }*/

  //method for node "quick" creation, add a talk or an answer depending on the sel node
  public async addEmptyTalk(posX: number, posY: number) {
    var sel = []; var selNode: Node;
    sel = ReteComponent.editor.selected["list"];

    if (sel.length == 1) {
      selNode = sel[0];
      posX = selNode.position[0] + 300;
      posY = selNode.position[1];

      var i = selNode.getConnections().length % 5;
      if (selNode.name.includes("Question")) {
        var nAnswer: Node;
        nAnswer = await this.createNode("Answer", "multiple", "", "", undefined, undefined, "", "", posX, posY - 200 + (i * 100));

        await ReteComponent.editor.addNode(nAnswer);
        return;
      }
    }

    var nTalk: Node;
    nTalk = await this.createNode("Talk", "text", "", "", 0, 0, "", "", posX, posY);
    await ReteComponent.editor.addNode(nTalk);
  }

  //adds the tagged class to the nodes with a tag, which changes the border color and centers them in the view
  public async highlightTags(tag) {

    var selEl = document.getElementsByClassName("tagged");
    await this.delay(500);

    for (var j = 0; j < selEl.length; j++) {
      selEl[j].classList.remove("tagged");
    }

    var toFocus = [];
    var first = true;
    var nodes = []; nodes = ReteComponent.editor.nodes;

    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].data.tag != undefined && nodes[i].data.tag == tag) {
        if (first) {
          ReteComponent.editor.selectNode(nodes[i]);
          first = false;
        } else {
          ReteComponent.editor.selectNode(nodes[i], true);
        }
        toFocus.push(nodes[i]);
      }
    }
    var selEl = document.getElementsByClassName("selected");
    await this.delay(1000);

    for (var j = 0; j < selEl.length; j++) {
      selEl[j].classList.add("tagged");
    }
    if (toFocus.length > 0) {
      AreaPlugin.zoomAt(ReteComponent.editor, toFocus);
    }
  }

  //gathers all the conversation tags from the editor
  public getConversationTags() {

    var tags = [];
    var nodes: any;
    nodes = ReteComponent.editor.nodes;
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].data.tag != undefined && nodes[i].data.tag != "") {
        if (!tags.includes(nodes[i].data.tag.toLowerCase())) {
          tags.push(nodes[i].data.tag.toLowerCase());
        }
      }
    }
    this.reteChangedConversationTags(tags);
  }

  //event emitter for changes in the tags
  public reteChangedConversationTags(tags) {
    this.conversationTags.emit(tags);
  }

  //method to manage questions creation with the option of addint "ansNumber" answers and filling their content
  //calls "createNode" to actually create the nodes
  public async addBlankQuestion(posX: number, posY: number, type: string, ansNumber: number, content: string) {
    //overrides standard linking of nodes
    this.createLink = false;
    //creates question
    var nQuestion: Node;
    if (type == "multiple") {
      nQuestion = await this.createNode("Question", "star", "", "", 0, 0, "", "", posX, posY);
    } else if (type == "checkbox") {
      nQuestion = await this.createNode("Question", "checkbox", "", "", 0, 0, "", "", posX, posY);
    } else {
      nQuestion = await this.createNode("Question", "text", "", "", 0, 0, "", "", posX, posY);
    }

    await ReteComponent.editor.addNode(nQuestion);

    //create talk
    var nTalk: Node;
    nTalk = await this.createNode("Talk", "text", "", "", 0, 0, "", "", posX + 600, posY);
    await ReteComponent.editor.addNode(nTalk);

    posY -= 300;
    //creates answers and link them

    var answerContent = content.split("-");

    for (var i = 1; i <= ansNumber; i++) {
      var txt = "";
      if (answerContent[i - 1] != undefined) {
        txt = answerContent[i - 1];
      }
      var nAnswer: Node;
      nAnswer = await this.createNode("Answer", type, txt, "", i, i, "", "", posX + 300, posY + (i * 200));
      await ReteComponent.editor.addNode(nAnswer);
      //link nodes
      await ReteComponent.editor.connect(nQuestion.outputs.get("out"), nAnswer.inputs.get("in"));
      await ReteComponent.editor.connect(nAnswer.outputs.get("out"), nTalk.inputs.get("in"));
    }
    this.createLink = true;

  }

  //creates a node in the conversation
  public async createNode(type: string, subtype: string, text: string, tag: string, sort: number, value: number,
    image_url: string, url: string, posX: number, posY: number) {
    var n: Node;
    if (type == "Question") {
      n = await this.components[0].createNode({ text: text, visualization: subtype, tag: tag });
    } else if (type == "Answer") {
      if (subtype == "multiple") {
        n = await this.components[2].createNode({ text: text, sort: sort, value: value, points: 0 });
      } else if (subtype == "single") {
        n = await this.components[1].createNode({ text: text, points: 0 });
      } else {
        n = await this.components[3].createNode({ text: [], points: 0 });
      }
    } else {
      if (subtype == "text") {
        n = await this.components[4].createNode({ text: text, tag: tag });
      } else if (subtype == "imageUrl") {
        n = await this.components[5].createNode({ imageUrl: image_url, tag: tag });
      } else {
        n = await this.components[6].createNode({ title: text, url: url, tag: tag });
      }
    }
    n.position = [posX, posY];
    return n;
  }

  async ngOnChanges() {

    if (this.sourceJson != null) {
      this.createLink = false;
      await ReteComponent.engine.abort();
      await ReteComponent.editor.fromJSON(this.sourceJson);

      if (this.sourceJson['status'] === ENUM_CONV_STATUS.PUBLISHED || this.sourceJson['status'] === ENUM_CONV_STATUS.UNPUBLISHED) {
        this.readonly.enabled = true;
      } else {
        this.readonly.enabled = false;
      }

      ReteComponent.editor.trigger('process');
    } this.createLink = true;
  }

  /*checks some stuff
  returns: 
  - 0: no starting node found
  - 1: isolated node found
  - 2: multiple starting points found
  - 3: there is a question at the end
  - 4: empty fields in talk or question box  
  */
  public checkForMistakes() {
    this.globalPath = [];

    var n: Node; 
    var count = 0;
    var output: Node;
    var list = ReteComponent.editor.nodes;
    for (var i = 0; i < list.length; i++) {

     //console.log("NODE: " + list[i].id + ", with name: " + list[i].name);

      n = list[i];
      var conns = n.getConnections();
      if (undefined == conns[0]) {
        this.setViewOnNode(n);
        //isolated nodes
        return 1;
      }

      //if there is only one output and it points to self, then it's a starting
      if (n.id == conns[0].output.node.id) {
        count += 1;
        output = n;
      }

      //if there is only one input and it points to self, then it's an ending node 
      if ((n.id ==conns[0].input.node.id) 
          && (n.name.includes("Question"))
          && (conns[1] == undefined)) {
        this.setViewOnNode(n);
        return 3;
      }

      if (count > 1) {
        this.setViewOnNode(n);
        //more than one starting points
        return 2;
      }

      //empty fields
      if(n.name.includes("Question") || n.name.includes("Talk")){
        if(n.data == undefined){
          this.setViewOnNode(n);
          return 4;
        }
        if(n.name.includes("text") && (n.data.text == "" || n.data.text == undefined)){
          this.setViewOnNode(n);
          return 4;
        }
        if((n.name.includes("link") || n.name.includes("imageUrl")) && (n.data.url == "" || n.data.url == undefined)){
          this.setViewOnNode(n);
          return 4;
        }
      }
    }

    if (count == 0) { 
      //no beginning
      return 0;
    }

    if (output.name.includes("Answer")) {
      //starts with an answer
      return false;
    }
    return output;
  }
  
  //checks for loops in the graph
  //currently DISABLED due to the high time complexity (n^2)
  //TODO: aprire il libro di algoritmi che non ricordo nulla
  public checkForLoops(n: Node, path: any) {

    var conns = n.getConnections();
    var prev: Node;
    var res: any;
    res = true;

    if (path.includes(n.id)) {
      this.setViewOnNode(n);
      res = false;
      return res;
    }
    path.push(n.id);

    for (var i = 0; i < conns.length; i++) {
      prev = conns[i].input.node;
      if (n.id != prev.id) {
        var stop = false;
        for (var j = path.length - 1; j >= 0; j--) {
          if (path[j] == n.id) {
            stop = true;
          }
          if (!stop) {
            path.pop();
          }
        }
        res = res && this.checkForLoops(prev, path);
      }
    }
    return res;
  }

  //returns the first selected node and, if it's a question, all the answers
  public getSelectedNode() {
    var res = [];
    var list = ReteComponent.editor.selected["list"];
    if (list.length == 1) {
      var n: Node;
      n = list[0];
      res.push(n);
      if (n.name.includes("Question")) {
        var prev: Node;
        var conns = n.getConnections();
        for (var i = 0; i < conns.length; i++) {
          prev = conns[i].input.node;
          if (n.id != prev.id) {
            res.push(prev);
          }
        }
      }
      return res;
    }
  }

  //for the reload/close check in home.component
  //returns true if there is just one block (Talk) with no content (i.e. new conv)
  public isConversationNew() {
    var nodes = ReteComponent.editor.nodes;
    if (nodes.length == 1) {
      if (nodes[0].name == "Talk [text]" && (nodes[0].data.text == undefined || nodes[0].data.text == "")) {
        return true;
      }
    }
    return false;
  }

  /*
  checks that 
  - all the answers to a question have different "order values" (if not returns 1)
  - all the options and select answers have text content (if not returns 2)
  */
  public checkForMultipleValues(n: Node) {

    var next: any;
    var res = 0;
    var nodes = ReteComponent.editor.nodes;
    for (var c = 0; c < nodes.length; c++) {

      var element = nodes[c];
      if (element.name.includes("Question")) {
        var conns = element.getConnections();
        var values = [];

        for (var i = 0; i < conns.length; i++) {

          next = conns[i].input.node;


          if (element.id != next.id && next.name.includes("Answer") && !next.name.includes("checkbox")) {

            if ((element.data.visualization == "options" || element.data.visualization == "select") && (next.data.text == "" || next.data.text == null)) {
              //case when answers are options and the text is empty
              this.setViewOnNode(next);
              return 2;
            }

            if (values.includes(next.data.sort)) {

              this.setViewOnNode(next);
              return 1;
            }
            values.push(next.data.sort);
          } else if (next.name.includes("checkbox")) {
            if (next.data.checkbox == undefined || next.data.checkbox.length < 1) {
              this.setViewOnNode(next);
              return 2;
            } else if (next.data.checkbox.length >= 1) {
              var tmp = next.data.checkbox;
              for (var z = 0; z < tmp.length; z++) {
                if (tmp[z].v == undefined || tmp[z].v == "") {
                  //if(tmp[z].value == undefined)
                  this.setViewOnNode(next);
                  return 2;
                }
              }
            } else {
              break;
            }
          }
        }
      } else if (element.name.includes("Talk")) {
        //TODO include talk check
      }
    }
    return res;
  }

  //returns true if the user is focusing an input/textarea field
  public checkForInputFocus() {
    var res = false;

    var txtarea = document.getElementsByTagName("textarea");
    var input = document.getElementsByTagName("input");
    for (var i = 0; i < txtarea.length; i++) {
      if (document.activeElement == txtarea[i]) {
        res = true;
      }
    }
    for (var i = 0; i < input.length; i++) {
      if (document.activeElement == input[i]) {
        res = true;
      }
    }
    return res;
  }

  //moves all the nodes following a selected one either up, down, right of left
  public moveAllFollowingNodes(n: Node, path, dir) {

    var check = true;
    var prev: Node;
    if (n == undefined) {
      var list = ReteComponent.editor.selected["list"];
      n = list[0];
      check = false;
    }

    path.push(n);

    var amountX = 0;
    var amountY = 0;

    if (dir == "up") {
      amountY = -200;
    } else if (dir == "down") {
      amountY = +200;
    } else if (dir == "right") {
      amountX = 200;
    } else if (dir == "left") {
      amountX = -200;
    }

    ReteComponent.editor.view.nodes.get(n).translate(n.position[0] + amountX, n.position[1] + amountY);
    if (check || list.length == 1) {
      var conns = n.getConnections();
      for (var i = 0; i < conns.length; i++) {
        prev = conns[i].input.node;

        if (n.id != prev.id) {
          if (!path.includes(prev) && prev != undefined) {
            this.moveAllFollowingNodes(prev, path, dir);
          }
        }
      }
    } else {
      return;
    }
  }

  //connect nodes if possible and if only 2 are selected
  public connectSelectedNodes(){
    var selectedNodes = ReteComponent.editor.selected["list"];
    //only works if 2 are selected
    if (selectedNodes.length == 2){

      var n1: Node = selectedNodes[0];
      var n2: Node = selectedNodes[1];

      if(n1.position[0] < n2.position[0]){
        ReteComponent.editor.connect(n1.outputs.get("out"), n2.inputs.get("in"));
      } else {
        ReteComponent.editor.connect(n2.outputs.get("out"), n1.inputs.get("in"));
      }
    }
  }

  public reteChangedPosition(pos: Array<number>) {
    this.changedPosition.emit(pos);
  }

  public reteEditedJson(json: any) {
    this.editedJson.emit(json);
  }

  public reteMessage(type: string, msg: string) {
    const obj = { 'type': type, 'msg': msg };
    this.reteObject.emit(obj);
  }
}
