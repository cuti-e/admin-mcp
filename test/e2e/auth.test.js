import { describe, it, expect } from "vitest";
import { hasCredentials, skipReason, createTestClient } from "./setup.js";

describe.skipIf(!hasCredentials)("E2E: Auth", () => {
  it("should exchange client credentials for an access token", async () => {
    const { tokenManager } = createTestClient();
    const token = await tokenManager.getToken();
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");
    expect(token.startsWith("cutie_at_")).toBe(true);
  });

  it("should return cached token on subsequent calls", async () => {
    const { tokenManager } = createTestClient();
    const first = await tokenManager.getToken();
    const second = await tokenManager.getToken();
    expect(first).toBe(second);
  });

  it("should get a fresh token via forceRefresh", async () => {
    const { tokenManager } = createTestClient();
    await tokenManager.getToken();
    const refreshed = await tokenManager.forceRefresh();
    expect(refreshed).toBeDefined();
    expect(typeof refreshed).toBe("string");
    expect(refreshed.startsWith("cutie_at_")).toBe(true);
  });

  if (!hasCredentials) {
    it.skip(skipReason, () => {});
  }
});
