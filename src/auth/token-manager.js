/**
 * OAuth2 Client Credentials token manager.
 *
 * Handles token acquisition, caching, and auto-refresh for the Cuti-E API.
 * Uses a promise lock to prevent concurrent refresh requests.
 */

import { AuthError } from "../utils/errors.js";

export class TokenManager {
  #apiUrl;
  #clientId;
  #clientSecret;
  #accessToken = null;
  #refreshToken = null;
  #expiresAt = 0;
  #refreshPromise = null;

  /**
   * @param {Object} config
   * @param {string} config.apiUrl - Base API URL (e.g., "https://api.cutie.town")
   * @param {string} config.clientId - OAuth2 client ID (cutie_ci_...)
   * @param {string} config.clientSecret - OAuth2 client secret (cutie_cs_...)
   */
  constructor({ apiUrl, clientId, clientSecret }) {
    this.#apiUrl = apiUrl;
    this.#clientId = clientId;
    this.#clientSecret = clientSecret;
  }

  /**
   * Get a valid access token, refreshing if needed.
   * Uses a promise lock so concurrent callers share one refresh request.
   * @returns {Promise<string>} Valid access token
   */
  async getToken() {
    if (this.#accessToken && Date.now() < this.#expiresAt - 60_000) {
      return this.#accessToken;
    }

    // Use lock to prevent concurrent refreshes
    if (this.#refreshPromise) {
      await this.#refreshPromise;
      return this.#accessToken;
    }

    this.#refreshPromise = this.#refresh();
    try {
      await this.#refreshPromise;
    } finally {
      this.#refreshPromise = null;
    }
    return this.#accessToken;
  }

  /**
   * Force a token refresh (called on 401).
   * @returns {Promise<string>} New access token
   */
  async forceRefresh() {
    if (this.#refreshPromise) {
      await this.#refreshPromise;
      return this.#accessToken;
    }

    this.#refreshPromise = this.#refresh();
    try {
      await this.#refreshPromise;
    } finally {
      this.#refreshPromise = null;
    }
    return this.#accessToken;
  }

  /**
   * Clear all cached tokens.
   */
  clear() {
    this.#accessToken = null;
    this.#refreshToken = null;
    this.#expiresAt = 0;
    this.#refreshPromise = null;
  }

  async #refresh() {
    // Try refresh token first if we have one
    if (this.#refreshToken) {
      try {
        await this.#exchangeRefreshToken();
        return;
      } catch {
        // Refresh failed (revoked, expired), fall through to client_credentials
        this.clear();
      }
    }

    await this.#exchangeClientCredentials();
  }

  async #exchangeClientCredentials() {
    const res = await fetch(`${this.#apiUrl}/v1/auth/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "client_credentials",
        client_id: this.#clientId,
        client_secret: this.#clientSecret,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new AuthError(
        `OAuth2 client_credentials failed (${res.status}): ${text}`
      );
    }

    const data = await res.json();
    this.#storeTokens(data);
  }

  async #exchangeRefreshToken() {
    const res = await fetch(`${this.#apiUrl}/v1/auth/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "refresh_token",
        refresh_token: this.#refreshToken,
      }),
    });

    if (!res.ok) {
      throw new AuthError(`Token refresh failed (${res.status})`);
    }

    const data = await res.json();
    this.#storeTokens(data);
  }

  #storeTokens(data) {
    this.#accessToken = data.access_token;
    this.#refreshToken = data.refresh_token;
    this.#expiresAt = Date.now() + data.expires_in * 1000;
  }
}
