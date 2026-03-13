/**
 * Unit tests for AuthProvider (COMP-032.2). Verifies AuthContext.Provider passes value to descendants.
 * Full AuthProvider integration is covered by useUser tests and manual verification.
 */

import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthContext } from "./AuthProvider";

function Consumer() {
  const { loading, user } = React.useContext(AuthContext);
  if (loading) return <span>loading</span>;
  return <span>{user ? user.email : "anonymous"}</span>;
}

describe("AuthProvider / AuthContext", () => {
  it("AuthContext.Provider passes value to descendants", () => {
    render(
      <AuthContext.Provider
        value={{
          user: null,
          session: null,
          loading: false,
          error: null,
        }}
      >
        <Consumer />
      </AuthContext.Provider>
    );
    expect(screen.getByText("anonymous")).toBeDefined();
  });
});
