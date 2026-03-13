/**
 * Unit tests for ThemeProvider and useTheme.
 * Architecture: COMP-032
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { ThemeProvider, useTheme } from "./theme-provider";

function TestConsumer() {
  const { theme, setTheme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme-value">{theme}</span>
      <button type="button" onClick={() => setTheme("dark")}>
        Set dark
      </button>
      <button type="button" onClick={() => setTheme("light")}>
        Set light
      </button>
      <button type="button" onClick={toggleTheme}>
        Toggle
      </button>
    </div>
  );
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      length: 0,
      key: vi.fn(),
      clear: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("provides default theme and allows setTheme", async () => {
    const { container } = render(
      <ThemeProvider defaultTheme="light">
        <TestConsumer />
      </ThemeProvider>
    );
    const wrapper = container.firstElementChild;
    const themeValue = () => wrapper?.querySelector("[data-testid=theme-value]");
    expect(themeValue()?.textContent).toBe("light");
    await act(async () => {
      const setDark = wrapper?.querySelectorAll("button").item(0);
      if (setDark) fireEvent.click(setDark);
    });
    expect(themeValue()?.textContent).toBe("dark");
  });

  it("toggleTheme switches between light and dark", async () => {
    const { container } = render(
      <ThemeProvider defaultTheme="light">
        <TestConsumer />
      </ThemeProvider>
    );
    const wrapper = container.firstElementChild;
    const themeValue = () => wrapper?.querySelector("[data-testid=theme-value]");
    const toggleBtn = () => Array.from(wrapper?.querySelectorAll("button") ?? []).find((b) => b.textContent === "Toggle");
    expect(themeValue()?.textContent).toBe("light");
    await act(async () => {
      toggleBtn() && fireEvent.click(toggleBtn()!);
    });
    expect(themeValue()?.textContent).toBe("dark");
    await act(async () => {
      toggleBtn() && fireEvent.click(toggleBtn()!);
    });
    expect(themeValue()?.textContent).toBe("light");
  });
});

describe("useTheme", () => {
  it("throws when used outside ThemeProvider", () => {
    function BadConsumer() {
      useTheme();
      return null;
    }
    expect(() => render(<BadConsumer />)).toThrow("useTheme must be used within ThemeProvider");
  });
});
