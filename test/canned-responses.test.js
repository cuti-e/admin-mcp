import { describe, it, expect, vi } from "vitest";
import { handleCannedResponseTool } from "../src/tools/canned-responses.js";

function mockClient() {
  return {
    get: vi.fn().mockResolvedValue({ ok: true }),
    post: vi.fn().mockResolvedValue({ ok: true }),
  };
}

describe("handleCannedResponseTool", () => {
  describe("list_canned_responses", () => {
    it("should call GET /v1/canned-responses", async () => {
      const client = mockClient();
      await handleCannedResponseTool("list_canned_responses", {}, client);
      expect(client.get).toHaveBeenCalledWith("/v1/canned-responses");
    });
  });

  describe("create_canned_response", () => {
    it("should call POST with title and content", async () => {
      const client = mockClient();
      await handleCannedResponseTool("create_canned_response", {
        title: "Greeting",
        content: "Hello {{name}}, how can I help?",
      }, client);
      expect(client.post).toHaveBeenCalledWith("/v1/canned-responses", {
        title: "Greeting",
        content: "Hello {{name}}, how can I help?",
      });
    });

    it("should include category when provided", async () => {
      const client = mockClient();
      await handleCannedResponseTool("create_canned_response", {
        title: "Bug Ack",
        content: "Thanks for reporting this bug.",
        category: "bugs",
      }, client);
      expect(client.post).toHaveBeenCalledWith("/v1/canned-responses", {
        title: "Bug Ack",
        content: "Thanks for reporting this bug.",
        category: "bugs",
      });
    });
  });

  describe("use_canned_response", () => {
    it("should call POST /use with variables", async () => {
      const client = mockClient();
      await handleCannedResponseTool("use_canned_response", {
        conversation_id: "conv_123",
        canned_response_id: "cr_456",
        variables: { name: "John" },
      }, client);
      expect(client.post).toHaveBeenCalledWith(
        "/v1/conversations/conv_123/canned-responses/cr_456/use",
        { variables: { name: "John" } }
      );
    });

    it("should send empty variables when not provided", async () => {
      const client = mockClient();
      await handleCannedResponseTool("use_canned_response", {
        conversation_id: "conv_123",
        canned_response_id: "cr_456",
      }, client);
      expect(client.post).toHaveBeenCalledWith(
        "/v1/conversations/conv_123/canned-responses/cr_456/use",
        { variables: {} }
      );
    });
  });

  it("should throw on unknown tool", async () => {
    const client = mockClient();
    await expect(
      handleCannedResponseTool("unknown_tool", {}, client)
    ).rejects.toThrow("Unknown canned response tool: unknown_tool");
  });

  it("should propagate client errors", async () => {
    const client = mockClient();
    client.get.mockRejectedValue(new Error("Forbidden"));
    await expect(
      handleCannedResponseTool("list_canned_responses", {}, client)
    ).rejects.toThrow("Forbidden");
  });
});
