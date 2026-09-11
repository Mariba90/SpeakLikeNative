export type Correction = { original: string; correction: string; explanation: string };
export type Improvement = { original: string; suggestion: string; explanation: string };
export type Score = { grammar: number; vocabulary: number; fluency: number; naturalness: number; confidence: number };
export type Feedback = {
  transcript: string;
  correctedVersion: string;
  grammarCorrections: Correction[];
  vocabularyImprovements: Improvement[];
  naturalExpressions: Improvement[];
  fluencySuggestions: string[];
  pronunciationNotes: string[];
  scores: Score;
  encouragement: string;
};
