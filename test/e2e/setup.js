/**
 * E2E test setup and helpers.
 *
 * E2E tests require real API credentials. They are skipped when
 * environment variables are not set, making them safe for CI.
 *
 * Required env vars:
 *   CUTIE_API_URL       - e.g., https://api.cuti-e.com
 *   CUTIE_CLIENT_ID     - OAuth2 client ID (cutie_ci_...)
 *   CUTIE_CLIENT_SECRET - OAuth2 client secret (cutie_cs_...)
 */

import { TokenManager } from "../../src/auth/token-manager.js";
import { CutiEClient } from "../../src/api/client.js";

const API_URL = process.env.CUTIE_API_URL;
const CLIENT_ID = process.env.CUTIE_CLIENT_ID;
const CLIENT_SECRET = process.env.CUTIE_CLIENT_SECRET;

export const hasCredentials = Boolean(API_URL && CLIENT_ID && CLIENT_SECRET);

export const skipReason = "E2E tests require CUTIE_API_URL, CUTIE_CLIENT_ID, CUTIE_CLIENT_SECRET";

/**
 * Create a configured TokenManager and CutiEClient for E2E tests.
 * @returns {{ tokenManager: TokenManager, client: CutiEClient }}
 */
export function createTestClient() {
  const tokenManager = new TokenManager({
    apiUrl: API_URL,
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
  });

  const client = new CutiEClient({
    apiUrl: API_URL,
    tokenManager,
  });

  return { tokenManager, client };
}
