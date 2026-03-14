/**
 * ContextModelUpdater — updates UserContextModel from events; supports batching.
 * Architecture: COMP-012.5, orchestration-context-engine
 */

import { UserContextModel } from "./user-context-model.js";
import type { UserContextUpdateEvent, UserId } from "./types.js";

/** Repository interface for loading and saving UserContextModel. */
export interface UserContextModelRepository {
  findByUser(userId: UserId): Promise<UserContextModel | null>;
  save(model: UserContextModel): Promise<void>;
}

/**
 * Updates UserContextModel from context refresh events.
 * Loads or creates model, applies event(s), saves. Batches multiple events per user.
 */
export class ContextModelUpdater {
  constructor(private readonly repository: UserContextModelRepository) {}

  /**
   * Applies a single event to the user's context model and persists.
   *
   * @param userId - User whose context to update
   * @param event - Domain event (activity_added, goals_updated, skill_level_updated)
   */
  async update(userId: UserId, event: UserContextUpdateEvent): Promise<void> {
    const model = await this.getOrCreate(userId);
    const updated = model.update(event);
    await this.repository.save(updated);
  }

  /**
   * Applies multiple events in sequence and persists once (batched).
   *
   * @param userId - User whose context to update
   * @param events - Domain events in order
   */
  async updateBatch(
    userId: UserId,
    events: UserContextUpdateEvent[]
  ): Promise<void> {
    let model = await this.getOrCreate(userId);
    for (const event of events) {
      model = model.update(event);
    }
    await this.repository.save(model);
  }

  private async getOrCreate(userId: UserId): Promise<UserContextModel> {
    const existing = await this.repository.findByUser(userId);
    return existing ?? UserContextModel.create({ userId });
  }
}
