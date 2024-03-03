<template>
  <div style="display: flex;">
    <div
      id="shape-selector"
      style="width: 100px; height: 600px; border: 1px solid #ccc; padding: 10px;"
    >
      <div
        id="drag-node"
        style="width: 80px; height: 40px; background-color: #9EC9FF; cursor: grab; margin-bottom: 10px;"
        draggable="true"
        @dragstart="onDragStart($event, 'rect')"
      >
        拖拽矩形
      </div>
    </div>
    <div id="container" style="flex-grow: 1; height: 600px; border: 1px solid #ccc;"></div>
  </div>
</template>

<script>
import G6 from '@antv/g6';

export default {
  name: 'GraphEditor',
  data() {
    return {
      graph: null,
    };
  },
  mounted() {
    this.initGraph();
    this.setupDragEvents();
  },
  methods: {
    initGraph() {
      this.graph = new G6.Graph({
        container: 'container',
        width: 800,
        height: 600,
        modes: {
          default: ['drag-canvas', 'drag-node'],
        },
        defaultNode: {
          type: 'rect',
          size: [100, 50],
          style: {
            fill: '#9EC9FF',
            stroke: '#5B8FF9',
            lineWidth: 2,
          },
        },
        defaultEdge: {
          type: 'polyline',
          style: {
            stroke: '#e2e2e2',
            lineWidth: 2,
            endArrow: {
              path: G6.Arrow.vee(10, 10, 10),
              d: 10,
            },
          },
        },
      });

      let selectedNodeId = null;

      this.graph.on('node:dblclick', (evt) => {
        const { item } = evt;
        selectedNodeId = item.getID();
      });

      this.graph.on('node:click', (evt) => {
        const { item } = evt;
        const clickedNodeId = item.getID();
        if (selectedNodeId && selectedNodeId !== clickedNodeId) {
          this.graph.addItem('edge', {
            source: selectedNodeId,
            target: clickedNodeId,
            style: {
              endArrow: {
                path: G6.Arrow.vee(10, 10, 10),
                d: 10,
              },
            },
          });
          selectedNodeId = null;
        }
      });
    },
    onDragStart(event, nodeType) {
      event.dataTransfer.setData('node-type', nodeType);
    },
    setupDragEvents() {
      const container = document.getElementById('container');
      container.addEventListener('dragover', (event) => {
        event.preventDefault();
      });

      container.addEventListener('drop', (event) => {
        event.preventDefault();
        const nodeType = event.dataTransfer.getData('node-type');
        if (nodeType) {
          const model = {
            id: `${nodeType}-${Date.now()}`,
            x: event.offsetX,
            y: event.offsetY,
            type: nodeType,
          };
          this.graph.addItem('node', model);
        }
      });
    },
  },
};
</script>
