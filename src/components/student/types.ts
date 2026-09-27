import type {
  InstructionalStep,
  StudentSupportProfile,
  SupportLevel,
  VocabularyImage,
  VocabularyWord,
} from "@/lib/types";

export interface StepComponentProps {
  sessionId: string;
  word: VocabularyWord;
  supportProfile: StudentSupportProfile;
  supportLevel: SupportLevel;
  imageChoices?: VocabularyImage[];
  onStepComplete: () => void;
  onExitSave?: () => void;
}

export interface AttemptSubmitPayload {
  instructionalStep: InstructionalStep;
  studentResponse: string | null;
  correctResponse: string | null;
  isCorrect?: boolean;
  hintsUsed?: number;
  audioReplays?: number;
  slowAudioUsed?: boolean;
  textToSpeechUsed?: boolean;
  wordBankUsed?: boolean;
  pictureSupportUsed?: boolean;
  speechRecognitionConfidence?: number | null;
  completionStatus?: "completed" | "skipped";
}

export interface AttemptResponse {
  feedback: string;
  isCorrect: boolean;
  nextStep: InstructionalStep | null;
  session: { status: string; currentStep: InstructionalStep };
  adaptiveExplanations: string[];
}

export const STEP_LABELS = [
  "Listen",
  "Sounds",
  "Build",
  "Parts",
  "Read",
  "Picture",
  "Definition",
  "Sentence",
  "Write",
  "Apply",
] as const;

export const STEP_DIRECTIONS: Record<InstructionalStep, string> = {
  1: "Listen to the word. When you're ready, reveal it and clap each syllable.",
  2: "Put the sounds in the correct order to build the word.",
  3: "Build the word using the letter tiles. Correct tiles will lock in place.",
  4: "Match each word part to its meaning.",
  5: "Read the word aloud. Use speech recognition or self-check.",
  6: "Choose the picture that best matches the word.",
  7: "Choose the definition that best matches the word.",
  8: "Complete the sentence with the correct word.",
  9: "Write the word by typing or handwriting.",
  10: "Apply the word to a science scenario.",
};

export function supportTextSizeClass(profile: StudentSupportProfile): string {
  switch (profile.textSize) {
    case "small":
      return "text-sm";
    case "large":
      return "text-lg";
    case "extra_large":
      return "text-xl";
    default:
      return "text-base";
  }
}

export function supportSpacingClass(profile: StudentSupportProfile): string {
  const letter =
    profile.letterSpacing === "extra_wide"
      ? "tracking-widest"
      : profile.letterSpacing === "wide"
        ? "tracking-wide"
        : "";
  const line =
    profile.lineSpacing === "loose"
      ? "leading-loose"
      : profile.lineSpacing === "relaxed"
        ? "leading-relaxed"
        : "leading-normal";
  return `${letter} ${line}`;
}

export function supportFontClass(profile: StudentSupportProfile): string {
  if (profile.fontPreference === "opendyslexic") return "font-[family-name:var(--font-dyslexic)]";
  return "";
}

export function shuffleWithSeed<T>(items: T[], seed: string): T[] {
  const copy = [...items];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  for (let i = copy.length - 1; i > 0; i--) {
    hash = (hash * 1664525 + 1013904223) | 0;
    const j = Math.abs(hash) % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
