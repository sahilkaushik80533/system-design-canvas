import { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  BrainCircuit,
  X,
  Loader2,
  Sparkles,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface AIEvaluation {
  score: number;
  strengths: string[];
  bottlenecks: string[];
  suggestions: string[];
}

interface AIEvaluationPanelProps {
  isLoading: boolean;
  evaluation: AIEvaluation | null;
  onClose?: () => void;
}

// ─── Mock data for testing layout ───────────────────────────────────────────

const MOCK_EVALUATION: AIEvaluation = {
  score: 78,
  strengths: [
    'Proper separation of concerns between API gateway and microservices',
    'Redis cache layer significantly reduces database load',
    'Message queue enables asynchronous processing of heavy tasks',
    'CDN placement optimizes static asset delivery latency',
  ],
  bottlenecks: [
    'Single database instance creates a single point of failure',
    'No rate limiting configured on the API gateway',
    'Missing health check endpoints for service discovery',
  ],
  suggestions: [
    'Add a read replica or implement database sharding for horizontal scalability',
    'Introduce circuit breakers between microservices to prevent cascading failures',
    'Consider adding an event-driven architecture pattern for real-time updates',
    'Implement distributed tracing (e.g., OpenTelemetry) for observability',
  ],
};

// ─── Score Helpers ──────────────────────────────────────────────────────────

function getScoreColor(score: number) {
  if (score >= 80) return { ring: 'stroke-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Excellent' };
  if (score >= 50) return { ring: 'stroke-amber-500', text: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Needs Work' };
  return { ring: 'stroke-red-500', text: 'text-red-400', bg: 'bg-red-500/10', label: 'Critical' };
}

function ScoreRing({ score }: { score: number }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const colors = getScoreColor(score);

  return (
    <div className="relative flex items-center justify-center">
      <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
        {/* Background ring */}
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-gray-800"
        />
        {/* Score ring */}
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${colors.ring} transition-all duration-1000 ease-out`}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-2xl font-bold ${colors.text}`}>{score}</span>
        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">/ 100</span>
      </div>
    </div>
  );
}

// ─── Skeleton Loader ────────────────────────────────────────────────────────

function SkeletonLoader() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Score skeleton */}
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="w-[100px] h-[100px] rounded-full bg-gray-800" />
        <div className="h-4 w-24 rounded bg-gray-800" />
      </div>

      {/* Section skeletons */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-3 w-28 rounded bg-gray-800" />
          <div className="space-y-1.5">
            <div className="h-10 rounded-lg bg-gray-800/60" />
            <div className="h-10 rounded-lg bg-gray-800/60" />
            <div className="h-10 rounded-lg bg-gray-800/40 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Section Component ──────────────────────────────────────────────────────

interface SectionProps {
  title: string;
  items: string[];
  icon: React.ReactNode;
  titleColor: string;
  itemBg: string;
  itemBorder: string;
  iconSlot: React.ReactNode;
}

function Section({ title, items, icon, titleColor, itemBg, itemBorder, iconSlot }: SectionProps) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-2.5">
      <h3 className={`text-xs uppercase tracking-wider font-semibold ${titleColor} flex items-center gap-2`}>
        {icon}
        {title}
        <span className="ml-auto text-[10px] bg-gray-800 px-1.5 py-0.5 rounded-full text-gray-400 font-normal">
          {items.length}
        </span>
      </h3>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li
            key={i}
            className={`text-sm text-gray-200 ${itemBg} ${itemBorder} p-2.5 rounded-lg flex items-start gap-2.5 leading-relaxed transition-colors hover:brightness-110`}
          >
            <span className="mt-0.5 shrink-0">{iconSlot}</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function AIEvaluationPanel({ isLoading, evaluation, onClose }: AIEvaluationPanelProps) {
  const showContent = !isLoading && evaluation;
  const scoreColors = evaluation ? getScoreColor(evaluation.score) : null;

  return (
    <div className="bg-[#1a1b2e]/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl w-[380px] max-h-[85vh] flex flex-col overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700/50">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-violet-400" />
          AI Evaluation
          {isLoading && (
            <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
          )}
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700/50"
            aria-label="Close evaluation panel"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6 custom-scrollbar">
        {/* Loading state */}
        {isLoading && <SkeletonLoader />}

        {/* Empty state */}
        {!isLoading && !evaluation && (
          <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-300">No evaluation yet</p>
              <p className="text-xs text-gray-500 mt-1 max-w-[240px]">
                Run evaluation to analyze your architecture for strengths, bottlenecks, and improvement suggestions.
              </p>
            </div>
          </div>
        )}

        {/* Results */}
        {showContent && (
          <>
            {/* Score Ring */}
            <div className="flex flex-col items-center gap-2 py-2">
              <ScoreRing score={evaluation.score} />
              <span className={`text-xs font-semibold uppercase tracking-widest ${scoreColors!.text} ${scoreColors!.bg} px-3 py-1 rounded-full`}>
                {scoreColors!.label}
              </span>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-700/50" />

            {/* Strengths */}
            <Section
              title="Strengths"
              items={evaluation.strengths}
              icon={<CheckCircle2 className="w-3.5 h-3.5" />}
              titleColor="text-emerald-400"
              itemBg="bg-emerald-500/5"
              itemBorder="border border-emerald-500/10"
              iconSlot={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            />

            {/* Bottlenecks */}
            <Section
              title="Bottlenecks"
              items={evaluation.bottlenecks}
              icon={<AlertTriangle className="w-3.5 h-3.5" />}
              titleColor="text-red-400"
              itemBg="bg-red-500/5"
              itemBorder="border border-red-500/10"
              iconSlot={<AlertTriangle className="w-4 h-4 text-red-500" />}
            />

            {/* Suggestions */}
            <Section
              title="Suggestions"
              items={evaluation.suggestions}
              icon={<Lightbulb className="w-3.5 h-3.5" />}
              titleColor="text-blue-400"
              itemBg="bg-blue-500/5"
              itemBorder="border border-blue-500/10"
              iconSlot={<Lightbulb className="w-4 h-4 text-blue-400" />}
            />
          </>
        )}
      </div>
    </div>
  );
}

// ─── Standalone Test Wrapper ────────────────────────────────────────────────
// Mount this temporarily to verify the layout. Remove before production.

export function AIEvaluationPanelTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<AIEvaluation | null>(null);

  const handleTest = () => {
    setIsLoading(true);
    setEvaluation(null);
    setTimeout(() => {
      setEvaluation(MOCK_EVALUATION);
      setIsLoading(false);
    }, 2000);
  };

  const handleClear = () => {
    setEvaluation(null);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col gap-3 items-end">
      <div className="flex gap-2">
        <button
          onClick={handleTest}
          disabled={isLoading}
          className="px-4 py-1.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-lg shadow-violet-900/30"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Test Evaluation
        </button>
        <button
          onClick={handleClear}
          className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-lg transition-colors border border-gray-700"
        >
          Clear
        </button>
      </div>
      <AIEvaluationPanel
        isLoading={isLoading}
        evaluation={evaluation}
        onClose={handleClear}
      />
    </div>
  );
}
