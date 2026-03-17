"use client";

/**
 * FormField — wraps an input with label, optional helper text, and error message.
 * Architecture: COMP-041, COMPONENT-LIBRARY FormField
 * Structure: Label → helper → input slot → error. aria-describedby links helper and error to input.
 */

import { AlertCircle } from "lucide-react";
import {
  type ReactNode,
  useId,
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
} from "react";
import { cn } from "../lib/utils";

export interface FormFieldProps {
  /** Label text. Required fields show " *" in error color. */
  label: ReactNode;
  /** Optional helper text below label, above input. */
  helperText?: ReactNode;
  /** Optional error message below input. When set, input gets aria-invalid and error id in aria-describedby. */
  error?: ReactNode;
  /** When true, label shows asterisk and input receives required attribute if forwarded. */
  required?: boolean;
  /** Single child: Input, Textarea, SelectTrigger, or Checkbox. Receives id, aria-describedby, aria-invalid, required. */
  children: ReactNode;
  /** Optional id for the input. If omitted, a stable id is generated. */
  id?: string;
  /** Optional class for the root wrapper. */
  className?: string;
}

/**
 * FormField wraps a single form control with a label, optional helper text, and optional error.
 * Label htmlFor and input id are linked; error and helper ids are set on input aria-describedby.
 */
export function FormField({
  label,
  helperText,
  error,
  required = false,
  children,
  id: idProp,
  className,
}: FormFieldProps) {
  const generatedId = useId();
  const fieldId = idProp ?? generatedId;
  const helperId = `${fieldId}-helper`;
  const errorId = `${fieldId}-error`;

  const describedBy = [helperText && helperId, error && errorId]
    .filter(Boolean)
    .join(" ");

  const child = Children.only(children);
  const controlledChild =
    isValidElement(child) &&
    (child as ReactElement<Record<string, unknown>>).props !== undefined
      ? cloneElement(child as ReactElement<Record<string, unknown>>, {
          id: fieldId,
          ...(describedBy && { "aria-describedby": describedBy }),
          ...(error !== undefined && error !== "" && { "aria-invalid": true }),
          ...(required && { required: true }),
        })
      : child;

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex flex-col gap-[var(--space-1.5)]">
        <label
          htmlFor={fieldId}
          className="text-[length:var(--text-label)] font-[var(--text-label-weight)] leading-[var(--text-label-line)] text-[var(--text-primary)]"
        >
          {label}
          {required && (
            <span className="text-[var(--color-error-500)]" aria-hidden>
              {" "}
              *
            </span>
          )}
        </label>
        {helperText && (
          <p
            id={helperId}
            className="text-[length:var(--text-caption)] text-[var(--text-secondary)]"
          >
            {helperText}
          </p>
        )}
        {controlledChild}
      </div>
      {error !== undefined && error !== "" && (
        <p
          id={errorId}
          role="alert"
          className="mt-[var(--space-1)] flex items-center gap-[var(--space-1)] text-[length:var(--text-caption)] text-[var(--color-error-500)]"
        >
          <AlertCircle className="size-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}
FormField.displayName = "FormField";
