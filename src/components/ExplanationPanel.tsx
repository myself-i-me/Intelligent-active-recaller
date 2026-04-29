import type { Question } from '../lib/types';
import { Markdown } from './Markdown';

interface Props {
  question: Question;
  userAnswer: string | null;
}

function row(label: string, body: string, highlight?: 'correct' | 'incorrect') {
  const tone =
    highlight === 'correct'
      ? 'bg-emerald-50 border-emerald-200'
      : highlight === 'incorrect'
        ? 'bg-rose-50 border-rose-200'
        : 'bg-white border-slate-200';
  return (
    <div className={`rounded border p-3 ${tone}`}>
      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <Markdown>{body}</Markdown>
    </div>
  );
}

export function ExplanationPanel({ question, userAnswer }: Props) {
  const correctAnswer = question.answer;
  const isCorrect = userAnswer === correctAnswer;

  return (
    <div className="mt-4 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <div className={`text-sm font-semibold ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
          {userAnswer == null ? 'Skipped' : isCorrect ? 'Correct' : 'Incorrect'}
        </div>
        <div className="text-sm text-slate-600">
          Correct answer: <span className="font-semibold text-slate-900">{correctAnswer}</span>
          {userAnswer && userAnswer !== correctAnswer && (
            <>
              {' · '}Your answer: <span className="font-semibold text-slate-900">{userAnswer}</span>
            </>
          )}
        </div>
      </div>

      <div className="rounded border border-slate-200 bg-white p-3">
        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Explanation</div>
        <Markdown>{question.explanation.summary}</Markdown>
      </div>

      {/* Type-specific breakdowns */}
      {(question.type === 'single-correct' || question.type === 'assertion-reason') &&
        question.explanation.perOption && (
          <div className="space-y-2">
            {question.options.map((o) => (
              <div key={o.id}>
                {row(
                  `Option ${o.id} — ${o.text}`,
                  question.explanation.perOption?.[o.id] ?? '',
                  o.id === correctAnswer ? 'correct' : userAnswer === o.id ? 'incorrect' : undefined,
                )}
              </div>
            ))}
          </div>
        )}

      {(question.type === 'multi-statement' || question.type === 'statements-count') &&
        question.explanation.perStatement && (
          <div className="space-y-2">
            {question.statements.map((s) => {
              const isStmtCorrect = question.correctStatements.includes(Number(s.id));
              return (
                <div key={s.id}>
                  {row(
                    `Statement ${s.id} — ${isStmtCorrect ? 'Correct' : 'Incorrect'}`,
                    question.explanation.perStatement?.[String(s.id)] ?? '',
                    isStmtCorrect ? 'correct' : 'incorrect',
                  )}
                </div>
              );
            })}
          </div>
        )}

      {question.type === 'match-the-following' && question.explanation.perMatch && (
        <div className="space-y-2">
          {question.leftList.items.map((item) => {
            const correctMatch = question.correctMatches[String(item.id)];
            const rightItem = question.rightList.items.find((r) => Number(r.id) === Number(correctMatch));
            return (
              <div key={item.id}>
                {row(
                  `${item.id} → ${correctMatch} — ${rightItem?.text ?? ''}`,
                  question.explanation.perMatch?.[String(item.id)] ?? '',
                  'correct',
                )}
              </div>
            );
          })}
        </div>
      )}

      {question.type === 'chronological' && question.explanation.perEvent && (
        <div className="space-y-2">
          <div className="text-sm text-slate-700">
            <span className="font-semibold">Correct order:</span> {question.correctOrder.join(' → ')}
          </div>
          {question.events.map((e) => (
            <div key={e.id}>
              {row(
                `Event ${e.id} — ${e.text}`,
                question.explanation.perEvent?.[String(e.id)] ?? '',
              )}
            </div>
          ))}
        </div>
      )}

      {question.type === 'pairs-count' && question.explanation.perPair && (
        <div className="space-y-2">
          {question.pairs.map((p) => {
            const isPairCorrect = question.correctPairs.includes(p.id);
            return (
              <div key={p.id}>
                {row(
                  `Pair ${p.id} (${p.left} — ${p.right}) — ${isPairCorrect ? 'Correctly matched' : 'Incorrectly matched'}`,
                  question.explanation.perPair?.[String(p.id)] ?? '',
                  isPairCorrect ? 'correct' : 'incorrect',
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
