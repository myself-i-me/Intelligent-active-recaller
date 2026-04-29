import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Quiz, QuizAttempt, QuizBank, QuizResult, QuizSession } from './lib/types';
import { storage } from './lib/storage';
import { newSession } from './lib/session';
import { isCorrect } from './lib/grading';
import { buildResult } from './lib/results';

interface AppContextValue {
  bank: QuizBank;
  customBanks: QuizBank[];
  session: QuizSession | null;
  lastResult: QuizResult | null;

  setBank: (bank: QuizBank) => void;
  addCustomBank: (bank: QuizBank) => void;
  removeCustomBank: (id: string) => void;

  startQuiz: (quiz: Quiz, opts: { shuffleQuestions: boolean; shuffleOptions: boolean }) => void;
  selectAnswer: (questionId: string, answerId: string) => void;
  submitCurrent: () => void;
  skipCurrent: () => void;
  goToNext: () => void;
  finishQuiz: () => QuizResult | null;
  abandonQuiz: () => void;

  startRetryWrong: (resultsToRetry: { quiz: Quiz; wrongIds: string[] }) => void;
}

const Ctx = createContext<AppContextValue | null>(null);

export function AppProvider({ initialBank, children }: { initialBank: QuizBank; children: ReactNode }) {
  const [bank, setBankState] = useState<QuizBank>(() => storage.getActiveBank() ?? initialBank);
  const [customBanks, setCustomBanks] = useState<QuizBank[]>(() => storage.getCustomBanks());
  const [session, setSession] = useState<QuizSession | null>(() => storage.getActiveSession());
  const [lastResult, setLastResult] = useState<QuizResult | null>(() => storage.getLastResult());

  useEffect(() => {
    storage.setActiveBank(bank);
  }, [bank]);

  useEffect(() => {
    if (session) storage.setActiveSession(session);
    else storage.clearActiveSession();
  }, [session]);

  useEffect(() => {
    storage.setCustomBanks(customBanks);
  }, [customBanks]);

  const setBank = useCallback((b: QuizBank) => setBankState(b), []);

  const addCustomBank = useCallback((b: QuizBank) => {
    setCustomBanks((prev) => {
      const without = prev.filter((x) => x.bank.id !== b.bank.id);
      return [b, ...without];
    });
    setBankState(b);
  }, []);

  const removeCustomBank = useCallback((id: string) => {
    setCustomBanks((prev) => prev.filter((x) => x.bank.id !== id));
  }, []);

  const startQuiz = useCallback<AppContextValue['startQuiz']>((quiz, opts) => {
    const s = newSession(quiz, { bankId: bank.bank.id, ...opts });
    setSession(s);
  }, [bank]);

  const startRetryWrong = useCallback<AppContextValue['startRetryWrong']>(({ quiz, wrongIds }) => {
    const filtered: Quiz = { ...quiz, questions: quiz.questions.filter((q) => wrongIds.includes(q.id)) };
    if (filtered.questions.length === 0) return;
    const s = newSession(filtered, { bankId: bank.bank.id, shuffleQuestions: true, shuffleOptions: true });
    setSession(s);
  }, [bank]);

  const selectAnswer = useCallback((questionId: string, answerId: string) => {
    setSession((prev) => {
      if (!prev) return prev;
      const a = prev.attempts[questionId];
      if (a?.submitted) return prev;
      return {
        ...prev,
        attempts: { ...prev.attempts, [questionId]: { ...a, questionId, userAnswer: answerId } },
      };
    });
  }, []);

  const submitCurrent = useCallback(() => {
    setSession((prev) => {
      if (!prev) return prev;
      const qid = prev.questionOrder[prev.currentIndex];
      const quiz = bank.quizzes.find((q) => q.id === prev.quizId);
      const question = quiz?.questions.find((q) => q.id === qid);
      const a = prev.attempts[qid];
      if (!question || !a || a.submitted || a.userAnswer == null) return prev;
      const updated: QuizAttempt = {
        ...a,
        submitted: true,
        isCorrect: isCorrect(question, a.userAnswer),
      };
      return { ...prev, attempts: { ...prev.attempts, [qid]: updated } };
    });
  }, [bank]);

  const skipCurrent = useCallback(() => {
    setSession((prev) => {
      if (!prev) return prev;
      const qid = prev.questionOrder[prev.currentIndex];
      const a = prev.attempts[qid];
      const updated: QuizAttempt = { ...a, questionId: qid, userAnswer: null, submitted: true, isCorrect: false };
      const nextIndex = Math.min(prev.currentIndex + 1, prev.questionOrder.length - 1);
      return {
        ...prev,
        attempts: { ...prev.attempts, [qid]: updated },
        currentIndex: nextIndex,
      };
    });
  }, []);

  const goToNext = useCallback(() => {
    setSession((prev) => {
      if (!prev) return prev;
      const next = prev.currentIndex + 1;
      if (next >= prev.questionOrder.length) return prev;
      return { ...prev, currentIndex: next };
    });
  }, []);

  const finishQuiz = useCallback<AppContextValue['finishQuiz']>(() => {
    if (!session) return null;
    const quiz = bank.quizzes.find((q) => q.id === session.quizId);
    if (!quiz) return null;
    const result = buildResult(bank, quiz, session);
    setLastResult(result);
    storage.setLastResult(result);
    setSession(null);
    return result;
  }, [bank, session]);

  const abandonQuiz = useCallback(() => setSession(null), []);

  const value = useMemo<AppContextValue>(
    () => ({
      bank,
      customBanks,
      session,
      lastResult,
      setBank,
      addCustomBank,
      removeCustomBank,
      startQuiz,
      selectAnswer,
      submitCurrent,
      skipCurrent,
      goToNext,
      finishQuiz,
      abandonQuiz,
      startRetryWrong,
    }),
    [
      bank,
      customBanks,
      session,
      lastResult,
      setBank,
      addCustomBank,
      removeCustomBank,
      startQuiz,
      selectAnswer,
      submitCurrent,
      skipCurrent,
      goToNext,
      finishQuiz,
      abandonQuiz,
      startRetryWrong,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used inside <AppProvider>');
  return v;
}
