import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileUpload, readJsonFile } from '../components/FileUpload';
import { useApp } from '../AppContext';
import { validateBank } from '../lib/validate';
import type { Quiz, QuizBank } from '../lib/types';

export function Home() {
  const { bank, addCustomBank, customBanks, removeCustomBank, startQuiz } = useApp();
  const [error, setError] = useState<string | null>(null);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleOptions, setShuffleOptions] = useState(true);
  const navigate = useNavigate();

  async function onUpload(files: File[]) {
    setError(null);
    try {
      const parsed = await readJsonFile<unknown>(files[0]);
      const result = validateBank(parsed);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      addCustomBank(result.bank);
    } catch (e) {
      setError(`Could not parse JSON: ${(e as Error).message}`);
    }
  }

  function pickBank(b: QuizBank) {
    addCustomBank(b); // also makes it active
  }

  function start(quiz: Quiz) {
    startQuiz(quiz, { shuffleQuestions, shuffleOptions });
    navigate('/quiz');
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold text-slate-900">Quiz banks</h1>
        <p className="mt-1 text-sm text-slate-600">
          Upload a JSON quiz bank to practice. The format is documented in the project README.
        </p>
      </section>

      <section className="space-y-3">
        <FileUpload
          label="Drag & drop a quiz bank JSON, or click to browse"
          hint="Single .json file conforming to schemaVersion 1.0"
          onFiles={onUpload}
        />
        {error && (
          <div className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>
        )}
        <div className="text-xs text-slate-500">
          Need a starting point?{' '}
          <a
            href={`${import.meta.env.BASE_URL}sample-quiz-bank.json`}
            download
            className="text-blue-600 underline"
          >
            Download the sample template
          </a>{' '}
          and have Claude fill it with your own questions.
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-900">Active bank</div>
            <div className="text-base font-medium text-slate-800">{bank.bank.title}</div>
            {bank.bank.description && <div className="text-sm text-slate-600">{bank.bank.description}</div>}
          </div>
          <div className="text-xs text-slate-500">{bank.quizzes.length} quizzes</div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={shuffleQuestions}
              onChange={(e) => setShuffleQuestions(e.target.checked)}
              className="h-4 w-4"
            />
            Shuffle questions
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={shuffleOptions}
              onChange={(e) => setShuffleOptions(e.target.checked)}
              className="h-4 w-4"
            />
            Shuffle options
          </label>
        </div>

        <ul className="mt-4 space-y-2">
          {bank.quizzes.map((q) => (
            <li
              key={q.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <div>
                <div className="font-medium text-slate-900">{q.title}</div>
                {q.description && <div className="text-sm text-slate-600">{q.description}</div>}
                <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                  <span>{q.questions.length} questions</span>
                  {q.metadata?.subject && <span>· {q.metadata.subject}</span>}
                  {q.metadata?.difficulty && <span>· {q.metadata.difficulty}</span>}
                </div>
              </div>
              <button
                type="button"
                onClick={() => start(q)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
              >
                Start
              </button>
            </li>
          ))}
        </ul>
      </section>

      {customBanks.length > 1 && (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 text-sm font-semibold text-slate-900">Other uploaded banks</div>
          <ul className="space-y-2">
            {customBanks
              .filter((b) => b.bank.id !== bank.bank.id)
              .map((b) => (
                <li
                  key={b.bank.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm"
                >
                  <div>
                    <div className="font-medium text-slate-900">{b.bank.title}</div>
                    <div className="text-xs text-slate-500">{b.quizzes.length} quizzes</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => pickBank(b)}
                      className="rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium hover:bg-slate-100"
                    >
                      Use
                    </button>
                    <button
                      type="button"
                      onClick={() => removeCustomBank(b.bank.id)}
                      className="rounded border border-rose-200 bg-white px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
          </ul>
        </section>
      )}
    </div>
  );
}
