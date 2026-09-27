import type { ApplicationQuestion, GlossaryTranslation, VocabularyImage } from "@/lib/types";

export const SEED_TIMESTAMP = "2026-07-01T12:00:00.000Z";

export function seedTimestamps() {
  return {
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP,
  };
}

export function placeholderSvg(label: string, color = "#0ea5e9"): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360" role="img" aria-label="${label}"><rect width="480" height="360" fill="${color}"/><text x="240" y="190" text-anchor="middle" fill="#ffffff" font-family="system-ui,sans-serif" font-size="22">${label}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function unsplashImage(photoId: string, alt: string): VocabularyImage {
  return {
    id: `img-${photoId}`,
    url: `https://images.unsplash.com/${photoId}?w=480&h=360&fit=crop`,
    altText: alt,
    isPrimary: true,
  };
}

export function svgImage(id: string, label: string, alt: string, color?: string): VocabularyImage {
  return {
    id,
    url: placeholderSvg(label, color),
    altText: alt,
    isPrimary: true,
  };
}

export function makeApplicationQuestion(
  vocabularyWordId: string,
  prompt: string,
  choices: string[],
  correctChoiceIndex: number,
  explanation: string,
): ApplicationQuestion {
  return {
    id: `aq-${vocabularyWordId}-${correctChoiceIndex}`,
    vocabularyWordId,
    prompt,
    choices,
    correctChoiceIndex,
    explanation,
    difficultyLevel: 2,
    isActive: true,
    ...seedTimestamps(),
  };
}

export function defaultElGlossary(word: string, definition: string): GlossaryTranslation[] {
  return [
    { languageCode: "es", term: word, definition: `[Revisar traducción] ${definition}` },
    { languageCode: "vi", term: word, definition: `[Review translation] ${definition}` },
  ];
}

export function simpleSyllables(word: string): string[] {
  return word.split(/[\s-]+/).flatMap((part) => {
    const chunks = part.match(/[^aeiouy]*[aeiouy]+(?:[^aeiouy]|$)/gi);
    return chunks ?? [part];
  });
}
