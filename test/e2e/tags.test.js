import { describe, it, expect } from "vitest";
import { hasCredentials, skipReason, createTestClient } from "./setup.js";

describe.skipIf(!hasCredentials)("E2E: Tags", () => {
  it("should list all tags", async () => {
    const { client } = createTestClient();
    const result = await client.get("/v1/tags");
    expect(result).toBeDefined();
    expect(Array.isArray(result.tags || result)).toBe(true);
  });

  if (!hasCredentials) {
    it.skip(skipReason, () => {});
  }
});
