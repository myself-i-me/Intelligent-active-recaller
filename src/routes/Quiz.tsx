import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';
import { QuestionView } from '../components/QuestionView';

export function Quiz() {
  const { bank, session, selectAnswer, submitCurrent, skipCurrent, goToNext, finishQuiz } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) navigate('/', { replace: true });
  }, [session, navigate]);

  if (!session) return null;

  const quiz = bank.quizzes.find((q) => q.id === session.quizId);
  if (!quiz) {
    return <div className="rounded border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">Quiz not found in active bank.</div>;
  }

  const qid = session.questionOrder[session.currentIndex];
  const question = quiz.questions.find((q) => q.id === qid);
  if (!question) return null;

  const attempt = session.attempts[qid];
  const total = session.questionOrder.length;
  const isLast = session.currentIndex === total - 1;
  const answeredCount = Object.values(session.attempts).filter((a) => a.submitted).length;
  const progressPct = Math.round((session.currentIndex / total) * 100);

  function handleNext() {
    if (isLast) {
      finishQuiz();
      navigate('/results', { replace: true });
    } else {
      goToNext();
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-baseline justify-between">
          <h1 className="text-xl font-semibold text-slate-900">{quiz.title}</h1>
          <div className="text-sm text-slate-600">
            Question {session.currentIndex + 1} / {total}
            <span className="ml-3 text-slate-400">{answeredCount} answered</span>
          </div>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-full bg-blue-600 transition-all" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <QuestionView
        key={qid}
        question={question}
        optionOrder={session.optionOrders[qid]}
        userAnswer={attempt.userAnswer}
        submitted={attempt.submitted}
        onSelect={(id) => selectAnswer(qid, id)}
        onSubmit={submitCurrent}
        onSkip={skipCurrent}
        onNext={handleNext}
        isLast={isLast}
      />
    </div>
  );
}
