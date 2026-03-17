/**
 * Unit tests for Card component.
 * Architecture: COMP-041.4, COMPONENT-LIBRARY Card
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./card";

describe("Card", () => {
  it("renders with default variant (surface shadow)", () => {
    const { container } = render(
      <Card data-testid="card-default">
        <CardContent>Content</CardContent>
      </Card>
    );
    const card = container.querySelector("[data-testid=card-default]");
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass("bg-surface", "shadow-sm");
  });

  it("applies elevated variant classes", () => {
    const { container } = render(
      <Card variant="elevated" data-testid="card-elevated">
        <CardContent>Content</CardContent>
      </Card>
    );
    const card = container.querySelector("[data-testid=card-elevated]");
    expect(card).toHaveClass("bg-surface-raised", "shadow-md");
  });

  it("applies interactive variant with hover lift", () => {
    const { container } = render(
      <Card variant="interactive" data-testid="card-interactive">
        <CardContent>Content</CardContent>
      </Card>
    );
    const card = container.querySelector("[data-testid=card-interactive]");
    expect(card).toHaveClass("hover:-translate-y-0.5", "hover:shadow-md");
  });

  it("applies sunken variant classes", () => {
    const { container } = render(
      <Card variant="sunken" data-testid="card-sunken">
        <CardContent>Content</CardContent>
      </Card>
    );
    const card = container.querySelector("[data-testid=card-sunken]");
    expect(card).toHaveClass("bg-surface-sunken");
  });

  it("renders CardHeader, CardTitle, CardDescription, CardContent, CardFooter", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Body</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    );
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });
});
