#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { TokenManager } from "./auth/token-manager.js";
import { CutiEClient } from "./api/client.js";
import { conversationTools, handleConversationTool } from "./tools/conversations.js";
import { messageTools, handleMessageTool } from "./tools/messages.js";
import { tagTools, handleTagTool } from "./tools/tags.js";
import { analyticsTools, handleAnalyticsTool } from "./tools/analytics.js";
import { cannedResponseTools, handleCannedResponseTool } from "./tools/canned-responses.js";

// Validate required environment variables
const requiredEnvVars = ["CUTIE_API_URL", "CUTIE_CLIENT_ID", "CUTIE_CLIENT_SECRET"];
const missing = requiredEnvVars.filter((v) => !process.env[v]);
if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  console.error("");
  console.error("Required:");
  console.error("  CUTIE_API_URL       - Base URL (e.g., https://api.cutie.town)");
  console.error("  CUTIE_CLIENT_ID     - OAuth2 client ID (cutie_ci_...)");
  console.error("  CUTIE_CLIENT_SECRET - OAuth2 client secret (cutie_cs_...)");
  process.exit(1);
}

// Initialize auth and API client
const tokenManager = new TokenManager({
  apiUrl: process.env.CUTIE_API_URL,
  clientId: process.env.CUTIE_CLIENT_ID,
  clientSecret: process.env.CUTIE_CLIENT_SECRET,
});

const client = new CutiEClient({
  apiUrl: process.env.CUTIE_API_URL,
  tokenManager,
});

// Create MCP server
const server = new Server(
  {
    name: "admin-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register all tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      ...conversationTools,
      ...messageTools,
      ...tagTools,
      ...analyticsTools,
      ...cannedResponseTools,
    ],
  };
});

// Route tool calls to handlers
const toolHandlers = {
  ...Object.fromEntries(conversationTools.map((t) => [t.name, (args) => handleConversationTool(t.name, args, client)])),
  ...Object.fromEntries(messageTools.map((t) => [t.name, (args) => handleMessageTool(t.name, args, client)])),
  ...Object.fromEntries(tagTools.map((t) => [t.name, (args) => handleTagTool(t.name, args, client)])),
  ...Object.fromEntries(analyticsTools.map((t) => [t.name, (args) => handleAnalyticsTool(t.name, args, client)])),
  ...Object.fromEntries(cannedResponseTools.map((t) => [t.name, (args) => handleCannedResponseTool(t.name, args, client)])),
};

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  const handler = toolHandlers[name];
  if (!handler) {
    return {
      content: [{ type: "text", text: `Unknown tool: ${name}` }],
      isError: true,
    };
  }

  try {
    const result = await handler(args);
    return {
      content: [{ type: "text", text: typeof result === "string" ? result : JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

// Connect via stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);
