/**
 * Mock DOIProvider for tests (COMP-026.2).
 */

import type {
  DOIProvider,
  ArticleDOIMetadata,
  RegisterDOIResult,
} from "../domain/doi-publication/ports/doi-provider.js";

let nextSuffix = 1;

/**
 * In-memory mock that returns deterministic DOIs and records deactivate calls.
 */
export class MockDOIProvider implements DOIProvider {
  private readonly prefix: string;
  private deactivated: string[] = [];

  constructor(prefix = "10.1234") {
    this.prefix = prefix;
  }

  async register(_article: ArticleDOIMetadata): Promise<RegisterDOIResult> {
    const doi = `${this.prefix}/mock-${nextSuffix++}`;
    return { doi };
  }

  async deactivate(doi: string): Promise<void> {
    this.deactivated.push(doi);
  }

  getDeactivated(): string[] {
    return [...this.deactivated];
  }

  reset(): void {
    nextSuffix = 1;
    this.deactivated.length = 0;
  }
}
