# admin-mcp

MCP server for managing Cuti-E conversations, messages, tags, analytics, and canned responses via the [Model Context Protocol](https://modelcontextprotocol.io).

## Features

- **Conversation Management** - List, view, update status/priority, assign to admins
- **Messages** - Send replies, internal notes, list message history
- **Tags** - List, add, and remove tags from conversations
- **Analytics** - Conversation stats, response time metrics
- **Canned Responses** - Create, list, and use template responses with variable substitution

## Setup

### Prerequisites

- Node.js 22+
- Cuti-E API OAuth2 credentials (client ID + secret)

### Installation

```bash
git clone https://github.com/cuti-e/admin-mcp.git
cd admin-mcp
npm install
```

### Configuration

Set the following environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `CUTIE_API_URL` | Yes | Base URL (e.g., `https://api.cutie.town`) |
| `CUTIE_CLIENT_ID` | Yes | OAuth2 client ID (`cutie_ci_...`) |
| `CUTIE_CLIENT_SECRET` | Yes | OAuth2 client secret (`cutie_cs_...`) |

### MCP Configuration

Add to your Claude Code `.mcp.json`:

```json
{
  "mcpServers": {
    "admin-mcp": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/admin-mcp/src/index.js"],
      "env": {
        "CUTIE_API_URL": "https://api.cutie.town",
        "CUTIE_CLIENT_ID": "cutie_ci_...",
        "CUTIE_CLIENT_SECRET": "cutie_cs_..."
      }
    }
  }
}
```

## Tools

| Tool | Description |
|------|-------------|
| `list_conversations` | List conversations with optional status/category filters |
| `get_conversation` | Get a conversation by ID with messages |
| `update_conversation` | Update status, priority, or category |
| `assign_conversation` | Assign/unassign a conversation to an admin |
| `send_message` | Send a message or internal note |
| `list_messages` | List messages in a conversation |
| `list_tags` | List all available tags |
| `add_tag` | Add a tag to a conversation |
| `remove_tag` | Remove a tag from a conversation |
| `get_conversation_stats` | Get conversation statistics |
| `get_response_times` | Get response time metrics |
| `list_canned_responses` | List saved response templates |
| `create_canned_response` | Create a new response template |
| `use_canned_response` | Send a canned response with variable substitution |

## Development

```bash
npm run lint    # Run ESLint
npm test        # Run tests
npm start       # Start the MCP server
```

## License

MIT
