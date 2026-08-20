// ─── Types ──────────────────────────────────────────────────────────────────

export interface EvaluationResult {
  score: number;
  strengths: string[];
  bottlenecks: string[];
  suggestions: string[];
}

interface EvaluationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  data: EvaluationResult | null;
}

// ─── Score Helpers ──────────────────────────────────────────────────────────

function getScoreColor(score: number) {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 50) return 'text-amber-400';
  return 'text-red-400';
}

function getScoreBg(score: number) {
  if (score >= 80) return 'bg-emerald-500/20 border-emerald-500/30';
  if (score >= 50) return 'bg-amber-500/20 border-amber-500/30';
  return 'bg-red-500/20 border-red-500/30';
}

// ─── Component ──────────────────────────────────────────────────────────────

export function EvaluationPanel({ isOpen, onClose, data }: EvaluationPanelProps) {
  if (!isOpen || !data) {
    return null;
  }

  const { score, strengths, bottlenecks, suggestions } = data;

  return (
    <div
      className="nodrag nopan pointer-events-auto absolute top-4 right-4 z-50 bg-[#242736] p-5 rounded-2xl shadow-2xl border border-gray-700/50 w-[380px] text-gray-200 max-h-[85vh] overflow-y-auto backdrop-blur-md"
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* ── Header ── */}
      <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
          AI Evaluation
          <span className={`ml-2 px-2.5 py-0.5 ${getScoreBg(score)} border rounded-full text-sm font-semibold tracking-wide ${getScoreColor(score)}`}>
            Score: {score}
          </span>
        </h2>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="nodrag nopan pointer-events-auto text-gray-400 hover:text-white transition-colors bg-gray-800 hover:bg-gray-700 p-1.5 rounded-full"
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      {/* ── Strengths ── */}
      {strengths.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm uppercase tracking-wider font-semibold text-emerald-400 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            Strengths ({strengths.length})
          </h3>
          <ul className="space-y-2">
            {strengths.map((item, i) => (
              <li key={i} className="text-sm text-emerald-100 bg-emerald-900/20 p-2.5 rounded-lg border border-emerald-700/30 flex items-start">
                <span className="mr-2 mt-0.5 text-emerald-400">✓</span>
                <span className="leading-tight">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Bottlenecks ── */}
      {bottlenecks.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm uppercase tracking-wider font-semibold text-red-400 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            Bottlenecks ({bottlenecks.length})
          </h3>
          <ul className="space-y-2">
            {bottlenecks.map((item, i) => (
              <li key={i} className="text-sm text-red-100 bg-red-900/20 p-2.5 rounded-lg border border-red-700/30 flex items-start">
                <span className="mr-2 mt-0.5 text-red-400">⚠</span>
                <span className="leading-tight">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Suggestions ── */}
      {suggestions.length > 0 && (
        <div className="mb-2">
          <h3 className="text-sm uppercase tracking-wider font-semibold text-blue-400 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
            Suggestions ({suggestions.length})
          </h3>
          <ul className="space-y-2">
            {suggestions.map((item, i) => (
              <li key={i} className="text-sm text-blue-100 bg-blue-900/20 p-2.5 rounded-lg border border-blue-700/30 flex items-start">
                <span className="mr-2 mt-0.5 text-blue-400">💡</span>
                <span className="leading-tight">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
