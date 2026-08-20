import { useCanvasStore } from '../../store/canvasStore';

interface EvaluationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EvaluationPanel({ isOpen, onClose }: EvaluationPanelProps) {
  const evaluationResult = useCanvasStore((state) => state.evaluationResult);

  if (!isOpen || !evaluationResult) {
    return null;
  }

  // Merge scores, warnings, and recommendations from both sub-evaluations
  const sysEval = evaluationResult.system_evaluation ?? {};
  const nnEval = evaluationResult.nn_evaluation ?? {};

  const scores = sysEval.scores ?? {};
  const warnings = [
    ...(sysEval.warnings ?? []),
    ...(nnEval.warnings ?? []),
  ];
  const recommendations = [
    ...(sysEval.recommendations ?? []),
    ...(nnEval.recommendations ?? []),
  ];

  return (
    <div
      className="nodrag nopan pointer-events-auto absolute top-4 right-4 z-50 bg-[#242736] p-5 rounded-2xl shadow-2xl border border-gray-700/50 w-[350px] text-gray-200 max-h-[85vh] overflow-y-auto backdrop-blur-md"
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
          Evaluation Results
          <span className="ml-2 px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-sm font-semibold tracking-wide">
            Score: {evaluationResult.overall_score ?? 0}
          </span>
        </h2>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="nodrag nopan pointer-events-auto text-gray-400 hover:text-white transition-colors bg-gray-800 hover:bg-gray-700 p-1 rounded-full"
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      {/* System Scores */}
      {Object.keys(scores).length > 0 && (
        <div className="mb-6 space-y-3">
          <h3 className="text-sm uppercase tracking-wider font-semibold text-gray-400 mb-3">System Scores</h3>
          {Object.entries(scores).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center bg-gray-800/50 p-2 rounded-lg">
              <span className="text-sm font-medium">{key}</span>
              <div className="flex items-center gap-3 flex-1 ml-4">
                <div className="flex-1 bg-gray-900 h-2 rounded-full overflow-hidden shadow-inner">
                  <div
                    className={`h-full rounded-full ${
                      Number(value) > 75 ? 'bg-green-500' : Number(value) > 40 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${value}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-white w-8 text-right">
                  {String(value)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* NN Validation Status */}
      {nnEval.layer_count !== undefined && nnEval.layer_count > 0 && (
        <div className="mb-6 flex items-center gap-3 bg-gray-800/50 p-3 rounded-lg">
          <span className={`w-3 h-3 rounded-full ${nnEval.valid ? 'bg-green-500' : 'bg-red-500'}`} />
          <div>
            <span className="text-sm font-medium text-white">
              NN Architecture: {nnEval.valid ? 'Valid' : 'Invalid'}
            </span>
            <span className="text-xs text-gray-400 ml-2">({nnEval.layer_count} layers)</span>
          </div>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm uppercase tracking-wider font-semibold text-yellow-500 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            Warnings ({warnings.length})
          </h3>
          <ul className="space-y-2">
            {warnings.map((warning: string, i: number) => (
              <li key={i} className="text-sm text-yellow-100 bg-yellow-900/30 p-2.5 rounded-lg border border-yellow-700/30 flex items-start">
                <span className="mr-2 mt-0.5">•</span>
                <span className="leading-tight">{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="mb-2">
          <h3 className="text-sm uppercase tracking-wider font-semibold text-green-500 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
            Recommendations ({recommendations.length})
          </h3>
          <ul className="space-y-2">
            {recommendations.map((rec: string, i: number) => (
              <li key={i} className="text-sm text-green-100 bg-green-900/20 p-2.5 rounded-lg border border-green-700/30 flex items-start">
                <span className="mr-2 mt-0.5 text-green-400">✓</span>
                <span className="leading-tight">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
