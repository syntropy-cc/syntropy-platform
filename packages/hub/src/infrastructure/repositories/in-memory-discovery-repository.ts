/**
 * In-memory implementation of DiscoveryRepositoryPort for tests and optional stub (COMP-021.3).
 */

import type { DiscoveryDocument } from "../../domain/public-square/discovery-document.js";
import type { DiscoveryRepositoryPort } from "../../domain/public-square/ports/discovery-repository-port.js";

export class InMemoryDiscoveryRepository implements DiscoveryRepositoryPort {
  private readonly docs = new Map<string, DiscoveryDocument>();

  async upsert(doc: DiscoveryDocument): Promise<void> {
    this.docs.set(doc.institutionId, { ...doc });
  }

  async findById(institutionId: string): Promise<DiscoveryDocument | null> {
    const doc = this.docs.get(institutionId);
    return doc ? { ...doc } : null;
  }

  async findTop(limit: number): Promise<DiscoveryDocument[]> {
    const sorted = [...this.docs.values()].sort(
      (a, b) => b.prominenceScore - a.prominenceScore
    );
    return sorted.slice(0, Math.max(0, limit)).map((d) => ({ ...d }));
  }
}
