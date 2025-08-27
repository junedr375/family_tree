import React from 'react';
import ReactFlow, { MiniMap, Controls, Background } from 'reactflow';
import CustomNode from './CustomNode';

const nodeTypes = { custom: CustomNode };

const TreeView = ({ nodes, edges, onNodesChange, onEdgesChange, onConnect, onNodeClick }) => {
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={onNodeClick}
      nodeTypes={nodeTypes}
      fitView
    >
      <MiniMap />
      <Controls />
      <Background />
    </ReactFlow>
  );
};

export default TreeView;