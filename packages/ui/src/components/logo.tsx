"use client";

/**
 * Logo — Syntropy brand mark. Renders an image with optional size and alt.
 * COMPONENT-LIBRARY: used in Navbar and Footer
 */

import type { ImgHTMLAttributes } from "react";
import { cn } from "../lib/utils";

export interface LogoProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "alt"> {
  /** Image URL (e.g. from public folder: "/syntropy-logo.png"). */
  src: string;
  /** Alt text for accessibility. */
  alt?: string;
  /** Optional width (number or string). */
  width?: number | string;
  /** Optional height (number or string). */
  height?: number | string;
  className?: string;
}

export function Logo({
  src,
  alt = "Syntropy",
  width,
  height,
  className,
  ...props
}: LogoProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={cn("inline-block object-contain", className)}
      {...props}
    />
  );
}
