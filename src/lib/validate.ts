import type { QuizBank } from './types';

export function validateBank(input: unknown): { ok: true; bank: QuizBank } | { ok: false; error: string } {
  if (!input || typeof input !== 'object') return { ok: false, error: 'File is not a JSON object.' };
  const obj = input as Record<string, unknown>;
  if (obj.type !== 'quiz-bank') return { ok: false, error: 'Top-level "type" must be "quiz-bank".' };
  if (!obj.bank || typeof obj.bank !== 'object') return { ok: false, error: 'Missing "bank" object.' };
  if (!Array.isArray(obj.quizzes) || obj.quizzes.length === 0) {
    return { ok: false, error: 'Field "quizzes" must be a non-empty array.' };
  }
  // Light shape check on quizzes/questions; full structural validation is the author's job.
  for (const [qi, qz] of (obj.quizzes as unknown[]).entries()) {
    const quiz = qz as Record<string, unknown>;
    if (!quiz?.id || !quiz?.title) return { ok: false, error: `Quiz ${qi} missing "id" or "title".` };
    if (!Array.isArray(quiz.questions) || quiz.questions.length === 0) {
      return { ok: false, error: `Quiz "${quiz.title ?? qi}" has no questions.` };
    }
    for (const [qqi, q] of (quiz.questions as unknown[]).entries()) {
      const question = q as Record<string, unknown>;
      if (!question?.id || !question?.type || !question?.stem || !question?.answer) {
        return { ok: false, error: `Question ${qqi} in quiz "${quiz.title}" missing required field (id/type/stem/answer).` };
      }
      if (!Array.isArray(question.options) || question.options.length === 0) {
        return { ok: false, error: `Question ${question.id} has no options.` };
      }
    }
  }
  return { ok: true, bank: input as QuizBank };
}

export function validateResult(input: unknown): { ok: true } | { ok: false; error: string } {
  if (!input || typeof input !== 'object') return { ok: false, error: 'Not a JSON object.' };
  const obj = input as Record<string, unknown>;
  if (obj.type !== 'quiz-result') return { ok: false, error: 'Top-level "type" must be "quiz-result".' };
  if (!obj.score || !Array.isArray(obj.questions)) return { ok: false, error: 'Missing "score" or "questions".' };
  return { ok: true };
}
