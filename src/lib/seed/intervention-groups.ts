import type { InterventionGroup, InterventionGroupMember } from "@/lib/types";
import { SEED_IDS } from "@/lib/seed/seed-ids";
import { seedTimestamps } from "@/lib/seed/helpers";

const ts = seedTimestamps();

export const SEED_INTERVENTION_GROUPS: InterventionGroup[] = [
  {
    id: "seed-group-syllable-support",
    classId: SEED_IDS.class.riveraPeriod3,
    name: "Needs syllable support",
    reason:
      "Students frequently miss syllable boundaries and phoneme sequencing on multi-syllable science words.",
    supportingData:
      "Marcus and Jayden averaged below 60% on phoneme sequencing for evaporation and force across 10+ attempts.",
    recommendedActivity:
      "Practice clapping syllables with audio replay before grapheme mapping on water cycle words.",
    status: "active",
    isManual: false,
    skillFocus: "syllable_awareness",
    ...ts,
  },
  {
    id: "seed-group-spelling-practice",
    classId: SEED_IDS.class.riveraPeriod3,
    name: "Needs spelling practice",
    reason: "Repeated substitution and omission errors during written production steps.",
    supportingData:
      "Jayden scored 42–45% on spelling and written production; Marcus shows support-dependent correct spelling.",
    recommendedActivity:
      "Use morpheme highlighting and reduced distractor tiles for build-the-word practice.",
    status: "active",
    isManual: false,
    skillFocus: "spelling",
    ...ts,
  },
  {
    id: "seed-group-decode-not-apply",
    classId: SEED_IDS.class.riveraPeriod3,
    name: "Can decode but cannot apply the concept",
    reason:
      "Students match definitions but miss science application questions on the same words.",
    supportingData:
      "Noah answered definition steps correctly with supports but missed concept application on evaporation.",
    recommendedActivity:
      "Reteach with paired image + sentence frames before removing the word bank.",
    status: "suggested",
    isManual: false,
    skillFocus: "concept_application",
    ...ts,
  },
  {
    id: "seed-group-retrieval-practice",
    classId: SEED_IDS.class.riveraPeriod3,
    name: "Needs additional retrieval practice",
    reason: "Previously mastered words are due for spaced review.",
    supportingData: "Grace and Emma have review-due schedules for water cycle vocabulary.",
    recommendedActivity: "Assign mixed review session with evaporation and condensation retrieval.",
    status: "active",
    isManual: false,
    skillFocus: "retrieval_fluency",
    ...ts,
  },
  {
    id: "seed-group-advanced-application",
    classId: SEED_IDS.class.riveraPeriod3,
    name: "Ready for advanced application",
    reason: "Strong mastery across decoding and concept skills with minimal support use.",
    supportingData: "Olivia averaged 95% weighted mastery on ecosystem with level 4 supports.",
    recommendedActivity: "Extend with cross-unit compare-and-contrast application prompts.",
    status: "suggested",
    isManual: false,
    skillFocus: "concept_application",
    ...ts,
  },
  {
    id: "seed-group-morphology",
    classId: SEED_IDS.class.riveraPeriod3,
    name: "Needs morphology instruction",
    reason: "Suffix and root errors on -ation words during analyze-word-parts steps.",
    supportingData:
      "Marcus missed suffix meaning on evaporation and condensation in step 4 attempts.",
    recommendedActivity: "Mini-lesson on -ation meaning with evaporation and condensation morpheme cards.",
    status: "active",
    isManual: false,
    skillFocus: "morphology",
    ...ts,
  },
];

export const SEED_INTERVENTION_GROUP_MEMBERS: InterventionGroupMember[] = [
  { id: "seed-group-member-1", groupId: "seed-group-syllable-support", studentId: SEED_IDS.users.students.marcusJohnson, addedAt: ts.createdAt },
  { id: "seed-group-member-2", groupId: "seed-group-syllable-support", studentId: SEED_IDS.users.students.jaydenTaylor, addedAt: ts.createdAt },
  { id: "seed-group-member-3", groupId: "seed-group-spelling-practice", studentId: SEED_IDS.users.students.jaydenTaylor, addedAt: ts.createdAt },
  { id: "seed-group-member-4", groupId: "seed-group-spelling-practice", studentId: SEED_IDS.users.students.marcusJohnson, addedAt: ts.createdAt },
  { id: "seed-group-member-5", groupId: "seed-group-decode-not-apply", studentId: SEED_IDS.users.students.noahWilliams, addedAt: ts.createdAt },
  { id: "seed-group-member-6", groupId: "seed-group-retrieval-practice", studentId: SEED_IDS.users.students.graceKim, addedAt: ts.createdAt },
  { id: "seed-group-member-7", groupId: "seed-group-retrieval-practice", studentId: SEED_IDS.users.students.emmaChen, addedAt: ts.createdAt },
  { id: "seed-group-member-8", groupId: "seed-group-advanced-application", studentId: SEED_IDS.users.students.oliviaNguyen, addedAt: ts.createdAt },
  { id: "seed-group-member-9", groupId: "seed-group-morphology", studentId: SEED_IDS.users.students.marcusJohnson, addedAt: ts.createdAt },
  { id: "seed-group-member-10", groupId: "seed-group-morphology", studentId: SEED_IDS.users.students.noahWilliams, addedAt: ts.createdAt },
];
