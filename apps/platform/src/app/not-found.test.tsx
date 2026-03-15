/**
 * Not-found page tests (COMP-032.8).
 */

import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import NotFound from "./not-found";

describe("Not-found page", () => {
  it("renders 404 message and links", () => {
    render(<NotFound />);
    expect(screen.getByRole("heading", { name: "Page not found" })).toBeDefined();
    expect(screen.getByText(/exist or has been moved/)).toBeDefined();
    expect(screen.getByRole("link", { name: "Home" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Dashboard" })).toBeDefined();
  });
});
