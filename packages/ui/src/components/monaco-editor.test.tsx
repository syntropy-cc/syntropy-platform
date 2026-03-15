/**
 * Unit tests for MonacoEditor component (COMP-035.1).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "./theme-provider";
import { MonacoEditor } from "./monaco-editor";

const mockAddAction = vi.fn();

vi.mock("@monaco-editor/react", () => ({
  default: function MockEditor({
    value,
    onChange,
    onMount,
    language,
    theme,
    height,
  }: {
    value: string;
    onChange?: (v: string) => void;
    onMount?: (editor: unknown, monaco: unknown) => void;
    language: string;
    theme: string;
    height: string | number;
  }) {
    const fakeEditor = {
      addAction: (config: { id: string; run: () => void }) => {
        mockAddAction(config);
        (window as unknown as { __monacoSaveRun?: () => void }).__monacoSaveRun =
          config.run;
      },
    };
    const fakeMonaco = {
      KeyMod: { CtrlCmd: 2048 },
      KeyCode: { KeyS: 83 },
    };
    if (onMount) {
      setTimeout(() => onMount(fakeEditor, fakeMonaco), 0);
    }
    return (
      <div data-testid="monaco-editor-mock" data-value={value} data-language={language} data-theme={theme} data-height={String(height)}>
        <textarea
          data-testid="monaco-mock-textarea"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          aria-label="editor"
        />
      </div>
    );
  },
}));

describe("MonacoEditor", () => {
  beforeEach(() => {
    mockAddAction.mockClear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders wrapper and passes value and language to editor", async () => {
    render(
      <ThemeProvider defaultTheme="light">
        <MonacoEditor value="const x = 1;" language="typescript" height="300px" />
      </ThemeProvider>
    );
    const wrapper = screen.getByTestId("monaco-editor-wrapper");
    expect(wrapper).toBeInTheDocument();

    await vi.runAllTimersAsync();

    const mockEl = screen.getByTestId("monaco-editor-mock");
    expect(mockEl).toHaveAttribute("data-value", "const x = 1;");
    expect(mockEl).toHaveAttribute("data-language", "typescript");
    expect(mockEl).toHaveAttribute("data-theme", "light");
  });

  it("registers save action when onSave is provided", async () => {
    const onSave = vi.fn();
    render(
      <ThemeProvider defaultTheme="dark">
        <MonacoEditor value="code" onSave={onSave} />
      </ThemeProvider>
    );

    await vi.runAllTimersAsync();

    expect(mockAddAction).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "save",
        label: "Save",
      })
    );
    const runFn = mockAddAction.mock.calls[0]?.[0]?.run;
    expect(runFn).toBeDefined();
    runFn?.();
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("does not register save action when onSave is not provided", async () => {
    render(
      <ThemeProvider defaultTheme="light">
        <MonacoEditor value="code" />
      </ThemeProvider>
    );

    await vi.runAllTimersAsync();

    expect(mockAddAction).not.toHaveBeenCalled();
  });

  it("passes theme prop to editor (vs-dark when dark)", async () => {
    const { container } = render(
      <ThemeProvider defaultTheme="light">
        <MonacoEditor value="x" theme="dark" />
      </ThemeProvider>
    );
    await vi.runAllTimersAsync();
    const wrapper = container.querySelector("[data-testid=monaco-editor-wrapper]");
    const mockEl = wrapper?.querySelector("[data-testid=monaco-editor-mock]");
    expect(mockEl).toHaveAttribute("data-theme", "vs-dark");
  });
});
