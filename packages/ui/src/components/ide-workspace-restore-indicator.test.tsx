/**
 * Unit tests for IdeWorkspaceRestoreIndicator (COMP-035.6).
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { IdeWorkspaceRestoreIndicator } from "./ide-workspace-restore-indicator";

describe("IdeWorkspaceRestoreIndicator", () => {
  it("returns null when restoring is false", () => {
    const { container } = render(
      <IdeWorkspaceRestoreIndicator restoring={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("shows Restoring workspace… when restoring is true", () => {
    render(<IdeWorkspaceRestoreIndicator restoring={true} />);
    const el = screen.getByTestId("ide-workspace-restore-indicator");
    expect(el).toBeInTheDocument();
    expect(el).toHaveTextContent("Restoring workspace…");
    expect(el).toHaveAttribute("role", "status");
    expect(el).toHaveAttribute("aria-live", "polite");
  });
});
