/**
 * Conversation management tools.
 *
 * Tools: list_conversations, get_conversation, update_conversation, assign_conversation
 */

export const conversationTools = [
  {
    name: "list_conversations",
    description: "List conversations with optional filters (status, category, assigned admin)",
    inputSchema: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["open", "in_progress", "waiting_user", "waiting_admin", "resolved", "closed"],
          description: "Filter by conversation status",
        },
        category: {
          type: "string",
          enum: ["bug", "feature", "question", "feedback", "other"],
          description: "Filter by category",
        },
        limit: {
          type: "number",
          description: "Maximum number of conversations to return (default: 20)",
        },
        offset: {
          type: "number",
          description: "Offset for pagination (default: 0)",
        },
      },
    },
  },
  {
    name: "get_conversation",
    description: "Get a conversation by ID, including its messages",
    inputSchema: {
      type: "object",
      properties: {
        conversation_id: {
          type: "string",
          description: "The conversation ID",
        },
      },
      required: ["conversation_id"],
    },
  },
  {
    name: "update_conversation",
    description: "Update conversation status, priority, or category",
    inputSchema: {
      type: "object",
      properties: {
        conversation_id: {
          type: "string",
          description: "The conversation ID",
        },
        status: {
          type: "string",
          enum: ["open", "in_progress", "waiting_user", "waiting_admin", "resolved", "closed"],
        },
        priority: {
          type: "string",
          enum: ["low", "normal", "high", "urgent"],
        },
        category: {
          type: "string",
          enum: ["bug", "feature", "question", "feedback", "other"],
        },
      },
      required: ["conversation_id"],
    },
  },
  {
    name: "assign_conversation",
    description: "Assign a conversation to an admin",
    inputSchema: {
      type: "object",
      properties: {
        conversation_id: {
          type: "string",
          description: "The conversation ID",
        },
        admin_id: {
          type: "string",
          description: "The admin ID to assign to (null to unassign)",
        },
      },
      required: ["conversation_id"],
    },
  },
];

/**
 * Handle a conversation tool call.
 * @param {string} name - Tool name
 * @param {Object} args - Tool arguments
 * @param {import('../api/client.js').CutiEClient} client - API client
 */
export async function handleConversationTool(name, args, client) {
  switch (name) {
    case "list_conversations": {
      const params = {};
      if (args.status) params.status = args.status;
      if (args.category) params.category = args.category;
      if (args.limit !== undefined) params.limit = args.limit;
      if (args.offset !== undefined) params.offset = args.offset;
      return client.get("/v1/conversations", params);
    }
    case "get_conversation":
      return client.get(`/v1/conversations/${args.conversation_id}`);
    case "update_conversation": {
      const body = {};
      if (args.status) body.status = args.status;
      if (args.priority) body.priority = args.priority;
      if (args.category) body.category = args.category;
      return client.patch(`/v1/conversations/${args.conversation_id}`, body);
    }
    case "assign_conversation":
      return client.post(`/v1/conversations/${args.conversation_id}/assign`, {
        admin_id: args.admin_id || null,
      });
    default:
      throw new Error(`Unknown conversation tool: ${name}`);
  }
}
