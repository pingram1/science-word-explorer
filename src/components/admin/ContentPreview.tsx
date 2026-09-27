"use client";

import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StepProgress } from "@/components/shared/StepProgress";
import { STEP_LABELS } from "@/lib/teacher/formatters";
import type { VocabularyWord } from "@/lib/types";

export interface ContentPreviewProps {
  word: VocabularyWord;
  currentStep?: number;
}

const STEP_DESCRIPTIONS = [
  "Listen to the word and focus on each syllable.",
  "Sequence phonemes in the correct order.",
  "Map graphemes to sounds for spelling.",
  "Analyze prefixes, roots, and suffixes.",
  "Practice pronunciation with audio support.",
  "Choose the picture that matches the science meaning.",
  "Select the student-friendly definition.",
  "Use the word correctly in context (cloze).",
  "Write or build the word independently.",
  "Apply the concept in a science question.",
];

export function ContentPreview({ word, currentStep = 1 }: ContentPreviewProps) {
  const primaryImage = word.images.find((image) => image.isPrimary) ?? word.images[0];
  const question = word.applicationQuestions[0];

  return (
    <div className="space-y-6">
      <Card padding="md">
        <CardHeader>
          <CardTitle>Preview: {word.word}</CardTitle>
          <p className="text-muted">{word.studentFriendlyDefinition}</p>
        </CardHeader>
        <CardContent>
          <StepProgress
            currentStep={currentStep}
            labels={[...STEP_LABELS]}
            className="mb-6"
          />
        </CardContent>
      </Card>

      <Card padding="md">
        <CardHeader>
          <CardTitle>
            Step {currentStep}: {STEP_LABELS[currentStep - 1]}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-base text-foreground">{STEP_DESCRIPTIONS[currentStep - 1]}</p>

          {currentStep === 1 && (
            <p className="rounded-xl bg-surface-muted p-4 text-lg font-bold">{word.word}</p>
          )}

          {currentStep === 2 && (
            <ul className="flex flex-wrap gap-2">
              {word.phonemeSequence.map((phoneme) => (
                <li key={phoneme}>
                  <Badge variant="blue">{phoneme}</Badge>
                </li>
              ))}
            </ul>
          )}

          {currentStep === 3 && (
            <ul className="flex flex-wrap gap-2">
              {word.graphemeSequence.map((grapheme, index) => (
                <li key={`${grapheme}-${index}`}>
                  <Badge variant="teal">{grapheme}</Badge>
                </li>
              ))}
            </ul>
          )}

          {currentStep === 4 && word.morphologyApplicable && (
            <dl className="grid gap-2 sm:grid-cols-3">
              {word.prefix && (
                <>
                  <dt className="font-semibold text-muted">Prefix</dt>
                  <dd className="sm:col-span-2">{word.prefix}</dd>
                </>
              )}
              {word.baseOrRoot && (
                <>
                  <dt className="font-semibold text-muted">Root/base</dt>
                  <dd className="sm:col-span-2">{word.baseOrRoot}</dd>
                </>
              )}
              {word.suffix && (
                <>
                  <dt className="font-semibold text-muted">Suffix</dt>
                  <dd className="sm:col-span-2">{word.suffix}</dd>
                </>
              )}
              {word.morphemeMeanings.map((entry) => (
                <div key={entry.part} className="sm:col-span-3 rounded-xl bg-surface-muted p-3">
                  <strong>{entry.part}</strong> ({entry.type}): {entry.meaning}
                </div>
              ))}
            </dl>
          )}

          {currentStep === 5 && (
            <p className="text-base">
              Syllables: {word.syllableBreakdown.join(" · ")}
            </p>
          )}

          {currentStep === 6 && primaryImage && (
            <figure>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={primaryImage.url}
                alt={primaryImage.altText}
                className="max-h-64 w-full rounded-xl object-cover"
              />
              <figcaption className="mt-2 text-sm text-muted">{primaryImage.altText}</figcaption>
            </figure>
          )}

          {currentStep === 7 && (
            <ul className="space-y-2">
              <li className="rounded-xl border-2 border-science-green bg-science-green/10 p-3">
                {word.studentFriendlyDefinition}
              </li>
              {word.definitionDistractors.map((distractor) => (
                <li key={distractor} className="rounded-xl border-2 border-border p-3">
                  {distractor}
                </li>
              ))}
            </ul>
          )}

          {currentStep === 8 && (
            <p className="text-lg">{word.clozeSentence.replace("__________", "_______")}</p>
          )}

          {currentStep === 9 && (
            <p className="rounded-xl bg-surface-muted p-4 font-mono text-xl">{word.word}</p>
          )}

          {currentStep === 10 && question && (
            <div className="space-y-3">
              <p className="font-semibold">{question.prompt}</p>
              <ol className="list-decimal space-y-2 pl-5">
                {question.choices.map((choice) => (
                  <li key={choice}>{choice}</li>
                ))}
              </ol>
              <p className="text-sm text-muted">Explanation: {question.explanation}</p>
            </div>
          )}

          {!question && currentStep === 10 && (
            <p className="text-muted">No application question configured yet.</p>
          )}
        </CardContent>
      </Card>

      <Card padding="md">
        <CardHeader>
          <CardTitle>Example sentence</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{word.exampleSentence}</p>
        </CardContent>
      </Card>
    </div>
  );
}
