<template>
  <div style="display:flex">
    <div
      id="shape-selector"
      style="width: 200px; height: 600px; border: 1px solid #ccc; padding: 10px; display:block; flex-direction:column; justify-items:center; align-items:center"
    >
      <div v-for="(category, index) in categories" :key="index" style="margin-bottom: 20px;">
        <h3>{{ category.categoryName }}</h3>
        <div v-for="model in category.models" :key="model.class_name"
          class="drag-node model"
          draggable="true"
          @dragstart="onDragStart($event, model.class_name)"
          :style="{ backgroundColor: model.color }">
          {{ model.description }}
        </div>
      </div>
    </div>
    
    <div id="container" style="flex-grow: 1; height: 600px; border: 1px solid #ccc;"></div>
  </div>
  <div><button @click="saveGraph">save</button></div>
  <div>
    <el-dialog
    title="Warning"
    width="500"
    align-center
    v-model="detailDialogVisible">
      <div style="display:flex; flex-direction: column;">
        class-name:{{ selectedClassName }}
      </div>
    </el-dialog>
  </div>
</template>

<script setup name="GraphEditor">
import G6, { Tooltip } from '@antv/g6';
import {ref, onMounted} from 'vue'

// display
const selectedClassName = ref('')
const selectedClassInputParams = ref([])
const selectedClassCode = ref('')
let count = 0;

const detailDialogVisible = ref(false);
const processParallelEdgesOnAnchorPoint = (
    edges,
    offsetDiff = 15,
    multiEdgeType = 'quadratic',
    singleEdgeType = undefined,
    loopEdgeType = undefined
) => {
    const len = edges.length;
    const cod = offsetDiff * 2;
    const loopPosition = [
        'top',
        'top-right',
        'right',
        'bottom-right',
        'bottom',
        'bottom-left',
        'left',
        'top-left',
    ];
    const edgeMap = {};
    const tags = [];
    const reverses = {};
    for (let i = 0; i < len; i++) {
        const edge = edges[i];
        const { source, target, sourceAnchor, targetAnchor } = edge;
        const sourceTarget = `${source}|${sourceAnchor}-${target}|${targetAnchor}`;

        if (tags[i]) continue;
        if (!edgeMap[sourceTarget]) {
            edgeMap[sourceTarget] = [];
        }
        tags[i] = true;
        edgeMap[sourceTarget].push(edge);
        for (let j = 0; j < len; j++) {
            if (i === j) continue;
            const sedge = edges[j];
            const { source: src, target: dst, sourceAnchor: srcAnchor, targetAnchor: dstAnchor } = sedge;

            // 两个节点之间共同的边
            // 第一条的source = 第二条的target
            // 第一条的target = 第二条的source
            if (!tags[j]) {
                if (source === dst && sourceAnchor === dstAnchor
                    && target === src && targetAnchor === srcAnchor) {
                    edgeMap[sourceTarget].push(sedge);
                    tags[j] = true;
                    reverses[`${src}|${srcAnchor}|${dst}|${dstAnchor}|${edgeMap[sourceTarget].length - 1}`] = true;
                } else if (source === src && sourceAnchor === srcAnchor
                    && target === dst && targetAnchor === dstAnchor) {
                    edgeMap[sourceTarget].push(sedge);
                    tags[j] = true;
                }
            }
        }
    }

    for (const key in edgeMap) {
        const arcEdges = edgeMap[key];
        const { length } = arcEdges;
        for (let k = 0; k < length; k++) {
            const current = arcEdges[k];
            if (current.source === current.target) {
                if (loopEdgeType) current.type = loopEdgeType;
                // 超过8条自环边，则需要重新处理
                current.loopCfg = {
                    position: loopPosition[k % 8],
                    dist: Math.floor(k / 8) * 20 + 50,
                };
                continue;
            }
            if (length === 1 && singleEdgeType && (current.source !== current.target || current.sourceAnchor !== current.targetAnchor)) {
                current.type = singleEdgeType;
                continue;
            }
            current.type = multiEdgeType;
            const sign =
                (k % 2 === 0 ? 1 : -1) * (reverses[`${current.source}|${current.sourceAnchor}|${current.target}|${current.targetAnchor}|${k}`] ? -1 : 1);
            if (length % 2 === 1) {
                current.curveOffset = sign * Math.ceil(k / 2) * cod;
            } else {
                current.curveOffset = sign * (Math.floor(k / 2) * cod + offsetDiff);
            }
        }
    }
    return edges;
};

