import { describe, it, expect, vi } from "vitest";
import { handleMessageTool } from "../src/tools/messages.js";

function mockClient() {
  return {
    get: vi.fn().mockResolvedValue({ ok: true }),
    post: vi.fn().mockResolvedValue({ ok: true }),
  };
}

describe("handleMessageTool", () => {
  describe("send_message", () => {
    it("should call POST with message content", async () => {
      const client = mockClient();
      await handleMessageTool("send_message", {
        conversation_id: "conv_123",
        message: "Hello there",
      }, client);
      expect(client.post).toHaveBeenCalledWith(
        "/v1/conversations/conv_123/messages",
        { message: "Hello there", internal_note: false }
      );
    });

    it("should pass internal_note flag", async () => {
      const client = mockClient();
      await handleMessageTool("send_message", {
        conversation_id: "conv_123",
        message: "Internal note",
        internal_note: true,
      }, client);
      expect(client.post).toHaveBeenCalledWith(
        "/v1/conversations/conv_123/messages",
        { message: "Internal note", internal_note: true }
      );
    });
  });

  describe("list_messages", () => {
    it("should call GET messages with no params", async () => {
      const client = mockClient();
      await handleMessageTool("list_messages", {
        conversation_id: "conv_123",
      }, client);
      expect(client.get).toHaveBeenCalledWith(
        "/v1/conversations/conv_123/messages",
        {}
      );
    });

    it("should pass limit param", async () => {
      const client = mockClient();
      await handleMessageTool("list_messages", {
        conversation_id: "conv_123",
        limit: 10,
      }, client);
      expect(client.get).toHaveBeenCalledWith(
        "/v1/conversations/conv_123/messages",
        { limit: 10 }
      );
    });
  });

  it("should throw on unknown tool", async () => {
    const client = mockClient();
    await expect(
      handleMessageTool("unknown_tool", {}, client)
    ).rejects.toThrow("Unknown message tool: unknown_tool");
  });

  it("should propagate client errors", async () => {
    const client = mockClient();
    client.post.mockRejectedValue(new Error("Server error"));
    await expect(
      handleMessageTool("send_message", {
        conversation_id: "conv_123",
        message: "test",
      }, client)
    ).rejects.toThrow("Server error");
  });
});
