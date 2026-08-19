import React, { useEffect, useState } from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { API_BASE_URL } from '../../utils/apiConfig';

interface HistoryRecord {
  id: string;
  score: number | null;
  nodes: any[];
  edges: any[];
  created_at: string;
}

interface HistoryModalProps {
  onClose: () => void;
}

export function HistoryModal({ onClose }: HistoryModalProps) {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const setCanvasState = useCanvasStore((state) => state.setCanvasState);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/history`);
        if (!response.ok) {
          throw new Error('Failed to fetch history');
        }
        const data = await response.json();
        setHistory(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleLoad = (e: React.MouseEvent, record: HistoryRecord) => {
    e.preventDefault();
    try {
      const rawNodes = record.nodes ?? [];
      const nodes = rawNodes.map((node: any) => ({
          ...node,
          position: node.position || { x: 0, y: 0 } // Fallback for legacy DB records
      }));
      const edges = record.edges ?? [];
      
      setCanvasState(nodes, edges);
      onClose();
    } catch (error) {
      console.error("Failed to load saved architecture:", error);
      alert("Error loading architecture data. Check console.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#1e1e2e] border border-gray-700 p-6 rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl text-gray-200">
        <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Saved Architectures
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors bg-gray-800 hover:bg-gray-700 p-1.5 rounded-full"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : error ? (
            <div className="text-red-400 bg-red-900/20 p-4 rounded-xl border border-red-800/30 text-center">
              {error}
            </div>
          ) : history.length === 0 ? (
            <div className="text-gray-400 text-center py-10 italic">
              No architectures saved yet.
            </div>
          ) : (
            history.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 hover:border-indigo-500/50 transition-colors group"
              >
                <div>
                  <h3 className="font-semibold text-white">Architecture #{record.id.slice(0, 8)}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-400">
                      Nodes: {record.nodes?.length ?? 0}
                    </span>
                    <span className="text-xs text-gray-400">
                      Edges: {record.edges?.length ?? 0}
                    </span>
                    {record.score != null && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-900/40 text-indigo-300 border border-indigo-700/50">
                        Score: {record.score}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleLoad(e, record)}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-indigo-900/20 opacity-90 group-hover:opacity-100"
                >
                  Load
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