// 实际接入后端后，改为在init时进行处理
const categories = ref([
  {
    categoryName: "第一类",
    models: [
      { class_name: "A", description: "矩形-3-2(A)", color: "#9EC9FF" },
      { class_name: "B", description: "矩形-4-3(B)", color: "#9EC9FF" },
    ]
  },
  {
    categoryName: "第二类",
    models: [
      { class_name: "C", description: "矩形-1-5(C)", color: "#FFD700" },
      { class_name: "D", description: "矩形-1-3(D)", color: "#FFD700" },
    ]
  },
]);


let graph = ref(null)
let nodes = ref([])
let edges = ref([])
// let selectedNodeId = ref(null)
let sourceAnchorIdx, targetAnchorIdx
// const menu = ref(null)

import classesData from '@/static/classes.json'

let classes = classesData.classes
let curVarType = ref('')

import insertCss from 'insert-css';
insertCss(`
  .g6-component-tooltip {
    background-color: rgba(255, 255, 255, 0.8);
    padding: 0px 10px 24px 10px;
    box-shadow: rgb(174, 174, 174) 0px 0px 10px;
  }
`);

onMounted(() => {
    initGraph()
    initMenu()
    setupDragEvents()
})

function hideAnchorPointsVisibility(item)
{
    const anchorPoints = item.getContainer().findAll(ele => ele.get('name') === 'anchor-point');
    anchorPoints.forEach(point => {
        point.attr({opacity:0.5})
    })
}

function showAnchorPointsVisibility(item)
{
    const anchorPoints = item.getContainer().findAll(ele => ele.get('name') === 'anchor-point');
    anchorPoints.forEach(point => {
        point.attr({opacity:1})
    })
}

function getRectAnchors(inNum, outNum) {
  // 4,3 leads to [[0, 0.2], [0, 0.4], [0, 0.6], [0, 0.8], [1, 0.25], [1, 0.5], [1, 0.75]]
  inNum = Number(inNum)
  outNum = Number(outNum)
  let inInterval = 1 / (inNum + 1)
  let outInterval = 1 / (outNum + 1)
  let anchors = []
  for (let i = 1; i <= inNum; i++)
    anchors.push([0, i * inInterval])
  for (let i = 1; i <= outNum; i++)
    anchors.push([1, i * outInterval])
  return anchors
}

function register(inNum, outNum, inPar, outPar) {
  count++;
  let newName = `rect-node-${inNum}-${outNum}`
  G6.registerNode(newName,{
    getAnchorPoints(cfg) {
      return cfg.anchorPoints || getRectAnchors(inNum,outNum);
      // return cfg.anchorPoints || [[0, 0.2], [0, 0.4], [0, 0.6], [0, 0.8], [1, 0.25], [1, 0.5], [1, 0.75]];
    },
    // draw anchor-point circles according to the anchorPoints in afterDraw
    afterDraw(cfg, group) {
      const bbox = group.getBBox();
      const anchorPoints = this.getAnchorPoints(cfg)
      anchorPoints.forEach((anchorPos, i) => {
          const isEntryPoint = i < inNum;
          group.addShape('circle', {
              attrs: {
                  r: 5,
                  x: bbox.x + bbox.width * anchorPos[0],
                  y: bbox.y + bbox.height * anchorPos[1],
                  fill: '#fff',
                  stroke: '#5F95FF',
                  opacity: 0
              },
              // must be assigned in G6 3.3 and later versions. it can be any string you want, but should be unique in a custom item type
              name: `anchor-point`, // the name, for searching by group.find(ele => ele.get('name') === 'anchor-point')
              anchorPointIdx: i, // flag the idx of the anchor-point circle
              links: 1, // cache the number of edges connected to this shape
              visible: true, // invisible by default, shows up when links > 1 or the node is in showAnchors state
              draggable: true, // allow to catch the drag events on this shape
              pointType: isEntryPoint ? 'entry' : 'exit', // 入点或出点
              parType: isEntryPoint ? inPar[i].type : outPar[i-inNum].type,
              parName: isEntryPoint ? inPar[i].name : outPar[i-inNum].name,
              parTag: isEntryPoint ? inPar[i].tag : outPar[i-inNum].tag,
          })
      })
    },

    // response the state changes and show/hide the link-point circles
    setState(name, value, item) {
      if (name === 'showAnchors') {
          const anchorPoints = item.getContainer().findAll(ele => ele.get('name') === 'anchor-point');
          anchorPoints.forEach(point => {
              if (value || point.get('links') > 0) point.show()
              else point.hide()
          })
      }
    }
  }, 'rect')
  console.log(newName)
  return newName
}

