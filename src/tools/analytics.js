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
 * @param {import('../api/client.js').CutiEClient} _client - API client
 */
export async function handleAnalyticsTool(name, _args, _client) {
  // TODO: Implement in issue #3
  throw new Error(`Tool ${name} not yet implemented - see issue #3`);
}
