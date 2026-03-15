/**
 * Unit tests for IdeReconnectionIndicator (COMP-035.4).
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { IdeReconnectionIndicator } from "./ide-reconnection-indicator";

describe("IdeReconnectionIndicator", () => {
  it("returns null when reconnecting is false", () => {
    const { container } = render(
      <IdeReconnectionIndicator reconnecting={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("shows Reconnecting… when reconnecting is true", () => {
    render(<IdeReconnectionIndicator reconnecting={true} />);
    const el = screen.getByTestId("ide-reconnection-indicator");
    expect(el).toBeInTheDocument();
    expect(el).toHaveTextContent("Reconnecting…");
    expect(el).toHaveAttribute("role", "status");
    expect(el).toHaveAttribute("aria-live", "polite");
  });
});
