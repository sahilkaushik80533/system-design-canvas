import type {
  CanvasNode,
  CanvasEdge,
  SystemComponentData,
  NeuralLayerData,
} from '../types/canvas.types';

// ─── Mock System Design Nodes ───────────────────────────────────────────────

const loadBalancerNode: CanvasNode = {
  id: 'sys-1',
  type: 'systemComponent',
  position: { x: 100, y: 200 },
  data: {
    nodeCategory: 'system',
    kind: 'load_balancer',
    label: 'Primary Load Balancer',
    description: 'Distributes incoming traffic across backend servers.',
    params: {
      capacity: 10_000,
      replicas: 2,
      technology: 'NGINX',
      latencyMs: 5,
    },
  } satisfies SystemComponentData,
};

const databaseNode: CanvasNode = {
  id: 'sys-2',
  type: 'systemComponent',
  position: { x: 500, y: 200 },
  data: {
    nodeCategory: 'system',
    kind: 'database',
    label: 'Users DB',
    description: 'Primary relational store for user data.',
    params: {
      capacity: 5_000,
      replicas: 3,
      technology: 'PostgreSQL',
      latencyMs: 12,
    },
  } satisfies SystemComponentData,
};

const cacheNode: CanvasNode = {
  id: 'sys-3',
  type: 'systemComponent',
  position: { x: 500, y: 50 },
  data: {
    nodeCategory: 'system',
    kind: 'cache',
    label: 'Session Cache',
    description: 'In-memory cache for session tokens and hot data.',
    params: {
      capacity: 50_000,
      replicas: 2,
      technology: 'Redis',
      latencyMs: 1,
    },
  } satisfies SystemComponentData,
};

// ─── Mock Neural Network Nodes ──────────────────────────────────────────────

const conv2dNode: CanvasNode = {
  id: 'nn-1',
  type: 'neuralLayer',
  position: { x: 100, y: 500 },
  data: {
    nodeCategory: 'neural',
    kind: 'conv2d',
    label: 'Conv2D – Feature Extraction',
    description: 'Extracts spatial features from the input image.',
    params: {
      units: 32,
      activation: 'relu',
      inputShape: [28, 28, 1],
      outputShape: [26, 26, 32],
      dropoutRate: 0,
      kernelSize: [3, 3],
    },
  } satisfies NeuralLayerData,
};

const denseNode: CanvasNode = {
  id: 'nn-2',
  type: 'neuralLayer',
  position: { x: 500, y: 500 },
  data: {
    nodeCategory: 'neural',
    kind: 'dense',
    label: 'Dense – Classifier',
    description: 'Fully connected layer producing class probabilities.',
    params: {
      units: 10,
      activation: 'softmax',
      inputShape: [128],
      outputShape: [10],
      dropoutRate: 0,
      kernelSize: [],
    },
  } satisfies NeuralLayerData,
};

// ─── Edges ──────────────────────────────────────────────────────────────────

const edges: CanvasEdge[] = [
  {
    id: 'e-sys-1-2',
    source: 'sys-1',
    target: 'sys-2',
    animated: true,
    label: 'read/write',
  },
  {
    id: 'e-sys-1-3',
    source: 'sys-1',
    target: 'sys-3',
    animated: true,
    label: 'cache lookup',
  },
  {
    id: 'e-nn-1-2',
    source: 'nn-1',
    target: 'nn-2',
    animated: true,
    label: 'flatten → dense',
  },
];

// ─── Exports ────────────────────────────────────────────────────────────────

export const initialNodes: CanvasNode[] = [
  loadBalancerNode,
  databaseNode,
  cacheNode,
  conv2dNode,
  denseNode,
];

export const initialEdges: CanvasEdge[] = edges;
