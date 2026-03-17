/**
 * Unit tests for Sheet component.
 * Architecture: COMP-041.6, COMPONENT-LIBRARY Sheet
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Sheet } from "./sheet";

describe("Sheet", () => {
  it("renders panel with token-based classes when open", () => {
    render(
      <Sheet open onClose={() => {}}>
        <div data-testid="sheet-content">Panel content</div>
      </Sheet>
    );
    const content = screen.getByTestId("sheet-content");
    expect(content).toBeInTheDocument();
    expect(content).toHaveTextContent("Panel content");
    const panel = document.querySelector("[role=dialog]");
    expect(panel).toHaveClass("bg-surface", "border-border", "shadow-lg");
  });
});
