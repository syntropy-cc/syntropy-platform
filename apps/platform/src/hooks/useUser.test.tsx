/**
 * Unit tests for useUser (COMP-032.2). useUser returns context state; tests use mock provider.
 */

import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { useUser } from "./useUser";
import { AuthContext } from "@/components/auth/AuthProvider";

function TestConsumer() {
  const { user, loading, error } = useUser();
  if (loading) return <span>loading</span>;
  if (error) return <span>error</span>;
  return <span>{user ? user.email : "anonymous"}</span>;
}

describe("useUser", () => {
  it("returns user when provided in context", () => {
    const mockUser = {
      id: "user-1",
      email: "test@example.com",
      app_metadata: {},
      user_metadata: {},
      aud: "authenticated",
      created_at: "",
    } as ReturnType<typeof useUser>["user"];
    render(
      <AuthContext.Provider
        value={{
          user: mockUser,
          session: null,
          loading: false,
          error: null,
        }}
      >
        <TestConsumer />
      </AuthContext.Provider>
    );
    expect(screen.getByText("test@example.com")).toBeDefined();
  });

  it("returns anonymous when user is null in context", () => {
    render(
      <AuthContext.Provider
        value={{
          user: null,
          session: null,
          loading: false,
          error: null,
        }}
      >
        <TestConsumer />
      </AuthContext.Provider>
    );
    expect(screen.getByText("anonymous")).toBeDefined();
  });

  it("returns loading state when loading is true", () => {
    render(
      <AuthContext.Provider
        value={{
          user: null,
          session: null,
          loading: true,
          error: null,
        }}
      >
        <TestConsumer />
      </AuthContext.Provider>
    );
    expect(screen.getByText("loading")).toBeDefined();
  });
});
