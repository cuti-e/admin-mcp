# admin-mcp

MCP server for managing [Cuti-E](https://cuti-e.com) conversations, messages, tags, analytics, and canned responses via the [Model Context Protocol](https://modelcontextprotocol.io).

Designed for AI assistants (Claude Code, etc.) to manage customer feedback conversations programmatically.

## Features

- **Conversation Management** - List, view, update status/priority, assign to admins
- **Messages** - Send replies, internal notes, list message history
- **Tags** - List, add, and remove tags from conversations
- **Analytics** - Conversation stats, response time metrics
- **Canned Responses** - Create, list, and use template responses with variable substitution
- **OAuth2 Authentication** - Secure client credentials flow with automatic token refresh

## Quick Start

### 1. Install

```bash
git clone https://github.com/cuti-e/admin-mcp.git
cd admin-mcp
npm install
```

### 2. Create API Credentials

Generate OAuth2 credentials from the Cuti-E admin dashboard or API:

```bash
curl -X POST https://api.cuti-e.com/v1/admin/api-credentials \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MCP Server",
    "scopes": [
      "conversations:read", "conversations:write",
      "messages:read", "messages:write",
      "tags:read", "tags:write",
      "analytics:read",
      "canned_responses:read"
    ]
  }'
```

Save the returned `client_id` and `client_secret` - the secret is only shown once.

### 3. Configure

Set environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `CUTIE_API_URL` | Yes | Base URL (e.g., `https://api.cuti-e.com`) |
| `CUTIE_CLIENT_ID` | Yes | OAuth2 client ID (`cutie_ci_...`) |
| `CUTIE_CLIENT_SECRET` | Yes | OAuth2 client secret (`cutie_cs_...`) |

### 4. Add to Claude Code

Add to your `.mcp.json`:

```json
{
  "mcpServers": {
    "cutie-admin": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/admin-mcp/src/index.js"],
      "env": {
        "CUTIE_API_URL": "https://api.cuti-e.com",
        "CUTIE_CLIENT_ID": "cutie_ci_...",
        "CUTIE_CLIENT_SECRET": "cutie_cs_..."
      }
    }
  }
}
```

## Tool Reference

### Conversations

| Tool | Description | Required Args |
|------|-------------|---------------|
| `list_conversations` | List conversations with optional filters | - |
| `get_conversation` | Get a conversation by ID with messages | `conversation_id` |
| `update_conversation` | Update status, priority, or category | `conversation_id` |
| `assign_conversation` | Assign/unassign to an admin | `conversation_id` |

**Optional args for `list_conversations`:** `status` (open, in_progress, waiting_user, waiting_admin, resolved, closed), `category` (bug, feature, question, feedback, other), `limit`, `offset`

**Optional args for `update_conversation`:** `status`, `priority` (low, normal, high, urgent), `category`

**Optional args for `assign_conversation`:** `admin_id` (omit to unassign)

### Messages

| Tool | Description | Required Args |
|------|-------------|---------------|
| `send_message` | Send a message or internal note | `conversation_id`, `message` |
| `list_messages` | List messages in a conversation | `conversation_id` |

**Optional args for `send_message`:** `internal_note` (boolean, default: false)

**Optional args for `list_messages`:** `limit` (default: 50)

### Tags

| Tool | Description | Required Args |
|------|-------------|---------------|
| `list_tags` | List all available tags | - |
| `add_tag` | Add a tag to a conversation | `conversation_id`, `tag` |
| `remove_tag` | Remove a tag from a conversation | `conversation_id`, `tag` |

### Analytics

| Tool | Description | Required Args |
|------|-------------|---------------|
| `get_conversation_stats` | Conversation statistics by status, category, priority | - |
| `get_response_times` | Average response time metrics | - |

**Optional args:** `days` (default: 30)

### Canned Responses

| Tool | Description | Required Args |
|------|-------------|---------------|
| `list_canned_responses` | List saved response templates | - |
| `create_canned_response` | Create a new template | `title`, `content` |
| `use_canned_response` | Send a template in a conversation | `conversation_id`, `canned_response_id` |

**Optional args for `create_canned_response`:** `category`

**Optional args for `use_canned_response`:** `variables` (object for `{{placeholder}}` substitution)

## Authentication

The MCP server uses OAuth2 client credentials flow:

1. On first API call, exchanges `client_id` + `client_secret` for an access token (1h TTL)
2. Caches the token and reuses it for subsequent requests
3. Automatically refreshes via refresh token (30d TTL) when the access token nears expiry
4. Falls back to full client credentials exchange if refresh fails
5. Retries once on 401 with a fresh token

### Scopes

Credentials can be scoped to limit access:

| Scope | Grants |
|-------|--------|
| `conversations:read` | List and get conversations |
| `conversations:write` | Update status, priority, assign |
| `messages:read` | List messages |
| `messages:write` | Send messages |
| `tags:read` | List tags |
| `tags:write` | Add/remove tags |
| `analytics:read` | View stats and response times |
| `canned_responses:read` | List and use canned responses |

## Development

```bash
npm install         # Install dependencies
npm run lint        # ESLint
npm test            # Unit tests (78 tests)
npm run test:e2e    # E2E tests (requires API credentials)
npm run test:all    # All tests
npm start           # Start the MCP server
```

### E2E Tests

E2E tests run against the real Cuti-E API and require credentials:

```bash
export CUTIE_API_URL=https://api.cuti-e.com
export CUTIE_CLIENT_ID=cutie_ci_...
export CUTIE_CLIENT_SECRET=cutie_cs_...
npm run test:e2e
```

E2E tests are automatically skipped when credentials are not set (safe for CI).

### Project Structure

```
src/
├── index.js              # MCP server entry point
├── auth/
│   └── token-manager.js  # OAuth2 token lifecycle
├── api/
│   └── client.js         # Authenticated HTTP client
├── tools/                # Tool definitions + handlers
│   ├── conversations.js  # 4 tools
│   ├── messages.js       # 2 tools
│   ├── tags.js           # 3 tools
│   ├── analytics.js      # 2 tools
│   └── canned-responses.js # 3 tools
└── utils/
    └── errors.js         # Error types + MCP formatters

test/
├── *.test.js             # Unit tests (mocked client)
└── e2e/                  # E2E tests (real API)
```

## License

MIT
