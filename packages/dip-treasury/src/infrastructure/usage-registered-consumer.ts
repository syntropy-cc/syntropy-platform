/**
 * Consumes dip.artifact.published events and records usage contribution (COMP-008.2).
 * Architecture: DIP Value Distribution & Treasury; subscribes to dip.events (filter by type).
 */

import type { ConsumedMessage } from "@syntropy/event-bus";
import type { UsageRegistryPort } from "../domain/ports/usage-registry-port.js";

const DIP_ARTIFACT_PUBLISHED = "dip.artifact.published";

/** Minimal payload we need from dip.artifact.published (event envelope body). */
interface ArtifactPublishedPayload {
  type?: string;
  artifactId?: string;
  authorId?: string;
  institutionId?: string;
  timestamp?: string;
}

/**
 * Computes contribution score for a single published artifact event.
 * Simple deterministic rule: one unit per event (COMP-008.2); weights from DAG in COMP-008.4.
 */
export function computeUsageContribution(_payload: ArtifactPublishedPayload): number {
  return 1;
}

/**
 * UsageRegisteredConsumer subscribes to artifact published events, computes
 * contribution, and records in UsageRegistry.
 */
export class UsageRegisteredConsumer {
  constructor(
    private readonly usageRegistry: UsageRegistryPort,
    private readonly options: {
      /** Default institution when event has no institutionId (e.g. platform). */
      defaultInstitutionId?: string;
    } = {}
  ) {}

  /**
   * Handles one Kafka message. Parses value as JSON; if type is dip.artifact.published,
   * computes contribution and records it.
   */
  async handleMessage(message: ConsumedMessage): Promise<void> {
    if (message.value == null || message.value.length === 0) {
      return;
    }
    let payload: ArtifactPublishedPayload;
    try {
      payload = JSON.parse(message.value.toString("utf8")) as ArtifactPublishedPayload;
    } catch {
      return;
    }
    if (payload.type !== DIP_ARTIFACT_PUBLISHED) {
      return;
    }
    const artifactId = payload.artifactId ?? "unknown";
    const institutionId =
      payload.institutionId ?? this.options.defaultInstitutionId ?? "platform";
    const contributionScore = computeUsageContribution(payload);
    await this.usageRegistry.recordContribution({
      artifactId,
      institutionId,
      contributionScore,
      recordedAt: new Date(),
    });
  }
}
