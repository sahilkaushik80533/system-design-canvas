import { useState } from 'react';
import { Sidebar } from './components/sidebar/Sidebar';
import { CanvasArea } from './components/canvas/CanvasArea';
import { useCanvasStore } from './store/canvasStore';
import { HistoryModal } from './components/ui/HistoryModal';
import { CodeModal } from './components/ui/CodeModal';
import { exportToJson, exportToPng } from './utils/exportUtils';
import { API_BASE_URL } from './utils/apiConfig';

function App() {
  const nodes = useCanvasStore((state) => state.nodes);
  const edges = useCanvasStore((state) => state.edges);

  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  
  const setEvaluationResult = useCanvasStore((state) => state.setEvaluationResult);
  const clearCanvas = useCanvasStore((state) => state.clearCanvas);

  const handleEvaluate = async () => {
    setIsEvaluating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nodes, edges }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      setEvaluationResult(result);
    } catch (error) {
      console.error('Failed to evaluate architecture:', error);
      // Removed alert as per standard pattern, UI could be extended to show toast errors
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleGenerateCode = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/generate-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nodes, edges }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      setGeneratedCode(result.code);
      setIsCodeModalOpen(true);
    } catch (error) {
      console.error('Failed to generate code:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col w-screen h-screen bg-surface overflow-hidden">
      {/* ── Header ── */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-border-subtle bg-surface-raised z-10 relative shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚡</span>
          <h1 className="text-lg font-bold text-text-primary tracking-tight">
            Architecture Platform
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border-r border-gray-700 pr-3 mr-1">
            <button
              onClick={() => exportToJson(nodes, edges)}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 rounded-md text-xs font-semibold transition-colors cursor-pointer"
            >
              Export JSON
            </button>
            <button
              onClick={exportToPng}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 rounded-md text-xs font-semibold transition-colors cursor-pointer"
            >
              Export PNG
            </button>
            <button
              onClick={handleGenerateCode}
              disabled={isGenerating}
              className="px-3 py-1.5 bg-emerald-900/20 hover:bg-emerald-900/40 text-emerald-400 border border-emerald-800/50 rounded-md text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              {isGenerating ? '⏳' : '⚡'} Gen Code
            </button>
          </div>
          <button
            onClick={clearCanvas}
            className="px-4 py-1.5 bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-800/50 rounded-md text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span>🗑️</span> Clear
          </button>
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 rounded-md text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span>📜</span> View History
          </button>
          <button
            onClick={handleEvaluate}
            disabled={isEvaluating}
            className="px-4 py-1.5 bg-accent-blue/10 hover:bg-accent-blue/20 text-accent-blue border border-accent-blue/30 rounded-md text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{isEvaluating ? '⏳' : '▶️'}</span> 
            {isEvaluating ? 'Evaluating...' : 'Evaluate Architecture'}
          </button>
        </div>
      </header>

      {/* ── Main Layout ── */}
      <main className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        <CanvasArea />
      </main>

      {/* ── History Modal ── */}
      {isHistoryOpen && <HistoryModal onClose={() => setIsHistoryOpen(false)} />}
      
      {/* ── Code Modal ── */}
      <CodeModal
        code={generatedCode}
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
      />
    </div>
  );
}

export default App;
