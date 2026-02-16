/**
 * Tag management tools.
 *
 * Tools: list_tags, add_tag, remove_tag
 */

export const tagTools = [
  {
    name: "list_tags",
    description: "List all available tags",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "add_tag",
    description: "Add a tag to a conversation",
    inputSchema: {
      type: "object",
      properties: {
        conversation_id: {
          type: "string",
          description: "The conversation ID",
        },
        tag: {
          type: "string",
          description: "The tag name to add",
        },
      },
      required: ["conversation_id", "tag"],
    },
  },
  {
    name: "remove_tag",
    description: "Remove a tag from a conversation",
    inputSchema: {
      type: "object",
      properties: {
        conversation_id: {
          type: "string",
          description: "The conversation ID",
        },
        tag: {
          type: "string",
          description: "The tag name to remove",
        },
      },
      required: ["conversation_id", "tag"],
    },
  },
];

/**
 * Handle a tag tool call.
 * @param {string} name - Tool name
 * @param {Object} args - Tool arguments
 * @param {import('../api/client.js').CutiEClient} client - API client
 */
export async function handleTagTool(name, args, client) {
  switch (name) {
    case "list_tags":
      return client.get("/v1/tags");
    case "add_tag":
      return client.post(`/v1/conversations/${args.conversation_id}/tags`, {
        tag: args.tag,
      });
    case "remove_tag":
      return client.delete(
        `/v1/conversations/${args.conversation_id}/tags/${encodeURIComponent(args.tag)}`
      );
    default:
      throw new Error(`Unknown tag tool: ${name}`);
  }
}
