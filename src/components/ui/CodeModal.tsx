import { useState } from 'react';

interface CodeModalProps {
  code: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CodeModal({ code, isOpen, onClose }: CodeModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#1e1e2e] border border-gray-700 p-6 rounded-2xl max-w-2xl w-full flex flex-col shadow-2xl text-gray-200">
        <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            Generated Code
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

        <div className="bg-[#1a1b26] p-4 rounded-xl border border-gray-800 overflow-x-auto max-h-[60vh] overflow-y-auto mb-4 custom-scrollbar">
          <pre>
            <code className="text-emerald-400 font-mono text-sm">
              {code}
            </code>
          </pre>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 shadow-lg"
          >
            {copied ? '✅ Copied!' : '📋 Copy Code'}
          </button>
        </div>
      </div>
    </div>
  );
}
