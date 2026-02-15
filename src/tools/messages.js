/**
 * Message management tools.
 *
 * Tools: send_message, list_messages
 */

export const messageTools = [
  {
    name: "send_message",
    description: "Send a message in a conversation as an admin",
    inputSchema: {
      type: "object",
      properties: {
        conversation_id: {
          type: "string",
          description: "The conversation ID",
        },
        message: {
          type: "string",
          description: "The message content",
        },
        internal_note: {
          type: "boolean",
          description: "If true, the message is an internal note not visible to the user (default: false)",
        },
      },
      required: ["conversation_id", "message"],
    },
  },
  {
    name: "list_messages",
    description: "List messages in a conversation",
    inputSchema: {
      type: "object",
      properties: {
        conversation_id: {
          type: "string",
          description: "The conversation ID",
        },
        limit: {
          type: "number",
          description: "Maximum number of messages to return (default: 50)",
        },
      },
      required: ["conversation_id"],
    },
  },
];

/**
 * Handle a message tool call.
 * @param {string} name - Tool name
 * @param {Object} args - Tool arguments
 * @param {import('../api/client.js').CutiEClient} _client - API client
 */
export async function handleMessageTool(name, _args, _client) {
  // TODO: Implement in issue #3
  throw new Error(`Tool ${name} not yet implemented - see issue #3`);
}
