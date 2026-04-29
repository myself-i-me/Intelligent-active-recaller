import type { QuizResult } from './types';

export interface DimensionStat {
  key: string;
  total: number;
  correct: number;
  incorrect: number;
  skipped: number;
  accuracy: number; // 0..1, computed over total (skipped counted as wrong for accuracy)
}

export interface OverallStats {
  totalQuizzes: number;
  totalQuestions: number;
  totalCorrect: number;
  totalIncorrect: number;
  totalSkipped: number;
  averagePercentage: number;
  bySubject: DimensionStat[];
  byTopic: DimensionStat[];
  bySubtopic: DimensionStat[];
  byConcept: DimensionStat[];
  byDifficulty: DimensionStat[];
  byTag: DimensionStat[];
  trend: { completedAt: string; quizTitle: string; percentage: number }[];
}

function bumpStat(map: Map<string, DimensionStat>, key: string, isCorrect: boolean, isSkipped: boolean) {
  let s = map.get(key);
  if (!s) {
    s = { key, total: 0, correct: 0, incorrect: 0, skipped: 0, accuracy: 0 };
    map.set(key, s);
  }
  s.total += 1;
  if (isSkipped) s.skipped += 1;
  else if (isCorrect) s.correct += 1;
  else s.incorrect += 1;
}

function finalize(map: Map<string, DimensionStat>): DimensionStat[] {
  for (const s of map.values()) {
    s.accuracy = s.total === 0 ? 0 : s.correct / s.total;
  }
  return [...map.values()].sort((a, b) => a.accuracy - b.accuracy || b.total - a.total);
}

export function aggregateResults(results: QuizResult[]): OverallStats {
  const subject = new Map<string, DimensionStat>();
  const topic = new Map<string, DimensionStat>();
  const subtopic = new Map<string, DimensionStat>();
  const concept = new Map<string, DimensionStat>();
  const difficulty = new Map<string, DimensionStat>();
  const tag = new Map<string, DimensionStat>();

  let totalQuestions = 0;
  let totalCorrect = 0;
  let totalIncorrect = 0;
  let totalSkipped = 0;
  let percentSum = 0;

  const trend: OverallStats['trend'] = [];

  for (const r of results) {
    percentSum += r.score.percentage;
    trend.push({ completedAt: r.completedAt, quizTitle: r.quiz.title, percentage: r.score.percentage });

    for (const q of r.questions) {
      totalQuestions += 1;
      const isSkipped = q.userAnswer == null;
      if (isSkipped) totalSkipped += 1;
      else if (q.isCorrect) totalCorrect += 1;
      else totalIncorrect += 1;

      const m = q.metadata ?? {};
      if (m.subject) bumpStat(subject, m.subject, q.isCorrect, isSkipped);
      if (m.topic) bumpStat(topic, m.topic, q.isCorrect, isSkipped);
      if (m.subtopic) bumpStat(subtopic, m.subtopic, q.isCorrect, isSkipped);
      if (m.concepts) for (const c of m.concepts) bumpStat(concept, c, q.isCorrect, isSkipped);
      if (m.difficulty) bumpStat(difficulty, m.difficulty, q.isCorrect, isSkipped);
      if (m.tags) for (const t of m.tags) bumpStat(tag, t, q.isCorrect, isSkipped);
    }
  }

  trend.sort((a, b) => a.completedAt.localeCompare(b.completedAt));

  return {
    totalQuizzes: results.length,
    totalQuestions,
    totalCorrect,
    totalIncorrect,
    totalSkipped,
    averagePercentage: results.length === 0 ? 0 : Math.round(percentSum / results.length),
    bySubject: finalize(subject),
    byTopic: finalize(topic),
    bySubtopic: finalize(subtopic),
    byConcept: finalize(concept),
    byDifficulty: finalize(difficulty),
    byTag: finalize(tag),
    trend,
  };
}
