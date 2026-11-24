import { describe, expect, test } from "bun:test";
import { matchDocumentVersion, normalizeDocumentVersion } from "./mirror";

describe("normalizeDocumentVersion", () => {
  test("pads integers and short forms to MAJOR.MINOR", () => {
    expect(normalizeDocumentVersion("1")).toBe("1.00");
    expect(normalizeDocumentVersion("3")).toBe("3.00");
    expect(normalizeDocumentVersion("3.0")).toBe("3.00");
    expect(normalizeDocumentVersion("3.00")).toBe("3.00");
  });

  test("strips v prefix and whitespace", () => {
    expect(normalizeDocumentVersion("v3")).toBe("3.00");
    expect(normalizeDocumentVersion("  V4.0 ")).toBe("4.00");
  });

  test("rejects non-numeric input", () => {
    expect(() => normalizeDocumentVersion("")).toThrow(/Invalid document version/);
    expect(() => normalizeDocumentVersion("latest")).toThrow(/Invalid document version/);
  });
});

describe("matchDocumentVersion", () => {
  test("matches across equivalent spellings", () => {
    expect(matchDocumentVersion("1", "1.00")).toBe(true);
    expect(matchDocumentVersion("3.0", "3.00")).toBe(true);
    expect(matchDocumentVersion("v4", "4.00")).toBe(true);
  });

  test("rejects different versions without throwing", () => {
    expect(matchDocumentVersion("1.00", "3.00")).toBe(false);
    expect(matchDocumentVersion("bogus", "1.00")).toBe(false);
  });
});
