/**
 * Kafka consumer that maintains DiscoveryDocument index from DIP and Hub events (COMP-021.3).
 *
 * Subscribes to dip.governance.events and hub.events; on dip.governance.* and hub.contribution.integrated
 * (or hub.contribution.merged) applies event to document, recomputes prominence, upserts.
 */

import type { KafkaConsumer as EventBusKafkaConsumer } from "@syntropy/event-bus";
import type { ConsumedMessage } from "@syntropy/event-bus";
import {
  applyDiscoveryEvent,
  withProminenceScore,
  type DiscoveryDocument,
  type DiscoveryDocumentEventPayload,
  type DipGovernanceEventPayload,
  type HubContributionEventPayload,
} from "../../domain/public-square/discovery-document.js";
import type { DiscoveryRepositoryPort } from "../../domain/public-square/ports/discovery-repository-port.js";
import { computeProminenceScore, type ProminenceSignals } from "../../domain/public-square/services/prominence-scorer.js";

const PUBLIC_SQUARE_TOPICS = ["dip.governance.events", "hub.events"];

const DIP_GOVERNANCE_EVENT_TYPES = new Set([
  "dip.governance.institution_created",
  "dip.governance.institution_updated",
  "dip.governance.proposal_executed",
  "dip.governance.proposal_opened",
]);

const HUB_CONTRIBUTION_EVENT_TYPES = new Set([
  "hub.contribution.integrated",
  "hub.contribution.merged",
]);

/**
 * Build prominence signals from a discovery document (for recompute after event).
 */
function signalsFromDocument(doc: DiscoveryDocument): ProminenceSignals {
  const lastAt = doc.recentArtifacts[0]?.at;
  return {
    artifactCount: doc.recentArtifacts.length,
    contributorCount: doc.contributorCount,
    governanceActivity: 0,
    recentContributionsCount: doc.recentArtifacts.length,
    crossLinksCount: 0,
    lastActivityAt: lastAt,
  };
}

function toDipGovernancePayload(
  eventType: string,
  payload: Record<string, unknown>
): DipGovernanceEventPayload | null {
  if (eventType === "dip.governance.institution_created") {
    const institutionId = payload.institutionId ?? payload.institution_id;
    const name = payload.name;
    if (typeof institutionId !== "string") return null;
    return { type: "institution_created", institutionId, name: typeof name === "string" ? name : undefined };
  }
  if (eventType === "dip.governance.institution_updated") {
    const institutionId = payload.institutionId ?? payload.institution_id;
    const name = payload.name;
    if (typeof institutionId !== "string") return null;
    return { type: "institution_updated", institutionId, name: typeof name === "string" ? name : undefined };
  }
  if (eventType === "dip.governance.proposal_executed" || eventType === "dip.governance.proposal_opened") {
    const institutionId = payload.institutionId ?? payload.institution_id;
    if (typeof institutionId !== "string") return null;
    return { type: "institution_updated", institutionId };
  }
  return null;
}

function toHubContributionPayload(
  payload: Record<string, unknown>
): HubContributionEventPayload | null {
  const institutionId = payload.institutionId ?? payload.institution_id;
  const artifactId = payload.artifactId ?? payload.artifact_id ?? payload.dip_artifact_id;
  const projectId = payload.projectId ?? payload.project_id;
  const contributorId = payload.contributorId ?? payload.contributor_id;
  return {
    type: "contribution_integrated",
    institutionId: typeof institutionId === "string" ? institutionId : undefined,
    projectId: typeof projectId === "string" ? projectId : undefined,
    contributorId: typeof contributorId === "string" ? contributorId : undefined,
    artifactId: typeof artifactId === "string" ? artifactId : undefined,
  };
}

export const PUBLIC_SQUARE_INDEXER_GROUP_ID = "hub-public-square-indexer";

export interface PublicSquareIndexerOptions {
  consumer: EventBusKafkaConsumer;
  repository: DiscoveryRepositoryPort;
  topics?: string[];
}

/**
 * Consumer that updates DiscoveryDocument index from governance and contribution events.
 */
export class PublicSquareIndexer {
  private readonly consumer: EventBusKafkaConsumer;
  private readonly repository: DiscoveryRepositoryPort;
  private readonly topics: string[];

  constructor(options: PublicSquareIndexerOptions) {
    this.consumer = options.consumer;
    this.repository = options.repository;
    this.topics = options.topics ?? PUBLIC_SQUARE_TOPICS;
  }

  start(): void {
    this.consumer.subscribeMany(this.topics, (msg: ConsumedMessage) => this.handleMessage(msg));
  }

  async disconnect(): Promise<void> {
    await this.consumer.disconnect();
  }

  private async handleMessage(message: ConsumedMessage): Promise<void> {
    let envelope: unknown;
    try {
      const raw = message.value ? message.value.toString("utf8") : "{}";
      envelope = JSON.parse(raw) as unknown;
    } catch {
      return;
    }

    if (envelope === null || typeof envelope !== "object") return;
    const env = envelope as Record<string, unknown>;
    const eventType = typeof env.eventType === "string" ? env.eventType : "";
    const payload = (env.payload !== null && typeof env.payload === "object"
      ? env.payload
      : {}) as Record<string, unknown>;

    let eventPayload: DiscoveryDocumentEventPayload | null = null;
    if (DIP_GOVERNANCE_EVENT_TYPES.has(eventType)) {
      eventPayload = toDipGovernancePayload(eventType, payload);
    } else if (HUB_CONTRIBUTION_EVENT_TYPES.has(eventType)) {
      eventPayload = toHubContributionPayload(payload);
    }
    if (!eventPayload) return;

    const institutionId =
      "institutionId" in eventPayload
        ? eventPayload.institutionId
        : eventPayload.institutionId ?? "";
    if (!institutionId) return;

    const current = await this.repository.findById(institutionId);
    const updated = applyDiscoveryEvent(current, eventPayload);
    const signals = signalsFromDocument(updated);
    const prominenceScore = computeProminenceScore(signals);
    const docWithScore = withProminenceScore(updated, prominenceScore);
    await this.repository.upsert(docWithScore);
  }
}
