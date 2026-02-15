/**
 * Custom error types and MCP response formatters for admin-mcp.
 */

export class CutiEAPIError extends Error {
  /**
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {Object} [body] - Response body
   */
  constructor(message, statusCode, body) {
    super(message);
    this.name = "CutiEAPIError";
    this.statusCode = statusCode;
    this.body = body;
  }
}

export class AuthError extends Error {
  constructor(message) {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Format an error into an MCP tool response.
 * @param {Error} error
 * @returns {{ content: Array<{type: string, text: string}>, isError: true }}
 */
export function formatError(error) {
  return {
    content: [{ type: "text", text: `Error: ${error.message}` }],
    isError: true,
  };
}

/**
 * Format data into a successful MCP tool response.
 * @param {*} data
 * @returns {{ content: Array<{type: string, text: string}> }}
 */
export function formatSuccess(data) {
  return {
    content: [
      { type: "text", text: JSON.stringify(data, null, 2) },
    ],
  };
}
