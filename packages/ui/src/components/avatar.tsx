"use client";

/**
 * Avatar component — user or institution identity.
 * Architecture: COMP-041, COMPONENT-LIBRARY Avatar
 * Sizes: sm 24px, md 32px, lg 40px, xl 64px. Fallback: initials on pillar-accent background.
 */

import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { cn } from "../lib/utils";

const avatarSizeClasses = {
  sm: "size-6",
  md: "size-8",
  lg: "size-10",
  xl: "size-16",
} as const;

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export type AvatarSize = keyof typeof avatarSizeClasses;

export type AvatarProps = ComponentPropsWithoutRef<"span"> & {
  /** Image source. When absent, fallback initials are shown. */
  src?: string | null;
  /** Alt text for the image. Used for fallback initials when src is missing. */
  alt?: string;
  /** Size: sm (24px), md (32px), lg (40px), xl (64px). */
  size?: AvatarSize;
};

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(
  ({ className, src, alt = "", size = "md", children, ...props }, ref) => {
    const sizeClass = avatarSizeClasses[size];
    const initials = alt ? getInitials(alt) : null;

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-[var(--pillar-accent-subtle)] text-[length:var(--text-caption)] font-medium text-[var(--pillar-accent-text)]",
          sizeClass,
          className
        )}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="size-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : initials ? (
          initials
        ) : (
          children
        )}
      </span>
    );
  }
);
Avatar.displayName = "Avatar";
