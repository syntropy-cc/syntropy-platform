/**
 * Component tests for Textarea.
 * Architecture: COMP-041, COMPONENT-LIBRARY Textarea
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Textarea } from "./textarea";

describe("Textarea", () => {
  it("renders with min-height 80px and resize vertical", () => {
    const { container } = render(
      <Textarea data-testid="textarea-default" placeholder="Enter text" />
    );
    const textarea = container.querySelector("[data-testid=textarea-default]");
    expect(textarea).toBeInTheDocument();
    expect(textarea?.tagName).toBe("TEXTAREA");
    expect(textarea).toHaveClass("min-h-[80px]", "resize-y");
  });

  it("applies same border and focus ring as Input", () => {
    const { container } = render(
      <Textarea data-testid="textarea-focus" placeholder="Focus" />
    );
    const textarea = container.querySelector("[data-testid=textarea-focus]");
    expect(textarea).toHaveClass(
      "border-border",
      "focus-visible:shadow-[var(--focus-ring)]"
    );
  });

  it("applies error border and aria-invalid when error is true", () => {
    const { container } = render(
      <Textarea data-testid="textarea-error" error placeholder="Error" />
    );
    const textarea = container.querySelector("[data-testid=textarea-error]");
    expect(textarea).toHaveClass("border-[var(--border-error)]");
    expect(textarea).toHaveAttribute("aria-invalid", "true");
  });

  it("applies disabled styles when disabled", () => {
    const { container } = render(
      <Textarea data-testid="textarea-disabled" disabled placeholder="Off" />
    );
    const textarea = container.querySelector("[data-testid=textarea-disabled]");
    expect(textarea).toBeDisabled();
    expect(textarea).toHaveClass("disabled:opacity-50");
  });

  it("forwards ref to native textarea", () => {
    let refCurrent: HTMLTextAreaElement | null = null;
    render(
      <Textarea
        data-testid="textarea-ref"
        ref={(el) => {
          refCurrent = el;
        }}
      />
    );
    const textarea = screen.getByTestId("textarea-ref");
    expect(refCurrent).toBe(textarea);
  });

  it("merges custom className", () => {
    const { container } = render(
      <Textarea data-testid="textarea-custom" className="my-class" />
    );
    const textarea = container.querySelector("[data-testid=textarea-custom]");
    expect(textarea).toHaveClass("my-class");
  });
});
