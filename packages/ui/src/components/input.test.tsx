/**
 * Component tests for Input.
 * Architecture: COMP-041, COMPONENT-LIBRARY Input
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Input } from "./input";

describe("Input", () => {
  it("renders with default styles (height 40px, border, padding)", () => {
    const { container } = render(
      <Input data-testid="input-default" placeholder="Enter text" />
    );
    const input = container.querySelector("[data-testid=input-default]");
    expect(input).toBeInTheDocument();
    expect(input?.tagName).toBe("INPUT");
    expect(input).toHaveClass("h-10", "rounded-md", "border", "px-3");
  });

  it("applies focus ring class for keyboard focus", () => {
    const { container } = render(
      <Input data-testid="input-focus" placeholder="Focus" />
    );
    const input = container.querySelector("[data-testid=input-focus]");
    expect(input).toHaveClass("focus-visible:shadow-[var(--focus-ring)]");
  });

  it("applies error border and aria-invalid when error is true", () => {
    const { container } = render(
      <Input data-testid="input-error" error placeholder="Error state" />
    );
    const input = container.querySelector("[data-testid=input-error]");
    expect(input).toHaveClass("border-[var(--border-error)]");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("applies focus ring error class when error is true", () => {
    const { container } = render(
      <Input data-testid="input-error-focus" error placeholder="Error" />
    );
    const input = container.querySelector("[data-testid=input-error-focus]");
    expect(input).toHaveClass("focus-visible:shadow-[var(--focus-ring-error)]");
  });

  it("applies disabled attribute and disabled styles when disabled", () => {
    const { container } = render(
      <Input data-testid="input-disabled" disabled placeholder="Disabled" />
    );
    const input = container.querySelector("[data-testid=input-disabled]");
    expect(input).toBeDisabled();
    expect(input).toHaveClass("disabled:opacity-50", "disabled:bg-surface-sunken");
  });

  it("forwards ref to native input", () => {
    let refCurrent: HTMLInputElement | null = null;
    render(
      <Input
        data-testid="input-ref"
        ref={(el) => {
          refCurrent = el;
        }}
      />
    );
    const input = screen.getByTestId("input-ref");
    expect(refCurrent).toBe(input);
  });

  it("supports type prop (text, email, password)", () => {
    const { container } = render(
      <>
        <Input data-testid="input-text" type="text" />
        <Input data-testid="input-email" type="email" />
        <Input data-testid="input-password" type="password" />
      </>
    );
    expect(container.querySelector("[data-testid=input-text]")).toHaveAttribute(
      "type",
      "text"
    );
    expect(container.querySelector("[data-testid=input-email]")).toHaveAttribute(
      "type",
      "email"
    );
    expect(
      container.querySelector("[data-testid=input-password]")
    ).toHaveAttribute("type", "password");
  });

  it("defaults type to text", () => {
    const { container } = render(<Input data-testid="input-no-type" />);
    expect(container.querySelector("[data-testid=input-no-type]")).toHaveAttribute(
      "type",
      "text"
    );
  });

  it("merges custom className", () => {
    const { container } = render(
      <Input data-testid="input-custom" className="custom-class" />
    );
    const input = container.querySelector("[data-testid=input-custom]");
    expect(input).toHaveClass("custom-class");
  });
});
