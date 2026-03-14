/**
 * Career aggregate — top-level learning path (COMP-015.1).
 * Architecture: Learn Content Hierarchy, content-hierarchy-navigation.md.
 */

import type { CareerId, TrackId } from "@syntropy/types";

export interface CareerParams {
  careerId: CareerId;
  title: string;
  trackIds: TrackId[];
  /** When true, career is visible to learners; requires at least one published track. */
  isPublished?: boolean;
}

/**
 * Career aggregate. Top-level container for tracks in a professional domain.
 * Invariant: published only when at least one track is published (enforced at publish time).
 */
export class Career {
  readonly careerId: CareerId;
  readonly title: string;
  private readonly _trackIds: readonly TrackId[];

  private constructor(params: CareerParams) {
    this.careerId = params.careerId;
    this.title = params.title;
    this._trackIds = [...params.trackIds];
  }

  static create(params: CareerParams): Career {
    return new Career(params);
  }

  get tracks(): readonly TrackId[] {
    return this._trackIds;
  }
}
