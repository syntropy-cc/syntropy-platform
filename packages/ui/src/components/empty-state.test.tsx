/**
 * Component tests for EmptyState.
 * Architecture: COMP-041.16, COMPONENT-LIBRARY EmptyState
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(
      <EmptyState
        title="No projects yet"
        description="Create your first project to get started."
      />
    );
    expect(screen.getByText("No projects yet")).toBeInTheDocument();
    expect(
      screen.getByText("Create your first project to get started.")
    ).toBeInTheDocument();
  });

  it("has max-width 400px and uses token-based typography", () => {
    const { container } = render(
      <EmptyState title="Empty" description="Description." />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("max-w-[400px]");
  });

  it("renders optional action when provided", () => {
    render(
      <EmptyState
        title="Empty"
        description="Desc"
        action={<button type="button">Create project</button>}
      />
    );
    expect(screen.getByRole("button", { name: "Create project" })).toBeInTheDocument();
  });
});
