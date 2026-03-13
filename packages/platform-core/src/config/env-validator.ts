/**
 * Environment variable validation at application startup.
 *
 * Ensures required configuration is present before the app runs. Never logs
 * or includes secret values in error messages (ARCH-008, COMP-037.6).
 *
 * Architecture: COMP-037.6, cross-cutting/security/ARCHITECTURE.md
 */

/**
 * Options for validateEnv.
 */
export interface ValidateEnvOptions {
  /**
   * Optional prefix for error messages (e.g. app name).
   */
  prefix?: string;
}

/**
 * Validates that all required environment variables are set and non-empty.
 *
 * Use at application startup so the process fails fast if configuration is
 * missing. Error messages list missing keys by name only — never secret values.
 *
 * @param requiredKeys - Array of env var names that must be present and non-empty.
 * @param options - Optional prefix for error messages.
 * @throws Error if any key is missing or empty (message lists key names only).
 *
 * @example
 * validateEnv(['NODE_ENV', 'DATABASE_URL']);
 * validateEnv(['API_KEY'], { prefix: 'MyApp' });
 */
export function validateEnv(
  requiredKeys: string[],
  options: ValidateEnvOptions = {}
): void {
  const missing: string[] = [];

  for (const key of requiredKeys) {
    const value = process.env[key];
    if (value === undefined || value.trim() === "") {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    const prefix = options.prefix ? `${options.prefix}: ` : "";
    throw new Error(
      `${prefix}Missing or empty required environment variable(s): ${missing.join(", ")}. ` +
        "Check .env.example and set values in .env or the environment."
    );
  }
}
