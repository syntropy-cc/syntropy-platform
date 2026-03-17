import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        /* Primary scale — DESIGN-TOKENS §7.1 */
        primary: {
          50: "var(--color-primary-50)",
          100: "var(--color-primary-100)",
          200: "var(--color-primary-200)",
          300: "var(--color-primary-300)",
          400: "var(--color-primary-400)",
          500: "var(--color-primary-500)",
          600: "var(--color-primary-600)",
          700: "var(--color-primary-700)",
          800: "var(--color-primary-800)",
          900: "var(--color-primary-900)",
          DEFAULT: "var(--color-primary-500)",
          foreground: "var(--text-inverse)",
        },
        /* Pillar accent — overridden per app */
        pillar: {
          DEFAULT: "var(--pillar-accent)",
          subtle: "var(--pillar-accent-subtle)",
          text: "var(--pillar-accent-text)",
        },
        /* Semantic surfaces */
        background: "var(--bg-page)",
        surface: "var(--bg-surface)",
        overlay: "var(--bg-overlay)",
        "surface-raised": "var(--bg-surface-raised)",
        "surface-sunken": "var(--bg-surface-sunken)",
        /* Semantic text */
        foreground: "var(--text-primary)",
        "muted-foreground": "var(--text-secondary)",
        /* Semantic states */
        success: {
          50: "var(--color-success-50)",
          500: "var(--color-success-500)",
          700: "var(--color-success-700)",
          DEFAULT: "var(--color-success-500)",
          light: "var(--color-success-50)",
        },
        error: {
          50: "var(--color-error-50)",
          500: "var(--color-error-500)",
          700: "var(--color-error-700)",
          DEFAULT: "var(--color-error-500)",
          light: "var(--color-error-50)",
        },
        warning: {
          50: "var(--color-warning-50)",
          500: "var(--color-warning-500)",
          700: "var(--color-warning-700)",
          DEFAULT: "var(--color-warning-500)",
          light: "var(--color-warning-50)",
        },
        info: {
          50: "var(--color-info-50)",
          500: "var(--color-info-500)",
          700: "var(--color-info-700)",
          DEFAULT: "var(--color-info-500)",
          light: "var(--color-info-50)",
        },
        /* Border */
        border: "var(--border-default)",
        "border-strong": "var(--border-strong)",
        /* Legacy shadcn-style names (bridge from tokens.css) */
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-default)",
        xl: "var(--radius-lg)",
        "2xl": "var(--radius-xl)",
        full: "var(--radius-full)",
      },
      boxShadow: {
        focus: "var(--focus-ring)",
        "focus-error": "var(--focus-ring-error)",
        lg: "var(--shadow-lg)",
      },
      zIndex: {
        overlay: "var(--z-overlay)",
        modal: "var(--z-modal)",
      },
      keyframes: {
        "skeleton-shimmer": {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        "skeleton-shimmer":
          "skeleton-shimmer 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
