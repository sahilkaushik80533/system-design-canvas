import type { Node, Edge, NodeChange, EdgeChange, Connection } from '@xyflow/react';

// ─── System Design Component Types ──────────────────────────────────────────

/** Supported system-design component kinds. */
export type SystemComponentKind =
  | 'load_balancer'
  | 'database'
  | 'cache'
  | 'message_queue'
  | 'api_gateway'
  | 'server'
  | 'cdn'
  | 'storage';

/** Configuration parameters specific to each system component. */
export interface SystemComponentParams {
  /** Max requests/sec the component can handle. */
  capacity: number;
  /** Number of replicas for horizontal scaling. */
  replicas: number;
  /** Descriptive technology tag (e.g. "PostgreSQL", "Redis"). */
  technology: string;
  /** Estimated latency in milliseconds. */
  latencyMs: number;
}

/** Data payload stored inside a SystemComponent node. */
export interface SystemComponentData {
  nodeCategory: 'system';
  kind: SystemComponentKind;
  label: string;
  description: string;
  params: SystemComponentParams;
  [key: string]: unknown;
}

// ─── Neural Network Layer Types ─────────────────────────────────────────────

/** Supported neural-network layer kinds. */
export type NeuralLayerKind =
  | 'dense'
  | 'conv2d'
  | 'maxpool2d'
  | 'lstm'
  | 'dropout'
  | 'batchnorm'
  | 'flatten'
  | 'embedding';

/** Supported activation functions. */
export type ActivationFunction =
  | 'relu'
  | 'sigmoid'
  | 'tanh'
  | 'softmax'
  | 'leaky_relu'
  | 'none';

/** Configuration parameters specific to each neural layer. */
export interface NeuralLayerParams {
  /** Number of output units / filters. */
  units: number;
  /** Activation function applied to the output. */
  activation: ActivationFunction;
  /** Input shape (first layer only, empty otherwise). */
  inputShape: number[];
  /** Output shape (computed or user-specified). */
  outputShape: number[];
  /** Dropout rate (0–1, relevant for Dropout layers). */
  dropoutRate: number;
  /** Kernel size for convolutional layers. */
  kernelSize: number[];
}

/** Data payload stored inside a NeuralLayer node. */
export interface NeuralLayerData {
  nodeCategory: 'neural';
  kind: NeuralLayerKind;
  label: string;
  description: string;
  params: NeuralLayerParams;
  [key: string]: unknown;
}

// ─── Unified Node Types ─────────────────────────────────────────────────────

/** Discriminated union of all custom node data payloads. */
export type CanvasNodeData = SystemComponentData | NeuralLayerData;

/** Custom node type string used to register renderers. */
export type CanvasNodeType = 'systemComponent' | 'neuralLayer';

/** A React Flow Node whose data is one of our custom payloads. */
export type CanvasNode = Node<CanvasNodeData, CanvasNodeType>;

/** Re-export for convenience — edges don't need custom data yet. */
export type CanvasEdge = Edge;

// ─── Store Types ────────────────────────────────────────────────────────────

/** Shape of the Zustand canvas store. */
export interface CanvasStore {
  /** All nodes currently on the canvas. */
  nodes: CanvasNode[];
  /** All edges currently on the canvas. */
  edges: CanvasEdge[];

  // ── React Flow event handlers ──
  onNodesChange: (changes: NodeChange<CanvasNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<CanvasEdge>[]) => void;
  onConnect: (connection: Connection) => void;

  // ── Custom actions ──
  addNode: (data: CanvasNodeData, position: { x: number; y: number }) => void;
  updateNodeConfig: (nodeId: string, data: Partial<CanvasNodeData>) => void;
  setEvaluationResult: (result: any | null) => void;
  evaluationResult: any | null;
  setCanvasState: (nodes: CanvasNode[], edges: CanvasEdge[]) => void;
  setNodes: (nodes: CanvasNode[]) => void;
  setEdges: (edges: CanvasEdge[]) => void;
  clearCanvas: () => void;
}
