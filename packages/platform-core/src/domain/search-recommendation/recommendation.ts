/**
 * Recommendation entity — a single surfaced opportunity for a user (COMP-011.5, COMP-011.6).
 * Architecture: Platform Core — Search & Recommendation.
 */

export type OpportunityType =
  | "OpenIssue"
  | "PublishedTrack"
  | "LabsArticle"
  | "InstitutionToJoin";

export interface RecommendationParams {
  id: string;
  opportunityType: OpportunityType;
  entityType: string;
  entityId: string;
  relevanceScore: number;
  reasoning?: string | null;
  wasClicked?: boolean;
  generatedAt: Date;
}

export class Recommendation {
  readonly id: string;
  readonly opportunityType: OpportunityType;
  readonly entityType: string;
  readonly entityId: string;
  readonly relevanceScore: number;
  readonly reasoning: string | null;
  readonly wasClicked: boolean;
  readonly generatedAt: Date;

  private constructor(params: RecommendationParams) {
    this.id = params.id;
    this.opportunityType = params.opportunityType;
    this.entityType = params.entityType;
    this.entityId = params.entityId;
    this.relevanceScore = params.relevanceScore;
    this.reasoning = params.reasoning ?? null;
    this.wasClicked = params.wasClicked ?? false;
    this.generatedAt = params.generatedAt;
  }

  static create(params: RecommendationParams): Recommendation {
    return new Recommendation(params);
  }

  recordClick(): Recommendation {
    return new Recommendation({
      id: this.id,
      opportunityType: this.opportunityType,
      entityType: this.entityType,
      entityId: this.entityId,
      relevanceScore: this.relevanceScore,
      reasoning: this.reasoning,
      wasClicked: true,
      generatedAt: this.generatedAt,
    });
  }
}
