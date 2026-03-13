/**
 * Reconstructs causal chain of events by correlation_id (COMP-009.5).
 *
 * Returns events in causal order (cause before effect). Handles cycles gracefully.
 */

import type { AppendOnlyLogRepository } from "./AppendOnlyLogRepository.js";
import type { EventLogEntry } from "./types.js";

const MAX_DEPTH = 1000;

/**
 * Builds the causal order of events with the given correlation_id.
 * Cause (causation_id reference) appears before effect. Cycles are broken
 * by ordering remaining nodes by recorded_at.
 */
export class CausalChainTracer {
  constructor(private readonly repository: AppendOnlyLogRepository) {}

  /**
   * Returns events sharing this correlation_id in causal order (root first).
   * If the causation graph has a cycle, returns a best-effort order and does not throw.
   */
  async trace(correlationId: string): Promise<EventLogEntry[]> {
    const all = await this.repository.findByCorrelationId(correlationId);
    if (all.length === 0) return [];

    const byId = new Map<number, EventLogEntry>();
    for (const e of all) {
      byId.set(e.id, e);
    }

    const idToCausationId = new Map<number, string | null>();
    for (const e of all) {
      const cid = e.causation_id && e.causation_id.trim() !== "" ? e.causation_id : null;
      idToCausationId.set(e.id, cid);
    }

    const causationIdToEntry = new Map<string, EventLogEntry>();
    for (const e of all) {
      causationIdToEntry.set(String(e.id), e);
    }

    const ordered: EventLogEntry[] = [];
    const added = new Set<number>();
    let iterations = 0;

    while (ordered.length < all.length && iterations < MAX_DEPTH) {
      iterations++;
      let addedThisRound = 0;
      for (const e of all) {
        if (added.has(e.id)) continue;
        const causeId = idToCausationId.get(e.id);
        const causeAlreadyIn =
          causeId == null ||
          causeId === "" ||
          ordered.some((x) => String(x.id) === causeId) ||
          !byId.has(Number(causeId));
        if (causeAlreadyIn) {
          ordered.push(e);
          added.add(e.id);
          addedThisRound++;
        }
      }
      if (addedThisRound === 0) {
        break;
      }
    }

    if (ordered.length < all.length) {
      const remaining = all.filter((e) => !added.has(e.id));
      remaining.sort((a, b) => a.recorded_at.getTime() - b.recorded_at.getTime());
      for (const e of remaining) {
        ordered.push(e);
      }
    }

    return ordered;
  }
}
