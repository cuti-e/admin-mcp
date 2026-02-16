import { describe, it, expect } from "vitest";
import { hasCredentials, skipReason, createTestClient } from "./setup.js";

describe.skipIf(!hasCredentials)("E2E: Analytics", () => {
  it("should return conversation stats", async () => {
    const { client } = createTestClient();
    const result = await client.get("/v1/analytics/conversation-stats");
    expect(result).toBeDefined();
  });

  it("should return conversation stats with days filter", async () => {
    const { client } = createTestClient();
    const result = await client.get("/v1/analytics/conversation-stats", { days: 7 });
    expect(result).toBeDefined();
  });

  it("should return response times", async () => {
    const { client } = createTestClient();
    const result = await client.get("/v1/analytics/response-times");
    expect(result).toBeDefined();
  });

  if (!hasCredentials) {
    it.skip(skipReason, () => {});
  }
});
