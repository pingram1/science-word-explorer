"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import {
  joinCommaList,
  splitCommaList,
  vocabularyFormSchema,
  type VocabularyFormValues,
} from "@/lib/admin/vocabulary-schema";
import type { SupportLevel, VocabularyWord } from "@/lib/types";

export interface VocabularyFormProps {
  units: Array<{ id: string; title: string }>;
  initialValues?: Partial<VocabularyWord>;
  onSubmit: (values: VocabularyFormValues) => Promise<void>;
  submitLabel?: string;
}

function wordToFormValues(word?: Partial<VocabularyWord>): VocabularyFormValues {
  const primaryImage = word?.images?.find((image) => image.isPrimary) ?? word?.images?.[0];
  return {
    unitId: word?.unitId ?? "",
    word: word?.word ?? "",
    gradeLevel: word?.gradeLevel ?? 5,
    standardsTags: joinCommaList(word?.standardsTags ?? []),
    studentFriendlyDefinition: word?.studentFriendlyDefinition ?? "",
    formalDefinition: word?.formalDefinition ?? "",
    pronunciationAudioUrl: word?.pronunciationAudioUrl ?? "",
    syllableBreakdown: joinCommaList(word?.syllableBreakdown ?? []),
    phonemeSequence: joinCommaList(word?.phonemeSequence ?? []),
    graphemeSequence: joinCommaList(word?.graphemeSequence ?? []),
    prefix: word?.prefix ?? "",
    baseOrRoot: word?.baseOrRoot ?? "",
    suffix: word?.suffix ?? "",
    morphologyApplicable: word?.morphologyApplicable ?? false,
    requiresTeacherReview: word?.requiresTeacherReview ?? true,
    exampleSentence: word?.exampleSentence ?? "",
    clozeSentence: word?.clozeSentence ?? "",
    definitionDistractors: joinCommaList(word?.definitionDistractors ?? []),
    commonSpellingErrors: joinCommaList(word?.commonSpellingErrors ?? []),
    commonMisconceptions: joinCommaList(word?.commonMisconceptions ?? []),
    difficultyLevel: word?.difficultyLevel ?? 2,
    isActive: word?.isActive ?? true,
    imageUrl: primaryImage?.url ?? "",
    imageAltText: primaryImage?.altText ?? "",
  };
}

