/**
 * Analytics tools.
 *
 * Tools: get_conversation_stats, get_response_times
 */

export const analyticsTools = [
  {
    name: "get_conversation_stats",
    description: "Get conversation statistics (counts by status, category, priority)",
    inputSchema: {
      type: "object",
      properties: {
        days: {
          type: "number",
          description: "Number of days to look back (default: 30)",
        },
      },
    },
  },
  {
    name: "get_response_times",
    description: "Get average response time metrics",
    inputSchema: {
      type: "object",
      properties: {
        days: {
          type: "number",
          description: "Number of days to look back (default: 30)",
        },
      },
    },
  },
];

/**
 * Handle an analytics tool call.
 * @param {string} name - Tool name
 * @param {Object} args - Tool arguments
 * @param {import('../api/client.js').CutiEClient} client - API client
 */
export async function handleAnalyticsTool(name, args, client) {
  switch (name) {
    case "get_conversation_stats": {
      const params = {};
      if (args.days !== undefined) params.days = args.days;
      return client.get("/v1/analytics/conversation-stats", params);
    }
    case "get_response_times": {
      const params = {};
      if (args.days !== undefined) params.days = args.days;
      return client.get("/v1/analytics/response-times", params);
    }
    default:
      throw new Error(`Unknown analytics tool: ${name}`);
  }
}
