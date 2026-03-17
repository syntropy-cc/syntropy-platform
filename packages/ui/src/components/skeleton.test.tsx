/**
 * Component tests for Skeleton.
 * Architecture: COMP-041, COMPONENT-LIBRARY Skeleton
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Skeleton } from "./skeleton";

describe("Skeleton", () => {
  it("renders with surface-sunken background", () => {
    const { container } = render(
      <Skeleton data-testid="skeleton-default" />
    );
    const el = container.querySelector("[data-testid=skeleton-default]");
    expect(el).toBeInTheDocument();
    expect(el).toHaveStyle({
      backgroundColor: "var(--bg-surface-sunken)",
    });
  });

  it("applies custom className for shape/size", () => {
    render(
      <Skeleton data-testid="skeleton-custom" className="h-4 w-32" />
    );
    const el = screen.getByTestId("skeleton-custom");
    expect(el).toHaveClass("h-4", "w-32");
  });

  it("includes reduced-motion override to disable animation", () => {
    const { container } = render(
      <Skeleton data-testid="skeleton-motion" />
    );
    const el = container.querySelector("[data-testid=skeleton-motion]");
    expect(el).toHaveClass("motion-reduce:animate-none");
  });

  it("forwards ref to div element", () => {
    let refCurrent: HTMLDivElement | null = null;
    render(
      <Skeleton
        data-testid="skeleton-ref"
        ref={(el) => {
          refCurrent = el;
        }}
      />
    );
    expect(refCurrent).toBe(screen.getByTestId("skeleton-ref"));
  });
});
