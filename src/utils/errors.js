/**
 * Custom error types for admin-mcp.
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
