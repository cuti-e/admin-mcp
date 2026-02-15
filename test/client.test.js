import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CutiEClient } from "../src/api/client.js";
import { CutiEAPIError } from "../src/utils/errors.js";

const API_URL = "https://api.test.com";

function createMockTokenManager() {
  return {
    getToken: vi.fn().mockResolvedValue("cutie_at_test_token"),
    forceRefresh: vi.fn().mockResolvedValue("cutie_at_refreshed_token"),
  };
}

// Headers as a Map-like with .get()
function createHeaders(entries) {
  const map = new Map(entries);
  return { get: (key) => map.get(key) || null };
}

function mockResponse(status, body, contentType = "application/json") {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: createHeaders([["content-type", contentType]]),
    json: () => Promise.resolve(typeof body === "object" ? body : JSON.parse(body)),
    text: () => Promise.resolve(typeof body === "string" ? body : JSON.stringify(body)),
  };
}

describe("CutiEClient", () => {
  let client;
  let tokenManager;

  beforeEach(() => {
    tokenManager = createMockTokenManager();
    client = new CutiEClient({ apiUrl: API_URL, tokenManager });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Authorization header", () => {
    it("adds Bearer token to all requests", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        mockResponse(200, { data: "test" })
      );

      await client.get("/v1/conversations");

      const [, options] = globalThis.fetch.mock.calls[0];
      expect(options.headers.Authorization).toBe("Bearer cutie_at_test_token");
    });
  });

  describe("GET requests", () => {
    it("makes GET request to correct URL", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        mockResponse(200, { conversations: [] })
      );

      const result = await client.get("/v1/conversations");

      expect(globalThis.fetch).toHaveBeenCalledOnce();
      const [url, options] = globalThis.fetch.mock.calls[0];
      expect(url).toBe(`${API_URL}/v1/conversations`);
      expect(options.method).toBe("GET");
      expect(result).toEqual({ conversations: [] });
    });

    it("appends query params to URL", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        mockResponse(200, { conversations: [] })
      );

      await client.get("/v1/conversations", { status: "open", limit: "10" });

      const [url] = globalThis.fetch.mock.calls[0];
      expect(url).toContain("status=open");
      expect(url).toContain("limit=10");
    });

    it("skips query params when empty", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        mockResponse(200, { data: [] })
      );

      await client.get("/v1/conversations", {});

      const [url] = globalThis.fetch.mock.calls[0];
      expect(url).toBe(`${API_URL}/v1/conversations`);
    });
  });

  describe("POST requests", () => {
    it("sends JSON body with Content-Type header", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        mockResponse(200, { message_id: "msg_123" })
      );

      const body = { conversation_id: "conv_1", message: "Hello" };
      const result = await client.post("/v1/conversations/conv_1/messages", body);

      const [, options] = globalThis.fetch.mock.calls[0];
      expect(options.method).toBe("POST");
      expect(options.headers["Content-Type"]).toBe("application/json");
      expect(JSON.parse(options.body)).toEqual(body);
      expect(result).toEqual({ message_id: "msg_123" });
    });
  });

  describe("PUT requests", () => {
    it("sends PUT with JSON body", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        mockResponse(200, { updated: true })
      );

      await client.put("/v1/conversations/conv_1", { status: "resolved" });

      const [, options] = globalThis.fetch.mock.calls[0];
      expect(options.method).toBe("PUT");
      expect(JSON.parse(options.body)).toEqual({ status: "resolved" });
    });
  });

  describe("PATCH requests", () => {
    it("sends PATCH with JSON body", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        mockResponse(200, { updated: true })
      );

      await client.patch("/v1/conversations/conv_1", { priority: "high" });

      const [, options] = globalThis.fetch.mock.calls[0];
      expect(options.method).toBe("PATCH");
      expect(JSON.parse(options.body)).toEqual({ priority: "high" });
    });
  });

  describe("DELETE requests", () => {
    it("sends DELETE request", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        mockResponse(204, "", "text/plain")
      );

      const result = await client.delete("/v1/tags/tag_1");

      const [, options] = globalThis.fetch.mock.calls[0];
      expect(options.method).toBe("DELETE");
      expect(result).toBeNull();
    });
  });

  describe("401 retry", () => {
    it("retries once on 401 with a fresh token", async () => {
      let callCount = 0;
      globalThis.fetch = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve(
            mockResponse(401, { error: "Token expired" })
          );
        }
        return Promise.resolve(
          mockResponse(200, { data: "success" })
        );
      });

      const result = await client.get("/v1/conversations");

      expect(result).toEqual({ data: "success" });
      expect(tokenManager.forceRefresh).toHaveBeenCalledOnce();
      expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    });

    it("throws on second 401 (no infinite retry)", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        mockResponse(401, { error: "Invalid token" })
      );

      await expect(client.get("/v1/conversations")).rejects.toThrow(CutiEAPIError);
      // First call + one retry = 2 fetch calls
      expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe("Error handling", () => {
    it("throws CutiEAPIError on non-401 errors", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        mockResponse(404, { error: "Conversation not found" })
      );

      try {
        await client.get("/v1/conversations/nonexistent");
        expect.unreachable("Should have thrown");
      } catch (err) {
        expect(err).toBeInstanceOf(CutiEAPIError);
        expect(err.statusCode).toBe(404);
        expect(err.message).toBe("Conversation not found");
      }
    });

    it("handles non-JSON error responses", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        mockResponse(500, "Internal Server Error", "text/plain")
      );

      try {
        await client.get("/v1/conversations");
        expect.unreachable("Should have thrown");
      } catch (err) {
        expect(err).toBeInstanceOf(CutiEAPIError);
        expect(err.statusCode).toBe(500);
      }
    });

    it("handles JSON responses", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        mockResponse(200, { items: [1, 2, 3] })
      );

      const result = await client.get("/v1/items");
      expect(result).toEqual({ items: [1, 2, 3] });
    });

    it("handles non-JSON success responses", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        mockResponse(200, "OK", "text/plain")
      );

      const result = await client.get("/v1/health");
      expect(result).toBe("OK");
    });
  });
});
