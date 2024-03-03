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
  <div><button @click="saveGraph"></button></div>
</template>

<script>
import G6 from '@antv/g6';

export default {
  name: 'GraphEditor',
  data() {
    return {
      graph: null,
      nodes: [],
      edges: [],
      selectedNodeId: null,
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
          type: 'quadratic',
          style: {
            stroke: '#e2e2e2',
            lineWidth: 2,
            endArrow: {
              path: G6.Arrow.vee(10, 10, 10),
              d: 10,
            },
          },
          labelCfg: {
            autoRotate: true,
          },
        },
      });

      // Event listeners
      this.graph.on('node:click', this.onNodeClick);

      // Initial render
      this.updateGraph();
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
            id: `${nodeType}-${this.nodes.length}`,
            x: event.offsetX,
            y: event.offsetY,
            label: `${nodeType.toUpperCase()} - ${this.nodes.length}`,
            type: nodeType,
          };
          this.nodes.push(model); // Add node to nodes array
          this.updateGraph(); // Re-render the graph
        }
      });
    },
    onNodeClick(evt) {
      const { item } = evt;
      const clickedNodeId = item.getID();
      if (this.selectedNodeId && this.selectedNodeId !== clickedNodeId) {
        const newEdge = {
          source: this.selectedNodeId,
          target: clickedNodeId,
          label: `edge from ${this.selectedNodeId} to ${clickedNodeId}`,
          style: {
            endArrow: {
              path: G6.Arrow.vee(10, 10, 10),
              d: 10,
            },
          },
        };
        this.edges.push(newEdge); // Add edge to edges array
        this.updateGraph(); // Re-render the graph
        this.selectedNodeId = null; // Reset selected node
      } else {
        this.selectedNodeId = clickedNodeId; // Set this node as selected
      }
    },
    updateGraph() {
      // Use nodes and edges data to update the graph
      this.graph.data({
        nodes: this.nodes,
        edges: this.edges,
      });
      
      G6.Util.processParallelEdges(this.edges);
      this.graph.render();
    },
    saveGraph() {
      const data = this.graph.save();
      const dataStr = JSON.stringify(data, null, 2); 
      console.log(dataStr)
    }
  },
};
</script>
