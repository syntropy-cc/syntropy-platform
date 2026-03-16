"use client";

/**
 * Card component — default, glass, and pillar variants.
 * COMPONENT-LIBRARY: Card
 */

import { type HTMLAttributes, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const cardVariants = cva(
  "rounded-[var(--radius)] border transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md",
  {
    variants: {
      variant: {
        default:
          "border-border bg-background text-foreground shadow-sm",
        glass:
          "border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)] text-foreground",
        pillar:
          "border-border bg-background text-foreground shadow-sm overflow-hidden",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /** Pillar variant only: gradient/key for header (learn | hub | labs | contribute | portfolio). */
  pillarHeader?: "learn" | "hub" | "labs" | "contribute" | "portfolio";
}

const pillarGradients: Record<
  NonNullable<CardProps["pillarHeader"]>,
  string
> = {
  learn: "linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)",
  hub: "linear-gradient(135deg, #6366f1 0%, #1e3a8a 100%)",
  labs: "linear-gradient(135deg, #c026d3 0%, #86198f 100%)",
  contribute: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
  portfolio: "linear-gradient(135deg, #ff6b00 0%, #ea580c 100%)",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, pillarHeader, children, ...props }, ref) => {
    const isPillar = variant === "pillar" && pillarHeader;
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, className }))}
        {...props}
      >
        {isPillar ? (
          <>
            <div
              className="h-2 w-full shrink-0"
              style={{ background: pillarGradients[pillarHeader] }}
              aria-hidden
            />
            <div className="p-4">{children}</div>
          </>
        ) : (
          children
        )}
      </div>
    );
  }
);
Card.displayName = "Card";

export const CardHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-4", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref as React.Ref<HTMLParagraphElement>}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

export const CardContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-4 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";
