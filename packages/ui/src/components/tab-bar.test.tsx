/**
 * Component tests for TabBar.
 * Architecture: COMP-041.17, COMPONENT-LIBRARY TabBar
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TabBar, TabList, TabTrigger, TabContent } from "./tab-bar";

describe("TabBar", () => {
  it("renders tabs and shows active panel", () => {
    render(
      <TabBar defaultValue="a">
        <TabList>
          <TabTrigger value="a">Tab A</TabTrigger>
          <TabTrigger value="b">Tab B</TabTrigger>
        </TabList>
        <TabContent value="a">Content A</TabContent>
        <TabContent value="b">Content B</TabContent>
      </TabBar>
    );
    expect(screen.getByRole("tab", { name: "Tab A" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Tab B" })).toBeInTheDocument();
    expect(screen.getByText("Content A")).toBeInTheDocument();
  });

  it("applies active teal border to selected tab", () => {
    render(
      <TabBar defaultValue="first">
        <TabList>
          <TabTrigger value="first">First</TabTrigger>
        </TabList>
        <TabContent value="first">Panel</TabContent>
      </TabBar>
    );
    const tab = screen.getByRole("tab", { name: "First" });
    expect(tab).toHaveAttribute("data-state", "active");
    expect(tab).toHaveClass("data-[state=active]:border-[var(--action-primary)]");
  });

  it("has role tablist and tab for accessibility", () => {
    const { container } = render(
      <TabBar defaultValue="a">
        <TabList>
          <TabTrigger value="a">Tab A</TabTrigger>
        </TabList>
        <TabContent value="a">Content</TabContent>
      </TabBar>
    );
    expect(container.querySelector("[role=tablist]")).toBeInTheDocument();
    expect(container.querySelector("[role=tab]")).toBeInTheDocument();
    expect(container.querySelector("[role=tabpanel]")).toBeInTheDocument();
  });
});
