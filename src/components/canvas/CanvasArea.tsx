import React, { useCallback, useRef, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useCanvasStore } from '../../store/canvasStore';
import { SystemNode } from '../nodes/SystemNode';
import { NNNode } from '../nodes/NNNode';
import { EvaluationPanel } from '../ui/EvaluationPanel';
import type { CanvasNodeData } from '../../types/canvas.types';
import { API_BASE_URL } from '../../utils/apiConfig';

// ─── Custom Node Registration ───────────────────────────────────────────────

const nodeTypes = {
  systemComponent: SystemNode,
  neuralLayer: NNNode,
};

// ─── Inner Canvas Component ─────────────────────────────────────────────────

function CanvasInner() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  // Zustand Store mappings
  const nodes = useCanvasStore((state) => state.nodes);
  const edges = useCanvasStore((state) => state.edges);
  const onNodesChange = useCanvasStore((state) => state.onNodesChange);
  const onEdgesChange = useCanvasStore((state) => state.onEdgesChange);
  const onConnect = useCanvasStore((state) => state.onConnect);
  const addNode = useCanvasStore((state) => state.addNode);

  // ─── Auto-Save Pipeline ───
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Do not trigger the save function on the initial mount if the canvas is empty
    if (nodes.length === 0 && edges.length === 0) {
      return;
    }

    const saveTimer = setTimeout(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/save-architecture`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ nodes, edges }),
        });
        
        if (!response.ok) {
          console.error('Auto-save failed:', response.status);
        } else {
          console.log('Canvas auto-saved successfully.');
        }
      } catch (error) {
        console.error('Auto-save network error:', error);
      }
    }, 1500);

    return () => clearTimeout(saveTimer);
  }, [nodes, edges]);

  // ─── Drag and Drop Handlers ───

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const nodeDataStr = event.dataTransfer.getData('application/reactflow');

      // Ensure valid drop
      if (!nodeDataStr || !reactFlowBounds) {
        return;
      }

      const nodeData = JSON.parse(nodeDataStr) as CanvasNodeData;

      // Project screen coordinates to the canvas's local coordinate system
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Add the node to the Zustand store
      addNode(nodeData, position);
    },
    [addNode, screenToFlowPosition]
  );

  return (
    <div className="w-full h-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        deleteKeyCode={['Backspace', 'Delete']}
        fitView
      >
        <Background color="#363a4f" gap={16} />
        <Controls />
        <EvaluationPanel />
      </ReactFlow>
    </div>
  );
}

// ─── Wrapper Component ──────────────────────────────────────────────────────

export function CanvasArea() {
  return (
    <div className="flex-1 h-full w-full bg-surface">
      <ReactFlowProvider>
        <CanvasInner />
      </ReactFlowProvider>
    </div>
  );
}
