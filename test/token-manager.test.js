import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TokenManager } from "../src/auth/token-manager.js";
import { AuthError } from "../src/utils/errors.js";

const API_URL = "https://api.test.com";
const CLIENT_ID = "cutie_ci_test123";
const CLIENT_SECRET = "cutie_cs_secret456";

function makeTokenResponse(overrides = {}) {
  return {
    access_token: overrides.access_token || "cutie_at_abc123",
    refresh_token: overrides.refresh_token || "cutie_rt_xyz789",
    token_type: "Bearer",
    expires_in: overrides.expires_in ?? 3600,
    scopes: ["conversations:read", "conversations:write"],
  };
}

function mockFetchOk(data) {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve(data),
  });
}

function mockFetchError(status, body) {
  return vi.fn().mockResolvedValue({
    ok: false,
    status,
    text: () => Promise.resolve(typeof body === "string" ? body : JSON.stringify(body)),
  });
}

describe("TokenManager", () => {
  let tm;

  beforeEach(() => {
    tm = new TokenManager({
      apiUrl: API_URL,
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("exchanges client credentials on first getToken call", async () => {
    const tokenData = makeTokenResponse();
    globalThis.fetch = mockFetchOk(tokenData);

    const token = await tm.getToken();

    expect(token).toBe("cutie_at_abc123");
    expect(globalThis.fetch).toHaveBeenCalledOnce();

    const [url, options] = globalThis.fetch.mock.calls[0];
    expect(url).toBe(`${API_URL}/v1/auth/oauth/token`);
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body)).toEqual({
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    });
  });

  it("returns cached token on subsequent calls", async () => {
    const tokenData = makeTokenResponse({ expires_in: 7200 });
    globalThis.fetch = mockFetchOk(tokenData);

    const token1 = await tm.getToken();
    const token2 = await tm.getToken();

    expect(token1).toBe(token2);
    expect(globalThis.fetch).toHaveBeenCalledOnce();
  });

  it("refreshes when token is within 60s of expiry", async () => {
    // First call: token that expires in 30 seconds (within 60s threshold)
    const shortLived = makeTokenResponse({
      access_token: "cutie_at_short",
      refresh_token: "cutie_rt_short",
      expires_in: 30,
    });
    globalThis.fetch = mockFetchOk(shortLived);
    await tm.getToken();

    // Second call should trigger refresh since token expires within 60s
    const refreshed = makeTokenResponse({
      access_token: "cutie_at_refreshed",
      refresh_token: "cutie_rt_refreshed2",
    });
    globalThis.fetch = mockFetchOk(refreshed);

    const token = await tm.getToken();
    expect(token).toBe("cutie_at_refreshed");

    // Should have used refresh_token grant
    const body = JSON.parse(globalThis.fetch.mock.calls[0][1].body);
    expect(body.grant_type).toBe("refresh_token");
    expect(body.refresh_token).toBe("cutie_rt_short");
  });

  it("concurrent calls share one refresh request", async () => {
    let resolveCount = 0;
    const tokenData = makeTokenResponse();
    globalThis.fetch = vi.fn().mockImplementation(() => {
      resolveCount++;
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(tokenData),
      });
    });

    // Fire 5 concurrent getToken calls
    const results = await Promise.all([
      tm.getToken(),
      tm.getToken(),
      tm.getToken(),
      tm.getToken(),
      tm.getToken(),
    ]);

    // All should get the same token
    for (const t of results) {
      expect(t).toBe("cutie_at_abc123");
    }

    // But only 1 fetch call should have been made
    expect(resolveCount).toBe(1);
  });

  it("falls back to client_credentials when refresh fails", async () => {
    // First call: get initial tokens
    const initial = makeTokenResponse({
      access_token: "cutie_at_initial",
      refresh_token: "cutie_rt_initial",
      expires_in: 10, // will expire soon
    });
    globalThis.fetch = mockFetchOk(initial);
    await tm.getToken();

    // Second call: refresh fails (401), then client_credentials succeeds
    let callCount = 0;
    const fallback = makeTokenResponse({ access_token: "cutie_at_fallback" });
    globalThis.fetch = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        // refresh_token attempt fails
        return Promise.resolve({
          ok: false,
          status: 401,
          text: () => Promise.resolve("Invalid refresh token"),
        });
      }
      // client_credentials succeeds
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(fallback),
      });
    });

    const token = await tm.getToken();
    expect(token).toBe("cutie_at_fallback");
    expect(callCount).toBe(2);

    // Verify second call was client_credentials
    const body = JSON.parse(globalThis.fetch.mock.calls[1][1].body);
    expect(body.grant_type).toBe("client_credentials");
  });

  it("throws AuthError on invalid credentials", async () => {
    globalThis.fetch = mockFetchError(401, "Invalid client credentials");

    await expect(tm.getToken()).rejects.toThrow(AuthError);
    await expect(tm.getToken()).rejects.toThrow("client_credentials failed");
  });

  it("forceRefresh gets a new token", async () => {
    const initial = makeTokenResponse({ access_token: "cutie_at_old", expires_in: 7200 });
    globalThis.fetch = mockFetchOk(initial);
    await tm.getToken();

    const refreshed = makeTokenResponse({ access_token: "cutie_at_new" });
    globalThis.fetch = mockFetchOk(refreshed);

    const token = await tm.forceRefresh();
    expect(token).toBe("cutie_at_new");
  });

  it("clear removes all cached tokens", async () => {
    const tokenData = makeTokenResponse();
    globalThis.fetch = mockFetchOk(tokenData);
    await tm.getToken();

    tm.clear();

    // Should need to fetch again
    const newData = makeTokenResponse({ access_token: "cutie_at_after_clear" });
    globalThis.fetch = mockFetchOk(newData);

    const token = await tm.getToken();
    expect(token).toBe("cutie_at_after_clear");
  });
});
