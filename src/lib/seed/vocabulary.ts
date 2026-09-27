import type { ApplicationQuestion, VocabularyWord } from "@/lib/types";
import {
  defaultElGlossary,
  makeApplicationQuestion,
  seedTimestamps,
  simpleSyllables,
  svgImage,
  unsplashImage,
} from "@/lib/seed/helpers";
import { SEED_IDS } from "@/lib/seed/seed-ids";
import { getUnitIdBySlug } from "@/lib/seed/units";

export const SEED_WORD_IDS = {
  atom: "seed-word-atom",
  molecule: "seed-word-molecule",
  mixture: "seed-word-mixture",
  solution: "seed-word-solution",
  physicalProperty: "seed-word-physical-property",
  chemicalProperty: "seed-word-chemical-property",
  mass: "seed-word-mass",
  volume: "seed-word-volume",
  density: "seed-word-density",
  force: "seed-word-force",
  gravity: "seed-word-gravity",
  friction: "seed-word-friction",
  motion: "seed-word-motion",
  speed: "seed-word-speed",
  balancedForce: "seed-word-balanced-force",
  unbalancedForce: "seed-word-unbalanced-force",
  weathering: "seed-word-weathering",
  erosion: "seed-word-erosion",
  deposition: "seed-word-deposition",
  sediment: "seed-word-sediment",
  fossil: "seed-word-fossil",
  landform: "seed-word-landform",
  plate: "seed-word-plate",
  evaporation: "seed-word-evaporation",
  condensation: "seed-word-condensation",
  precipitation: "seed-word-precipitation",
  collection: "seed-word-collection",
  runoff: "seed-word-runoff",
  waterVapor: "seed-word-water-vapor",
  producer: "seed-word-producer",
  consumer: "seed-word-consumer",
  decomposer: "seed-word-decomposer",
  habitat: "seed-word-habitat",
  ecosystem: "seed-word-ecosystem",
  adaptation: "seed-word-adaptation",
  foodChain: "seed-word-food-chain",
  foodWeb: "seed-word-food-web",
  hypothesis: "seed-word-hypothesis",
  variable: "seed-word-variable",
  control: "seed-word-control",
  investigation: "seed-word-investigation",
  observation: "seed-word-observation",
  inference: "seed-word-inference",
  evidence: "seed-word-evidence",
  model: "seed-word-model",
  data: "seed-word-data",
  conclusion: "seed-word-conclusion",
} as const;

interface WordSeedConfig {
  id: string;
  unitSlug: string;
  word: string;
  studentFriendlyDefinition: string;
  formalDefinition: string;
  standardsTags?: string[];
  difficultyLevel?: 1 | 2 | 3 | 4;
}

type DemoWordContent = Omit<
  VocabularyWord,
  | "id"
  | "unitId"
  | "word"
  | "gradeLevel"
  | "standardsTags"
  | "studentFriendlyDefinition"
  | "formalDefinition"
  | "difficultyLevel"
  | "isActive"
  | "requiresTeacherReview"
  | "createdAt"
  | "updatedAt"
>;

function buildDemoWord(config: WordSeedConfig, content: DemoWordContent): VocabularyWord {
  return {
    id: config.id,
    unitId: getUnitIdBySlug(config.unitSlug),
    word: config.word,
    gradeLevel: 5,
    standardsTags: config.standardsTags ?? [],
    studentFriendlyDefinition: config.studentFriendlyDefinition,
    formalDefinition: config.formalDefinition,
    difficultyLevel: config.difficultyLevel ?? 2,
    isActive: true,
    requiresTeacherReview: false,
    ...content,
    ...seedTimestamps(),
  };
}

