/**
 * Component tests for Avatar.
 * Architecture: COMP-041, COMPONENT-LIBRARY Avatar
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Avatar } from "./avatar";

describe("Avatar", () => {
  it("renders with default size (md)", () => {
    const { container } = render(
      <Avatar data-testid="avatar-md" alt="Jane Doe" />
    );
    const root = container.querySelector("[data-testid=avatar-md]");
    expect(root).toBeInTheDocument();
    expect(root).toHaveClass("size-8");
    expect(root).toHaveClass("rounded-full");
  });

  it("renders fallback initials from alt when src is not provided", () => {
    render(<Avatar data-testid="avatar-initials" alt="Jane Doe" />);
    const root = screen.getByTestId("avatar-initials");
    expect(root).toHaveTextContent("JD");
  });

  it("renders single initial when alt is one word", () => {
    render(<Avatar data-testid="avatar-single" alt="Jane" />);
    const root = screen.getByTestId("avatar-single");
    expect(root).toHaveTextContent("J");
  });

  it("applies size classes for sm, md, lg, xl", () => {
    const { rerender, container } = render(
      <Avatar data-testid="avatar-size" alt="User" size="sm" />
    );
    expect(container.querySelector("[data-testid=avatar-size]")).toHaveClass(
      "size-6"
    );

    rerender(<Avatar data-testid="avatar-size" alt="User" size="lg" />);
    expect(container.querySelector("[data-testid=avatar-size]")).toHaveClass(
      "size-10"
    );

    rerender(<Avatar data-testid="avatar-size" alt="User" size="xl" />);
    expect(container.querySelector("[data-testid=avatar-size]")).toHaveClass(
      "size-16"
    );
  });

  it("renders image when src is provided", () => {
    render(
      <Avatar
        data-testid="avatar-img"
        src="/test.png"
        alt="Test User"
      />
    );
    const root = screen.getByTestId("avatar-img");
    const img = root.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/test.png");
    expect(img).toHaveAttribute("alt", "Test User");
  });

  it("uses pillar-accent token classes for fallback", () => {
    const { container } = render(
      <Avatar data-testid="avatar-fallback" alt="Ab" />
    );
    const root = container.querySelector("[data-testid=avatar-fallback]");
    expect(root).toHaveClass("bg-[var(--pillar-accent-subtle)]");
    expect(root).toHaveClass("text-[var(--pillar-accent-text)]");
  });

  it("forwards ref to span element", () => {
    let refCurrent: HTMLSpanElement | null = null;
    render(
      <Avatar
        data-testid="avatar-ref"
        alt="Ref"
        ref={(el) => {
          refCurrent = el;
        }}
      />
    );
    expect(refCurrent).toBe(screen.getByTestId("avatar-ref"));
  });
});
