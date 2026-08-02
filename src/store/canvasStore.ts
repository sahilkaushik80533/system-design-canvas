import { create } from 'zustand';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react';
import type { NodeChange, EdgeChange, Connection } from '@xyflow/react';
import { nanoid } from 'nanoid';
import type {
  CanvasNode,
  CanvasEdge,
  CanvasNodeData,
  CanvasStore,
} from '../types/canvas.types';
import { initialNodes, initialEdges } from '../mock/initialData';

/**
 * Central Zustand store that owns all React Flow state.
 *
 * Nodes & edges live here so that any component in the tree can read/write
 * canvas state without prop-drilling.
 */
export const useCanvasStore = create<CanvasStore>((set, get) => ({
  // ── Initial state (loaded from mock data) ─────────────────────────────
  nodes: initialNodes,
  edges: initialEdges,

  // ── React Flow event handlers ─────────────────────────────────────────

  /** Applies position / selection / removal changes produced by React Flow. */
  onNodesChange: (changes: NodeChange<CanvasNode>[]) => {
    set({ nodes: applyNodeChanges<CanvasNode>(changes, get().nodes) });
  },

  /** Applies selection / removal changes for edges. */
  onEdgesChange: (changes: EdgeChange<CanvasEdge>[]) => {
    set({ edges: applyEdgeChanges<CanvasEdge>(changes, get().edges) });
  },

  /** Handles a new connection drawn between two handles. */
  onConnect: (connection: Connection) => {
    set({ edges: addEdge(connection, get().edges) });
  },

  // ── Custom actions ────────────────────────────────────────────────────

  /** Drops a new node onto the canvas at `position`. */
  addNode: (data: CanvasNodeData, position: { x: number; y: number }) => {
    const newNode: CanvasNode = {
      id: nanoid(),
      type: data.nodeCategory === 'system' ? 'systemComponent' : 'neuralLayer',
      position,
      data,
    };
    set({ nodes: [...get().nodes, newNode] });
  },

  /**
   * Merges partial data into an existing node's `data` payload.
   * Useful for editing configuration through an inspector panel.
   */
  updateNodeConfig: (nodeId: string, patch: Partial<CanvasNodeData>) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...patch } as CanvasNodeData }
          : node,
      ),
    });
  },

  evaluationResult: null,
  setEvaluationResult: (result: any | null) => {
    set({ evaluationResult: result });
  },

  setCanvasState: (newNodes: CanvasNode[], newEdges: CanvasEdge[]) => {
    set({ nodes: [...newNodes], edges: [...newEdges], evaluationResult: null });
  },

  setNodes: (nodes: CanvasNode[]) => set({ nodes }),
  setEdges: (edges: CanvasEdge[]) => set({ edges }),

  clearCanvas: () => {
    set({ nodes: [], edges: [], evaluationResult: null });
  },
}));