export function VocabularyForm({
  units,
  initialValues,
  onSubmit,
  submitLabel = "Save word",
}: VocabularyFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VocabularyFormValues>({
    resolver: zodResolver(vocabularyFormSchema) as Resolver<VocabularyFormValues>,
    defaultValues: wordToFormValues(initialValues),
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-6 rounded-2xl border-2 border-border bg-surface p-6"
      noValidate
    >
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 text-lg font-bold text-foreground">Basic information</legend>

        <Select label="Unit" error={errors.unitId?.message} {...register("unitId")}>
          <option value="">Select a unit</option>
          {units.map((unit) => (
            <option key={unit.id} value={unit.id}>
              {unit.title}
            </option>
          ))}
        </Select>

        <Input label="Word" error={errors.word?.message} {...register("word")} />

        <Input
          label="Grade level"
          type="number"
          min={1}
          max={12}
          error={errors.gradeLevel?.message}
          {...register("gradeLevel", { valueAsNumber: true })}
        />

        <Select
          label="Difficulty level"
          error={errors.difficultyLevel?.message}
          {...register("difficultyLevel", { valueAsNumber: true })}
        >
          {[1, 2, 3, 4].map((level) => (
            <option key={level} value={level}>
              Level {level}
            </option>
          ))}
        </Select>

        <Input
          label="Standards tags (comma-separated)"
          hint="Example: 5-ESS2-1, 5-PS1-1"
          error={errors.standardsTags?.message}
          {...register("standardsTags")}
        />
      </fieldset>

      <fieldset className="grid gap-4">
        <legend className="mb-2 text-lg font-bold text-foreground">Definitions</legend>
        <Textarea
          label="Student-friendly definition"
          error={errors.studentFriendlyDefinition?.message}
          {...register("studentFriendlyDefinition")}
        />
        <Textarea
          label="Formal definition"
          error={errors.formalDefinition?.message}
          {...register("formalDefinition")}
        />
        <Textarea
          label="Definition distractors (comma-separated)"
          error={errors.definitionDistractors?.message}
          {...register("definitionDistractors")}
        />
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 text-lg font-bold text-foreground">Linguistic structure</legend>
        <Input
          label="Syllable breakdown (comma-separated)"
          error={errors.syllableBreakdown?.message}
          {...register("syllableBreakdown")}
        />
        <Input
          label="Phoneme sequence (comma-separated)"
          error={errors.phonemeSequence?.message}
          {...register("phonemeSequence")}
        />
        <Input
          label="Grapheme sequence (comma-separated)"
          error={errors.graphemeSequence?.message}
          {...register("graphemeSequence")}
        />
        <Input label="Prefix" {...register("prefix")} />
        <Input label="Base or root" {...register("baseOrRoot")} />
        <Input label="Suffix" {...register("suffix")} />
        <Input label="Pronunciation audio URL" {...register("pronunciationAudioUrl")} />
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 text-lg font-bold text-foreground">Instructional content</legend>
        <Textarea
          label="Example sentence"
          className="sm:col-span-2"
          error={errors.exampleSentence?.message}
          {...register("exampleSentence")}
        />
        <Textarea
          label="Cloze sentence"
          className="sm:col-span-2"
          error={errors.clozeSentence?.message}
          {...register("clozeSentence")}
        />
        <Input label="Primary image URL" {...register("imageUrl")} />
        <Input label="Image alt text" {...register("imageAltText")} />
        <Textarea
          label="Common spelling errors (comma-separated)"
          className="sm:col-span-2"
          {...register("commonSpellingErrors")}
        />
        <Textarea
          label="Common misconceptions (comma-separated)"
          className="sm:col-span-2"
          {...register("commonMisconceptions")}
        />
      </fieldset>

      <fieldset className="grid gap-3 sm:grid-cols-2">
        <legend className="mb-2 text-lg font-bold text-foreground">Publishing options</legend>
        <label className="flex items-center gap-3 text-base">
          <input type="checkbox" className="size-5" {...register("morphologyApplicable")} />
          Morphology applicable
        </label>
        <label className="flex items-center gap-3 text-base">
          <input type="checkbox" className="size-5" {...register("requiresTeacherReview")} />
          Requires teacher review
        </label>
        <label className="flex items-center gap-3 text-base">
          <input type="checkbox" className="size-5" {...register("isActive")} />
          Active for instruction
        </label>
      </fieldset>

      <Button type="submit" isLoading={isSubmitting}>
        {submitLabel}
      </Button>
    </form>
  );
}

export function formValuesToVocabularyPayload(values: VocabularyFormValues) {
  return {
    unitId: values.unitId,
    word: values.word,
    gradeLevel: values.gradeLevel,
    standardsTags: splitCommaList(values.standardsTags),
    studentFriendlyDefinition: values.studentFriendlyDefinition,
    formalDefinition: values.formalDefinition,
    pronunciationAudioUrl: values.pronunciationAudioUrl || null,
    syllableBreakdown: splitCommaList(values.syllableBreakdown),
    phonemeSequence: splitCommaList(values.phonemeSequence),
    graphemeSequence: splitCommaList(values.graphemeSequence),
    prefix: values.prefix || null,
    baseOrRoot: values.baseOrRoot || null,
    suffix: values.suffix || null,
    morphemeMeanings: [],
    morphologyApplicable: values.morphologyApplicable,
    requiresTeacherReview: values.requiresTeacherReview,
    images: values.imageUrl
      ? [
          {
            id: `img-${values.word}`,
            url: values.imageUrl,
            altText: values.imageAltText || `Illustration for ${values.word}`,
            isPrimary: true,
          },
        ]
      : [],
    imageDistractorIds: [],
    definitionDistractors: splitCommaList(values.definitionDistractors),
    exampleSentence: values.exampleSentence,
    clozeSentence: values.clozeSentence,
    applicationQuestions: [],
    commonSpellingErrors: splitCommaList(values.commonSpellingErrors),
    commonMisconceptions: splitCommaList(values.commonMisconceptions),
    glossaryTranslations: [],
    difficultyLevel: values.difficultyLevel as SupportLevel,
    isActive: values.isActive,
  };
}
