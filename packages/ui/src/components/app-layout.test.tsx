/**
 * Component tests for AppLayout.
 * Architecture: COMP-032
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppLayout } from "./app-layout";

describe("AppLayout", () => {
  it("renders children in main content area", () => {
    const { container } = render(
      <AppLayout>
        <p>Main content</p>
      </AppLayout>
    );
    expect(container.querySelector("main")).toHaveTextContent("Main content");
  });

  it("renders default nav links for Platform, Learn, Hub, Labs", () => {
    const { container } = render(<AppLayout><span>Content</span></AppLayout>);
    const nav = container.querySelector("nav");
    expect(nav).toBeInTheDocument();
    expect(nav?.textContent).toMatch(/Platform/);
    expect(nav?.textContent).toMatch(/Learn/);
    expect(nav?.textContent).toMatch(/Hub/);
    expect(nav?.textContent).toMatch(/Labs/);
  });

  it("uses custom nav links when provided", () => {
    const navLinks = [
      { href: "/custom-a", label: "Custom A" },
      { href: "/custom-b", label: "Custom B" },
    ];
    const { container } = render(
      <AppLayout navLinks={navLinks}>
        <span>Content</span>
      </AppLayout>
    );
    const linkA = Array.from(container.querySelectorAll("a")).find((a) => a.getAttribute("href") === "/custom-a");
    const linkB = Array.from(container.querySelectorAll("a")).find((a) => a.getAttribute("href") === "/custom-b");
    expect(linkA).toHaveTextContent("Custom A");
    expect(linkB).toHaveTextContent("Custom B");
  });

  it("renders headerRight slot when provided", () => {
    const { container } = render(
      <AppLayout headerRight={<button type="button">Extra</button>}>
        <span>Content</span>
      </AppLayout>
    );
    const btn = container.querySelector("header button");
    expect(btn).toHaveTextContent("Extra");
  });

  it("has banner role on header for accessibility", () => {
    const { container } = render(<AppLayout><span>Content</span></AppLayout>);
    expect(container.querySelector("header[role=banner]")).toBeInTheDocument();
  });
});
