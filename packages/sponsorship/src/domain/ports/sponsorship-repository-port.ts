/**
 * SponsorshipRepositoryPort — persistence for Sponsorship aggregate (COMP-027.4).
 * Implemented by PostgresSponsorshipRepository in infrastructure.
 */

import type { Sponsorship } from "../sponsorship.js";

export interface SponsorshipRepositoryPort {
  save(sponsorship: Sponsorship): Promise<void>;
  findById(id: string): Promise<Sponsorship | null>;
  findBySponsor(sponsorId: string): Promise<Sponsorship[]>;
}
