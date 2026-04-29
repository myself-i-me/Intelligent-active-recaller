import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';
import { ExplanationPanel } from '../components/ExplanationPanel';
import { Markdown } from '../components/Markdown';
import { QuestionBody } from '../components/QuestionBody';
import { QuestionImage } from '../components/QuestionImage';
import { QuestionTable } from '../components/QuestionTable';

type Filter = 'all' | 'wrong' | 'correct' | 'skipped';

export function Review() {
  const { bank, lastResult, startRetryWrong } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>('all');

  const quiz = useMemo(() => {
    if (!lastResult) return null;
    return bank.quizzes.find((q) => q.id === lastResult.quiz.id) ?? null;
  }, [bank, lastResult]);

  if (!lastResult) {
    return (
      <div className="rounded border border-slate-200 bg-white px-4 py-6 text-center">
        <p className="text-slate-700">No quiz result to review.</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="rounded border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
        The original quiz isn't in the active bank, so we can't show full questions. Switch back to the bank used for this attempt.
      </div>
    );
  }

  const items = lastResult.questions.filter((r) => {
    if (filter === 'wrong') return r.userAnswer != null && !r.isCorrect;
    if (filter === 'correct') return r.isCorrect;
    if (filter === 'skipped') return r.userAnswer == null;
    return true;
  });

  const wrongIds = lastResult.questions.filter((r) => r.userAnswer != null && !r.isCorrect).map((r) => r.questionId);
  const skippedIds = lastResult.questions.filter((r) => r.userAnswer == null).map((r) => r.questionId);

  function FilterPill({ value, label, count }: { value: Filter; label: string; count: number }) {
    const active = filter === value;
    return (
      <button
        type="button"
        onClick={() => setFilter(value)}
        className={
          'rounded-full px-3 py-1 text-sm font-medium transition ' +
          (active ? 'bg-slate-900 text-white' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50')
        }
      >
        {label} <span className="opacity-70">({count})</span>
      </button>
    );
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Review · {quiz.title}</h1>
          <div className="text-sm text-slate-600">
            {lastResult.score.correct}/{lastResult.score.total} correct ·{' '}
            {lastResult.score.percentage}%
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              startRetryWrong({ quiz, wrongIds: [...wrongIds, ...skippedIds] });
              navigate('/quiz');
            }}
            disabled={wrongIds.length + skippedIds.length === 0}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
          >
            Retry wrong & skipped
          </button>
          <button
            type="button"
            onClick={() => navigate('/results')}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Back to results
          </button>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        <FilterPill value="all" label="All" count={lastResult.questions.length} />
        <FilterPill value="wrong" label="Wrong" count={wrongIds.length} />
        <FilterPill value="correct" label="Correct" count={lastResult.score.correct} />
        <FilterPill value="skipped" label="Skipped" count={skippedIds.length} />
      </div>

      <ol className="space-y-4">
        {items.map((r, idx) => {
          const q = quiz.questions.find((qq) => qq.id === r.questionId);
          if (!q) return null;
          const tone = r.userAnswer == null ? 'gray' : r.isCorrect ? 'green' : 'red';
          const toneCls =
            tone === 'green'
              ? 'border-emerald-200'
              : tone === 'red'
                ? 'border-rose-200'
                : 'border-slate-200';

          return (
            <li key={r.questionId} className={`rounded-xl border bg-white p-5 shadow-sm ${toneCls}`}>
              <div className="mb-2 flex items-baseline justify-between">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Q{idx + 1} · {q.type.replace('-', ' ')}
                </div>
                <div className="text-xs text-slate-500">
                  {r.userAnswer == null
                    ? 'Skipped'
                    : r.isCorrect
                      ? `Correct (${r.userAnswer})`
                      : `Wrong — picked ${r.userAnswer}, correct ${r.correctAnswer}`}
                </div>
              </div>
              <div className="text-base font-medium text-slate-900">
                <Markdown>{q.stem}</Markdown>
              </div>
              {q.image && <QuestionImage src={q.image} alt={q.imageAlt} />}
              {q.table && <QuestionTable table={q.table} />}
              <QuestionBody question={q} />
              <ul className="mt-3 space-y-1.5 text-sm">
                {q.options.map((o) => {
                  const isCorrect = o.id === q.answer;
                  const isPicked = o.id === r.userAnswer;
                  const cls = isCorrect
                    ? 'border-emerald-300 bg-emerald-50'
                    : isPicked
                      ? 'border-rose-300 bg-rose-50'
                      : 'border-slate-200 bg-white';
                  return (
                    <li key={o.id} className={`flex items-start gap-2 rounded border px-3 py-2 ${cls}`}>
                      <span className="font-semibold">{o.id}.</span>
                      <span className="flex-1">
                        <Markdown>{o.text}</Markdown>
                      </span>
                      {isCorrect && <span className="text-xs font-semibold text-emerald-700">Correct</span>}
                      {isPicked && !isCorrect && <span className="text-xs font-semibold text-rose-700">Your pick</span>}
                    </li>
                  );
                })}
              </ul>
              <ExplanationPanel question={q} userAnswer={r.userAnswer} />
            </li>
          );
        })}
      </ol>
    </div>
  );
}
