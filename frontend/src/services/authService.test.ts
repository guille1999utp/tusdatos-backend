import { describe, expect, it, vi } from "vitest";

import authService, { register } from "./authService";
import { clientHTTP } from "@/api/configAxios";

vi.mock("@/api/configAxios", () => ({
  clientHTTP: {
    post: vi.fn(),
  },
}));

describe("authService", () => {
  it("hace login enviando email y password", async () => {
    vi.mocked(clientHTTP.post).mockResolvedValueOnce({
      data: {
        access_token: "token-123",
        user: { email: "user@example.com" },
      },
    } as any);

    const result = await authService.login("user@example.com", "12345678");

    expect(clientHTTP.post).toHaveBeenCalledWith("/auth/login", {
      email: "user@example.com",
      password: "12345678",
    });
    expect(result.access_token).toBe("token-123");
  });

  it("registra usuario y retorna la data", async () => {
    vi.mocked(clientHTTP.post).mockResolvedValueOnce({
      data: { access_token: "token-abc" },
    } as any);

    const payload = {
      email: "new@example.com",
      password: "12345678",
      name: "Nuevo",
    };
    const result = await register(payload);

    expect(clientHTTP.post).toHaveBeenCalledWith("/auth/register", payload);
    expect(result).toEqual({ access_token: "token-abc" });
  });
});
