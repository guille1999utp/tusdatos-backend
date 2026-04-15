import { describe, expect, it } from "vitest";
import { transformToQueryString } from "./transformToQueryString";

describe("transformToQueryString", () => {
  it("construye la URL con query params", () => {
    const result = transformToQueryString("event", {
      skip: "0",
      limit: "10",
      query: "python",
    });

    expect(result).toContain("event?");
    expect(result).toContain("skip=0");
    expect(result).toContain("limit=10");
    expect(result).toContain("query=python");
  });
});
