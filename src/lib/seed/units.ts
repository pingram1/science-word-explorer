import type { Unit } from "@/lib/types";
import { SEED_IDS } from "@/lib/seed/seed-ids";
import { seedTimestamps } from "@/lib/seed/helpers";

export const SEED_UNITS: Unit[] = [
  {
    id: SEED_IDS.units.matter,
    slug: "matter",
    title: "Matter",
    description:
      "Explore atoms, molecules, mixtures, and the physical and chemical properties that describe matter.",
    gradeLevel: 5,
    standardsTags: ["5-PS1-1", "5-PS1-2", "5-PS1-3", "5-PS1-4"],
    sortOrder: 1,
    isActive: true,
    ...seedTimestamps(),
  },
  {
    id: SEED_IDS.units.forceAndMotion,
    slug: "force-and-motion",
    title: "Force and Motion",
    description:
      "Investigate forces, gravity, friction, and how balanced and unbalanced forces affect motion.",
    gradeLevel: 5,
    standardsTags: ["5-PS2-1"],
    sortOrder: 2,
    isActive: true,
    ...seedTimestamps(),
  },
  {
    id: SEED_IDS.units.earthScience,
    slug: "earth-science",
    title: "Earth Science",
    description:
      "Study weathering, erosion, deposition, fossils, and landforms that shape Earth's surface.",
    gradeLevel: 5,
    standardsTags: ["5-ESS2-1", "5-ESS2-2"],
    sortOrder: 3,
    isActive: true,
    ...seedTimestamps(),
  },
  {
    id: SEED_IDS.units.waterCycle,
    slug: "water-cycle",
    title: "Water Cycle",
    description:
      "Follow water as it evaporates, condenses, precipitates, and moves through the environment.",
    gradeLevel: 5,
    standardsTags: ["5-ESS2-1"],
    sortOrder: 4,
    isActive: true,
    ...seedTimestamps(),
  },
  {
    id: SEED_IDS.units.ecosystems,
    slug: "ecosystems",
    title: "Ecosystems",
    description:
      "Learn how producers, consumers, and decomposers interact in habitats, food chains, and food webs.",
    gradeLevel: 5,
    standardsTags: ["5-LS2-1", "5-LS2-2"],
    sortOrder: 5,
    isActive: true,
    ...seedTimestamps(),
  },
  {
    id: SEED_IDS.units.scientificInvestigation,
    slug: "scientific-investigation",
    title: "Scientific Investigation",
    description:
      "Practice the language of science inquiry: hypotheses, variables, evidence, models, and conclusions.",
    gradeLevel: 5,
    standardsTags: ["5-PS1-1", "3-5-ETS1-1", "3-5-ETS1-2", "3-5-ETS1-3"],
    sortOrder: 6,
    isActive: true,
    ...seedTimestamps(),
  },
];

export function getUnitIdBySlug(slug: string): string {
  const unit = SEED_UNITS.find((entry) => entry.slug === slug);
  if (!unit) {
    throw new Error(`Unknown unit slug: ${slug}`);
  }
  return unit.id;
}
