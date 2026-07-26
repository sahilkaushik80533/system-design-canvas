import React from 'react';
import type { CanvasNodeData } from '../../types/canvas.types';

// ─── Default Data for Drag and Drop ─────────────────────────────────────────

const SYSTEMS_ITEMS: { label: string; icon: string; data: CanvasNodeData }[] = [
  {
    label: 'Load Balancer',
    icon: '⚖️',
    data: {
      nodeCategory: 'system',
      kind: 'load_balancer',
      label: 'New Load Balancer',
      description: 'Distributes incoming traffic.',
      params: { capacity: 10000, replicas: 1, technology: 'NGINX', latencyMs: 5 },
    },
  },
  {
    label: 'API Gateway',
    icon: '🌐',
    data: {
      nodeCategory: 'system',
      kind: 'api_gateway',
      label: 'New API Gateway',
      description: 'Routes API requests.',
      params: { capacity: 5000, replicas: 2, technology: 'Kong', latencyMs: 15 },
    },
  },
  {
    label: 'Database (PostgreSQL)',
    icon: '🗄️',
    data: {
      nodeCategory: 'system',
      kind: 'database',
      label: 'New Database',
      description: 'Persistent relational storage.',
      params: { capacity: 2000, replicas: 1, technology: 'PostgreSQL', latencyMs: 20 },
    },
  },
];

const NN_ITEMS: { label: string; icon: string; data: CanvasNodeData }[] = [
  {
    label: 'Dense',
    icon: '🧠',
    data: {
      nodeCategory: 'neural',
      kind: 'dense',
      label: 'Dense Layer',
      description: 'Fully connected layer.',
      params: { units: 64, activation: 'relu', inputShape: [], outputShape: [64], dropoutRate: 0, kernelSize: [] },
    },
  },
  {
    label: 'Conv2D',
    icon: '👁️',
    data: {
      nodeCategory: 'neural',
      kind: 'conv2d',
      label: 'Conv2D Layer',
      description: 'Spatial feature extraction.',
      params: { units: 32, activation: 'relu', inputShape: [], outputShape: [], dropoutRate: 0, kernelSize: [3, 3] },
    },
  },
  {
    label: 'Dropout',
    icon: '🎲',
    data: {
      nodeCategory: 'neural',
      kind: 'dropout',
      label: 'Dropout Layer',
      description: 'Regularization by dropping units.',
      params: { units: 0, activation: 'none', inputShape: [], outputShape: [], dropoutRate: 0.5, kernelSize: [] },
    },
  },
];

// ─── Component ──────────────────────────────────────────────────────────────

export function Sidebar() {
  const onDragStart = (event: React.DragEvent, nodeData: CanvasNodeData) => {
    // Set the dragged node's data payload
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-72 h-full bg-surface-raised border-r border-border-subtle flex flex-col overflow-y-auto">
      <div className="p-5 border-b border-border-subtle">
        <h2 className="text-sm font-bold text-text-primary tracking-wider uppercase">
          Component Palette
        </h2>
        <p className="text-xs text-text-muted mt-1">
          Drag and drop nodes onto the canvas.
        </p>
      </div>

      <div className="flex-1 p-4 space-y-6">
        
        {/* Systems Infrastructure Section */}
        <section>
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-blue" />
            Systems Infrastructure
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {SYSTEMS_ITEMS.map((item, idx) => (
              <div
                key={idx}
                draggable
                onDragStart={(e) => onDragStart(e, item.data)}
                className="flex items-center gap-3 p-3 rounded-md bg-surface border border-border-subtle cursor-grab active:cursor-grabbing hover:border-accent-blue hover:shadow-[0_0_12px_rgba(122,162,247,0.1)] transition-all group"
              >
                <span className="text-lg group-hover:scale-110 transition-transform">
                  {item.icon}
                </span>
                <span className="text-sm font-medium text-text-primary">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Neural Network Layers Section */}
        <section>
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-pink" />
            Neural Network Layers
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {NN_ITEMS.map((item, idx) => (
              <div
                key={idx}
                draggable
                onDragStart={(e) => onDragStart(e, item.data)}
                className="flex items-center gap-3 p-3 rounded-md bg-surface border border-border-subtle cursor-grab active:cursor-grabbing hover:border-accent-pink hover:shadow-[0_0_12px_rgba(255,121,198,0.1)] transition-all group"
              >
                <span className="text-lg group-hover:scale-110 transition-transform">
                  {item.icon}
                </span>
                <span className="text-sm font-medium text-text-primary">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </section>
        
      </div>
    </aside>
  );
}
