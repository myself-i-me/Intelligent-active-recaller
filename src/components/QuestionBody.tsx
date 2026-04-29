import type { Question } from '../lib/types';
import { Markdown } from './Markdown';

// Renders the type-specific body that sits between the stem and the options:
// statements, list pairs, assertion/reason, events, pairs, etc.
export function QuestionBody({ question }: { question: Question }) {
  switch (question.type) {
    case 'single-correct':
      return null;

    case 'multi-statement':
    case 'statements-count':
      return (
        <ol className="my-3 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
          {question.statements.map((s) => (
            <li key={s.id} className="flex gap-2">
              <span className="font-semibold text-slate-700">{s.id}.</span>
              <Markdown>{s.text}</Markdown>
            </li>
          ))}
          {'question' in question && question.question && (
            <li className="!mt-3 list-none border-t border-slate-200 pt-3 font-medium text-slate-800">
              <Markdown>{question.question}</Markdown>
            </li>
          )}
        </ol>
      );

    case 'match-the-following':
      return (
        <div className="my-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[question.leftList, question.rightList].map((list, idx) => (
            <div key={idx} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="mb-2 text-sm font-semibold text-slate-700">{list.title}</div>
              <ul className="space-y-1.5">
                {list.items.map((item) => (
                  <li key={item.id} className="flex gap-2">
                    <span className="font-semibold text-slate-700">{item.id}.</span>
                    <Markdown>{item.text}</Markdown>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );

    case 'assertion-reason':
      return (
        <div className="my-3 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Assertion (A)</div>
            <Markdown>{question.assertion}</Markdown>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reason (R)</div>
            <Markdown>{question.reason}</Markdown>
          </div>
        </div>
      );

    case 'chronological':
      return (
        <ol className="my-3 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
          {question.events.map((e) => (
            <li key={e.id} className="flex gap-2">
              <span className="font-semibold text-slate-700">{e.id}.</span>
              <Markdown>{e.text}</Markdown>
            </li>
          ))}
        </ol>
      );

    case 'pairs-count':
      return (
        <div className="my-3 overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-2">
          <table className="w-full text-sm">
            <tbody>
              {question.pairs.map((p) => (
                <tr key={p.id} className="border-b border-slate-200 last:border-0">
                  <td className="py-1.5 pr-3 font-semibold text-slate-700">{p.id}.</td>
                  <td className="py-1.5 pr-3"><Markdown>{p.left}</Markdown></td>
                  <td className="py-1.5 pr-3 text-slate-400">—</td>
                  <td className="py-1.5"><Markdown>{p.right}</Markdown></td>
                </tr>
              ))}
            </tbody>
          </table>
          {question.question && (
            <div className="mt-2 border-t border-slate-200 pt-2 font-medium text-slate-800">
              <Markdown>{question.question}</Markdown>
            </div>
          )}
        </div>
      );
  }
}
