/**
 * Component tests for ListRow.
 * Architecture: COMP-041.18, COMPONENT-LIBRARY ListRow
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ListRow } from "./list-row";

describe("ListRow", () => {
  it("renders title", () => {
    render(<ListRow title="Issue title" />);
    expect(screen.getByText("Issue title")).toBeInTheDocument();
  });

  it("applies hover and selected token classes", () => {
    const { container } = render(
      <ListRow title="Row" selected />
    );
    const row = container.firstChild as HTMLElement;
    expect(row).toHaveClass("hover:bg-[var(--bg-hover)]");
    expect(row).toHaveClass("bg-[var(--bg-selected)]");
  });

  it("renders optional status dot with success color when status is success", () => {
    const { container } = render(
      <ListRow title="Done" status="success" />
    );
    const dot = container.querySelector(".rounded-full.bg-\\[var\\(--color-success-500\\)\\]");
    expect(dot).toBeInTheDocument();
  });

  it("renders as link when href is provided", () => {
    const { container } = render(<ListRow title="Link row" href="/items/1" />);
    const link = container.querySelector('a[href="/items/1"]');
    expect(link).toBeInTheDocument();
  });

  it("renders optional metadata", () => {
    render(<ListRow title="Row" metadata="2 days ago" />);
    expect(screen.getByText("2 days ago")).toBeInTheDocument();
  });
});
