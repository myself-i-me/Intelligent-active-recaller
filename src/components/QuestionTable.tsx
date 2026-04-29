import type { QuestionTable as QuestionTableT } from '../lib/types';
import { Markdown } from './Markdown';

export function QuestionTable({ table }: { table: QuestionTableT }) {
  return (
    <div className="overflow-x-auto my-3">
      <table className="border-collapse text-sm w-full">
        <thead>
          <tr>
            {table.headers.map((h, i) => (
              <th
                key={i}
                className="border border-slate-300 bg-slate-100 px-3 py-1.5 text-left font-semibold align-bottom"
              >
                <Markdown className="prose-sm">{h}</Markdown>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
              {row.map((cell, ci) => (
                <td key={ci} className="border border-slate-300 px-3 py-1.5 align-top">
                  <Markdown>{cell}</Markdown>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
