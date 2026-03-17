/**
 * Component tests for Switch.
 * Architecture: COMP-041, COMPONENT-LIBRARY Switch
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Switch } from "./switch";

describe("Switch", () => {
  it("renders with default unchecked state", () => {
    render(<Switch data-testid="switch-default" />);
    const root = screen.getByTestId("switch-default");
    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute("role", "switch");
    expect(root).toHaveAttribute("aria-checked", "false");
    expect(root).toHaveAttribute("data-state", "unchecked");
  });

  it("applies checked state and aria-checked when checked", () => {
    render(<Switch data-testid="switch-checked" checked />);
    const root = screen.getByTestId("switch-checked");
    expect(root).toHaveAttribute("aria-checked", "true");
    expect(root).toHaveAttribute("data-state", "checked");
  });

  it("applies disabled attribute when disabled", () => {
    render(<Switch data-testid="switch-disabled" disabled />);
    const root = screen.getByTestId("switch-disabled");
    expect(root).toHaveAttribute("data-disabled");
    expect(root).toHaveClass("disabled:opacity-50");
  });

  it("has 40x24px track dimensions", () => {
    const { container } = render(
      <Switch data-testid="switch-size" />
    );
    const root = container.querySelector("[data-testid=switch-size]");
    expect(root).toHaveClass("h-6", "w-10");
  });

  it("uses action-primary when checked", () => {
    const { container } = render(
      <Switch data-testid="switch-checked-style" checked />
    );
    const root = container.querySelector("[data-testid=switch-checked-style]");
    expect(root).toHaveClass("data-[state=checked]:bg-[var(--action-primary)]");
  });

  it("forwards ref to root element", () => {
    let refCurrent: HTMLButtonElement | null = null;
    render(
      <Switch
        data-testid="switch-ref"
        ref={(el) => {
          refCurrent = el;
        }}
      />
    );
    const root = screen.getByTestId("switch-ref");
    expect(refCurrent).toBe(root);
  });
});
