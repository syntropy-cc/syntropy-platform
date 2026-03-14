/**
 * Port for emitting learn domain progress events (COMP-016.3).
 * Architecture: fragment-artifact-engine.md.
 */

/**
 * Implemented by infrastructure to publish learn progress events.
 * Domain service calls this when a fragment or track is completed.
 */
export interface ProgressEventsPort {
  publishFragmentCompleted(
    userId: string,
    fragmentId: string,
    completedAt: Date,
    score?: number | null
  ): Promise<void>;

  publishTrackCompleted(
    userId: string,
    trackId: string,
    completedAt: Date
  ): Promise<void>;
}
