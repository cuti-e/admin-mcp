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
 * @param {import('../api/client.js').CutiEClient} client - API client
 */
export async function handleMessageTool(name, args, client) {
  switch (name) {
    case "send_message":
      return client.post(`/v1/conversations/${args.conversation_id}/messages`, {
        message: args.message,
        internal_note: args.internal_note || false,
      });
    case "list_messages": {
      const params = {};
      if (args.limit !== undefined) params.limit = args.limit;
      return client.get(`/v1/conversations/${args.conversation_id}/messages`, params);
    }
    default:
      throw new Error(`Unknown message tool: ${name}`);
  }
}
