/**
 * Unit tests for Button component.
 * Architecture: COMP-041, COMPONENT-LIBRARY Button
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "./button";

describe("Button", () => {
  it("renders with default variant (primary) and size (md)", () => {
    const { container } = render(
      <Button data-testid="btn-default">Click me</Button>
    );
    const btn = container.querySelector("[data-testid=btn-default]");
    expect(btn).toBeInTheDocument();
    expect(btn?.tagName).toBe("BUTTON");
    expect(btn).toHaveClass("bg-primary", "h-10");
  });

  it("applies primary variant classes when variant is primary", () => {
    const { container } = render(
      <Button variant="primary" data-testid="btn-primary">
        Primary
      </Button>
    );
    const btn = container.querySelector("[data-testid=btn-primary]");
    expect(btn).toHaveClass("bg-primary", "text-primary-foreground");
  });

  it("applies secondary variant classes when variant is secondary", () => {
    const { container } = render(
      <Button variant="secondary" data-testid="btn-secondary">
        Secondary
      </Button>
    );
    const btn = container.querySelector("[data-testid=btn-secondary]");
    expect(btn).toHaveClass("bg-surface", "border-border");
  });

  it("applies focus ring via design token", () => {
    const { container } = render(
      <Button data-testid="btn-focus">Focus</Button>
    );
    const btn = container.querySelector("[data-testid=btn-focus]");
    expect(btn).toHaveClass("focus-visible:shadow-[var(--focus-ring)]");
  });

  it("applies size icon when variant is icon-only", () => {
    const { container } = render(
      <Button variant="icon-only" aria-label="Close" data-testid="btn-icon">
        <span aria-hidden>x</span>
      </Button>
    );
    const btn = container.querySelector("[data-testid=btn-icon]");
    expect(btn).toHaveClass("h-10", "w-10");
    expect(btn).toHaveAttribute("aria-label", "Close");
  });

  it("sets aria-busy and hides children when loading is true", () => {
    const { container } = render(
      <Button loading data-testid="btn-loading">
        Submit
      </Button>
    );
    const btn = container.querySelector("[data-testid=btn-loading]");
    expect(btn).toHaveAttribute("aria-busy", "true");
    expect(btn).toBeDisabled();
    expect(btn?.querySelector("svg")).toBeInTheDocument();
    expect(btn?.textContent).not.toContain("Submit");
  });

  it("applies size sm (32px height) and lg (48px height)", () => {
    const { container } = render(
      <>
        <Button size="sm" data-testid="btn-sm">Small</Button>
        <Button size="lg" data-testid="btn-lg">Large</Button>
      </>
    );
    expect(container.querySelector("[data-testid=btn-sm]")).toHaveClass("h-8");
    expect(container.querySelector("[data-testid=btn-lg]")).toHaveClass("h-12");
  });

  it("forwards ref and extra props", () => {
    const onClick = vi.fn();
    render(
      <Button type="submit" data-testid="custom-btn" onClick={onClick}>
        Submit
      </Button>
    );
    const btn = screen.getByTestId("custom-btn");
    expect(btn).toHaveAttribute("type", "submit");
    btn.click();
    expect(onClick).toHaveBeenCalled();
  });
});
