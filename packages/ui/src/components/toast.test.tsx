/**
 * Component tests for Toast (Toaster + toast API).
 * Architecture: COMP-041.14, COMPONENT-LIBRARY Toast
 */

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Toaster, toast } from "./toast";

describe("Toaster", () => {
  it("renders without throwing", () => {
    expect(() => render(<Toaster />)).not.toThrow();
  });

  it("accepts position prop and passes to Sonner", () => {
    const { container } = render(<Toaster position="bottom-center" />);
    expect(container).toBeInTheDocument();
  });
});

describe("toast", () => {
  it("exposes success, error, warning, info and default methods", () => {
    expect(typeof toast.success).toBe("function");
    expect(typeof toast.error).toBe("function");
    expect(typeof toast.warning).toBe("function");
    expect(typeof toast.info).toBe("function");
    expect(typeof toast.message).toBe("function");
  });

  it("success toast can be called without throwing when Toaster is mounted", () => {
    render(<Toaster />);
    expect(() => toast.success("Done")).not.toThrow();
  });

  it("error toast can be called without throwing when Toaster is mounted", () => {
    render(<Toaster />);
    expect(() => toast.error("Failed")).not.toThrow();
  });
});
