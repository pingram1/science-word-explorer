export type SpeechSpeed = "normal" | "slow";

/** Conversational pacing. Rate 1.0 on most engines sounds clipped and synthetic. */
export const SPEECH_PROSODY: Record<SpeechSpeed, { rate: number; pitch: number }> = {
  normal: { rate: 0.94, pitch: 1 },
  slow: { rate: 0.78, pitch: 1 },
};

const NOVELTY_VOICE =
  /zarvox|whisper|trinoids|boing|bells|bubbles|cellos|bad news|good news|deranged|hysterical|pipe organ|\balbert\b|bahh|\bfred\b|junior|kathy|princess|ralph|superstar|wobble|organ|robot|dummy|compact|espeak|festival|mbrola|agnes|bruce|grandma|grandpa|jester/i;

const NEURAL_VOICE =
  /neural|natural|premium|enhanced|online|wavenet|studio|journey|super-?natural|neural2|generative/i;

const PREFERRED_VOICE =
  /aria|jenny|google us english|samantha|nicky|allison|ava|zoe|evan|karen|moira|tessa|serena|fiona|sonia|davis|guy|ryan|michelle|sara|emma|siri/i;

export interface VoiceLike {
  name: string;
  lang: string;
  localService: boolean;
  default?: boolean;
  voiceURI?: string;
}

export function scoreNaturalVoice(voice: VoiceLike): number {
  const name = voice.name.toLowerCase();
  const lang = voice.lang.toLowerCase().replace("_", "-");
  let score = 0;

  if (!lang.startsWith("en")) {
    return -1000;
  }

  if (lang.startsWith("en-us")) score += 30;
  else if (lang.startsWith("en-gb")) score += 22;
  else if (lang.startsWith("en-au")) score += 18;
  else score += 10;

  if (NOVELTY_VOICE.test(name)) score -= 500;
  if (NEURAL_VOICE.test(name)) score += 80;
  if (PREFERRED_VOICE.test(name)) score += 35;

  // Cloud / online engines are usually neural. Local SAPI/eSpeak often is not.
  if (!voice.localService) score += 25;

  if (/\b(david|zira|mark)\b/.test(name) && !NEURAL_VOICE.test(name)) {
    score -= 40;
  }

  return score;
}

export function pickNaturalVoice<T extends VoiceLike>(voices: readonly T[]): T | null {
  if (voices.length === 0) return null;

  let best: T | null = null;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const voice of voices) {
    const score = scoreNaturalVoice(voice);
    if (score > bestScore) {
      best = voice;
      bestScore = score;
    }
  }

  if (!best || bestScore <= -1000) {
    return voices.find((voice) => voice.lang.toLowerCase().startsWith("en")) ?? null;
  }

  return best;
}

export function applyNaturalVoice(
  utterance: SpeechSynthesisUtterance,
  voices: readonly SpeechSynthesisVoice[],
  speed: SpeechSpeed,
): SpeechSynthesisVoice | null {
  const voice = pickNaturalVoice(voices);
  const prosody = SPEECH_PROSODY[speed];

  utterance.rate = prosody.rate;
  utterance.pitch = prosody.pitch;
  utterance.volume = 1;
  utterance.lang = voice?.lang || "en-US";

  if (voice) {
    utterance.voice = voice;
  }

  return voice;
}

export function loadVoices(
  synth: Pick<SpeechSynthesis, "getVoices"> & {
    addEventListener: SpeechSynthesis["addEventListener"];
    removeEventListener: SpeechSynthesis["removeEventListener"];
  } = window.speechSynthesis,
): Promise<SpeechSynthesisVoice[]> {
  const existing = synth.getVoices();
  if (existing.length > 0) {
    return Promise.resolve(existing);
  }

  return new Promise((resolve) => {
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      synth.removeEventListener("voiceschanged", onChange);
      resolve(synth.getVoices());
    };

    const onChange = () => finish();
    synth.addEventListener("voiceschanged", onChange);
    window.setTimeout(finish, 1500);
  });
}
