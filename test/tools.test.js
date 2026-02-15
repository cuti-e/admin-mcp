import { describe, it, expect } from "vitest";
import { conversationTools } from "../src/tools/conversations.js";
import { messageTools } from "../src/tools/messages.js";
import { tagTools } from "../src/tools/tags.js";
import { analyticsTools } from "../src/tools/analytics.js";
import { cannedResponseTools } from "../src/tools/canned-responses.js";

describe("Tool definitions", () => {
  const allTools = [
    ...conversationTools,
    ...messageTools,
    ...tagTools,
    ...analyticsTools,
    ...cannedResponseTools,
  ];

  it("should have unique tool names", () => {
    const names = allTools.map((t) => t.name);
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });

  it("should have 14 tools total", () => {
    expect(allTools.length).toBe(14);
  });

  it("every tool should have a name, description, and inputSchema", () => {
    for (const tool of allTools) {
      expect(tool.name).toBeDefined();
      expect(tool.description).toBeDefined();
      expect(tool.inputSchema).toBeDefined();
      expect(tool.inputSchema.type).toBe("object");
    }
  });

  it("every required field should exist in properties", () => {
    for (const tool of allTools) {
      const required = tool.inputSchema.required || [];
      const properties = Object.keys(tool.inputSchema.properties || {});
      for (const field of required) {
        expect(properties).toContain(field);
      }
    }
  });
});

describe("Conversation tools", () => {
  it("should define 4 conversation tools", () => {
    expect(conversationTools.length).toBe(4);
  });

  it("list_conversations should have optional filters", () => {
    const tool = conversationTools.find((t) => t.name === "list_conversations");
    expect(tool.inputSchema.required).toBeUndefined();
    expect(tool.inputSchema.properties.status).toBeDefined();
    expect(tool.inputSchema.properties.category).toBeDefined();
  });

  it("get_conversation should require conversation_id", () => {
    const tool = conversationTools.find((t) => t.name === "get_conversation");
    expect(tool.inputSchema.required).toContain("conversation_id");
  });
});

describe("Message tools", () => {
  it("should define 2 message tools", () => {
    expect(messageTools.length).toBe(2);
  });

  it("send_message should require conversation_id and message", () => {
    const tool = messageTools.find((t) => t.name === "send_message");
    expect(tool.inputSchema.required).toContain("conversation_id");
    expect(tool.inputSchema.required).toContain("message");
  });
});

describe("Tag tools", () => {
  it("should define 3 tag tools", () => {
    expect(tagTools.length).toBe(3);
  });
});

describe("Analytics tools", () => {
  it("should define 2 analytics tools", () => {
    expect(analyticsTools.length).toBe(2);
  });
});

describe("Canned response tools", () => {
  it("should define 3 canned response tools", () => {
    expect(cannedResponseTools.length).toBe(3);
  });

  it("create_canned_response should require title and content", () => {
    const tool = cannedResponseTools.find((t) => t.name === "create_canned_response");
    expect(tool.inputSchema.required).toContain("title");
    expect(tool.inputSchema.required).toContain("content");
  });
});