function buildPlaceholderWord(config: WordSeedConfig): VocabularyWord {
  const syllables = simpleSyllables(config.word);
  const wordId = config.id;
  const placeholderPhonemes = syllables.map((syllable) => `/${syllable}/`);

  return {
    id: wordId,
    unitId: getUnitIdBySlug(config.unitSlug),
    word: config.word,
    gradeLevel: 5,
    standardsTags: config.standardsTags ?? [],
    studentFriendlyDefinition: config.studentFriendlyDefinition,
    formalDefinition: config.formalDefinition,
    pronunciationAudioUrl: null,
    syllableBreakdown: syllables,
    phonemeSequence: placeholderPhonemes,
    graphemeSequence: config.word.replace(/\s+/g, "").split(""),
    prefix: null,
    baseOrRoot: null,
    suffix: null,
    morphemeMeanings: [],
    morphologyApplicable: false,
    requiresTeacherReview: true,
    images: [
      svgImage(
        `img-placeholder-${wordId}`,
        config.word,
        `Placeholder illustration for ${config.word}. Teacher should replace with an accurate science image.`,
        "#0369a1",
      ),
    ],
    imageDistractorIds: [],
    definitionDistractors: [
      `A measurement tool used for ${config.word}.`,
      `A type of rock related to ${config.word}.`,
      `An energy source sometimes confused with ${config.word}.`,
    ],
    exampleSentence: `Scientists study ${config.word} to understand how living and nonliving systems interact.`,
    clozeSentence: `During our lab, we observed __________ and recorded what happened.`,
    applicationQuestions: [
      makeApplicationQuestion(
        wordId,
        `Which statement best matches the science meaning of "${config.word}"?`,
        [
          config.studentFriendlyDefinition,
          `It describes a random guess about ${config.word}.`,
          `It means the opposite of ${config.word}.`,
          `It only applies outside of science class.`,
        ],
        0,
        "This answer uses the student-friendly definition from the vocabulary record.",
      ),
    ],
    commonSpellingErrors: [],
    commonMisconceptions: [
      `Students may confuse ${config.word} with a similar everyday word.`,
    ],
    glossaryTranslations: defaultElGlossary(config.word, config.studentFriendlyDefinition),
    difficultyLevel: config.difficultyLevel ?? 2,
    isActive: true,
    ...seedTimestamps(),
  };
}

