import sampleJson from './sampleBank.json';
import type { QuizBank } from '../lib/types';

// The JSON is shipped as the default bank on first launch.
export const sampleBank: QuizBank = sampleJson as QuizBank;
