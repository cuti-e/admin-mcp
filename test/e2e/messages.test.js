import { describe, it, expect } from "vitest";
import { hasCredentials, skipReason, createTestClient } from "./setup.js";

describe.skipIf(!hasCredentials)("E2E: Messages", () => {
  it("should handle list_messages for non-existent conversation", async () => {
    const { client } = createTestClient();
    try {
      await client.get("/v1/conversations/non_existent_id/messages");
    } catch (error) {
      expect(error.statusCode).toBe(404);
    }
  });

  if (!hasCredentials) {
    it.skip(skipReason, () => {});
  }
});
