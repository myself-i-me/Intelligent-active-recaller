import { useMemo, useState } from 'react';
import { FileUpload, readJsonFile } from '../components/FileUpload';
import type { QuizResult } from '../lib/types';
import { validateResult } from '../lib/validate';
import { aggregateResults, type DimensionStat } from '../lib/analytics';

function StatBar({ stat, max }: { stat: DimensionStat; max: number }) {
  const accuracyPct = Math.round(stat.accuracy * 100);
  const widthPct = max === 0 ? 0 : Math.max(6, Math.round((stat.total / max) * 100));
  const tone =
    accuracyPct >= 75
      ? 'bg-emerald-500'
      : accuracyPct >= 50
        ? 'bg-amber-500'
        : 'bg-rose-500';
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between text-sm">
        <div className="font-medium text-slate-800">{stat.key}</div>
        <div className="tabular-nums text-slate-600">
          {stat.correct}/{stat.total} · <span className="font-semibold">{accuracyPct}%</span>
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full ${tone}`} style={{ width: `${(widthPct * accuracyPct) / 100}%` }} />
      </div>
    </div>
  );
}

function DimensionSection({ title, stats, hint }: { title: string; stats: DimensionStat[]; hint?: string }) {
  if (stats.length === 0) return null;
  const max = Math.max(...stats.map((s) => s.total));
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">{title}</h2>
        {hint && <div className="text-xs text-slate-500">{hint}</div>}
      </div>
      <div className="space-y-3">
        {stats.map((s) => (
          <StatBar key={s.key} stat={s} max={max} />
        ))}
      </div>
    </section>
  );
}

export function Analytics() {
  const [results, setResults] = useState<QuizResult[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  async function onFiles(files: File[]) {
    const errs: string[] = [];
    const parsed: QuizResult[] = [];
    for (const f of files) {
      try {
        const data = await readJsonFile<unknown>(f);
        const v = validateResult(data);
        if (!v.ok) {
          errs.push(`${f.name}: ${v.error}`);
          continue;
        }
        parsed.push(data as QuizResult);
      } catch (e) {
        errs.push(`${f.name}: ${(e as Error).message}`);
      }
    }
    setErrors(errs);
    setResults((prev) => {
      // Dedupe by completedAt + quiz.id
      const seen = new Set(prev.map((r) => r.completedAt + r.quiz.id));
      const merged = [...prev];
      for (const r of parsed) {
        const k = r.completedAt + r.quiz.id;
        if (!seen.has(k)) {
          merged.push(r);
          seen.add(k);
        }
      }
      return merged;
    });
  }

  const stats = useMemo(() => aggregateResults(results), [results]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="mt-1 text-sm text-slate-600">
          Upload one or more quiz result files (downloaded from the Results screen). The app aggregates by
          subject, topic, subtopic, concept, difficulty, and tag — sorted lowest accuracy first so weak areas
          surface immediately.
        </p>
      </header>

      <FileUpload
        label="Drag & drop result files, or click to add"
        hint="Multiple files supported · type must be 'quiz-result'"
        multiple
        onFiles={onFiles}
      />

      {errors.length > 0 && (
        <div className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          <div className="font-semibold">Some files were skipped:</div>
          <ul className="mt-1 list-disc pl-5">
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {results.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          No data yet. After completing quizzes, download the result files and upload them here.
        </div>
      ) : (
        <>
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SummaryStat label="Quizzes" value={stats.totalQuizzes} />
            <SummaryStat label="Questions" value={stats.totalQuestions} />
            <SummaryStat label="Avg score" value={`${stats.averagePercentage}%`} />
            <SummaryStat
              label="Correct"
              value={`${stats.totalCorrect}/${stats.totalQuestions}`}
            />
          </section>

          <DimensionSection
            title="By subject"
            stats={stats.bySubject}
            hint="Lowest accuracy first — focus revision here."
          />
          <DimensionSection title="By topic" stats={stats.byTopic} />
          <DimensionSection title="By subtopic" stats={stats.bySubtopic} />
          <DimensionSection title="By concept" stats={stats.byConcept} />
          <DimensionSection title="By difficulty" stats={stats.byDifficulty} />
          <DimensionSection title="By tag" stats={stats.byTag} />

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-700">Trend</h2>
            <Trend trend={stats.trend} />
          </section>
        </>
      )}
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
    </div>
  );
}

function Trend({ trend }: { trend: { completedAt: string; quizTitle: string; percentage: number }[] }) {
  if (trend.length === 0) return <div className="text-sm text-slate-500">No data.</div>;
  const max = 100;
  const stepW = 100 / Math.max(trend.length, 1);
  return (
    <div>
      <svg viewBox="0 0 100 40" className="h-32 w-full" preserveAspectRatio="none">
        <line x1="0" x2="100" y1="20" y2="20" stroke="#e2e8f0" strokeWidth="0.3" />
        <polyline
          fill="none"
          stroke="#2563eb"
          strokeWidth="0.6"
          points={trend
            .map((t, i) => {
              const x = i * stepW + stepW / 2;
              const y = 40 - (t.percentage / max) * 40;
              return `${x},${y}`;
            })
            .join(' ')}
        />
        {trend.map((t, i) => {
          const x = i * stepW + stepW / 2;
          const y = 40 - (t.percentage / max) * 40;
          return <circle key={i} cx={x} cy={y} r="0.8" fill="#2563eb" />;
        })}
      </svg>
      <div className="mt-2 max-h-40 overflow-y-auto text-xs text-slate-600">
        {trend.map((t, i) => (
          <div key={i} className="flex items-center justify-between border-t border-slate-100 py-1">
            <span className="truncate">{new Date(t.completedAt).toLocaleString()} — {t.quizTitle}</span>
            <span className="ml-3 font-semibold tabular-nums">{t.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
