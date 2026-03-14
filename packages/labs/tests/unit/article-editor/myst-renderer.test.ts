/**
 * Unit tests for MystRenderer (COMP-023.3).
 */

import { describe, it, expect } from "vitest";
import { MystRenderer } from "../../../src/infrastructure/myst-renderer.js";

describe("MystRenderer", () => {
  const renderer = new MystRenderer();

  it("renders simple heading to HTML", () => {
    const html = renderer.render("# Introduction\n");
    expect(html).toContain("<h1");
    expect(html).toContain("Introduction");
    expect(html).toContain("</h1>");
  });

  it("renders paragraph content", () => {
    const html = renderer.render("Hello **world**.");
    expect(html).toContain("<p>");
    expect(html).toContain("world");
    expect(html).toContain("</p>");
  });

  it("renders multiple headings", () => {
    const myst = "# Title\n\n## Section 1\n\nContent.";
    const html = renderer.render(myst);
    expect(html).toContain("<h1");
    expect(html).toContain("Title");
    expect(html).toContain("<h2");
    expect(html).toContain("Section 1");
    expect(html).toContain("Content");
  });

  it("renders empty string to empty or minimal HTML", () => {
    const html = renderer.render("");
    expect(typeof html).toBe("string");
    expect(html.length).toBeGreaterThanOrEqual(0);
  });

  it("throws when input is not a string", () => {
    expect(() => renderer.render(null as unknown as string)).toThrow("must be a string");
    expect(() => renderer.render(123 as unknown as string)).toThrow("must be a string");
  });

  it("renders admonition directive", () => {
    const myst = ":::{important}\nNote this.\n:::";
    const html = renderer.render(myst);
    expect(html).toContain("important");
    expect(html).toContain("Note this");
  });

  it("renders inline math", () => {
    const myst = "Equation $x^2$ inline.";
    const html = renderer.render(myst);
    expect(typeof html).toBe("string");
    expect(html.length).toBeGreaterThan(0);
    expect(html).toContain("x");
  });
});
