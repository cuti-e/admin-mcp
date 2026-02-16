import { describe, it, expect, vi } from "vitest";
import { handleAnalyticsTool } from "../src/tools/analytics.js";

function mockClient() {
  return {
    get: vi.fn().mockResolvedValue({ ok: true }),
  };
}

describe("handleAnalyticsTool", () => {
  describe("get_conversation_stats", () => {
    it("should call GET with no params by default", async () => {
      const client = mockClient();
      await handleAnalyticsTool("get_conversation_stats", {}, client);
      expect(client.get).toHaveBeenCalledWith(
        "/v1/analytics/conversation-stats",
        {}
      );
    });

    it("should pass days param", async () => {
      const client = mockClient();
      await handleAnalyticsTool("get_conversation_stats", { days: 7 }, client);
      expect(client.get).toHaveBeenCalledWith(
        "/v1/analytics/conversation-stats",
        { days: 7 }
      );
    });
  });

  describe("get_response_times", () => {
    it("should call GET with no params by default", async () => {
      const client = mockClient();
      await handleAnalyticsTool("get_response_times", {}, client);
      expect(client.get).toHaveBeenCalledWith(
        "/v1/analytics/response-times",
        {}
      );
    });

    it("should pass days param", async () => {
      const client = mockClient();
      await handleAnalyticsTool("get_response_times", { days: 90 }, client);
      expect(client.get).toHaveBeenCalledWith(
        "/v1/analytics/response-times",
        { days: 90 }
      );
    });
  });

  it("should throw on unknown tool", async () => {
    const client = mockClient();
    await expect(
      handleAnalyticsTool("unknown_tool", {}, client)
    ).rejects.toThrow("Unknown analytics tool: unknown_tool");
  });

  it("should propagate client errors", async () => {
    const client = mockClient();
    client.get.mockRejectedValue(new Error("Timeout"));
    await expect(
      handleAnalyticsTool("get_conversation_stats", {}, client)
    ).rejects.toThrow("Timeout");
  });
});
