/**
 * HTTP client for the Cuti-E Admin API.
 *
 * Wraps fetch with automatic OAuth2 token injection, 401 retry, and error handling.
 */

import { CutiEAPIError } from "../utils/errors.js";

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
   * @param {string} path - API path (e.g., "/v1/conversations")
   * @param {Object} [params] - Query parameters as key-value pairs
   * @returns {Promise<Object>} Parsed JSON response
   */
  async get(path, params) {
    let url = `${this.#apiUrl}${path}`;
    if (params && Object.keys(params).length > 0) {
      const qs = new URLSearchParams(params).toString();
      url += `?${qs}`;
    }
    return this.#request(url, { method: "GET" });
  }

  /**
   * Make an authenticated POST request.
   * @param {string} path - API path
   * @param {Object} body - Request body (JSON)
   * @returns {Promise<Object>} Parsed JSON response
   */
  async post(path, body) {
    return this.#request(`${this.#apiUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  /**
   * Make an authenticated PUT request.
   * @param {string} path - API path
   * @param {Object} body - Request body (JSON)
   * @returns {Promise<Object>} Parsed JSON response
   */
  async put(path, body) {
    return this.#request(`${this.#apiUrl}${path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  /**
   * Make an authenticated PATCH request.
   * @param {string} path - API path
   * @param {Object} body - Request body (JSON)
   * @returns {Promise<Object>} Parsed JSON response
   */
  async patch(path, body) {
    return this.#request(`${this.#apiUrl}${path}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  /**
   * Make an authenticated DELETE request.
   * @param {string} path - API path
   * @returns {Promise<Object>} Parsed JSON response
   */
  async delete(path) {
    return this.#request(`${this.#apiUrl}${path}`, { method: "DELETE" });
  }

  /**
   * Internal request method with token injection and 401 retry.
   */
  async #request(url, options, isRetry = false) {
    const token = await this.#tokenManager.getToken();
    const headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };

    const res = await fetch(url, { ...options, headers });

    // Retry once on 401 with a fresh token
    if (res.status === 401 && !isRetry) {
      await this.#tokenManager.forceRefresh();
      return this.#request(url, options, true);
    }

    if (!res.ok) {
      let body;
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        body = await res.json().catch(() => undefined);
      } else {
        const text = await res.text().catch(() => "");
        body = text || undefined;
      }
      throw new CutiEAPIError(
        body?.error || `Request failed: ${res.status}`,
        res.status,
        body
      );
    }

    // Handle empty responses (204 No Content)
    if (res.status === 204) {
      return null;
    }

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return res.json();
    }
    return res.text();
  }
}
