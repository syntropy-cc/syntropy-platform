/**
 * Unit tests for Footer component.
 * Architecture: COMP-041.7, COMPONENT-LIBRARY Footer
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "./footer";

describe("Footer", () => {
  it("renders with default columns and token-based background", () => {
    const { container } = render(<Footer />);
    const footer = container.firstChild as HTMLElement;
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveClass("bg-surface-sunken");
  });

  it("renders custom columns and copyright", () => {
    render(
      <Footer
        columns={[
          { title: "Links", links: [{ label: "Home", href: "/" }] },
        ]}
        copyright="© 2026 Test"
      />
    );
    expect(screen.getByText("Links")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("© 2026 Test")).toBeInTheDocument();
  });
});
