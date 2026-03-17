"use client";

/**
 * Button component — design system compliant variants.
 * Architecture: COMP-041, COMPONENT-LIBRARY Button
 */

import {
  type ComponentPropsWithoutRef,
  forwardRef,
  cloneElement,
  isValidElement,
  type ReactElement,
} from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:bg-primary-600 dark:hover:bg-primary-400 active:bg-primary-700 dark:active:bg-primary-300",
        secondary:
          "border border-border bg-surface text-foreground hover:bg-surface-sunken",
        ghost: "text-foreground hover:bg-surface-sunken",
        destructive:
          "bg-error text-primary-foreground hover:bg-error-700 active:opacity-90",
        link: "text-primary-600 underline-offset-4 hover:underline dark:text-primary-400",
        "icon-only":
          "text-foreground hover:bg-surface-sunken [&>svg]:size-4",
      },
      size: {
        sm: "h-8 px-3 rounded-md",
        md: "h-10 px-4 rounded-lg",
        lg: "h-12 px-6 rounded-lg",
        icon: "h-10 w-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];

export type ButtonProps = Omit<
  ComponentPropsWithoutRef<"button">,
  "aria-busy"
> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean;
    /** When true, merges button styles onto the single child element (e.g. Link). */
    asChild?: boolean;
  } & (
    | { variant?: Exclude<ButtonVariant, "icon-only"> }
    | { variant: "icon-only"; "aria-label": string }
  );

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      asChild = false,
      children,
      disabled,
      "aria-label": ariaLabel,
      ...props
    },
    ref
  ) => {
    const resolvedSize = variant === "icon-only" ? "icon" : size;
    const isDisabled = disabled ?? loading;
    const variantClasses = buttonVariants({
      variant,
      size: resolvedSize,
      className,
    });

    if (asChild && isValidElement(children)) {
      const child = children as ReactElement<{ className?: string }>;
      return cloneElement(child, {
        className: cn(variantClasses, child.props.className),
        ...(ref != null && { ref }),
      });
    }

    return (
      <button
        ref={ref}
        type="button"
        className={variantClasses}
        disabled={isDisabled}
        aria-busy={loading ? "true" : undefined}
        aria-label={variant === "icon-only" ? ariaLabel : undefined}
        aria-disabled={isDisabled ? "true" : undefined}
        {...props}
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = "Button";
