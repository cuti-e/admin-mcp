import { describe, it, expect, vi } from "vitest";
import { handleTagTool } from "../src/tools/tags.js";

function mockClient() {
  return {
    get: vi.fn().mockResolvedValue({ ok: true }),
    post: vi.fn().mockResolvedValue({ ok: true }),
    delete: vi.fn().mockResolvedValue(null),
  };
}

describe("handleTagTool", () => {
  describe("list_tags", () => {
    it("should call GET /v1/tags", async () => {
      const client = mockClient();
      await handleTagTool("list_tags", {}, client);
      expect(client.get).toHaveBeenCalledWith("/v1/tags");
    });
  });

  describe("add_tag", () => {
    it("should call POST with tag name", async () => {
      const client = mockClient();
      await handleTagTool("add_tag", {
        conversation_id: "conv_123",
        tag: "urgent",
      }, client);
      expect(client.post).toHaveBeenCalledWith(
        "/v1/conversations/conv_123/tags",
        { tag: "urgent" }
      );
    });
  });

  describe("remove_tag", () => {
    it("should call DELETE with encoded tag name", async () => {
      const client = mockClient();
      await handleTagTool("remove_tag", {
        conversation_id: "conv_123",
        tag: "urgent",
      }, client);
      expect(client.delete).toHaveBeenCalledWith(
        "/v1/conversations/conv_123/tags/urgent"
      );
    });

    it("should encode special characters in tag name", async () => {
      const client = mockClient();
      await handleTagTool("remove_tag", {
        conversation_id: "conv_123",
        tag: "needs review",
      }, client);
      expect(client.delete).toHaveBeenCalledWith(
        "/v1/conversations/conv_123/tags/needs%20review"
      );
    });
  });

  it("should throw on unknown tool", async () => {
    const client = mockClient();
    await expect(
      handleTagTool("unknown_tool", {}, client)
    ).rejects.toThrow("Unknown tag tool: unknown_tool");
  });

  it("should propagate client errors", async () => {
    const client = mockClient();
    client.get.mockRejectedValue(new Error("Not found"));
    await expect(
      handleTagTool("list_tags", {}, client)
    ).rejects.toThrow("Not found");
  });
});
