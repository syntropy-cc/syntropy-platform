/**
 * Component tests for ProgressBar.
 * Architecture: COMP-041, COMPONENT-LIBRARY ProgressBar
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressBar } from "./progress-bar";

describe("ProgressBar", () => {
  it("renders with progressbar role and ARIA attributes", () => {
    render(<ProgressBar data-testid="progress-default" value={35} />);
    const root = screen.getByTestId("progress-default");
    expect(root).toHaveAttribute("role", "progressbar");
    expect(root).toHaveAttribute("aria-valuenow", "35");
    expect(root).toHaveAttribute("aria-valuemin", "0");
    expect(root).toHaveAttribute("aria-valuemax", "100");
  });

  it("clamps value to 0-100 range", () => {
    const { rerender } = render(
      <ProgressBar data-testid="progress-clamp" value={150} />
    );
    expect(screen.getByTestId("progress-clamp")).toHaveAttribute(
      "aria-valuenow",
      "100"
    );

    rerender(<ProgressBar data-testid="progress-clamp" value={-10} />);
    expect(screen.getByTestId("progress-clamp")).toHaveAttribute(
      "aria-valuenow",
      "0"
    );
  });

  it("uses action-primary for fill", () => {
    const { container } = render(
      <ProgressBar data-testid="progress-fill" value={50} />
    );
    const fill = container.querySelector(
      "[data-testid=progress-fill] > div[aria-hidden]"
    );
    expect(fill).toHaveClass("bg-[var(--action-primary)]");
  });

  it("has 8px track height", () => {
    const { container } = render(
      <ProgressBar data-testid="progress-height" value={0} />
    );
    const root = container.querySelector("[data-testid=progress-height]");
    expect(root).toHaveClass("h-2");
  });

  it("accepts aria-label for screen readers", () => {
    render(
      <ProgressBar
        data-testid="progress-label"
        value={75}
        aria-label="75% complete"
      />
    );
    expect(screen.getByTestId("progress-label")).toHaveAttribute(
      "aria-label",
      "75% complete"
    );
  });

  it("forwards ref to root element", () => {
    let refCurrent: HTMLDivElement | null = null;
    render(
      <ProgressBar
        data-testid="progress-ref"
        value={0}
        ref={(el) => {
          refCurrent = el;
        }}
      />
    );
    expect(refCurrent).toBe(screen.getByTestId("progress-ref"));
  });
});