function initTooltip() {
  const tooltip = new G6.Tooltip({
    offsetX: 10,
    offsetY: 10,
    getContent(e) {
      const outDiv = document.createElement('div')
      outDiv.style.width = '180px'
      let type = e.item.getType();
      if(type == 'node') {
        if(e.target.get('name') == 'anchor-point') {
          outDiv.innerHTML = `
          <h4>Anchor Point</h4>
          <ul><li>Name: ${e.target.get('parName')}</li></ul>
          <ul><li>Type: ${e.target.get('parType')}</li></ul>
          <ul><li>Tag: ${e.target.get('parTag')}</li></ul>
          `
          return outDiv
        } 
        else {
          outDiv.innerHTML = `
          <h4>Node</h4>
          <ul><li>ID: ${e.item.getID()}</li></ul>
          <ul><li>Code: ${e.item.getModel().label || e.item.getModel().id}</li></ul>
          `
          return outDiv
        }
      } 
      else if(type == 'edge') {
        let sourceClassName = nodes.value.find(ele => ele.id==e.item.getSource().getID()).className;
        let targetClassName = nodes.value.find(ele => ele.id==e.item.getTarget().getID()).className;
        let sourceClass = classes.find(item => item.class_name == sourceClassName);
        let targetClass = classes.find(item => item.class_name == targetClassName);
        let sourceAP = sourceClass.output_params[e.item.getModel().sourceAnchor-sourceClass.input_num]
        let targetAP = targetClass.input_params[e.item.getModel().targetAnchor]
        outDiv.innerHTML = `
        <h4>Edge</h4>
        <h5>Source:</h5>
        <ul>
          <li>Name: ${sourceAP.name}</li>
          <li>Type: ${sourceAP.type}</li>
          <li>Tag: ${sourceAP.tag}</li>
        </ul>
        <h5>Target:</h5>
        <ul>
          <li>Name: ${targetAP.name}</li>
          <li>Type: ${targetAP.type}</li>
          <li>Tag: ${targetAP.tag}</li>
        </ul>
        `
        return outDiv
      }
    },
    itemTypes: ['node','edge']
  })
  return tooltip
}

function test()
{
    console.log('test')
}

function initMenu()
{
    const menu = new G6.Menu({
        getContent(evt) {
        let header;
        if (evt.target && evt.target.isCanvas && evt.target.isCanvas()) {
          header = 'Canvas ContextMenu';
        } else if (evt.item) {
          const itemType = evt.item.getType();
          header = `${itemType.toUpperCase()} ContextMenu`;
        }
        const outDiv = document.createElement('div');
        outDiv.style.cursor = 'pointer'
        outDiv.innerHTML = '<p id="deleteNode">删除节点</p>'
        console.log(outDiv)
        // let btn = outDiv.querySelector('#deleteNode')
        // console.log(btn)
        // btn.addEventListener('click', test)
        // return `
        // <h3>${header}</h3>
        // <ul>
        //   <li title='1'>li 1</li>
        //   <li title='2'>li 2</li>
        //   <li>li 3</li>
        //   <li>li 4</li>
        //   <li>li 5</li>
        // </ul>`;
        return outDiv
        },
        handleMenuClick: (target, item) => {
          console.log(target, item);
          graph.value.removeItem(item);
          edges.value = graph.value.save().edges
          nodes.value = graph.value.save().nodes
        },
        // offsetX and offsetY include the padding of the parent container
        // 需要加上父级容器的 padding-left 16 与自身偏移量 10
        offsetX: 16 + 10,
        // 需要加上父级容器的 padding-top 24 、画布兄弟元素高度、与自身偏移量 10
        offsetY: 0,
        // the types of items that allow the menu show up
        // 在哪些类型的元素上响应
        itemTypes: ['node', 'edge'],
    })
    return menu;
}

