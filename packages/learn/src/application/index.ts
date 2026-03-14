/**
 * Learn application layer (COMP-017).
 * Architecture: creator-tools-copilot.md.
 */

export { CreatorCopilotService, type CreatorCopilotServiceDeps } from "./creator-copilot-service.js";
export type {
  LearnCopilotAgentPort,
  GenerateContentParams,
  GenerateContentResult,
} from "./ports/learn-copilot-agent-port.js";
