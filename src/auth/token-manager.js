/**
 * OAuth2 Client Credentials token manager.
 *
 * Handles token acquisition and auto-refresh for the Cuti-E API.
 * Tokens are refreshed automatically when they expire or are close to expiry.
 */
export class TokenManager {
  #apiUrl;
  #clientId;
  #clientSecret;
  #accessToken = null;
  #expiresAt = 0;

  /**
   * @param {Object} config
   * @param {string} config.apiUrl - Base API URL
   * @param {string} config.clientId - OAuth2 client ID
   * @param {string} config.clientSecret - OAuth2 client secret
   */
  constructor({ apiUrl, clientId, clientSecret }) {
    this.#apiUrl = apiUrl;
    this.#clientId = clientId;
    this.#clientSecret = clientSecret;
  }

  /**
   * Get a valid access token, refreshing if needed.
   * @returns {Promise<string>} Valid access token
   */
  async getToken() {
    // Refresh if token is missing or expires within 30 seconds
    if (!this.#accessToken || Date.now() >= this.#expiresAt - 30_000) {
      await this.#fetchToken();
    }
    return this.#accessToken;
  }

  async #fetchToken() {
    // TODO: Implement OAuth2 client_credentials flow
    // POST {apiUrl}/oauth/token
    // Body: grant_type=client_credentials&client_id=...&client_secret=...
    // Response: { access_token, expires_in, token_type }
    throw new Error("TokenManager not yet implemented - see issue #2");
  }
}
