"use client";

/**
 * Toast — non-blocking feedback notification.
 * COMP-041.14: Sonner-based; 5 variants; bottom-right/center; DS tokens; Toaster provider; aria-live.
 * COMPONENT-LIBRARY: Toast
 */

import { Toaster as SonnerToaster, toast as sonnerToast } from "sonner";
import type { ExternalToast, ToasterProps } from "sonner";

const toastBaseClasses =
  "z-toast rounded-lg border border-border bg-surface shadow-md text-[length:var(--text-body)] text-foreground";

const toastOptionClassNames = {
  toast: toastBaseClasses,
  title: "font-medium text-foreground",
  description: "text-muted-foreground",
  success: "border-border [&>svg]:text-[var(--color-success-500)]",
  error: "border-border [&>svg]:text-[var(--color-error-500)]",
  warning: "border-border [&>svg]:text-[var(--color-warning-500)]",
  info: "border-border [&>svg]:text-[var(--color-info-500)]",
};

export type ToastToasterProps = ToasterProps;

/**
 * Toaster provider. Render once in the app root (e.g. layout).
 * Position: bottom-right on desktop; use `position="bottom-center"` for mobile-first or single layout.
 * Toasts use DS tokens: --bg-surface, --border-default, --radius-lg, --shadow-md.
 * Success/info/warning/default: aria-live="polite"; error: aria-live="assertive".
 */
export function Toaster(props: ToastToasterProps) {
  return (
    <SonnerToaster
      position="bottom-right"
      duration={5000}
      toastOptions={{
        ...props.toastOptions,
        classNames: {
          ...toastOptionClassNames,
          ...props.toastOptions?.classNames,
        },
      }}
      {...props}
    />
  );
}

/**
 * Programmatic toast API. Uses Sonner under the hood with DS-styled Toaster.
 * Variants: success (green icon), error (red icon), warning (amber), info (blue), default (no icon).
 */
export const toast = {
  ...sonnerToast,
  success: (message: string, data?: ExternalToast) =>
    sonnerToast.success(message, { duration: 5000, ...data }),
  error: (message: string, data?: ExternalToast) =>
    sonnerToast.error(message, { duration: 10000, ...data }),
  warning: (message: string, data?: ExternalToast) =>
    sonnerToast.warning(message, { duration: 5000, ...data }),
  info: (message: string, data?: ExternalToast) =>
    sonnerToast.info(message, { duration: 5000, ...data }),
};
