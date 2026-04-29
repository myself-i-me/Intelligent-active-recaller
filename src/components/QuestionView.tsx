import { useState } from 'react';
import type { Question } from '../lib/types';
import { ExplanationPanel } from './ExplanationPanel';
import { Markdown } from './Markdown';
import { QuestionBody } from './QuestionBody';
import { QuestionImage } from './QuestionImage';
import { QuestionTable } from './QuestionTable';

interface Props {
  question: Question;
  // The order of option ids to display (post-shuffle).
  optionOrder: string[];
  userAnswer: string | null;
  submitted: boolean;
  onSelect: (id: string) => void;
  onSubmit: () => void;
  onSkip: () => void;
  onNext: () => void;
  isLast: boolean;
}

export function QuestionView({
  question,
  optionOrder,
  userAnswer,
  submitted,
  onSelect,
  onSubmit,
  onSkip,
  onNext,
  isLast,
}: Props) {
  const [showExplanation, setShowExplanation] = useState(false);
  const orderedOptions = optionOrder
    .map((id) => question.options.find((o) => o.id === id))
    .filter((o): o is (typeof question.options)[number] => !!o);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-3 text-base font-medium text-slate-900">
        <Markdown>{question.stem}</Markdown>
      </div>

      {question.image && <QuestionImage src={question.image} alt={question.imageAlt} />}
      {question.table && <QuestionTable table={question.table} />}

      <QuestionBody question={question} />

      <ul className="mt-4 space-y-2">
        {orderedOptions.map((opt) => {
          const isSelected = userAnswer === opt.id;
          const isCorrect = submitted && opt.id === question.answer;
          const isWrongPick = submitted && isSelected && opt.id !== question.answer;

          let tone = 'border-slate-200 bg-white hover:bg-slate-50';
          if (submitted) {
            if (isCorrect) tone = 'border-emerald-300 bg-emerald-50';
            else if (isWrongPick) tone = 'border-rose-300 bg-rose-50';
            else tone = 'border-slate-200 bg-white opacity-70';
          } else if (isSelected) {
            tone = 'border-blue-500 bg-blue-50';
          }

          return (
            <li key={opt.id}>
              <button
                type="button"
                onClick={() => !submitted && onSelect(opt.id)}
                disabled={submitted}
                className={`flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left transition ${tone}`}
              >
                <span
                  className={
                    'mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ' +
                    (isSelected ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-300 bg-white text-slate-700')
                  }
                >
                  {opt.id}
                </span>
                <span className="flex-1">
                  <Markdown>{opt.text}</Markdown>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {!submitted && (
          <>
            <button
              type="button"
              onClick={onSubmit}
              disabled={userAnswer == null}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
              Submit answer
            </button>
            <button
              type="button"
              onClick={onSkip}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Skip
            </button>
          </>
        )}

        {submitted && !showExplanation && (
          <button
            type="button"
            onClick={() => setShowExplanation(true)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Check answer
          </button>
        )}
        {submitted && showExplanation && (
          <button
            type="button"
            onClick={() => setShowExplanation(false)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Hide answer
          </button>
        )}

        {submitted && (
          <button
            type="button"
            onClick={() => {
              setShowExplanation(false);
              onNext();
            }}
            className="ml-auto rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
          >
            {isLast ? 'Finish quiz' : 'Next question'}
          </button>
        )}
      </div>

      {submitted && showExplanation && <ExplanationPanel question={question} userAnswer={userAnswer} />}
    </div>
  );
}
