import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import EventDetail from "./EventDetail";
import EventsService from "@/services/app/events/events.service";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

const navigateMock = vi.fn();

vi.mock("react-router-dom", () => ({
  Link: ({ children }: { children: any }) => <a>{children}</a>,
  useNavigate: () => navigateMock,
  useParams: () => ({ eventId: "1" }),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/services/app/events/events.service", () => ({
  default: {
    getById: vi.fn(),
    getSessions: vi.fn(),
    subscribe: vi.fn(),
    leaveEventSelf: vi.fn(),
    createSession: vi.fn(),
  },
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("EventDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: { sub: "admin@example.com", role: "admin", exp: 9999999999 },
      login: vi.fn(),
      logout: vi.fn(),
      loading: false,
    });
    vi.mocked(EventsService.getById).mockResolvedValue({
      id: 1,
      title: "Evento Demo",
      description: "Descripción demo",
      capacity: 10,
      date: "2026-04-20",
      state: "scheduled",
      registered_count: 2,
      role: null,
      total_inscritos: 2,
    });
    vi.mocked(EventsService.getSessions).mockResolvedValue([
      {
        id: 2,
        event_id: 1,
        title: "Sesión B",
        speaker: "Ponente B",
        start_time: "2026-04-20T12:00:00",
        end_time: "2026-04-20T13:00:00",
        capacity: 20,
      },
      {
        id: 1,
        event_id: 1,
        title: "Sesión A",
        speaker: "Ponente A",
        start_time: "2026-04-20T10:00:00",
        end_time: "2026-04-20T11:00:00",
        capacity: 10,
      },
    ]);
    vi.mocked(EventsService.subscribe).mockResolvedValue({
      id: 1,
      title: "Evento Demo",
      description: "Descripción demo",
      capacity: 10,
      date: "2026-04-20",
      state: "scheduled",
      registered_count: 3,
    } as any);
    vi.mocked(EventsService.createSession).mockResolvedValue({
      id: 3,
      event_id: 1,
      title: "Nueva sesión",
      speaker: "Ponente",
      start_time: "2026-04-20T14:00:00",
      end_time: "2026-04-20T15:00:00",
      capacity: 8,
    });
  });

  it("carga el evento y muestra las sesiones", async () => {
    render(<EventDetail />);

    expect(await screen.findByText("Evento Demo")).toBeInTheDocument();
    expect(screen.getByText("Sesiones del evento")).toBeInTheDocument();
    expect(screen.getByText("Sesión A")).toBeInTheDocument();
    expect(screen.getByText("Sesión B")).toBeInTheDocument();
    expect(EventsService.getById).toHaveBeenCalledWith(1);
    expect(EventsService.getSessions).toHaveBeenCalledWith(1);
  });

  it("permite suscribirse al evento", async () => {
    render(<EventDetail />);
    const subscribeBtn = await screen.findByRole("button", {
      name: "Inscribirme al evento",
    });

    fireEvent.click(subscribeBtn);

    await waitFor(() => {
      expect(EventsService.subscribe).toHaveBeenCalledWith(
        { id: 1 },
        expect.any(Function),
      );
      expect(toast.success).toHaveBeenCalledWith("Inscripción completada");
    });
  });

  it("no muestra inscripción si el aforo ya está completo", async () => {
    vi.mocked(EventsService.getById).mockResolvedValue({
      id: 1,
      title: "Evento lleno",
      description: "x",
      capacity: 2,
      date: "2026-04-22",
      state: "scheduled",
      registered_count: 2,
      role: null,
      total_inscritos: 2,
    });

    render(<EventDetail />);

    expect(await screen.findByText("Evento lleno")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Inscribirme al evento" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/Cupo completo/i, { exact: false }),
    ).toBeInTheDocument();
  });

  it("permite crear sesión cuando tiene permisos de gestión", async () => {
    render(<EventDetail />);
    expect(
      await screen.findByRole("heading", { name: "Crear sesión" }),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Ej. Taller de React"), {
      target: { value: "Charla de testing" },
    });
    fireEvent.change(screen.getByPlaceholderText("Nombre del expositor"), {
      target: { value: "QA Lead" },
    });
    const [startInput, endInput] = document.querySelectorAll(
      'input[type="datetime-local"]',
    );
    fireEvent.change(startInput as Element, {
      target: { value: "2026-04-20T09:00" },
    });
    fireEvent.change(endInput as Element, {
      target: { value: "2026-04-20T10:00" },
    });
    fireEvent.change(screen.getByDisplayValue("1"), {
      target: { value: "25" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Crear sesión" }));

    await waitFor(() => {
      expect(EventsService.createSession).toHaveBeenCalledWith(
        1,
        {
          title: "Charla de testing",
          speaker: "QA Lead",
          start_time: "2026-04-20T09:00",
          end_time: "2026-04-20T10:00",
          capacity: 25,
        },
        expect.any(Function),
      );
      expect(toast.success).toHaveBeenCalledWith("Sesión creada");
    });
  });
});
