/** Stable identifiers for cross-referencing seed entities. */
export const SEED_IDS = {
  units: {
    matter: "seed-unit-matter",
    forceAndMotion: "seed-unit-force-motion",
    earthScience: "seed-unit-earth-science",
    waterCycle: "seed-unit-water-cycle",
    ecosystems: "seed-unit-ecosystems",
    scientificInvestigation: "seed-unit-scientific-investigation",
  },
  users: {
    teacherRivera: "seed-user-teacher-rivera",
    adminChen: "seed-user-admin-chen",
    students: {
      sofiaMartinez: "seed-user-student-sofia-martinez",
      marcusJohnson: "seed-user-student-marcus-johnson",
      aishaPatel: "seed-user-student-aisha-patel",
      liamObrien: "seed-user-student-liam-obrien",
      emmaChen: "seed-user-student-emma-chen",
      noahWilliams: "seed-user-student-noah-williams",
      zaraAhmed: "seed-user-student-zara-ahmed",
      ethanBrooks: "seed-user-student-ethan-brooks",
      oliviaNguyen: "seed-user-student-olivia-nguyen",
      jaydenTaylor: "seed-user-student-jayden-taylor",
      miaRodriguez: "seed-user-student-mia-rodriguez",
      calebWashington: "seed-user-student-caleb-washington",
      graceKim: "seed-user-student-grace-kim",
    },
  },
  class: {
    riveraPeriod3: "seed-class-rivera-period-3",
  },
  assignment: {
    waterCycleUnit: "seed-assignment-water-cycle",
    ecosystemsUnit: "seed-assignment-ecosystems",
    matterUnit: "seed-assignment-matter",
  },
} as const;

export type SeedStudentId =
  (typeof SEED_IDS.users.students)[keyof typeof SEED_IDS.users.students];
