/**
 * Error boundary tests (COMP-032.8).
 */

import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import ErrorBoundary from "./error";

describe("Error boundary", () => {
  afterEach(() => cleanup());

  it("renders error message and reference when digest present", () => {
    const reset = vi.fn();
    render(
      <ErrorBoundary
        error={Object.assign(new Error("Test error"), { digest: "ref-123" })}
        reset={reset}
      />
    );
    expect(screen.getByText("Something went wrong")).toBeDefined();
    expect(screen.getByText(/Reference for support/)).toBeDefined();
    expect(screen.getByText("ref-123")).toBeDefined();
  });

  it("calls reset when Try again is clicked", () => {
    const reset = vi.fn();
    const { container } = render(<ErrorBoundary error={new Error("Fail")} reset={reset} />);
    const button = container.querySelector("button");
    expect(button).toBeDefined();
    expect(button?.tagName).toBe("BUTTON");
    if (button) fireEvent.click(button);
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
