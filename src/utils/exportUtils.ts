import { toPng } from 'html-to-image';
import type { CanvasNode, CanvasEdge } from '../types/canvas.types';

export const exportToJson = (nodes: CanvasNode[], edges: CanvasEdge[]) => {
  const data = JSON.stringify({ nodes, edges }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'architecture.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportToPng = async () => {
  const element = document.querySelector('.react-flow') as HTMLElement;
  if (!element) {
    console.error('React Flow element not found');
    return;
  }
  
  try {
    const dataUrl = await toPng(element, {
      backgroundColor: '#1a1b26', // Matching dark theme background
    });
    
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'architecture.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (error) {
    console.error('Failed to export to PNG:', error);
  }
};
