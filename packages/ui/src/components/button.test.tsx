/**
 * Unit tests for Button component.
 * Architecture: COMP-032
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "./button";

describe("Button", () => {
  it("renders with default variant and size", () => {
    const { container } = render(<Button data-testid="btn-default">Click me</Button>);
    const btn = container.querySelector("[data-testid=btn-default]");
    expect(btn).toBeInTheDocument();
    expect(btn?.tagName).toBe("BUTTON");
  });

  it("applies variant classes when variant is secondary", () => {
    const { container } = render(
      <Button variant="secondary" data-testid="btn-secondary">Secondary</Button>
    );
    const btn = container.querySelector("[data-testid=btn-secondary]");
    expect(btn).toHaveClass("bg-muted");
  });

  it("applies size icon for size icon", () => {
    const { container } = render(
      <Button size="icon" data-testid="btn-icon" aria-label="Icon">x</Button>
    );
    const btn = container.querySelector("[data-testid=btn-icon]");
    expect(btn).toHaveClass("h-10", "w-10");
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
