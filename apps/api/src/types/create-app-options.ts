/**
 * Options for createApp and registerApiRoutes (COMP-033.4).
 * Defined in types to avoid circular dependency between server and router.
 */

import type { AuthProvider } from "@syntropy/identity";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AiAgentsContext } from "./ai-agents-context.js";
import type { DipContext } from "./dip-context.js";
import type { GovernanceContext } from "./governance-context.js";
import type { GovernanceModerationContext } from "./governance-moderation-context.js";
import type { HubCollaborationContext } from "./hub-context.js";
import type { IDEContext } from "./ide-context.js";
import type { LabsScientificContext } from "./labs-context.js";
import type { LearnContext } from "./learn-context.js";
import type { CommunicationContext } from "./communication-context.js";
import type { PlanningContext } from "./planning-context.js";
import type { PortfolioContext } from "./portfolio-context.js";
import type { SearchContext } from "./search-context.js";
import type { SponsorshipContext } from "./sponsorship-context.js";
import type { TreasuryContext } from "./treasury-context.js";

export interface CreateAppOptions {
  auth?: AuthProvider | null;
  supabaseClient?: SupabaseClient | null;
  dip?: DipContext | null;
  governance?: GovernanceContext | null;
  portfolio?: PortfolioContext | null;
  search?: SearchContext | null;
  treasury?: TreasuryContext | null;
  aiAgents?: AiAgentsContext | null;
  learn?: LearnContext | null;
  hub?: HubCollaborationContext | null;
  labs?: LabsScientificContext | null;
  sponsorship?: SponsorshipContext | null;
  communication?: CommunicationContext | null;
  planning?: PlanningContext | null;
  ide?: IDEContext | null;
  governanceModeration?: GovernanceModerationContext | null;
}
