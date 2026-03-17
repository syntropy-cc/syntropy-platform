/**
 * Unit tests for Badge component.
 * Architecture: COMP-041.5, COMPONENT-LIBRARY Badge
 */

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Badge } from "./badge";

describe("Badge", () => {
  it("renders with default variant and base typography", () => {
    const { container } = render(<Badge data-testid="badge-default">Label</Badge>);
    const badge = container.querySelector("[data-testid=badge-default]");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("Label");
    expect(badge).toHaveClass("rounded-full", "font-medium", "bg-surface-sunken");
  });

  it("applies primary variant classes", () => {
    const { container } = render(
      <Badge variant="primary" data-testid="badge-primary">Primary</Badge>
    );
    expect(container.querySelector("[data-testid=badge-primary]")).toHaveClass(
      "bg-primary-50",
      "text-primary-800"
    );
  });

  it("applies success variant classes", () => {
    const { container } = render(
      <Badge variant="success" data-testid="badge-success">OK</Badge>
    );
    expect(container.querySelector("[data-testid=badge-success]")).toHaveClass(
      "bg-success-light",
      "text-success-700"
    );
  });

  it("applies error variant classes", () => {
    const { container } = render(
      <Badge variant="error" data-testid="badge-error">Error</Badge>
    );
    expect(container.querySelector("[data-testid=badge-error]")).toHaveClass(
      "bg-error-light",
      "text-error-700"
    );
  });

  it("applies warning variant classes", () => {
    const { container } = render(
      <Badge variant="warning" data-testid="badge-warning">Warn</Badge>
    );
    expect(container.querySelector("[data-testid=badge-warning]")).toHaveClass(
      "bg-warning-light",
      "text-warning-700"
    );
  });

  it("applies info variant classes", () => {
    const { container } = render(
      <Badge variant="info" data-testid="badge-info">Info</Badge>
    );
    expect(container.querySelector("[data-testid=badge-info]")).toHaveClass(
      "bg-info-light",
      "text-info-700"
    );
  });

  it("applies pillar variant classes", () => {
    const { container } = render(
      <Badge variant="pillar" data-testid="badge-pillar">Pillar</Badge>
    );
    expect(container.querySelector("[data-testid=badge-pillar]")).toHaveClass(
      "bg-pillar-subtle",
      "text-pillar-text"
    );
  });
});
