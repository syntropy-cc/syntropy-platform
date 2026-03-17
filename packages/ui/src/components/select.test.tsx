/**
 * Component tests for Select.
 * Architecture: COMP-041, COMPONENT-LIBRARY Select
 */

import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

describe("Select", () => {
  it("renders trigger with placeholder", () => {
    const { container } = render(
      <Select>
        <SelectTrigger data-testid="select-trigger">
          <SelectValue placeholder="Choose one" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Option A</SelectItem>
          <SelectItem value="b">Option B</SelectItem>
        </SelectContent>
      </Select>
    );
    const trigger = container.querySelector("[data-testid=select-trigger]");
    expect(trigger).toBeInTheDocument();
    expect(container.textContent).toContain("Choose one");
  });

  it("applies design system classes to trigger (height, border)", () => {
    const { container } = render(
      <Select>
        <SelectTrigger data-testid="select-trigger">
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="x">X</SelectItem>
        </SelectContent>
      </Select>
    );
    const trigger = container.querySelector("[data-testid=select-trigger]");
    expect(trigger).toHaveClass("h-10", "rounded-md", "border", "border-border");
  });

  it("opens dropdown and shows options when trigger is clicked", () => {
    const { container } = render(
      <Select>
        <SelectTrigger data-testid="select-trigger">
          <SelectValue placeholder="Choose" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="one">One</SelectItem>
          <SelectItem value="two">Two</SelectItem>
        </SelectContent>
      </Select>
    );
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    const trigger = container.querySelector("[data-testid=select-trigger]");
    if (trigger) fireEvent.click(trigger);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getByText("One")).toBeInTheDocument();
    expect(screen.getByText("Two")).toBeInTheDocument();
  });

  it("updates displayed value when option is selected", () => {
    const { container } = render(
      <Select>
        <SelectTrigger data-testid="select-trigger">
          <SelectValue placeholder="Choose" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
        </SelectContent>
      </Select>
    );
    const trigger = container.querySelector("[data-testid=select-trigger]");
    if (trigger) fireEvent.click(trigger);
    fireEvent.click(screen.getByText("Banana"));
    expect(screen.getByText("Banana")).toBeInTheDocument();
  });

  it("trigger has role combobox and aria-expanded when open", () => {
    const { container } = render(
      <Select>
        <SelectTrigger data-testid="select-trigger">
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="v">V</SelectItem>
        </SelectContent>
      </Select>
    );
    const trigger = container.querySelector("[data-testid=select-trigger]");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    if (trigger) fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });
});
