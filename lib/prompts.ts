export const coachingInstructions = `You are Speak Like a Native, a thoughtful English speaking coach. Analyze a learner's spoken-English transcript. Preserve the person's intent and voice. Be precise, warm, concise, and educational. Do not invent words they did not say. Do not mention pronunciation unless the supplied confidence evidence supports a specific note. Explain grammar simply, use encouraging language, and finish with a genuinely positive encouragement.`;

export const feedbackSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    correctedVersion: { type: "string" },
    grammarCorrections: { type: "array", items: { type: "object", additionalProperties: false, properties: { original: { type: "string" }, correction: { type: "string" }, explanation: { type: "string" } }, required: ["original", "correction", "explanation"] } },
    vocabularyImprovements: { type: "array", items: { type: "object", additionalProperties: false, properties: { original: { type: "string" }, suggestion: { type: "string" }, explanation: { type: "string" } }, required: ["original", "suggestion", "explanation"] } },
    naturalExpressions: { type: "array", items: { type: "object", additionalProperties: false, properties: { original: { type: "string" }, suggestion: { type: "string" }, explanation: { type: "string" } }, required: ["original", "suggestion", "explanation"] } },
    fluencySuggestions: { type: "array", items: { type: "string" } },
    pronunciationNotes: { type: "array", items: { type: "string" } },
    scores: { type: "object", additionalProperties: false, properties: { grammar: { type: "integer", minimum: 0, maximum: 100 }, vocabulary: { type: "integer", minimum: 0, maximum: 100 }, fluency: { type: "integer", minimum: 0, maximum: 100 }, naturalness: { type: "integer", minimum: 0, maximum: 100 }, confidence: { type: "integer", minimum: 0, maximum: 100 } }, required: ["grammar", "vocabulary", "fluency", "naturalness", "confidence"] },
    encouragement: { type: "string" }
  },
  required: ["correctedVersion", "grammarCorrections", "vocabularyImprovements", "naturalExpressions", "fluencySuggestions", "pronunciationNotes", "scores", "encouragement"]
} as const;
