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
 * @param {import('../api/client.js').CutiEClient} _client - API client
 */
export async function handleTagTool(name, _args, _client) {
  // TODO: Implement in issue #3
  throw new Error(`Tool ${name} not yet implemented - see issue #3`);
}
