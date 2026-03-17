/**
 * Component tests for FormField.
 * Architecture: COMP-041, COMPONENT-LIBRARY FormField
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormField } from "./form-field";
import { Input } from "./input";

describe("FormField", () => {
  it("renders label with htmlFor linked to input id", () => {
    render(
      <FormField label="Email" id="email-field">
        <Input data-testid="email-input" />
      </FormField>
    );
    const label = screen.getByText("Email");
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute("for", "email-field");
    const input = screen.getByTestId("email-input");
    expect(input).toHaveAttribute("id", "email-field");
  });

  it("shows required asterisk in error color when required is true", () => {
    render(
      <FormField label="Name" required id="name-field">
        <Input data-testid="name-input" />
      </FormField>
    );
    const label = screen.getByText(/Name/);
    const asterisk = label.querySelector("span[aria-hidden]");
    expect(asterisk).toBeInTheDocument();
    expect(asterisk).toHaveTextContent("*");
    expect(asterisk).toHaveClass("text-[var(--color-error-500)]");
  });

  it("does not show asterisk when required is false", () => {
    render(
      <FormField label="Optional" id="opt-field">
        <Input data-testid="opt-input" />
      </FormField>
    );
    const label = screen.getByText("Optional");
    expect(label).not.toContainHTML("text-[var(--color-error-500)]");
  });

  it("renders optional helper text with caption and secondary styling", () => {
    render(
      <FormField label="Field" helperText="Help text" id="helper-field">
        <Input data-testid="helper-input" />
      </FormField>
    );
    const helper = screen.getByText("Help text");
    expect(helper).toBeInTheDocument();
    expect(helper).toHaveAttribute("id", "helper-field-helper");
    expect(helper).toHaveClass(
      "text-[length:var(--text-caption)]",
      "text-[var(--text-secondary)]"
    );
  });

  it("renders error message with icon and error color", () => {
    render(
      <FormField label="Field" error="Invalid value" id="error-field">
        <Input data-testid="error-input" />
      </FormField>
    );
    const error = screen.getByRole("alert");
    expect(error).toHaveTextContent("Invalid value");
    expect(error).toHaveAttribute("id", "error-field-error");
    expect(error).toHaveClass(
      "text-[length:var(--text-caption)]",
      "text-[var(--color-error-500)]"
    );
  });

  it("sets aria-invalid and aria-describedby on input when error is present", () => {
    render(
      <FormField label="Field" error="Error message" id="aria-field">
        <Input data-testid="aria-input" />
      </FormField>
    );
    const input = screen.getByTestId("aria-input");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", "aria-field-error");
  });

  it("includes helper id in aria-describedby when helper and error both present", () => {
    render(
      <FormField
        label="Field"
        helperText="Helper"
        error="Error"
        id="both-field"
      >
        <Input data-testid="both-input" />
      </FormField>
    );
    const input = screen.getByTestId("both-input");
    expect(input).toHaveAttribute(
      "aria-describedby",
      "both-field-helper both-field-error"
    );
  });

  it("includes only helper id in aria-describedby when no error", () => {
    render(
      <FormField label="Field" helperText="Helper" id="helper-only-field">
        <Input data-testid="helper-only-input" />
      </FormField>
    );
    const input = screen.getByTestId("helper-only-input");
    expect(input).toHaveAttribute("aria-describedby", "helper-only-field-helper");
  });

  it("forwards required to input when required is true", () => {
    render(
      <FormField label="Required" required id="req-field">
        <Input data-testid="req-input" />
      </FormField>
    );
    const input = screen.getByTestId("req-input");
    expect(input).toBeRequired();
  });

  it("does not render error block when error is empty string", () => {
    const { container } = render(
      <FormField label="Field" error="" id="empty-error-field">
        <Input data-testid="empty-error-input" />
      </FormField>
    );
    expect(
      container.querySelector("#empty-error-field-error")
    ).not.toBeInTheDocument();
  });

  it("uses generated id when id prop is omitted", () => {
    render(
      <FormField label="Auto">
        <Input data-testid="auto-input" />
      </FormField>
    );
    const label = screen.getByText("Auto");
    const input = screen.getByTestId("auto-input");
    const forId = label.getAttribute("for");
    const inputId = input.getAttribute("id");
    expect(forId).toBeTruthy();
    expect(inputId).toBe(forId);
  });
});
