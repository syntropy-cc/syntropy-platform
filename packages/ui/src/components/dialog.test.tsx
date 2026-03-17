/**
 * Component tests for Dialog.
 * Architecture: COMP-041.13, COMPONENT-LIBRARY Dialog
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "./dialog";

describe("Dialog", () => {
  it("renders closed by default when defaultOpen is false", () => {
    render(
      <Dialog defaultOpen={false}>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByText("Open")).toBeInTheDocument();
    const dialog = screen.queryByRole("dialog", { hidden: true });
    if (dialog) {
      expect(dialog).toHaveAttribute("data-state", "closed");
    }
  });

  it("opens when trigger is clicked and content is visible", async () => {
    const { container } = render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
        </DialogContent>
      </Dialog>
    );
    const trigger = container.querySelector('button[aria-haspopup="dialog"]');
    expect(trigger).toBeInTheDocument();
    fireEvent.click(trigger as HTMLElement);
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("data-state", "open");
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
  });

  it("applies size variant sm with max-width 480px to content", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent size="sm" data-testid="dialog-content-sm">
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
        </DialogContent>
      </Dialog>
    );
    const content = document.querySelector("[data-testid=dialog-content-sm]");
    expect(content).toBeInstanceOf(HTMLElement);
    expect(content).toHaveClass("max-w-[480px]");
  });

  it("applies size variant md with max-width 640px to content", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent size="md" data-testid="dialog-content-md">
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
        </DialogContent>
      </Dialog>
    );
    const content = document.querySelector("[data-testid=dialog-content-md]");
    expect(content).toBeInstanceOf(HTMLElement);
    expect(content).toHaveClass("max-w-[640px]");
  });

  it("applies size variant lg with max-width 800px to content", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent size="lg" data-testid="dialog-content-lg">
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
        </DialogContent>
      </Dialog>
    );
    const content = document.querySelector("[data-testid=dialog-content-lg]");
    expect(content).toBeInstanceOf(HTMLElement);
    expect(content).toHaveClass("max-w-[800px]");
  });

  it("closes on Escape key", () => {
    const onOpenChange = vi.fn();
    render(
      <Dialog defaultOpen onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
        </DialogContent>
      </Dialog>
    );
    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).toBeInTheDocument();
    fireEvent.keyDown(dialog ?? document.body, {
      key: "Escape",
      code: "Escape",
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("overlay has bg-overlay class for design token backdrop", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
        </DialogContent>
      </Dialog>
    );
    const overlay = document.querySelector(".dialog-overlay");
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveClass("bg-overlay");
  });

  it("content has aria-modal when open", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
        </DialogContent>
      </Dialog>
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("DialogClose closes the dialog when activated", () => {
    const onOpenChange = vi.fn();
    render(
      <Dialog defaultOpen onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
          <DialogClose asChild>
            <button type="button">Close</button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    );
    const closeBtn = screen.getByRole("button", { name: "Close" });
    fireEvent.click(closeBtn);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