function initGraph() {
  const tooltip = initTooltip()
  const menu = initMenu()
  graph.value = new G6.Graph({
    container: 'container',
    width: 800,
    height: 600,
    plugins:[menu,tooltip],
    modes: {
      default: [
      // config the shouldBegin for drag-node to avoid node moving while dragging on the anchor-point circles
      {
          type: 'drag-node',
          shouldBegin: e => {
              if (e.target.get('name') === 'anchor-point') return false;
              return true;
          }
      },
      // config the shouldBegin and shouldEnd to make sure the create-edge is began and ended at anchor-point circles
      {
          type: 'create-edge',
          trigger: 'drag', // set the trigger to be drag to make the create-edge triggered by drag
          shouldBegin: e => {
              // avoid beginning at other shapes on the node
              if (e.target && e.target.get('name') !== 'anchor-point') return false;
              sourceAnchorIdx = e.target.get('anchorPointIdx');
              if (e.target.get('pointType') != 'exit') return false;
              curVarType = e.target.get('parType');
              e.target.set('links', e.target.get('links') + 1); // cache the number of edge connected to this anchor-point circle
              return true;
          },
          shouldEnd: e => {
              // avoid ending at other shapes on the node
              if (e.target && e.target.get('name') !== 'anchor-point') return false;
              if (e.target.get('pointType') != 'entry') return false;
              if (e.target.get('parType') != curVarType) {
                alert(`出点的类型为: ${curVarType}，入点的类型为: ${e.target.get('parType')}，二者类型不同，不能相互连接。`);
                curVarType = '';
                return false;
              }
              if (e.target) {
                  targetAnchorIdx = e.target.get('anchorPointIdx');
                  e.target.set('links', e.target.get('links') + 1);  // cache the number of edge connected to this anchor-point circle
                  return true;
              }

              targetAnchorIdx = undefined;
              return true;
          },
      }],
    },
    defaultNode: {
      type: 'rect-node',
      size: [60,100],
      style: {
        fill: '#9EC9FF',
        stroke: '#5B8FF9',
        lineWidth: 2,
      },
    },
    defaultEdge: {
      type: 'quadratic',
      style: {
        stroke: '#e2e2e2',
        lineWidth: 2,
        endArrow: {
          path: G6.Arrow.vee(5, 10, 10),
          d: 10,
        },
      },
      labelCfg: {
        autoRotate: true,
      },
    },
  })
  // Event listeners
  // graph.value.on('node:click', onNodeClick);

  graph.value.on('aftercreateedge', (e) => {
      // count++;
      // update the sourceAnchor and targetAnchor for the newly added edge
      graph.value.updateItem(e.edge, {
          sourceAnchor: sourceAnchorIdx,
          targetAnchor: targetAnchorIdx
      })

      // update the curveOffset for parallel edges
      const tempEdges = graph.value.save().edges;
      edges.value = tempEdges
      processParallelEdgesOnAnchorPoint(tempEdges);
      graph.value.getEdges().forEach((edge, i) => {
          graph.value.updateItem(edge, {
              curveOffset: tempEdges[i].curveOffset,
              curvePosition: tempEdges[i].curvePosition,
          });
      });
      
  });
  // // after drag from the first node, the edge is created, update the sourceAnchor
  graph.value.on('afteradditem', (e) => {
      // count++;
       if (e.item && e.item.getType() === 'edge' && sourceAnchorIdx != null) {
          graph.value.updateItem(e.item, {
              sourceAnchor: sourceAnchorIdx
          });
      }
  })
  // if create-edge is canceled before ending, update the 'links' on the anchor-point circles
  graph.value.on('afterremoveitem', e => {
    if (e.item && e.item.source && e.item.target) {
        const sourceNode = graph.value.findById(e.item.source);
        const targetNode = graph.value.findById(e.item.target);
        const { sourceAnchor, targetAnchor } = e.item;
        if (sourceNode && !isNaN(sourceAnchor)) {
            const sourceAnchorShape = sourceNode.getContainer().find(ele => (ele.get('name') === 'anchor-point' && ele.get('anchorPointIdx') === sourceAnchor));
            sourceAnchorShape.set('links', sourceAnchorShape.get('links') - 1);
        }
        if (targetNode && !isNaN(targetAnchor)) {
            const targetAnchorShape = targetNode.getContainer().find(ele => (ele.get('name') === 'anchor-point' && ele.get('anchorPointIdx') === targetAnchor));
            targetAnchorShape.set('links', targetAnchorShape.get('links') - 1);
        }
    }
  })

  // 节点双击事件
  graph.value.on('dblclick', e => {
    console.log(e.item)
    if(e.item && e.item.getType() !== 'edge')
    {
      detailDialogVisible.value = true;
      selectedClassName.value = e.item._cfg.model.className;
    }
  })

  // some listeners to control the state of nodes to show and hide anchor-point circles
  graph.value.on('node:mouseenter', e => {
    // graph.value.setItemState(e.item, 'showAnchors', true);
    showAnchorPointsVisibility(e.item)
  })
  graph.value.on('node:mouseleave', e => {
    // graph.value.setItemState(e.item, 'showAnchors', false);
    hideAnchorPointsVisibility(e.item)
  })
  graph.value.on('node:mouseout', e => {
    // mouseout不符合预期，暂时不考虑触发隐藏锚点
    // hideAnchorPointsVisibility(e.item)
  }) 
  graph.value.on('node:dragenter', e => {
    // graph.value.setItemState(e.item, 'showAnchors', true);
    hideAnchorPointsVisibility(e.item)
  })
  graph.value.on('node:dragleave', e => {
    // console.log("dragleave")
    // graph.value.setItemState(e.item, 'showAnchors', false);
    hideAnchorPointsVisibility(e.item)
  })
  graph.value.on('node:dragstart', e => {
    // graph.value.setItemState(e.item, 'showAnchors', true);
    showAnchorPointsVisibility(e.item)
  })
  graph.value.on('node:dragend', e => {
    // graph.value.setItemState(e.item, 'showAnchors', false);
    // console.log('dragend')
    hideAnchorPointsVisibility(e.item)
  })
  // Initial render
  updateGraph();
}

