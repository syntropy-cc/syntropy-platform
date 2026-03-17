/**
 * Component tests for EntityHeader.
 * Architecture: COMP-041.17, COMPONENT-LIBRARY EntityHeader
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EntityHeader } from "./entity-header";

describe("EntityHeader", () => {
  it("renders entity name", () => {
    render(<EntityHeader name="Acme Project" />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Acme Project" })
    ).toBeInTheDocument();
  });

  it("renders optional type badge", () => {
    render(
      <EntityHeader name="Acme" typeLabel="Project" />
    );
    expect(screen.getByText("Project")).toBeInTheDocument();
  });

  it("renders optional stats", () => {
    render(
      <EntityHeader
        name="Repo"
        stats={[
          { label: "Issues", value: "12" },
          { label: "Contributors", value: "5" },
        ]}
      />
    );
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("Issues:")).toBeInTheDocument();
  });

  it("renders optional action", () => {
    render(
      <EntityHeader
        name="Lab"
        action={<button type="button">Edit</button>}
      />
    );
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });
});
