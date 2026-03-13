/**
 * Unit tests for AuthProvider (COMP-032.2). Verifies provider renders children and passes context.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthProvider, useAuthContext } from "./AuthProvider";

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  }),
}));

function Consumer() {
  const { loading } = useAuthContext();
  return <span>{loading ? "loading" : "ready"}</span>;
}

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders children", () => {
    render(
      <AuthProvider>
        <span>child</span>
      </AuthProvider>
    );
    expect(screen.getByText("child")).toBeDefined();
  });

  it("provides auth context to descendants", async () => {
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );
    expect(screen.getByText(/loading|ready/)).toBeDefined();
  });
});
