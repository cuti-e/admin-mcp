import { describe, it, expect, vi } from "vitest";
import { handleConversationTool } from "../src/tools/conversations.js";

function mockClient() {
  return {
    get: vi.fn().mockResolvedValue({ ok: true }),
    post: vi.fn().mockResolvedValue({ ok: true }),
    patch: vi.fn().mockResolvedValue({ ok: true }),
    delete: vi.fn().mockResolvedValue({ ok: true }),
  };
}

describe("handleConversationTool", () => {
  describe("list_conversations", () => {
    it("should call GET /v1/conversations with no params", async () => {
      const client = mockClient();
      await handleConversationTool("list_conversations", {}, client);
      expect(client.get).toHaveBeenCalledWith("/v1/conversations", {});
    });

    it("should pass status and category filters", async () => {
      const client = mockClient();
      await handleConversationTool("list_conversations", {
        status: "open",
        category: "bug",
      }, client);
      expect(client.get).toHaveBeenCalledWith("/v1/conversations", {
        status: "open",
        category: "bug",
      });
    });

    it("should pass pagination params", async () => {
      const client = mockClient();
      await handleConversationTool("list_conversations", {
        limit: 10,
        offset: 20,
      }, client);
      expect(client.get).toHaveBeenCalledWith("/v1/conversations", {
        limit: 10,
        offset: 20,
      });
    });

    it("should pass limit=0 correctly", async () => {
      const client = mockClient();
      await handleConversationTool("list_conversations", { limit: 0 }, client);
      expect(client.get).toHaveBeenCalledWith("/v1/conversations", { limit: 0 });
    });
  });

  describe("get_conversation", () => {
    it("should call GET /v1/conversations/:id", async () => {
      const client = mockClient();
      await handleConversationTool("get_conversation", {
        conversation_id: "conv_123",
      }, client);
      expect(client.get).toHaveBeenCalledWith("/v1/conversations/conv_123");
    });
  });

  describe("update_conversation", () => {
    it("should call PATCH with status", async () => {
      const client = mockClient();
      await handleConversationTool("update_conversation", {
        conversation_id: "conv_123",
        status: "resolved",
      }, client);
      expect(client.patch).toHaveBeenCalledWith("/v1/conversations/conv_123", {
        status: "resolved",
      });
    });

    it("should call PATCH with multiple fields", async () => {
      const client = mockClient();
      await handleConversationTool("update_conversation", {
        conversation_id: "conv_123",
        status: "in_progress",
        priority: "high",
        category: "bug",
      }, client);
      expect(client.patch).toHaveBeenCalledWith("/v1/conversations/conv_123", {
        status: "in_progress",
        priority: "high",
        category: "bug",
      });
    });

    it("should send empty body when no update fields provided", async () => {
      const client = mockClient();
      await handleConversationTool("update_conversation", {
        conversation_id: "conv_123",
      }, client);
      expect(client.patch).toHaveBeenCalledWith("/v1/conversations/conv_123", {});
    });
  });

  describe("assign_conversation", () => {
    it("should call POST /assign with admin_id", async () => {
      const client = mockClient();
      await handleConversationTool("assign_conversation", {
        conversation_id: "conv_123",
        admin_id: "admin_456",
      }, client);
      expect(client.post).toHaveBeenCalledWith(
        "/v1/conversations/conv_123/assign",
        { admin_id: "admin_456" }
      );
    });

    it("should send null admin_id to unassign", async () => {
      const client = mockClient();
      await handleConversationTool("assign_conversation", {
        conversation_id: "conv_123",
      }, client);
      expect(client.post).toHaveBeenCalledWith(
        "/v1/conversations/conv_123/assign",
        { admin_id: null }
      );
    });
  });

  it("should throw on unknown tool", async () => {
    const client = mockClient();
    await expect(
      handleConversationTool("unknown_tool", {}, client)
    ).rejects.toThrow("Unknown conversation tool: unknown_tool");
  });

  it("should propagate client errors", async () => {
    const client = mockClient();
    client.get.mockRejectedValue(new Error("Network error"));
    await expect(
      handleConversationTool("list_conversations", {}, client)
    ).rejects.toThrow("Network error");
  });
});
