import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

// Smoke test for the runner itself (T001). It asserts the two things the
// clinical suites depend on: the @/* alias resolves, and tests run without a
// DOM so pure logic can't accidentally lean on browser globals.
describe("vitest setup", () => {
  it("resolves the @/* alias into src", () => {
    // twMerge keeps the last of two conflicting utilities — proves clsx and
    // tailwind-merge resolved too, not just the module path.
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("runs in a DOM-free environment", () => {
    expect(typeof window).toBe("undefined");
  });
});
