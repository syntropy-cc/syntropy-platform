/**
 * Component tests for PageHeader.
 * Architecture: COMP-041.17, COMPONENT-LIBRARY PageHeader
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageHeader } from "./page-header";

describe("PageHeader", () => {
  it("renders title", () => {
    render(<PageHeader title="Dashboard" />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Dashboard" })
    ).toBeInTheDocument();
  });

  it("renders optional description", () => {
    render(
      <PageHeader
        title="Settings"
        description="Manage your preferences."
      />
    );
    expect(screen.getByText("Manage your preferences.")).toBeInTheDocument();
  });

  it("renders optional action", () => {
    render(
      <PageHeader
        title="Projects"
        action={<button type="button">New project</button>}
      />
    );
    expect(screen.getByRole("button", { name: "New project" })).toBeInTheDocument();
  });
});
