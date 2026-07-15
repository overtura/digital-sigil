import { describe, expect, it } from "vitest";
import { getPngSpec } from "../../src/export/exportImage";

describe("PNG export modes", () => {
  it("keeps transparent and poster output distinct", () => {
    expect(getPngSpec("transparent", "ivory-ink")).toEqual({
      size: 1600,
      padding: 0,
      background: null,
    });
    expect(getPngSpec("poster", "ivory-ink")).toEqual({
      size: 2400,
      padding: 180,
      background: "#f4efdf",
    });
  });
});
