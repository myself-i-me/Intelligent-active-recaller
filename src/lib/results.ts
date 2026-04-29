import type { Quiz, QuizBank, QuizResult, QuizSession, ResultQuestion } from './types';

export function buildResult(bank: QuizBank, quiz: Quiz, session: QuizSession): QuizResult {
  const byId = new Map(quiz.questions.map((q) => [q.id, q]));
  const questions: ResultQuestion[] = session.questionOrder.map((qid) => {
    const q = byId.get(qid)!;
    const attempt = session.attempts[qid];
    return {
      questionId: q.id,
      type: q.type,
      stem: q.stem,
      userAnswer: attempt?.userAnswer ?? null,
      correctAnswer: q.answer,
      isCorrect: !!attempt?.isCorrect,
      metadata: q.metadata,
    };
  });

  let correct = 0;
  let incorrect = 0;
  let skipped = 0;
  for (const r of questions) {
    if (r.userAnswer == null) skipped++;
    else if (r.isCorrect) correct++;
    else incorrect++;
  }
  const total = questions.length;

  return {
    schemaVersion: '1.0',
    type: 'quiz-result',
    completedAt: new Date().toISOString(),
    bank: { id: bank.bank.id, title: bank.bank.title },
    quiz: { id: quiz.id, title: quiz.title, metadata: quiz.metadata },
    score: {
      correct,
      incorrect,
      skipped,
      total,
      percentage: total === 0 ? 0 : Math.round((correct / total) * 100),
    },
    questions,
  };
}

export function downloadResult(result: QuizResult) {
  const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeTitle = result.quiz.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  const date = result.completedAt.slice(0, 10);
  a.href = url;
  a.download = `result-${safeTitle}-${date}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
