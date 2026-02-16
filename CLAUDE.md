# CLAUDE.md - admin-mcp

## Project Overview

**admin-mcp** is an MCP server for managing Cuti-E conversations, messages, tags, analytics, and canned responses. It authenticates via OAuth2 client credentials against the Cuti-E API.

**Repository:** https://github.com/cuti-e/admin-mcp

## Tech Stack

- **Runtime:** Node.js 22+ (ESM)
- **Protocol:** MCP SDK (`@modelcontextprotocol/sdk`)
- **Auth:** OAuth2 client credentials flow
- **Testing:** Vitest
- **Linting:** ESLint 9 (flat config)

## Architecture

```
src/
├── index.js              # MCP server entry point, tool routing
├── auth/
│   └── token-manager.js  # OAuth2 token lifecycle (auto-refresh)
├── api/
│   └── client.js         # Authenticated HTTP client wrapper
├── tools/                # Tool definitions + handlers (one file per domain)
│   ├── conversations.js  # 4 tools: list, get, update, assign
│   ├── messages.js       # 2 tools: send, list
│   ├── tags.js           # 3 tools: list, add, remove
│   ├── analytics.js      # 2 tools: stats, response times
│   └── canned-responses.js # 3 tools: list, create, use
└── utils/
    └── errors.js         # CutiEAPIError, AuthError
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `CUTIE_API_URL` | Base URL (e.g., `https://api.cutie.town`) |
| `CUTIE_CLIENT_ID` | OAuth2 client ID |
| `CUTIE_CLIENT_SECRET` | OAuth2 client secret |

## Development

```bash
npm install         # Install dependencies
npm run lint        # ESLint
npm test            # Unit tests (excludes E2E)
npm run test:e2e    # E2E tests (requires API credentials)
npm run test:all    # All tests
npm start           # Run MCP server
```

### E2E Tests

E2E tests live in `test/e2e/` and run against the real Cuti-E API. They require `CUTIE_API_URL`, `CUTIE_CLIENT_ID`, and `CUTIE_CLIENT_SECRET` env vars. Tests are auto-skipped when credentials are not set (safe for CI).

## CI/CD

| Workflow | Trigger | Description |
|----------|---------|-------------|
| `ci.yml` | PR to main | Lint + test |
| `release-please.yml` | Push to main | Automated releases |
| `auto-merge.yml` | PR to main | Auto-merge after CI + Copilot review |

## Git Workflow

- Branch from main: `feature/issue-N-description`
- Conventional commits: `feat:`, `fix:`, `chore:`, etc.
- Squash merge via PR
- Never push directly to main

## Related Issues

- [#1](https://github.com/cuti-e/admin-mcp/issues/1) - Scaffold repo (this)
- [#2](https://github.com/cuti-e/admin-mcp/issues/2) - TokenManager + API client
- [#3](https://github.com/cuti-e/admin-mcp/issues/3) - Implement 14 MCP tools
- [#4](https://github.com/cuti-e/admin-mcp/issues/4) - E2E testing + docs

## Dependencies

- Depends on: cutie #479 (OAuth2 client credentials auth on the API side)