const DEMO_WORDS: VocabularyWord[] = [
  buildDemoWord(
    {
      id: SEED_WORD_IDS.evaporation,
      unitSlug: "water-cycle",
      word: "evaporation",
      studentFriendlyDefinition: "Liquid water changing into water vapor.",
      formalDefinition:
        "The process by which liquid water gains enough energy to change into water vapor (gas) and enter the atmosphere.",
      standardsTags: ["5-ESS2-1"],
      difficultyLevel: 3,
    },
    {
      pronunciationAudioUrl: null,
      syllableBreakdown: ["e", "vap", "o", "ra", "tion"],
      phonemeSequence: ["/ih/", "/v/", "/ae/", "/p/", "/ah/", "/r/", "/ey/", "/sh/", "/ahn/"],
      graphemeSequence: ["e", "v", "a", "p", "o", "r", "a", "t", "i", "o", "n"],
      prefix: null,
      baseOrRoot: "evapor",
      suffix: "-ation",
      morphemeMeanings: [
        { part: "evapor", type: "root", meaning: "to change into vapor" },
        { part: "-ation", type: "suffix", meaning: "the process or result of" },
      ],
      morphologyApplicable: true,
      images: [
        unsplashImage(
          "photo-1500382017468-9049fed747ef",
          "Sunlight warming a puddle while water vapor rises into the air.",
        ),
      ],
      imageDistractorIds: ["img-distractor-rain", "img-distractor-ice"],
      definitionDistractors: [
        "Water vapor changing into liquid droplets in clouds.",
        "Rain falling from clouds to the ground.",
        "Water soaking into the soil after a storm.",
      ],
      exampleSentence: "Evaporation from the lake increased on the hot, sunny afternoon.",
      clozeSentence: "The puddle became smaller because of __________.",
      applicationQuestions: [
        makeApplicationQuestion(
          SEED_WORD_IDS.evaporation,
          "A wet towel dries outside on a warm day. Which process explains why the towel loses water?",
          [
            "Evaporation turns liquid water into water vapor.",
            "Condensation forms clouds in the sky.",
            "Deposition builds up sediment layers.",
            "Photosynthesis makes food for plants.",
          ],
          0,
          "Warm energy helps liquid water change into water vapor during evaporation.",
        ),
        makeApplicationQuestion(
          SEED_WORD_IDS.evaporation,
          "Which change would speed up evaporation from a shallow dish of water?",
          [
            "Placing the dish in direct sunlight",
            "Covering the dish with a lid",
            "Adding ice cubes to the water",
            "Moving the dish into a dark closet",
          ],
          0,
          "More heat energy increases evaporation.",
        ),
      ],
      commonSpellingErrors: ["evaportion", "evapouration", "evaperation"],
      commonMisconceptions: [
        "Thinking evaporation only happens at boiling temperatures.",
        "Confusing evaporation with condensation.",
      ],
      glossaryTranslations: [
        {
          languageCode: "es",
          term: "evaporación",
          definition: "El agua líquida se convierte en vapor de agua.",
        },
        {
          languageCode: "vi",
          term: "sự bốc hơi",
          definition: "Nước lỏng chuyển thành hơi nước.",
        },
      ],
    },
  ),
  buildDemoWord(
    {
      id: SEED_WORD_IDS.condensation,
      unitSlug: "water-cycle",
      word: "condensation",
      studentFriendlyDefinition: "Water vapor changing into liquid water.",
      formalDefinition:
        "The process by which water vapor cools and changes into liquid water, often forming droplets on surfaces or in clouds.",
      standardsTags: ["5-ESS2-1"],
      difficultyLevel: 3,
    },
    {
      pronunciationAudioUrl: null,
      syllableBreakdown: ["con", "den", "sa", "tion"],
      phonemeSequence: ["/k/", "/ahn/", "/d/", "/eh/", "/n/", "/s/", "/ey/", "/sh/", "/ahn/"],
      graphemeSequence: ["c", "o", "n", "d", "e", "n", "s", "a", "t", "i", "o", "n"],
      prefix: null,
      baseOrRoot: "condens",
      suffix: "-ation",
      morphemeMeanings: [
        { part: "con-", type: "prefix", meaning: "together" },
        { part: "dens", type: "root", meaning: "to make thick or compact" },
        { part: "-ation", type: "suffix", meaning: "the process or result of" },
      ],
      morphologyApplicable: true,
      images: [
        unsplashImage(
          "photo-1527482797690-983d3bbae1aa",
          "Water droplets forming on the outside of a cold glass.",
        ),
      ],
      imageDistractorIds: ["img-distractor-puddle", "img-distractor-snow"],
      definitionDistractors: [
        "Liquid water changing into water vapor.",
        "Water flowing downhill after rainfall.",
        "Water freezing into solid ice crystals.",
      ],
      exampleSentence: "Condensation formed on the cold window during the chilly morning.",
      clozeSentence: "Drops appeared on the mirror after a hot shower because of __________.",
      applicationQuestions: [
        makeApplicationQuestion(
          SEED_WORD_IDS.condensation,
          "Why do tiny water droplets form on a cold soda can outside?",
          [
            "Water vapor in the air cools and becomes liquid on the cold surface.",
            "Liquid water evaporates directly from inside the can.",
            "The can absorbs sunlight and melts ice.",
            "Rain falls only on metal containers.",
          ],
          0,
          "Cool surfaces cause water vapor to condense into liquid droplets.",
        ),
      ],
      commonSpellingErrors: ["condencation", "condensashun", "condenstation"],
      commonMisconceptions: [
        "Believing condensation and evaporation are the same process.",
        "Thinking clouds are made of liquid water only.",
      ],
      glossaryTranslations: [
        {
          languageCode: "es",
          term: "condensación",
          definition: "El vapor de agua se convierte en agua líquida.",
        },
        {
          languageCode: "vi",
          term: "sự ngưng tụ",
          definition: "Hơi nước chuyển thành nước lỏng.",
        },
      ],
    },
  ),
  buildDemoWord(
    {
      id: SEED_WORD_IDS.hypothesis,
      unitSlug: "scientific-investigation",
      word: "hypothesis",
      studentFriendlyDefinition: "A testable idea or prediction based on what you already know.",
      formalDefinition:
        "A proposed explanation for an observation that can be tested through investigation and evidence.",
      standardsTags: ["3-5-ETS1-1"],
      difficultyLevel: 3,
    },
    {
      pronunciationAudioUrl: null,
      syllableBreakdown: ["hy", "poth", "e", "sis"],
      phonemeSequence: ["/hh/", "/ay/", "/p/", "/aa/", "/th/", "/ah/", "/s/", "/ih/", "/s/"],
      graphemeSequence: ["h", "y", "p", "o", "t", "h", "e", "s", "i", "s"],
      prefix: "hypo-",
      baseOrRoot: "thesis",
      suffix: null,
      morphemeMeanings: [
        { part: "hypo-", type: "prefix", meaning: "under or less than" },
        { part: "thesis", type: "root", meaning: "placed or proposed idea" },
      ],
      morphologyApplicable: true,
      images: [
        svgImage(
          "img-hypothesis",
          "Hypothesis",
          "Student scientist writing a testable prediction before an experiment.",
          "#7c3aed",
        ),
      ],
      imageDistractorIds: [],
      definitionDistractors: [
        "The final answer at the end of an experiment.",
        "A random guess with no connection to observations.",
        "A list of safety rules in the lab.",
      ],
      exampleSentence: "Our hypothesis predicted that plants near the window would grow taller.",
      clozeSentence: "Before testing, we wrote a __________ about which soil would hold the most water.",
      applicationQuestions: [
        makeApplicationQuestion(
          SEED_WORD_IDS.hypothesis,
          "Which statement is the best hypothesis for an experiment on plant growth?",
          [
            "If plants receive more sunlight, then they will grow taller in two weeks.",
            "Plants are green and need water.",
            "I think plants are interesting.",
            "The experiment is finished and plants grew.",
          ],
          0,
          "A strong hypothesis is testable and includes a clear prediction.",
        ),
      ],
      commonSpellingErrors: ["hypothsis", "hypotheis", "hipothesis"],
      commonMisconceptions: [
        "Using hypothesis to mean the final conclusion.",
        "Thinking a hypothesis must always be correct.",
      ],
      glossaryTranslations: [
        {
          languageCode: "es",
          term: "hipótesis",
          definition: "Idea comprobable basada en lo que ya sabes.",
        },
        {
          languageCode: "vi",
          term: "giả thuyết",
          definition: "Ý tưởng có thể kiểm tra dựa trên những gì bạn đã biết.",
        },
      ],
    },
  ),
  buildDemoWord(
    {
      id: SEED_WORD_IDS.ecosystem,
      unitSlug: "ecosystems",
      word: "ecosystem",
      studentFriendlyDefinition: "All the living and nonliving things in an area and how they interact.",
      formalDefinition:
        "A community of living organisms interacting with each other and with the nonliving parts of their environment.",
      standardsTags: ["5-LS2-1"],
      difficultyLevel: 2,
    },
    {
      pronunciationAudioUrl: null,
      syllableBreakdown: ["e", "co", "sys", "tem"],
      phonemeSequence: ["/iy/", "/k/", "/ow/", "/s/", "/ih/", "/s/", "/t/", "/ah/", "/m/"],
      graphemeSequence: ["e", "c", "o", "s", "y", "s", "t", "e", "m"],
      prefix: null,
      baseOrRoot: "eco",
      suffix: "-system",
      morphemeMeanings: [
        { part: "eco-", type: "prefix", meaning: "house or environment" },
        { part: "system", type: "root", meaning: "a set of connected parts" },
      ],
      morphologyApplicable: true,
      images: [
        unsplashImage(
          "photo-1441974231531-c6227db76b6e",
          "Forest ecosystem with trees, plants, sunlight, and soil.",
        ),
      ],
      imageDistractorIds: ["img-distractor-desert", "img-distractor-ocean-floor"],
      definitionDistractors: [
        "Only the animals living in one habitat.",
        "A single food chain with no plants.",
        "A human-built machine used in science class.",
      ],
      exampleSentence: "The pond ecosystem includes fish, plants, insects, water, and sunlight.",
      clozeSentence: "When one species disappears, the whole __________ can be affected.",
      applicationQuestions: [
        makeApplicationQuestion(
          SEED_WORD_IDS.ecosystem,
          "Which example best describes an ecosystem?",
          [
            "A wetland with frogs, cattails, water, soil, and sunlight interacting",
            "One deer eating grass with no other parts of the environment",
            "A plastic bottle floating alone in space",
            "A dictionary definition of the word environment",
          ],
          0,
            "An ecosystem includes living and nonliving parts interacting in an area.",
        ),
      ],
      commonSpellingErrors: ["ecosytem", "echosystem", "ecosystme"],
      commonMisconceptions: [
        "Thinking ecosystems include only living things.",
        "Confusing ecosystem with habitat alone.",
      ],
      glossaryTranslations: [
        {
          languageCode: "es",
          term: "ecosistema",
          definition: "Seres vivos y no vivos en un área y cómo interactúan.",
        },
        {
          languageCode: "vi",
          term: "hệ sinh thái",
          definition: "Các yếu tố sống và phi sinh trong một khu vực và cách chúng tương tác.",
        },
      ],
    },
  ),
  buildDemoWord(
    {
      id: SEED_WORD_IDS.force,
      unitSlug: "force-and-motion",
      word: "force",
      studentFriendlyDefinition: "A push or a pull that can change how an object moves.",
      formalDefinition:
        "An interaction that, when unbalanced, can cause an object to start moving, stop, speed up, slow down, or change direction.",
      standardsTags: ["5-PS2-1"],
      difficultyLevel: 2,
    },
    {
      pronunciationAudioUrl: null,
      syllableBreakdown: ["force"],
      phonemeSequence: ["/f/", "/ao/", "/r/", "/s/"],
      graphemeSequence: ["f", "o", "r", "c", "e"],
      prefix: null,
      baseOrRoot: "force",
      suffix: null,
      morphemeMeanings: [{ part: "force", type: "base", meaning: "strength or push/pull" }],
      morphologyApplicable: false,
      images: [
        unsplashImage(
          "photo-1530026405186-ed1f139313f8",
          "Hands pushing a wooden block across a table demonstrating force.",
        ),
      ],
      imageDistractorIds: ["img-distractor-magnet-only"],
      definitionDistractors: [
        "The distance an object travels in one hour.",
        "The amount of matter in an object.",
        "A type of weather event with strong winds only.",
      ],
      exampleSentence: "A stronger force made the cart roll farther across the floor.",
      clozeSentence: "When you kick a soccer ball, you apply a __________ to it.",
      applicationQuestions: [
        makeApplicationQuestion(
          SEED_WORD_IDS.force,
          "Which action applies a force to a book on a desk?",
          [
            "Pushing the book to slide it across the desk",
            "Measuring the book with a ruler only",
            "Reading the title printed on the cover",
            "Coloring a picture of the book",
          ],
          0,
          "A push can change an object's motion, which means a force was applied.",
        ),
      ],
      commonSpellingErrors: ["forse", "froce", "forcee"],
      commonMisconceptions: [
        "Thinking force and speed mean the same thing.",
        "Believing forces only work when objects touch.",
      ],
      glossaryTranslations: [
        {
          languageCode: "es",
          term: "fuerza",
          definition: "Empuje o jalón que puede cambiar el movimiento.",
        },
        {
          languageCode: "vi",
          term: "lực",
          definition: "Đẩy hoặc kéo có thể làm thay đổi chuyển động.",
        },
      ],
    },
  ),
  buildDemoWord(
    {
      id: SEED_WORD_IDS.atom,
      unitSlug: "matter",
      word: "atom",
      studentFriendlyDefinition: "The smallest unit of matter that keeps the properties of an element.",
      formalDefinition:
        "The basic unit of a chemical element, consisting of a nucleus and electrons, that retains the identity of that element.",
      standardsTags: ["5-PS1-1"],
      difficultyLevel: 2,
    },
    {
      pronunciationAudioUrl: null,
      syllableBreakdown: ["at", "om"],
      phonemeSequence: ["/ae/", "/t/", "/ah/", "/m/"],
      graphemeSequence: ["a", "t", "o", "m"],
      prefix: null,
      baseOrRoot: "atom",
      suffix: null,
      morphemeMeanings: [
        { part: "a-", type: "prefix", meaning: "not" },
        { part: "tom", type: "root", meaning: "cut (cannot be cut further)" },
      ],
      morphologyApplicable: true,
      images: [
        svgImage(
          "img-atom",
          "Atom model",
          "Simple diagram of an atom with a nucleus and orbiting electrons.",
          "#0284c7",
        ),
      ],
      imageDistractorIds: ["img-distractor-molecule", "img-distractor-rock"],
      definitionDistractors: [
        "A large chunk of rock made of many minerals.",
        "Two or more atoms bonded together.",
        "Any object you can see without a microscope.",
      ],
      exampleSentence: "Every element is made of one type of atom.",
      clozeSentence: "An __________ is the basic building block of an element.",
      applicationQuestions: [
        makeApplicationQuestion(
          SEED_WORD_IDS.atom,
          "Which statement correctly describes an atom?",
          [
            "It is the smallest unit of an element that still behaves like that element.",
            "It is always visible without tools.",
            "It is the same as a mixture of many substances.",
            "It only exists in gases, not solids or liquids.",
          ],
          0,
          "Atoms are the fundamental units of elements in matter.",
        ),
      ],
      commonSpellingErrors: ["attom", "adom", "atim"],
      commonMisconceptions: [
        "Confusing atoms with molecules.",
        "Thinking atoms look like large balls you could hold.",
      ],
      glossaryTranslations: [
        {
          languageCode: "es",
          term: "átomo",
          definition: "Unidad más pequeña de un elemento.",
        },
        {
          languageCode: "vi",
          term: "nguyên tử",
          definition: "Đơn vị nhỏ nhất của một nguyên tố.",
        },
      ],
    },
  ),
];

