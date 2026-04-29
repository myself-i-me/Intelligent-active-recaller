import type { Question } from './types';

export function isCorrect(question: Question, userAnswer: string | null): boolean {
  if (userAnswer == null) return false;
  return userAnswer === question.answer;
}
