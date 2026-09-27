import type { DataStore } from "@/lib/repositories/types";
import { createEmptyDataStore } from "@/lib/repositories/types";
import { SEED_DEMO_LEARNING } from "@/lib/seed/demo-events";
import {
  SEED_ASSIGNMENTS,
  SEED_ASSIGNMENT_WORDS,
  SEED_CLASS,
  SEED_CLASS_MEMBERSHIPS,
  SEED_REWARDS,
  SEED_STUDENT_PROFILES,
  SEED_SUPPORT_PROFILES,
  SEED_TEACHER_PROFILES,
  SEED_USERS,
} from "@/lib/seed/demo-users";
import {
  SEED_INTERVENTION_GROUP_MEMBERS,
  SEED_INTERVENTION_GROUPS,
} from "@/lib/seed/intervention-groups";
import { SEED_UNITS } from "@/lib/seed/units";
import { SEED_VOCABULARY } from "@/lib/seed/vocabulary";
import { SEED_IDS } from "@/lib/seed/seed-ids";
import { seedTimestamps } from "@/lib/seed/helpers";
import type { TeacherNote } from "@/lib/types";
import {
  loadStoreFromDisk,
  saveStoreToDisk,
  storeFileExists,
} from "@/lib/repositories/local-store";

export const SEED_VERSION = "1.0.0";

export function buildSeedDataStore(): DataStore {
  const ts = seedTimestamps();
  const teacherNotes: TeacherNote[] = [
    {
      id: "seed-note-marcus-spelling",
      teacherId: SEED_IDS.users.teacherRivera,
      studentId: SEED_IDS.users.students.marcusJohnson,
      content:
        "Marcus benefits from syllable clapping before phoneme tiles. Consider keeping level 1 supports for evaporation review.",
      isPinned: true,
      ...ts,
    },
    {
      id: "seed-note-noah-application",
      teacherId: SEED_IDS.users.teacherRivera,
      studentId: SEED_IDS.users.students.noahWilliams,
      content:
        "Noah can select the correct definition with TTS but misses application items. Plan a small-group reteach with picture cards.",
      isPinned: false,
      ...ts,
    },
  ];

  return {
    metadata: {
      version: 1,
      seededAt: new Date().toISOString(),
      seedVersion: SEED_VERSION,
    },
    users: SEED_USERS,
    studentProfiles: SEED_STUDENT_PROFILES,
    teacherProfiles: SEED_TEACHER_PROFILES,
    classes: [SEED_CLASS],
    classMemberships: SEED_CLASS_MEMBERSHIPS,
    units: SEED_UNITS,
    vocabularyWords: SEED_VOCABULARY,
    studentSupportProfiles: SEED_SUPPORT_PROFILES,
    learningSessions: SEED_DEMO_LEARNING.learningSessions,
    learningAttempts: SEED_DEMO_LEARNING.learningAttempts,
    learningEvents: SEED_DEMO_LEARNING.learningEvents,
    studentWordMastery: SEED_DEMO_LEARNING.studentWordMastery,
    studentSkillMastery: SEED_DEMO_LEARNING.studentSkillMastery,
    reviewSchedules: SEED_DEMO_LEARNING.reviewSchedules,
    rewards: SEED_REWARDS,
    studentRewards: SEED_DEMO_LEARNING.studentRewards,
    interventionGroups: SEED_INTERVENTION_GROUPS,
    interventionGroupMembers: SEED_INTERVENTION_GROUP_MEMBERS,
    teacherNotes,
    assignments: SEED_ASSIGNMENTS,
    assignmentWords: SEED_ASSIGNMENT_WORDS,
  };
}

/**
 * Seeds the local JSON store with demo data.
 * Idempotent: if the store file already exists, it is loaded as-is.
 * Delete `.data/store.json` before process start to re-seed.
 */
export async function seedDatabase(): Promise<DataStore> {
  if (await storeFileExists()) {
    return loadStoreFromDisk();
  }

  const store = buildSeedDataStore();
  await saveStoreToDisk(store);
  return store;
}

export { createEmptyDataStore };
