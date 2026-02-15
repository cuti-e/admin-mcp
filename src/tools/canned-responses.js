/**
 * Canned response management tools.
 *
 * Tools: list_canned_responses, create_canned_response, use_canned_response
 */

export const cannedResponseTools = [
  {
    name: "list_canned_responses",
    description: "List all canned (saved) responses",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "create_canned_response",
    description: "Create a new canned response template",
    inputSchema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Short title for the canned response",
        },
        content: {
          type: "string",
          description: "The response content (supports variables like {{name}})",
        },
        category: {
          type: "string",
          description: "Category for organizing responses",
        },
      },
      required: ["title", "content"],
    },
  },
  {
    name: "use_canned_response",
    description: "Send a canned response in a conversation, with variable substitution",
    inputSchema: {
      type: "object",
      properties: {
        conversation_id: {
          type: "string",
          description: "The conversation ID",
        },
        canned_response_id: {
          type: "string",
          description: "The canned response ID to use",
        },
        variables: {
          type: "object",
          description: "Variable substitutions (e.g., {\"name\": \"John\"})",
        },
      },
      required: ["conversation_id", "canned_response_id"],
    },
  },
];

/**
 * Handle a canned response tool call.
 * @param {string} name - Tool name
 * @param {Object} args - Tool arguments
 * @param {import('../api/client.js').CutiEClient} _client - API client
 */
export async function handleCannedResponseTool(name, _args, _client) {
  // TODO: Implement in issue #3
  throw new Error(`Tool ${name} not yet implemented - see issue #3`);
}