function onDragStart(event, className) {
  let dragClass = classes.find(item => item.class_name == className);
  event.dataTransfer.setData('className', dragClass.class_name)
  // console.log("Drag Class: ", dragClass.class_name)
}

function setupDragEvents() {
  const container = document.getElementById('container');
  container.addEventListener('dragover', (event) => {
    event.preventDefault();
  });

  container.addEventListener('drop', (event) => {
    // hideAnchorPointsVisibility(event.item)
    // const anchorPoints = this.findAll(ele => ele.get('name') === 'anchor-point');
    // anchorPoints.forEach(point => {
    //     console.log(point)
    //     point.attr({opacity:0})
    // })
    event.preventDefault();
    let className = event.dataTransfer.getData('className');
    let dragClass = classes.find(item => item.class_name == className);
    let inNum = dragClass.input_num;
    let outNum = dragClass.output_num;
    let inPar = dragClass.input_params;
    let outPar = dragClass.output_params;
    let text = dragClass.code;
    event.dataTransfer.clearData();
    let nodeType = register(inNum, outNum, inPar, outPar);
    // console.log(categories.value)
    if (nodeType) {
      const model = {
        id: `${nodeType}-${count}`,
        className: className,
        x: event.offsetX,
        y: event.offsetY,
        label: `${text}`,
        type: nodeType,
        style: {
          "fill": categories.value[dragClass.category].models[0].color
        }
      };
      nodes.value.push(model); // Add node to nodes array
      updateGraph(); // Re-render the graph
    }
  });
}

function updateGraph() {
  // Use nodes and edges data to update the graph
  edges.value.forEach((edge, i)=>{
    console.log(i);
    console.log(edge)
  })
  graph.value.data({
    nodes: nodes.value,
    edges: edges.value,
  });
  G6.Util.processParallelEdges(edges.value);
  sourceAnchorIdx = null;
  graph.value.render();
}

function saveGraph() {
  const data = graph.value.save();
  const dataStr = JSON.stringify(data, null, 2); 
  console.log(dataStr)
}
</script>



<style scoped>
.model {
  width: 120px; 
  height: 40px;
  cursor: grab;
  margin-bottom:5px;
  display:flex;
  border-radius:10%;
  justify-content: center;
  align-items: center;
}
</style>