/**
 * Component tests for Tooltip.
 * Architecture: COMP-041, COMPONENT-LIBRARY Tooltip
 * Note: Radix renders tooltip content in a portal (document.body), so we use screen for content queries.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  tooltipDelayDuration,
} from "./tooltip";

describe("Tooltip", () => {
  it("uses 300ms delay duration per COMPONENT-LIBRARY", () => {
    expect(tooltipDelayDuration).toBe(300);
  });

  it("renders trigger and content with default open for testing", () => {
    render(
      <TooltipProvider>
        <Tooltip defaultOpen>
          <TooltipTrigger asChild>
            <button type="button">Hover me</button>
          </TooltipTrigger>
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    expect(screen.getByRole("button", { name: /hover me/i })).toBeInTheDocument();
    const tooltip = screen.getByRole("tooltip", { name: /tooltip text/i });
    expect(tooltip).toHaveTextContent("Tooltip text");
  });

  it("trigger has aria-describedby pointing to tooltip id when open", () => {
    render(
      <TooltipProvider>
        <Tooltip defaultOpen>
          <TooltipTrigger asChild>
            <button type="button">Trigger</button>
          </TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    const trigger = screen.getByRole("button", { name: /trigger/i });
    const tooltip = screen.getByRole("tooltip", { name: /content/i });
    const describedBy = trigger.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(tooltip.id).toBe(describedBy);
  });

  it("content has token-based classes (radius, shadow, caption)", () => {
    render(
      <TooltipProvider>
        <Tooltip defaultOpen>
          <TooltipTrigger asChild>
            <button type="button">Trigger</button>
          </TooltipTrigger>
          <TooltipContent data-testid="tooltip-tokens">Token content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    const content = screen.getByTestId("tooltip-tokens");
    expect(content).toHaveClass("rounded-[var(--radius-md)]");
    expect(content).toHaveClass("shadow-[var(--shadow-md)]");
    expect(content).toHaveClass("text-[length:var(--text-caption)]");
  });

  it("content has z-index token for tooltip layer", () => {
    render(
      <TooltipProvider>
        <Tooltip defaultOpen>
          <TooltipTrigger asChild>
            <button type="button">Trigger</button>
          </TooltipTrigger>
          <TooltipContent data-testid="tooltip-z">Z content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    const content = screen.getByTestId("tooltip-z");
    expect(content).toHaveClass("z-[var(--z-tooltip)]");
  });
});
