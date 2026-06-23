import { describe, expect, it } from "vitest";
import { config } from "../middleware";

describe("middleware matcher config", () => {
  it("defines the expected matcher exclusion pattern", () => {
    expect(config.matcher).toHaveLength(1);
    const pattern = config.matcher[0];

    expect(pattern).toContain("_next/static");
    expect(pattern).toContain("_next/image");
    expect(pattern).toContain("favicon.ico");
    expect(pattern).toContain("svg|png|jpg|jpeg|gif|webp");
  });
});
