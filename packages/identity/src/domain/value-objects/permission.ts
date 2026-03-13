/**
 * Permission value object — atomic capability (resource:action).
 * Architecture: COMP-002, domains/identity/ARCHITECTURE.md
 */

/**
 * Immutable permission: resource and action (e.g. "hub:contribution:submit").
 */
export class Permission {
  readonly resource: string;
  readonly action: string;

  constructor(resource: string, action: string) {
    this.resource = resource.trim();
    this.action = action.trim();
    if (!this.resource || !this.action) {
      throw new Error("Permission resource and action must be non-empty");
    }
  }

  /**
   * Parse "resource:action" or "resource:scope:action" into Permission.
   */
  static fromString(key: string): Permission {
    const parts = key.split(":").map((s) => s.trim()).filter(Boolean);
    if (parts.length < 2) {
      throw new Error(`Invalid permission key: "${key}" (expected resource:action)`);
    }
    const action = parts.pop()!;
    const resource = parts.join(":");
    return new Permission(resource, action);
  }

  /** Canonical key for comparison and storage. */
  get key(): string {
    return `${this.resource}:${this.action}`;
  }

  equals(other: Permission): boolean {
    return this.key === other.key;
  }
}
