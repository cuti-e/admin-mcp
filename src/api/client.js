/**
 * HTTP client for the Cuti-E Admin API.
 *
 * Wraps fetch with automatic OAuth2 token injection and error handling.
 */
export class CutiEClient {
  #apiUrl;
  #tokenManager;

  /**
   * @param {Object} config
   * @param {string} config.apiUrl - Base API URL
   * @param {import('../auth/token-manager.js').TokenManager} config.tokenManager - Token manager
   */
  constructor({ apiUrl, tokenManager }) {
    this.#apiUrl = apiUrl;
    this.#tokenManager = tokenManager;
  }

  /**
   * Make an authenticated GET request.
   * @param {string} path - API path (e.g., '/v1/conversations')
   * @param {URLSearchParams} [params] - Query parameters
   * @returns {Promise<Object>} Parsed JSON response
   */
  async get(_path, _params) {
    // TODO: Implement - see issue #2
    throw new Error("CutiEClient not yet implemented - see issue #2");
  }

  /**
   * Make an authenticated POST request.
   * @param {string} path - API path
   * @param {Object} body - Request body (JSON)
   * @returns {Promise<Object>} Parsed JSON response
   */
  async post(_path, _body) {
    // TODO: Implement - see issue #2
    throw new Error("CutiEClient not yet implemented - see issue #2");
  }

  /**
   * Make an authenticated PUT request.
   * @param {string} path - API path
   * @param {Object} body - Request body (JSON)
   * @returns {Promise<Object>} Parsed JSON response
   */
  async put(_path, _body) {
    // TODO: Implement - see issue #2
    throw new Error("CutiEClient not yet implemented - see issue #2");
  }

  /**
   * Make an authenticated DELETE request.
   * @param {string} path - API path
   * @returns {Promise<Object>} Parsed JSON response
   */
  async delete(_path) {
    // TODO: Implement - see issue #2
    throw new Error("CutiEClient not yet implemented - see issue #2");
  }
}
