/**
 * Moderation page tests (COMP-032.6).
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import ModerationPage from "./page";

vi.mock("@/lib/api-client", () => ({
  fetchApi: vi.fn(),
}));

const fetchApi = await import("@/lib/api-client").then((m) => m.fetchApi);

describe("Moderation page", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders flag queue when API returns flags", async () => {
    vi.mocked(fetchApi).mockResolvedValue({
      ok: true,
      status: 200,
      data: [
        {
          flagId: "flag-1",
          entityType: "comment",
          entityId: "c1",
          reason: "Spam",
          status: "pending",
          createdAt: "2024-01-15T10:00:00Z",
        },
      ],
      meta: { timestamp: new Date().toISOString() },
    });

    const node = await ModerationPage();
    const { container } = render(node);
    expect(container.querySelector("h1")?.textContent).toBe("Moderation");
    expect(screen.getByText("flag-1")).toBeDefined();
    expect(screen.getByText("comment / c1")).toBeDefined();
    expect(screen.getByText("Spam")).toBeDefined();
    expect(screen.getByText("pending")).toBeDefined();
  });

  it("renders error message when API returns error", async () => {
    vi.mocked(fetchApi).mockResolvedValue({
      ok: false,
      status: 403,
      error: { code: "FORBIDDEN", message: "PlatformModerator role required" },
      meta: {},
    });

    const node = await ModerationPage();
    render(node);
    expect(screen.getByRole("heading", { name: "Moderation" })).toBeDefined();
    expect(screen.getByText(/FORBIDDEN/)).toBeDefined();
    expect(screen.getByText(/PlatformModerator role required/)).toBeDefined();
  });

  it("renders empty state when no flags", async () => {
    vi.mocked(fetchApi).mockResolvedValue({
      ok: true,
      status: 200,
      data: [],
      meta: { timestamp: new Date().toISOString() },
    });

    const node = await ModerationPage();
    render(node);
    expect(screen.getByRole("heading", { name: "Moderation" })).toBeDefined();
    expect(screen.getByText("No flags in queue.")).toBeDefined();
  });
});
