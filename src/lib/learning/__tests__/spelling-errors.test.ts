import { describe, expect, it } from "vitest";
import {
  classifyPhonemeOrderErrors,
  classifySpellingErrors,
} from "@/lib/learning/spelling-errors";

describe("classifySpellingErrors", () => {
  it("returns no errors for an exact match", () => {
    const result = classifySpellingErrors({
      expected: "evaporation",
      actual: "evaporation",
    });

    expect(result.errors).toEqual([]);
  });

  it("classifies omission errors", () => {
    const result = classifySpellingErrors({
      expected: "evaporation",
      actual: "evapration",
    });

    expect(result.errors).toContain("omission");
  });

  it("classifies insertion errors", () => {
    const result = classifySpellingErrors({
      expected: "evaporation",
      actual: "evaporaation",
    });

    expect(result.errors).toContain("insertion");
  });

  it("classifies substitution errors", () => {
    const result = classifySpellingErrors({
      expected: "evaporation",
      actual: "evaperation",
    });

    expect(result.errors).toContain("substitution");
  });

  it("classifies transposition errors", () => {
    const result = classifySpellingErrors({
      expected: "form",
      actual: "from",
    });

    expect(result.errors).toContain("transposition");
  });

  it("returns no_response for empty input", () => {
    const result = classifySpellingErrors({
      expected: "evaporation",
      actual: "   ",
    });

    expect(result.errors).toEqual(["no_response"]);
  });

  it("detects morpheme-related suffix errors", () => {
    const result = classifySpellingErrors({
      expected: "evaporation",
      actual: "evapor",
      morphemes: [{ part: "ation", type: "suffix" }],
    });

    expect(result.errors).toContain("suffix_error");
  });

  it("is case and whitespace insensitive", () => {
    const result = classifySpellingErrors({
      expected: "Evaporation",
      actual: "  EVAPORATION  ",
    });

    expect(result.errors).toEqual([]);
  });
});

describe("classifyPhonemeOrderErrors", () => {
  it("returns no_response when no sounds are selected", () => {
    const result = classifyPhonemeOrderErrors(["/a/", "/b/"], []);

    expect(result.errors).toEqual(["no_response"]);
  });

  it("flags incorrect sound order for mismatched sequences", () => {
    const result = classifyPhonemeOrderErrors(["/a/", "/b/", "/c/"], ["/a/", "/c/", "/b/"]);

    expect(result.errors).toContain("incorrect_sound_order");
  });
});
