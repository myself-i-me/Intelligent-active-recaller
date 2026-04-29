import type { QuizBank, QuizResult, QuizSession } from './types';

const BANK_KEY = 'upsc-quiz:active-bank';
const SESSION_KEY = 'upsc-quiz:active-session';
const LAST_RESULT_KEY = 'upsc-quiz:last-result';
const CUSTOM_BANKS_KEY = 'upsc-quiz:custom-banks';

function safeGet<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function safeSet(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota or serialization error — ignore
  }
}

export const storage = {
  getActiveBank: () => safeGet<QuizBank>(BANK_KEY),
  setActiveBank: (b: QuizBank) => safeSet(BANK_KEY, b),
  clearActiveBank: () => window.localStorage.removeItem(BANK_KEY),

  getActiveSession: () => safeGet<QuizSession>(SESSION_KEY),
  setActiveSession: (s: QuizSession) => safeSet(SESSION_KEY, s),
  clearActiveSession: () => window.localStorage.removeItem(SESSION_KEY),

  getLastResult: () => safeGet<QuizResult>(LAST_RESULT_KEY),
  setLastResult: (r: QuizResult) => safeSet(LAST_RESULT_KEY, r),

  getCustomBanks: () => safeGet<QuizBank[]>(CUSTOM_BANKS_KEY) ?? [],
  setCustomBanks: (banks: QuizBank[]) => safeSet(CUSTOM_BANKS_KEY, banks),
};