const PLACEHOLDER_WORD_CONFIGS: WordSeedConfig[] = [
  {
    id: SEED_WORD_IDS.molecule,
    unitSlug: "matter",
    word: "molecule",
    studentFriendlyDefinition: "Two or more atoms bonded together.",
    formalDefinition: "A group of two or more atoms held together by chemical bonds.",
    standardsTags: ["5-PS1-1"],
  },
  {
    id: SEED_WORD_IDS.mixture,
    unitSlug: "matter",
    word: "mixture",
    studentFriendlyDefinition: "Two or more substances combined but not chemically bonded.",
    formalDefinition:
      "A combination of two or more substances that retain their individual properties and can often be separated physically.",
    standardsTags: ["5-PS1-4"],
  },
  {
    id: SEED_WORD_IDS.solution,
    unitSlug: "matter",
    word: "solution",
    studentFriendlyDefinition: "A mixture where one substance dissolves evenly in another.",
    formalDefinition:
      "A homogeneous mixture in which one substance (the solute) is dissolved in another substance (the solvent).",
    standardsTags: ["5-PS1-4"],
  },
  {
    id: SEED_WORD_IDS.physicalProperty,
    unitSlug: "matter",
    word: "physical property",
    studentFriendlyDefinition: "A feature you can observe without changing what the substance is.",
    formalDefinition:
      "A characteristic of matter that can be observed or measured without changing the identity of the substance.",
    standardsTags: ["5-PS1-3"],
    difficultyLevel: 3,
  },
  {
    id: SEED_WORD_IDS.chemicalProperty,
    unitSlug: "matter",
    word: "chemical property",
    studentFriendlyDefinition: "A feature that describes how a substance reacts to form something new.",
    formalDefinition:
      "A characteristic that describes how a substance changes into a different substance during a chemical reaction.",
    standardsTags: ["5-PS1-4"],
    difficultyLevel: 3,
  },
  {
    id: SEED_WORD_IDS.mass,
    unitSlug: "matter",
    word: "mass",
    studentFriendlyDefinition: "The amount of matter in an object.",
    formalDefinition: "A measure of the amount of matter in an object, often measured in grams or kilograms.",
    standardsTags: ["5-PS1-2"],
  },
  {
    id: SEED_WORD_IDS.volume,
    unitSlug: "matter",
    word: "volume",
    studentFriendlyDefinition: "The amount of space an object or substance takes up.",
    formalDefinition: "The measure of the three-dimensional space occupied by matter.",
    standardsTags: ["5-PS1-2"],
  },
  {
    id: SEED_WORD_IDS.density,
    unitSlug: "matter",
    word: "density",
    studentFriendlyDefinition: "How much mass is packed into a given volume.",
    formalDefinition: "The mass of a substance per unit volume, often expressed as grams per cubic centimeter.",
    standardsTags: ["5-PS1-2"],
    difficultyLevel: 3,
  },
  {
    id: SEED_WORD_IDS.gravity,
    unitSlug: "force-and-motion",
    word: "gravity",
    studentFriendlyDefinition: "A force that pulls objects toward each other.",
    formalDefinition:
      "An attractive force between objects with mass; on Earth, gravity pulls objects toward the planet's center.",
    standardsTags: ["5-PS2-1"],
  },
  {
    id: SEED_WORD_IDS.friction,
    unitSlug: "force-and-motion",
    word: "friction",
    studentFriendlyDefinition: "A force that resists motion when surfaces rub together.",
    formalDefinition:
      "A contact force that opposes the relative motion of two surfaces sliding against each other.",
    standardsTags: ["5-PS2-1"],
  },
  {
    id: SEED_WORD_IDS.motion,
    unitSlug: "force-and-motion",
    word: "motion",
    studentFriendlyDefinition: "A change in an object's position over time.",
    formalDefinition: "The change in position of an object as observed relative to a reference point over time.",
    standardsTags: ["5-PS2-1"],
  },
  {
    id: SEED_WORD_IDS.speed,
    unitSlug: "force-and-motion",
    word: "speed",
    studentFriendlyDefinition: "How fast an object moves over a distance.",
    formalDefinition: "The distance traveled by an object divided by the time taken to travel that distance.",
    standardsTags: ["5-PS2-1"],
  },
  {
    id: SEED_WORD_IDS.balancedForce,
    unitSlug: "force-and-motion",
    word: "balanced force",
    studentFriendlyDefinition: "Forces that are equal and opposite so motion does not change.",
    formalDefinition:
      "Forces acting on an object that are equal in size and opposite in direction, resulting in no change in motion.",
    standardsTags: ["5-PS2-1"],
    difficultyLevel: 3,
  },
  {
    id: SEED_WORD_IDS.unbalancedForce,
    unitSlug: "force-and-motion",
    word: "unbalanced force",
    studentFriendlyDefinition: "Forces that are not equal, causing a change in motion.",
    formalDefinition:
      "Forces acting on an object that do not cancel out, causing the object to accelerate or change direction.",
    standardsTags: ["5-PS2-1"],
    difficultyLevel: 3,
  },
  {
    id: SEED_WORD_IDS.weathering,
    unitSlug: "earth-science",
    word: "weathering",
    studentFriendlyDefinition: "The breaking down of rocks and minerals at Earth's surface.",
    formalDefinition:
      "The physical or chemical breakdown of rocks and minerals at or near Earth's surface.",
    standardsTags: ["5-ESS2-1"],
  },
  {
    id: SEED_WORD_IDS.erosion,
    unitSlug: "earth-science",
    word: "erosion",
    studentFriendlyDefinition: "The movement of weathered rock and soil from one place to another.",
    formalDefinition:
      "The process by which weathered materials are transported by agents such as water, wind, or ice.",
    standardsTags: ["5-ESS2-1"],
  },
  {
    id: SEED_WORD_IDS.deposition,
    unitSlug: "earth-science",
    word: "deposition",
    studentFriendlyDefinition: "The dropping of sediments in a new location.",
    formalDefinition:
      "The geological process in which eroded materials are laid down or deposited in a new location.",
    standardsTags: ["5-ESS2-1"],
  },
  {
    id: SEED_WORD_IDS.sediment,
    unitSlug: "earth-science",
    word: "sediment",
    studentFriendlyDefinition: "Small pieces of rock, soil, and organic material moved by water or wind.",
    formalDefinition:
      "Solid material that is transported and deposited by water, wind, ice, or gravity.",
    standardsTags: ["5-ESS2-1"],
  },
  {
    id: SEED_WORD_IDS.fossil,
    unitSlug: "earth-science",
    word: "fossil",
    studentFriendlyDefinition: "Preserved remains or traces of ancient living things.",
    formalDefinition:
      "The preserved remains, impressions, or traces of organisms from past geologic ages.",
    standardsTags: ["5-ESS2-1"],
  },
  {
    id: SEED_WORD_IDS.landform,
    unitSlug: "earth-science",
    word: "landform",
    studentFriendlyDefinition: "A natural feature on Earth's surface such as a mountain or valley.",
    formalDefinition:
      "A natural feature of Earth's solid surface such as a mountain, plateau, or valley.",
    standardsTags: ["5-ESS2-1"],
  },
  {
    id: SEED_WORD_IDS.plate,
    unitSlug: "earth-science",
    word: "plate",
    studentFriendlyDefinition: "A large section of Earth's crust that moves slowly.",
    formalDefinition:
      "A large, rigid slab of solid rock that makes up part of Earth's lithosphere and moves over the asthenosphere.",
    standardsTags: ["5-ESS2-1"],
  },
  {
    id: SEED_WORD_IDS.precipitation,
    unitSlug: "water-cycle",
    word: "precipitation",
    studentFriendlyDefinition: "Water falling from clouds as rain, snow, sleet, or hail.",
    formalDefinition:
      "Any form of water, liquid or solid, that falls from clouds and reaches the ground.",
    standardsTags: ["5-ESS2-1"],
  },
  {
    id: SEED_WORD_IDS.collection,
    unitSlug: "water-cycle",
    word: "collection",
    studentFriendlyDefinition: "Water gathering in oceans, lakes, rivers, and other bodies of water.",
    formalDefinition:
      "The stage of the water cycle in which water accumulates in bodies such as oceans, lakes, and rivers.",
    standardsTags: ["5-ESS2-1"],
  },
  {
    id: SEED_WORD_IDS.runoff,
    unitSlug: "water-cycle",
    word: "runoff",
    studentFriendlyDefinition: "Water that flows over the land into streams and rivers.",
    formalDefinition:
      "Water from precipitation or meltwater that flows over the land surface rather than soaking into the ground.",
    standardsTags: ["5-ESS2-1"],
  },
  {
    id: SEED_WORD_IDS.waterVapor,
    unitSlug: "water-cycle",
    word: "water vapor",
    studentFriendlyDefinition: "Water in gas form in the air.",
    formalDefinition: "Water in its gaseous state, present in the atmosphere and invisible to the eye.",
    standardsTags: ["5-ESS2-1"],
  },
  {
    id: SEED_WORD_IDS.producer,
    unitSlug: "ecosystems",
    word: "producer",
    studentFriendlyDefinition: "An organism that makes its own food, usually using sunlight.",
    formalDefinition:
      "An organism, typically a plant or alga, that produces its own food through photosynthesis or chemosynthesis.",
    standardsTags: ["5-LS2-1"],
  },
  {
    id: SEED_WORD_IDS.consumer,
    unitSlug: "ecosystems",
    word: "consumer",
    studentFriendlyDefinition: "An organism that eats other organisms for energy.",
    formalDefinition:
      "An organism that obtains energy by feeding on other organisms or organic matter.",
    standardsTags: ["5-LS2-1"],
  },
  {
    id: SEED_WORD_IDS.decomposer,
    unitSlug: "ecosystems",
    word: "decomposer",
    studentFriendlyDefinition: "An organism that breaks down dead material and returns nutrients to the soil.",
    formalDefinition:
      "An organism that breaks down dead organic matter, recycling nutrients into the ecosystem.",
    standardsTags: ["5-LS2-1"],
  },
  {
    id: SEED_WORD_IDS.habitat,
    unitSlug: "ecosystems",
    word: "habitat",
    studentFriendlyDefinition: "The place where an organism lives and gets what it needs.",
    formalDefinition:
      "The natural environment where an organism lives, including food, water, shelter, and space.",
    standardsTags: ["5-LS2-1"],
  },
  {
    id: SEED_WORD_IDS.adaptation,
    unitSlug: "ecosystems",
    word: "adaptation",
    studentFriendlyDefinition: "A trait that helps an organism survive in its environment.",
    formalDefinition:
      "A heritable trait or behavior that increases an organism's fitness in a specific environment.",
    standardsTags: ["5-LS2-1"],
  },
  {
    id: SEED_WORD_IDS.foodChain,
    unitSlug: "ecosystems",
    word: "food chain",
    studentFriendlyDefinition: "A sequence showing how energy passes from one organism to another.",
    formalDefinition:
      "A linear sequence of organisms through which energy and nutrients pass as one organism eats another.",
    standardsTags: ["5-LS2-1"],
    difficultyLevel: 3,
  },
  {
    id: SEED_WORD_IDS.foodWeb,
    unitSlug: "ecosystems",
    word: "food web",
    studentFriendlyDefinition: "Many connected food chains in an ecosystem.",
    formalDefinition:
      "A network of interconnected food chains showing multiple feeding relationships in an ecosystem.",
    standardsTags: ["5-LS2-1"],
    difficultyLevel: 3,
  },
  {
    id: SEED_WORD_IDS.variable,
    unitSlug: "scientific-investigation",
    word: "variable",
    studentFriendlyDefinition: "Something that can change in an experiment.",
    formalDefinition:
      "A factor, property, or condition that can be changed or measured in a scientific investigation.",
    standardsTags: ["3-5-ETS1-1"],
  },
  {
    id: SEED_WORD_IDS.control,
    unitSlug: "scientific-investigation",
    word: "control",
    studentFriendlyDefinition: "The part of an experiment kept the same for comparison.",
    formalDefinition:
      "The standard or reference condition in an experiment that is not changed so results can be compared.",
    standardsTags: ["3-5-ETS1-1"],
  },
  {
    id: SEED_WORD_IDS.investigation,
    unitSlug: "scientific-investigation",
    word: "investigation",
    studentFriendlyDefinition: "A careful search for evidence to answer a science question.",
    formalDefinition:
      "A systematic process of gathering and analyzing evidence to answer a question or test a hypothesis.",
    standardsTags: ["3-5-ETS1-1"],
  },
  {
    id: SEED_WORD_IDS.observation,
    unitSlug: "scientific-investigation",
    word: "observation",
    studentFriendlyDefinition: "Information gathered using the senses or tools.",
    formalDefinition:
      "Data collected through careful watching, measuring, or monitoring using senses or instruments.",
    standardsTags: ["3-5-ETS1-1"],
  },
  {
    id: SEED_WORD_IDS.inference,
    unitSlug: "scientific-investigation",
    word: "inference",
    studentFriendlyDefinition: "An explanation based on observations and prior knowledge.",
    formalDefinition:
      "A logical interpretation of observations that is not directly seen but supported by evidence.",
    standardsTags: ["3-5-ETS1-1"],
  },
  {
    id: SEED_WORD_IDS.evidence,
    unitSlug: "scientific-investigation",
    word: "evidence",
    studentFriendlyDefinition: "Information that supports or disproves an idea.",
    formalDefinition:
      "Data or observations used to support or refute a claim, hypothesis, or conclusion.",
    standardsTags: ["3-5-ETS1-1"],
  },
  {
    id: SEED_WORD_IDS.model,
    unitSlug: "scientific-investigation",
    word: "model",
    studentFriendlyDefinition: "A representation used to explain or test how something works.",
    formalDefinition:
      "A simplified representation of a system or phenomenon used to explain, predict, or investigate ideas.",
    standardsTags: ["3-5-ETS1-2"],
  },
  {
    id: SEED_WORD_IDS.data,
    unitSlug: "scientific-investigation",
    word: "data",
    studentFriendlyDefinition: "Information collected during an investigation.",
    formalDefinition:
      "Facts, measurements, or observations recorded during a scientific investigation.",
    standardsTags: ["3-5-ETS1-3"],
  },
  {
    id: SEED_WORD_IDS.conclusion,
    unitSlug: "scientific-investigation",
    word: "conclusion",
    studentFriendlyDefinition: "A summary of what the evidence shows about the question tested.",
    formalDefinition:
      "A statement that interprets the results of an investigation in light of the hypothesis and evidence.",
    standardsTags: ["3-5-ETS1-3"],
  },
];

export const SEED_VOCABULARY: VocabularyWord[] = [
  ...DEMO_WORDS,
  ...PLACEHOLDER_WORD_CONFIGS.map(buildPlaceholderWord),
];

export function getVocabularyWordId(word: string): string | undefined {
  return SEED_VOCABULARY.find((entry) => entry.word.toLowerCase() === word.toLowerCase())?.id;
}

export function getApplicationQuestions(): ApplicationQuestion[] {
  return SEED_VOCABULARY.flatMap((word) => word.applicationQuestions);
}
