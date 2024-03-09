<template>
  <div style="display:flex">
    <div
      id="shape-selector"
      style="width: 200px; height: 600px; border: 1px solid #ccc; padding: 10px;
      display:block;flex-direction:column;justify-items:center;align-items:center"
    >
      <!-- <div style="display:flex;justify-items:center;align-items:center"> -->
        <div
          id="drag-node"
          style="width: 120px; height: 40px; background-color: #9EC9FF; cursor: grab; margin-bottom:5px;display:flex;border-radius:10%;justify-content: center;align-items: center;"
          draggable="true"
          @dragstart="onDragStart($event, 'A')"
        >
          矩形-3-2(A)
        </div>
        <div
          id="drag-node"
          style="width: 120px; height: 40px; background-color: #9EC9FF; cursor: grab; margin-bottom:5px;display:flex;border-radius:10%;justify-content: center;align-items: center;"
          draggable="true"
          @dragstart="onDragStart($event, 'B')"
        >
          矩形-4-3(B)
        </div>
        <div
          id="drag-node"
          style="width: 120px; height: 40px; background-color: #9EC9FF; cursor: grab; margin-bottom:5px;display:flex;border-radius:10%;justify-content: center;align-items: center;"
          draggable="true"
          @dragstart="onDragStart($event, 'C')"
        >
          矩形-1-5(C)
        </div>
      <!-- </div> -->
    </div>
    
    <div id="container" style="flex-grow: 1; height: 600px; border: 1px solid #ccc;"></div>
  </div>
  <div><button @click="saveGraph">save</button></div>
</template>

<script setup name="GraphEditor">
import G6 from '@antv/g6';
import {ref, onMounted} from 'vue'

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

let graph = ref(null)
let nodes = ref([])
let edges = ref([])
let selectedNodeId = ref(null)
let sourceAnchorIdx, targetAnchorIdx

import classesData from '@/static/classes.json'

let classes = classesData.classes

onMounted(() => {
  initGraph()
  setupDragEvents()
})


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

function register(inNum, outNum) {
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
          group.addShape('circle', {
              attrs: {
                  r: 5,
                  x: bbox.x + bbox.width * anchorPos[0],
                  y: bbox.y + bbox.height * anchorPos[1],
                  fill: '#fff',
                  stroke: '#5F95FF'
              },
              // must be assigned in G6 3.3 and later versions. it can be any string you want, but should be unique in a custom item type
              name: `anchor-point`, // the name, for searching by group.find(ele => ele.get('name') === 'anchor-point')
              anchorPointIdx: i, // flag the idx of the anchor-point circle
              links: 1, // cache the number of edges connected to this shape
              visible: false, // invisible by default, shows up when links > 1 or the node is in showAnchors state
              draggable: true // allow to catch the drag events on this shape
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
  return newName
}

function initGraph() {
  // register()
  graph.value = new G6.Graph({
    container: 'container',
    width: 800,
    height: 600,
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
              e.target.set('links', e.target.get('links') + 1); // cache the number of edge connected to this anchor-point circle
              return true;
          },
          shouldEnd: e => {
              // avoid ending at other shapes on the node
              if (e.target && e.target.get('name') !== 'anchor-point') return false;
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
      // update the sourceAnchor and targetAnchor for the newly added edge
      graph.value.updateItem(e.edge, {
          sourceAnchor: sourceAnchorIdx,
          targetAnchor: targetAnchorIdx
      })

      // update the curveOffset for parallel edges
      const edges = graph.value.save().edges;
      processParallelEdgesOnAnchorPoint(edges);
      graph.value.getEdges().forEach((edge, i) => {
          graph.value.updateItem(edge, {
              curveOffset: edges[i].curveOffset,
              curvePosition: edges[i].curvePosition,
          });
      });
  });
  // after drag from the first node, the edge is created, update the sourceAnchor
  graph.value.on('afteradditem', e => {
      if (e.item && e.item.getType() === 'edge') {
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
  // some listeners to control the state of nodes to show and hide anchor-point circles
  graph.value.on('node:mouseenter', e => {
    graph.value.setItemState(e.item, 'showAnchors', true);
  })
  graph.value.on('node:mouseleave', e => {
    graph.value.setItemState(e.item, 'showAnchors', false);
  })
  graph.value.on('node:dragenter', e => {
    graph.value.setItemState(e.item, 'showAnchors', true);
  })
  graph.value.on('node:dragleave', e => {
    graph.value.setItemState(e.item, 'showAnchors', false);
  })
  graph.value.on('node:dragstart', e => {
    graph.value.setItemState(e.item, 'showAnchors', true);
  })
  graph.value.on('node:dragout', e => {
    graph.value.setItemState(e.item, 'showAnchors', false);
  })

  // Initial render
  updateGraph();
}

function onDragStart(event, className) {
  let dragClass = classes.find(item => item.class_name == className);
  event.dataTransfer.setData('text',dragClass.code);
  event.dataTransfer.setData('in-num',dragClass.input_num)
  event.dataTransfer.setData('out-num',dragClass.output_num)
}

function setupDragEvents() {
  const container = document.getElementById('container');
  container.addEventListener('dragover', (event) => {
    event.preventDefault();
  });

  container.addEventListener('drop', (event) => {
    event.preventDefault();
    let inNum = event.dataTransfer.getData('in-num');
    let outNum = event.dataTransfer.getData('out-num');
    let text = event.dataTransfer.getData('text');
    event.dataTransfer.clearData();
    let nodeType = register(inNum, outNum)
    if (nodeType) {
      const model = {
        id: `${nodeType}-${nodes.value.length}`,
        x: event.offsetX,
        y: event.offsetY,
        label: `${text}`,
        type: nodeType,
        // style: {
        //   "fill":"red"
        // }
      };
      nodes.value.push(model); // Add node to nodes array
      updateGraph(); // Re-render the graph
    }
  });
}

function onNodeClick(evt) {
  const { item } = evt;
  const clickedNodeId = item.getID();
  if (selectedNodeId.value && selectedNodeId.value !== clickedNodeId) {
    const newEdge = {
      source: selectedNodeId.value,
      target: clickedNodeId,
      label: `edge from ${selectedNodeId.value} to ${clickedNodeId}`,
      style: {
        endArrow: {
          path: G6.Arrow.vee(10, 10, 10),
          d: 10,
        },
      },
    };
    edges.value.push(newEdge); // Add edge to edges array
    updateGraph(); // Re-render the graph
    selectedNodeId.value = null; // Reset selected node
  } else {
    selectedNodeId.value = clickedNodeId; // Set this node as selected
  }
}

function updateGraph() {
  // Use nodes and edges data to update the graph
  graph.value.data({
    nodes: nodes.value,
    edges: edges.value,
  });
  
  G6.Util.processParallelEdges(edges.value);
  graph.value.render();
}

function saveGraph() {
  const data = graph.value.save();
  const dataStr = JSON.stringify(data, null, 2); 
  console.log(dataStr)
}

</script>



<style scoped>
</style>