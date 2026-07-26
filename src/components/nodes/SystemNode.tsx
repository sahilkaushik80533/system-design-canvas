import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps, Node } from '@xyflow/react';
import type { SystemComponentData, SystemComponentKind } from '../../types/canvas.types';

// ─── Per-kind visual config ─────────────────────────────────────────────────

type KindMeta = {
  icon: string;
  gradient: string;
  glow: string;
  statusColor: string;
};

const KIND_META: Record<SystemComponentKind, KindMeta> = {
  load_balancer: {
    icon: '⚖️',
    gradient: 'from-blue-500/20 to-cyan-500/10',
    glow: 'shadow-[0_0_20px_rgba(122,162,247,0.15)]',
    statusColor: 'bg-accent-green',
  },
  database: {
    icon: '🗄️',
    gradient: 'from-purple-500/20 to-indigo-500/10',
    glow: 'shadow-[0_0_20px_rgba(187,154,247,0.15)]',
    statusColor: 'bg-accent-green',
  },
  cache: {
    icon: '⚡',
    gradient: 'from-amber-500/20 to-orange-500/10',
    glow: 'shadow-[0_0_20px_rgba(224,175,104,0.15)]',
    statusColor: 'bg-accent-green',
  },
  message_queue: {
    icon: '📨',
    gradient: 'from-teal-500/20 to-emerald-500/10',
    glow: 'shadow-[0_0_20px_rgba(115,218,202,0.15)]',
    statusColor: 'bg-accent-teal',
  },
  api_gateway: {
    icon: '🌐',
    gradient: 'from-cyan-500/20 to-blue-500/10',
    glow: 'shadow-[0_0_20px_rgba(125,207,255,0.15)]',
    statusColor: 'bg-accent-cyan',
  },
  server: {
    icon: '🖥️',
    gradient: 'from-slate-500/20 to-gray-500/10',
    glow: 'shadow-[0_0_20px_rgba(160,164,184,0.15)]',
    statusColor: 'bg-accent-green',
  },
  cdn: {
    icon: '🌍',
    gradient: 'from-green-500/20 to-lime-500/10',
    glow: 'shadow-[0_0_20px_rgba(158,206,106,0.15)]',
    statusColor: 'bg-accent-green',
  },
  storage: {
    icon: '💾',
    gradient: 'from-rose-500/20 to-pink-500/10',
    glow: 'shadow-[0_0_20px_rgba(247,118,142,0.15)]',
    statusColor: 'bg-accent-orange',
  },
};

/** Pretty-print the kind string. */
function formatKind(kind: SystemComponentKind): string {
  return kind
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// ─── Component ──────────────────────────────────────────────────────────────

type SystemNodeType = Node<SystemComponentData, 'systemComponent'>;

function SystemNodeComponent({ data, selected }: NodeProps<SystemNodeType>) {
  const meta = KIND_META[data.kind];

  return (
    <div
      className={`
        group relative w-64 rounded-xl border transition-all duration-300
        bg-gradient-to-br ${meta.gradient}
        backdrop-blur-sm
        ${selected
          ? 'border-accent-blue/70 ' + meta.glow
          : 'border-border-subtle hover:border-border-default'}
      `}
    >
      {/* ── Target handle (top) ── */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-accent-blue !border-2 !border-surface-raised
                   !-top-1.5 transition-transform duration-200
                   hover:!scale-125"
      />

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 pt-3 pb-2">
        <span className="text-2xl drop-shadow-md">{meta.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-text-primary truncate leading-tight">
            {data.label}
          </h3>
          <span className="text-[11px] font-mono text-text-muted tracking-wide uppercase">
            {formatKind(data.kind)}
          </span>
        </div>
        {/* Status dot */}
        <span className="relative flex h-2.5 w-2.5">
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full ${meta.statusColor} opacity-40`}
          />
          <span
            className={`relative inline-flex h-2.5 w-2.5 rounded-full ${meta.statusColor}`}
          />
        </span>
      </div>

      {/* ── Divider ── */}
      <div className="mx-3 h-px bg-border-subtle/60" />

      {/* ── Params grid ── */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 px-4 py-2.5 text-[11px]">
        <div>
          <span className="text-text-muted">Capacity</span>
          <p className="text-text-secondary font-mono font-medium">
            {data.params.capacity.toLocaleString()}/s
          </p>
        </div>
        <div>
          <span className="text-text-muted">Replicas</span>
          <p className="text-text-secondary font-mono font-medium">
            ×{data.params.replicas}
          </p>
        </div>
        <div>
          <span className="text-text-muted">Tech</span>
          <p className="text-text-secondary font-medium truncate">
            {data.params.technology}
          </p>
        </div>
        <div>
          <span className="text-text-muted">Latency</span>
          <p className="text-text-secondary font-mono font-medium">
            {data.params.latencyMs}ms
          </p>
        </div>
      </div>

      {/* ── Source handle (bottom) ── */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-accent-purple !border-2 !border-surface-raised
                   !-bottom-1.5 transition-transform duration-200
                   hover:!scale-125"
      />
    </div>
  );
}

export const SystemNode = memo(SystemNodeComponent);
