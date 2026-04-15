import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "react-hot-toast";

import { ERROR_MESSAGE } from "@/models/common/axios-error";
import { getFastApiErrorMessage, handleApiErrors } from "./handle-api-error.utility";

vi.mock("react-hot-toast", () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe("getFastApiErrorMessage", () => {
  it("prioriza message cuando existe", () => {
    const msg = getFastApiErrorMessage({ message: "Error principal", detail: "No usado" });
    expect(msg).toBe("Error principal");
  });

  it("concatena detalles tipo array de FastAPI", () => {
    const msg = getFastApiErrorMessage({
      detail: [{ msg: "Campo requerido" }, "otro error"],
    });
    expect(msg).toBe("Campo requerido otro error");
  });
});

describe("handleApiErrors", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("retorna data cuando la llamada es exitosa", async () => {
    const data = await handleApiErrors(async () => ({
      data: { ok: true },
    } as any));

    expect(data).toEqual({ ok: true });
  });

  it("maneja error de red mostrando toast", async () => {
    const networkError = { code: "ERR_NETWORK" };

    await expect(handleApiErrors(async () => Promise.reject(networkError))).rejects.toBe(networkError);
    expect(toast.error).toHaveBeenCalledWith(ERROR_MESSAGE.ERR_NETWORK);
  });

  it("propaga errores 422 usando callback con mensaje parseado", async () => {
    const errorCallback = vi.fn();

    const axiosError = {
      code: "ERR_BAD_REQUEST",
      response: {
        status: 422,
        data: {
          detail: [{ msg: "Formato invalido" }],
          errors: { email: ["email invalido"] },
        },
      },
    };

    await expect(
      handleApiErrors(async () => Promise.reject(axiosError), errorCallback)
    ).rejects.toEqual({
      message: "Formato invalido",
      errors: { email: ["email invalido"] },
    });

    expect(errorCallback).toHaveBeenCalledWith("Formato invalido", { email: ["email invalido"] });
  });
});
