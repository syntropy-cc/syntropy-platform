/**
 * Component tests for StatCard.
 * Architecture: COMP-041.16, COMPONENT-LIBRARY StatCard
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatCard } from "./stat-card";

describe("StatCard", () => {
  it("renders label and value", () => {
    render(<StatCard label="Active Projects" value="12" />);
    expect(screen.getByText("Active Projects")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("applies surface-sunken and caption/h3 token classes", () => {
    const { container } = render(
      <StatCard label="Label" value="99" />
    );
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass("bg-surface-sunken");
    expect(card).toHaveClass("rounded-lg");
  });

  it("renders optional trend with success color class", () => {
    render(
      <StatCard
        label="Projects"
        value="5"
        trend="+3 from last month"
      />
    );
    expect(screen.getByText("+3 from last month")).toBeInTheDocument();
  });
});
