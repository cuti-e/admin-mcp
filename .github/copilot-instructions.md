# Copilot Instructions for admin-mcp

## Project Overview

**admin-mcp** is an MCP (Model Context Protocol) server that provides tools for managing Cuti-E conversations, messages, tags, analytics, and canned responses. It authenticates via OAuth2 client credentials flow against the Cuti-E API.

## Architecture

```
src/
├── index.js              # MCP server entry point
├── auth/
│   └── token-manager.js  # OAuth2 token lifecycle (auto-refresh)
├── api/
│   └── client.js         # Authenticated HTTP client
├── tools/
│   ├── conversations.js  # Conversation CRUD
│   ├── messages.js        # Message send/list
│   ├── tags.js            # Tag management
│   ├── analytics.js       # Stats and metrics
│   └── canned-responses.js # Template responses
└── utils/
    └── errors.js          # Custom error types
```

## Code Patterns

### MCP Tool Definition

Every tool file exports a tools array and a handler function:

```javascript
export const myTools = [
  {
    name: "tool_name",
    description: "What the tool does",
    inputSchema: {
      type: "object",
      properties: { ... },
      required: ["field"],
    },
  },
];

export async function handleMyTool(name, args, client) {
  switch (name) {
    case "tool_name":
      return await client.get("/v1/endpoint");
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
```

### Error Handling

- Throw `CutiEAPIError` for API errors (includes status code)
- Throw `AuthError` for authentication failures
- Tool handlers catch errors and return `{ isError: true }` MCP responses

### OAuth2 Security

- Never log tokens or secrets
- Token refresh happens automatically before expiry
- Client credentials are read from environment variables only
- No credentials in code or config files

## Testing

- Use Vitest for unit tests
- Test tool schema definitions (names, required fields)
- Mock the API client for handler tests
- Test token refresh edge cases

## Common Pitfalls

- Tool names must be unique across all tool files
- `inputSchema.type` must be `"object"` (MCP requirement)
- Required fields must exist in properties
- Always return `{ content: [{ type: "text", text: "..." }] }` from tool handlers
