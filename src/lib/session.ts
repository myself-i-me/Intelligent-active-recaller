import type { Quiz, QuizSession } from './types';
import { shuffle } from './shuffle';

interface NewSessionOptions {
  bankId: string;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
}

export function newSession(quiz: Quiz, opts: NewSessionOptions): QuizSession {
  const questionIds = quiz.questions.map((q) => q.id);
  const questionOrder = opts.shuffleQuestions ? shuffle(questionIds) : questionIds;

  const optionOrders: Record<string, string[]> = {};
  for (const q of quiz.questions) {
    const ids = q.options.map((o) => o.id);
    optionOrders[q.id] = opts.shuffleOptions ? shuffle(ids) : ids;
  }

  return {
    bankId: opts.bankId,
    quizId: quiz.id,
    startedAt: new Date().toISOString(),
    questionOrder,
    optionOrders,
    attempts: Object.fromEntries(
      questionIds.map((id) => [id, { questionId: id, userAnswer: null, submitted: false, isCorrect: null }]),
    ),
    currentIndex: 0,
    shuffleQuestions: opts.shuffleQuestions,
    shuffleOptions: opts.shuffleOptions,
  };
}
