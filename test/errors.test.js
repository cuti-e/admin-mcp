import { describe, it, expect } from "vitest";
import {
  CutiEAPIError,
  AuthError,
  formatError,
  formatSuccess,
} from "../src/utils/errors.js";

describe("CutiEAPIError", () => {
  it("stores statusCode and body", () => {
    const err = new CutiEAPIError("Not found", 404, { detail: "missing" });
    expect(err.message).toBe("Not found");
    expect(err.statusCode).toBe(404);
    expect(err.body).toEqual({ detail: "missing" });
    expect(err.name).toBe("CutiEAPIError");
    expect(err).toBeInstanceOf(Error);
  });
});

describe("AuthError", () => {
  it("has correct name", () => {
    const err = new AuthError("Token expired");
    expect(err.message).toBe("Token expired");
    expect(err.name).toBe("AuthError");
    expect(err).toBeInstanceOf(Error);
  });
});

describe("formatError", () => {
  it("returns MCP error response format", () => {
    const err = new Error("Something broke");
    const result = formatError(err);

    expect(result).toEqual({
      content: [{ type: "text", text: "Error: Something broke" }],
      isError: true,
    });
  });

  it("works with CutiEAPIError", () => {
    const err = new CutiEAPIError("Not found", 404);
    const result = formatError(err);

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe("Error: Not found");
  });
});

describe("formatSuccess", () => {
  it("returns MCP success response with JSON data", () => {
    const data = { conversations: [{ id: "conv_1" }] };
    const result = formatSuccess(data);

    expect(result.isError).toBeUndefined();
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(JSON.parse(result.content[0].text)).toEqual(data);
  });

  it("pretty-prints JSON with 2-space indent", () => {
    const result = formatSuccess({ a: 1 });
    expect(result.content[0].text).toBe('{\n  "a": 1\n}');
  });
});
