/**
 * Component tests for PillarBadge.
 * Architecture: COMP-041, COMPONENT-LIBRARY PillarBadge
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PillarBadge } from "./pillar-badge";

describe("PillarBadge", () => {
  it("renders Learn pillar with default label", () => {
    render(<PillarBadge data-testid="badge-learn" pillar="learn" />);
    const el = screen.getByTestId("badge-learn");
    expect(el).toHaveTextContent("Learn");
    expect(el).toHaveClass("bg-[var(--color-learn-50)]");
    expect(el).toHaveClass("text-[var(--color-learn-800)]");
  });

  it("renders Hub pillar with default label", () => {
    render(<PillarBadge data-testid="badge-hub" pillar="hub" />);
    const el = screen.getByTestId("badge-hub");
    expect(el).toHaveTextContent("Hub");
    expect(el).toHaveClass("bg-[var(--color-hub-50)]");
    expect(el).toHaveClass("text-[var(--color-hub-800)]");
  });

  it("renders Labs pillar with default label", () => {
    render(<PillarBadge data-testid="badge-labs" pillar="labs" />);
    const el = screen.getByTestId("badge-labs");
    expect(el).toHaveTextContent("Labs");
    expect(el).toHaveClass("bg-[var(--color-labs-50)]");
    expect(el).toHaveClass("text-[var(--color-labs-800)]");
  });

  it("uses custom label when provided", () => {
    render(
      <PillarBadge data-testid="badge-custom" pillar="learn" label="Learning" />
    );
    expect(screen.getByTestId("badge-custom")).toHaveTextContent("Learning");
  });

  it("applies badge shape and typography classes", () => {
    const { container } = render(
      <PillarBadge data-testid="badge-shape" pillar="learn" />
    );
    const el = container.querySelector("[data-testid=badge-shape]");
    expect(el).toHaveClass("rounded-full");
    expect(el).toHaveClass("font-medium");
  });

  it("forwards ref to span element", () => {
    let refCurrent: HTMLSpanElement | null = null;
    render(
      <PillarBadge
        data-testid="badge-ref"
        pillar="learn"
        ref={(el) => {
          refCurrent = el;
        }}
      />
    );
    expect(refCurrent).toBe(screen.getByTestId("badge-ref"));
  });
});
