import { describe, expect, it } from "vitest";
import {
  pickNaturalVoice,
  scoreNaturalVoice,
  SPEECH_PROSODY,
  type VoiceLike,
} from "@/lib/speech/natural-voice";

function voice(partial: Partial<VoiceLike> & Pick<VoiceLike, "name">): VoiceLike {
  return {
    lang: "en-US",
    localService: true,
    default: false,
    ...partial,
  };
}

describe("scoreNaturalVoice", () => {
  it("rejects non-English voices", () => {
    expect(scoreNaturalVoice(voice({ name: "Neural Spanish", lang: "es-ES" }))).toBeLessThan(0);
  });

  it("scores neural English voices far above novelty voices", () => {
    const aria = scoreNaturalVoice(
      voice({
        name: "Microsoft Aria Online (Natural) - English (United States)",
        localService: false,
      }),
    );
    const zarvox = scoreNaturalVoice(voice({ name: "Zarvox", lang: "en-US" }));
    expect(aria).toBeGreaterThan(zarvox + 100);
  });

  it("prefers Google US English over classic Windows desktop voices", () => {
    const google = scoreNaturalVoice(voice({ name: "Google US English", localService: false }));
    const zira = scoreNaturalVoice(voice({ name: "Microsoft Zira Desktop", localService: true }));
    expect(google).toBeGreaterThan(zira);
  });
});

describe("pickNaturalVoice", () => {
  it("returns null for an empty list", () => {
    expect(pickNaturalVoice([])).toBeNull();
  });

  it("picks a neural English voice over the default robotic one", () => {
    const defaultVoice = voice({ name: "Microsoft David Desktop", default: true });
    const neural = voice({
      name: "Microsoft Jenny Online (Natural) - English (United States)",
      localService: false,
    });
    const novelty = voice({ name: "Bad News" });

    expect(pickNaturalVoice([defaultVoice, novelty, neural])).toEqual(neural);
  });

  it("prefers Samantha Enhanced over compact novelty voices on Apple", () => {
    const samantha = voice({ name: "Samantha (Enhanced)" });
    const compact = voice({ name: "Samantha Compact" });
    const bells = voice({ name: "Bells" });

    expect(pickNaturalVoice([bells, compact, samantha])).toEqual(samantha);
  });

  it("falls back to any English voice when nothing scores well", () => {
    const french = voice({ name: "Thomas", lang: "fr-FR" });
    const english = voice({ name: "Unknown English", lang: "en-GB" });

    expect(pickNaturalVoice([french, english])).toEqual(english);
  });
});

describe("SPEECH_PROSODY", () => {
  it("uses slightly slower than 1.0 so speech does not sound clipped", () => {
    expect(SPEECH_PROSODY.normal.rate).toBeLessThan(1);
    expect(SPEECH_PROSODY.slow.rate).toBeLessThan(SPEECH_PROSODY.normal.rate);
    expect(SPEECH_PROSODY.normal.pitch).toBe(1);
  });
});
