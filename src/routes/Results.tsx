import { useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';
import { downloadResult } from '../lib/results';

function StatCard({ label, value, tone }: { label: string; value: number | string; tone?: 'green' | 'red' | 'gray' }) {
  const colors =
    tone === 'green'
      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
      : tone === 'red'
        ? 'bg-rose-50 text-rose-800 border-rose-200'
        : 'bg-slate-50 text-slate-800 border-slate-200';
  return (
    <div className={`rounded-lg border px-4 py-3 ${colors}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs uppercase tracking-wide opacity-80">{label}</div>
    </div>
  );
}

export function Results() {
  const { lastResult } = useApp();
  const navigate = useNavigate();

  if (!lastResult) {
    return (
      <div className="rounded border border-slate-200 bg-white px-4 py-6 text-center">
        <p className="text-slate-700">No quiz result available yet.</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
        >
          Go to home
        </button>
      </div>
    );
  }

  const { score, quiz, completedAt } = lastResult;

  return (
    <div className="space-y-5">
      <header>
        <div className="text-sm text-slate-500">Quiz complete</div>
        <h1 className="text-2xl font-bold text-slate-900">{quiz.title}</h1>
        <div className="text-sm text-slate-600">{new Date(completedAt).toLocaleString()}</div>
      </header>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500">Your score</div>
            <div className="mt-1 text-4xl font-bold text-slate-900">{score.percentage}%</div>
            <div className="text-sm text-slate-600">
              {score.correct} of {score.total} correct
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <StatCard label="Correct" value={score.correct} tone="green" />
            <StatCard label="Incorrect" value={score.incorrect} tone="red" />
            <StatCard label="Skipped" value={score.skipped} tone="gray" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => navigate('/review')}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
        >
          Review questions & answers
        </button>
        <button
          type="button"
          onClick={() => downloadResult(lastResult)}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Download result file (.json)
        </button>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back to home
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
        Save the result file. Upload it (along with future result files) on the
        <strong> Analytics </strong>
        page to see weak areas, trends, and topic-level performance over time.
      </div>
    </div>
  );
}
