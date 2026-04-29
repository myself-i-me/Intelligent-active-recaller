// Types mirror the JSON schema in sample-quiz-bank.json (schemaVersion 1.0).

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface QuestionMetadata {
  subject?: string;
  topic?: string;
  subtopic?: string;
  concepts?: string[];
  difficulty?: Difficulty;
  source?: string;
  tags?: string[];
}

export interface QuizMetadata {
  subject?: string;
  topic?: string;
  subtopics?: string[];
  difficulty?: Difficulty;
  tags?: string[];
}

export interface BankMetadata {
  exam?: string;
  createdAt?: string;
  tags?: string[];
}

export interface OptionItem {
  id: string;
  text: string;
}

export interface ListItem {
  id: string | number;
  text: string;
}

export interface QuestionTable {
  headers: string[];
  rows: string[][];
}

export interface ExplanationCommon {
  summary: string;
}

export interface ExplanationPerOption extends ExplanationCommon {
  perOption?: Record<string, string>;
}

export interface ExplanationPerStatement extends ExplanationCommon {
  perStatement?: Record<string, string>;
}

export interface ExplanationPerMatch extends ExplanationCommon {
  perMatch?: Record<string, string>;
}

export interface ExplanationPerEvent extends ExplanationCommon {
  perEvent?: Record<string, string>;
}

export interface ExplanationPerPair extends ExplanationCommon {
  perPair?: Record<string, string>;
}

export interface BaseQuestion {
  id: string;
  stem: string;
  image?: string;
  imageAlt?: string;
  table?: QuestionTable;
  metadata?: QuestionMetadata;
}

export interface SingleCorrectQuestion extends BaseQuestion {
  type: 'single-correct';
  options: OptionItem[];
  answer: string;
  explanation: ExplanationPerOption;
}

export interface MultiStatementQuestion extends BaseQuestion {
  type: 'multi-statement';
  statements: ListItem[];
  question: string;
  options: OptionItem[];
  answer: string;
  correctStatements: number[];
  explanation: ExplanationPerStatement;
}

export interface MatchTheFollowingQuestion extends BaseQuestion {
  type: 'match-the-following';
  leftList: { title: string; items: ListItem[] };
  rightList: { title: string; items: ListItem[] };
  options: OptionItem[];
  answer: string;
  correctMatches: Record<string, number>;
  explanation: ExplanationPerMatch;
}

export interface AssertionReasonQuestion extends BaseQuestion {
  type: 'assertion-reason';
  assertion: string;
  reason: string;
  options: OptionItem[];
  answer: string;
  explanation: ExplanationPerOption;
}

export interface ChronologicalQuestion extends BaseQuestion {
  type: 'chronological';
  events: ListItem[];
  options: OptionItem[];
  answer: string;
  correctOrder: number[];
  explanation: ExplanationPerEvent;
}

export interface StatementsCountQuestion extends BaseQuestion {
  type: 'statements-count';
  statements: ListItem[];
  question: string;
  options: OptionItem[];
  answer: string;
  correctStatements: number[];
  explanation: ExplanationPerStatement;
}

export interface PairsCountQuestion extends BaseQuestion {
  type: 'pairs-count';
  pairs: { id: number; left: string; right: string }[];
  question: string;
  options: OptionItem[];
  answer: string;
  correctPairs: number[];
  explanation: ExplanationPerPair;
}

export type Question =
  | SingleCorrectQuestion
  | MultiStatementQuestion
  | MatchTheFollowingQuestion
  | AssertionReasonQuestion
  | ChronologicalQuestion
  | StatementsCountQuestion
  | PairsCountQuestion;

export type QuestionType = Question['type'];

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  metadata?: QuizMetadata;
  questions: Question[];
}

export interface QuizBank {
  schemaVersion: string;
  type: 'quiz-bank';
  bank: {
    id: string;
    title: string;
    description?: string;
    metadata?: BankMetadata;
  };
  quizzes: Quiz[];
}

// ----- Runtime quiz session -----

export interface QuizAttempt {
  questionId: string;
  userAnswer: string | null;
  submitted: boolean;
  isCorrect: boolean | null;
}

export interface QuizSession {
  bankId: string;
  quizId: string;
  startedAt: string;
  // Order of question IDs after optional shuffling.
  questionOrder: string[];
  // Per-question shuffled option order; key = question ID.
  optionOrders: Record<string, string[]>;
  attempts: Record<string, QuizAttempt>;
  currentIndex: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
}

// ----- Quiz result file (downloaded after completion) -----

export interface ResultQuestion {
  questionId: string;
  type: QuestionType;
  stem: string;
  userAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  metadata?: QuestionMetadata;
}

export interface QuizResult {
  schemaVersion: string;
  type: 'quiz-result';
  completedAt: string;
  bank: { id: string; title: string };
  quiz: { id: string; title: string; metadata?: QuizMetadata };
  score: {
    correct: number;
    incorrect: number;
    skipped: number;
    total: number;
    percentage: number;
  };
  questions: ResultQuestion[];
}
