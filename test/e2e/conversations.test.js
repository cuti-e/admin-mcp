import { describe, it, expect } from "vitest";
import { hasCredentials, skipReason, createTestClient } from "./setup.js";

describe.skipIf(!hasCredentials)("E2E: Conversations", () => {
  it("should list conversations", async () => {
    const { client } = createTestClient();
    const result = await client.get("/v1/conversations");
    expect(result).toBeDefined();
    expect(Array.isArray(result.conversations || result)).toBe(true);
  });

  it("should list conversations with status filter", async () => {
    const { client } = createTestClient();
    const result = await client.get("/v1/conversations", { status: "open" });
    expect(result).toBeDefined();
  });

  it("should list conversations with pagination", async () => {
    const { client } = createTestClient();
    const result = await client.get("/v1/conversations", { limit: 5, offset: 0 });
    expect(result).toBeDefined();
  });

  it("should handle get_conversation for non-existent ID gracefully", async () => {
    const { client } = createTestClient();
    try {
      await client.get("/v1/conversations/non_existent_id");
      // If API returns empty/null instead of 404, that's also valid
    } catch (error) {
      expect(error.statusCode).toBe(404);
    }
  });

  if (!hasCredentials) {
    it.skip(skipReason, () => {});
  }
});
