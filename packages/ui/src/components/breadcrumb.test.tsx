/**
 * Component tests for Breadcrumb.
 * Architecture: COMP-041.15, COMPONENT-LIBRARY Breadcrumb
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbSeparator,
} from "./breadcrumb";

describe("Breadcrumb", () => {
  it("renders nav with aria-label Breadcrumb", () => {
    render(
      <Breadcrumb>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
      </Breadcrumb>
    );
    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(nav).toBeInTheDocument();
  });

  it("renders current item with aria-current page and primary text class", () => {
    render(
      <Breadcrumb>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem isCurrent>Current</BreadcrumbItem>
      </Breadcrumb>
    );
    const current = screen.getByText("Current");
    expect(current).toHaveAttribute("aria-current", "page");
    expect(current).toHaveClass("text-[var(--text-primary)]");
  });

  it("renders parent items as links with text-link", () => {
    render(
      <Breadcrumb>
        <BreadcrumbItem href="/learn">Learn</BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem isCurrent>Track</BreadcrumbItem>
      </Breadcrumb>
    );
    const link = screen.getByRole("link", { name: "Learn" });
    expect(link).toHaveAttribute("href", "/learn");
    expect(link).toHaveClass("text-[var(--text-link)]");
  });
});
