"use client";

import type { InstructionalStep, StudentSupportProfile, SupportLevel, VocabularyImage, VocabularyWord } from "@/lib/types";
import { Step01HearWord } from "@/components/student/steps/Step01HearWord";
import { Step02MatchSounds } from "@/components/student/steps/Step02MatchSounds";
import { Step03BuildWord } from "@/components/student/steps/Step03BuildWord";
import { Step04AnalyzeParts } from "@/components/student/steps/Step04AnalyzeParts";
import { Step05ReadWord } from "@/components/student/steps/Step05ReadWord";
import { Step06MatchPicture } from "@/components/student/steps/Step06MatchPicture";
import { Step07MatchDefinition } from "@/components/student/steps/Step07MatchDefinition";
import { Step08CompleteSentence } from "@/components/student/steps/Step08CompleteSentence";
import { Step09WriteWord } from "@/components/student/steps/Step09WriteWord";
import { Step10ApplyWord } from "@/components/student/steps/Step10ApplyWord";

export interface StepRendererProps {
  step: InstructionalStep;
  sessionId: string;
  word: VocabularyWord;
  supportProfile: StudentSupportProfile;
  supportLevel: SupportLevel;
  imageChoices?: VocabularyImage[];
  onStepComplete: () => void;
  onExitSave?: () => void;
}

export function StepRenderer({
  step,
  sessionId,
  word,
  supportProfile,
  supportLevel,
  imageChoices,
  onStepComplete,
  onExitSave,
}: StepRendererProps) {
  const common = {
    sessionId,
    word,
    supportProfile,
    supportLevel,
    imageChoices,
    onStepComplete,
    onExitSave,
  };

  switch (step) {
    case 1:
      return <Step01HearWord {...common} />;
    case 2:
      return <Step02MatchSounds {...common} />;
    case 3:
      return <Step03BuildWord {...common} />;
    case 4:
      return <Step04AnalyzeParts {...common} />;
    case 5:
      return <Step05ReadWord {...common} />;
    case 6:
      return <Step06MatchPicture {...common} />;
    case 7:
      return <Step07MatchDefinition {...common} />;
    case 8:
      return <Step08CompleteSentence {...common} />;
    case 9:
      return <Step09WriteWord {...common} />;
    case 10:
      return <Step10ApplyWord {...common} />;
    default:
      return null;
  }
}
