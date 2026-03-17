/**
 * Component tests for Checkbox.
 * Architecture: COMP-041, COMPONENT-LIBRARY Checkbox
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Checkbox } from "./checkbox";

describe("Checkbox", () => {
  it("renders with default unchecked state", () => {
    render(<Checkbox data-testid="checkbox-default" />);
    const root = screen.getByTestId("checkbox-default");
    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute("aria-checked", "false");
    expect(root).toHaveAttribute("data-state", "unchecked");
  });

  it("applies checked state and aria-checked when checked", () => {
    render(<Checkbox data-testid="checkbox-checked" checked />);
    const root = screen.getByTestId("checkbox-checked");
    expect(root).toHaveAttribute("aria-checked", "true");
    expect(root).toHaveAttribute("data-state", "checked");
  });

  it("applies disabled attribute and disabled styles when disabled", () => {
    render(<Checkbox data-testid="checkbox-disabled" disabled />);
    const root = screen.getByTestId("checkbox-disabled");
    expect(root).toHaveAttribute("data-disabled");
    expect(root).toHaveClass("disabled:opacity-50");
  });

  it("applies focus ring class for keyboard focus", () => {
    const { container } = render(
      <Checkbox data-testid="checkbox-focus" />
    );
    const root = container.querySelector("[data-testid=checkbox-focus]");
    expect(root).toHaveClass("focus-visible:shadow-[var(--focus-ring)]");
  });

  it("uses action-primary when checked", () => {
    const { container } = render(
      <Checkbox data-testid="checkbox-checked-style" checked />
    );
    const root = container.querySelector("[data-testid=checkbox-checked-style]");
    expect(root).toHaveClass("data-[state=checked]:bg-[var(--action-primary)]");
  });

  it("supports indeterminate state", () => {
    render(
      <Checkbox data-testid="checkbox-indeterminate" checked="indeterminate" />
    );
    const root = screen.getByTestId("checkbox-indeterminate");
    expect(root).toHaveAttribute("aria-checked", "mixed");
    expect(root).toHaveAttribute("data-state", "indeterminate");
  });

  it("forwards ref to root element", () => {
    let refCurrent: HTMLButtonElement | null = null;
    render(
      <Checkbox
        data-testid="checkbox-ref"
        ref={(el) => {
          refCurrent = el;
        }}
      />
    );
    const root = screen.getByTestId("checkbox-ref");
    expect(refCurrent).toBe(root);
  });
});
