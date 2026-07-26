import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps, Node } from '@xyflow/react';
import type { NeuralLayerData, NeuralLayerKind } from '../../types/canvas.types';

// ─── Per-kind visual config ─────────────────────────────────────────────────

type LayerMeta = {
  icon: string;
  gradient: string;
  borderClass: string;
  getPrimaryParam: (params: NeuralLayerData['params']) => string;
};

const LAYER_META: Record<NeuralLayerKind, LayerMeta> = {
  dense: {
    icon: '🧠',
    gradient: 'from-accent-purple/20 to-accent-pink/10',
    borderClass: 'border-accent-purple/50',
    getPrimaryParam: (p) => `Units: ${p.units}`,
  },
  conv2d: {
    icon: '👁️',
    gradient: 'from-accent-blue/20 to-accent-cyan/10',
    borderClass: 'border-accent-blue/50',
    getPrimaryParam: (p) => `Filters: ${p.units} | Kernel: ${p.kernelSize?.join('x')}`,
  },
  maxpool2d: {
    icon: '🔽',
    gradient: 'from-accent-teal/20 to-accent-green/10',
    borderClass: 'border-accent-teal/50',
    getPrimaryParam: (p) => `Pool: 2x2`, // Hardcoded for simplicity in mock
  },
  lstm: {
    icon: '⏳',
    gradient: 'from-accent-orange/20 to-accent-red/10',
    borderClass: 'border-accent-orange/50',
    getPrimaryParam: (p) => `Units: ${p.units}`,
  },
  dropout: {
    icon: '🎲',
    gradient: 'from-text-muted/20 to-border-default/10',
    borderClass: 'border-text-muted/50',
    getPrimaryParam: (p) => `Rate: ${p.dropoutRate}`,
  },
  batchnorm: {
    icon: '⚖️',
    gradient: 'from-accent-green/20 to-accent-teal/10',
    borderClass: 'border-accent-green/50',
    getPrimaryParam: () => `Axis: -1`,
  },
  flatten: {
    icon: '📏',
    gradient: 'from-text-secondary/20 to-text-muted/10',
    borderClass: 'border-text-secondary/50',
    getPrimaryParam: () => `Reshape to 1D`,
  },
  embedding: {
    icon: '📚',
    gradient: 'from-accent-pink/20 to-accent-orange/10',
    borderClass: 'border-accent-pink/50',
    getPrimaryParam: (p) => `Dims: ${p.units}`,
  },
};

/** Pretty-print the kind string. */
function formatKind(kind: NeuralLayerKind): string {
  if (kind === 'conv2d') return 'Conv2D';
  if (kind === 'maxpool2d') return 'MaxPool2D';
  if (kind === 'lstm') return 'LSTM';
  if (kind === 'batchnorm') return 'BatchNorm';
  return kind.charAt(0).toUpperCase() + kind.slice(1);
}

// ─── Component ──────────────────────────────────────────────────────────────

type NNNodeType = Node<NeuralLayerData, 'neuralLayer'>;

function NNNodeComponent({ data, selected }: NodeProps<NNNodeType>) {
  const meta = LAYER_META[data.kind];

  return (
    <div
      className={`
        group relative w-56 rounded-none transition-all duration-300
        bg-gradient-to-b ${meta.gradient}
        backdrop-blur-md
        border-l-4 border-y border-r
        ${selected
          ? `border-l-accent-blue border-y-accent-blue/50 border-r-accent-blue/50 shadow-[0_0_25px_rgba(187,154,247,0.25)]`
          : `${meta.borderClass} border-y-border-subtle border-r-border-subtle hover:border-r-border-default hover:border-y-border-default`}
      `}
      style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
    >
      {/* ── Target handle (left) ── */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-6 !bg-accent-blue !border-none !rounded-none
                   !-left-1 transition-transform duration-200
                   hover:!scale-110"
      />

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-3 pt-3 pb-2">
        <span className="text-xl drop-shadow-md">{meta.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-text-primary truncate leading-tight tracking-wide">
            {formatKind(data.kind)}
          </h3>
          <p className="text-[10px] text-text-muted leading-snug line-clamp-1">
            {data.description}
          </p>
        </div>
      </div>

      {/* ── Primary Param ── */}
      <div className="px-3 pb-3">
        <div className="bg-surface-raised/50 rounded px-2 py-1.5 border border-border-subtle">
          <span className="text-xs font-mono text-accent-purple font-semibold">
            {meta.getPrimaryParam(data.params)}
          </span>
          {data.params.activation && data.params.activation !== 'none' && (
            <span className="ml-2 text-[10px] font-mono text-text-secondary uppercase px-1 py-0.5 bg-surface/50 rounded">
              {data.params.activation}
            </span>
          )}
        </div>
      </div>

      {/* ── Source handle (right) ── */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-6 !bg-accent-pink !border-none !rounded-none
                   !-right-1 transition-transform duration-200
                   hover:!scale-110"
      />
    </div>
  );
}

export const NNNode = memo(NNNodeComponent);
