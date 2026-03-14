/**
 * IDE domain package.
 * Architecture: COMP-030
 */
export { IDESession } from "./domain/ide-session.js";
export { IDESessionStatus, isIDESessionStatus, type IDESessionStatusValue, } from "./domain/ide-session-status.js";
export { Container, ContainerStatus, type ContainerStatusValue, } from "./domain/container.js";
export type { ContainerOrchestrator, ProvisionParams, } from "./domain/ports/container-orchestrator.js";
export { QuotaExceededError } from "./domain/errors.js";
export { ResourceQuotaEnforcer } from "./domain/services/resource-quota-enforcer.js";
export type { RoleQuotaConfig, QuotaConfigByRole, } from "./domain/services/resource-quota-enforcer.js";
export type { UsagePort, UserUsage } from "./domain/ports/usage-port.js";
export type { RolePort } from "./domain/ports/role-port.js";
export { WorkspaceSnapshot, type WorkspaceSnapshotFile, type WorkspaceSnapshotData, } from "./domain/workspace-snapshot.js";
export type { DIPArtifactPort, PublishArtifactParams, PublishArtifactResult, } from "./domain/ports/dip-artifact-port.js";
export { IDEArtifactBridge, SessionNotActiveError, } from "./application/artifact-publish-bridge.js";
export type { IDESessionRepository } from "./domain/ports/ide-session-repository.js";
export type { WorkspaceSnapshotRepository, } from "./domain/ports/workspace-snapshot-repository.js";
export type { IDEEventPublisher, IDEDomainEvent, } from "./domain/ports/ide-event-publisher.js";
export type { ContainerProvisionedEvent } from "./domain/events/container-provisioned.js";
export { IDESessionProvisioningService, SessionNotFoundError, SessionNotSuspensibleError, } from "./application/ide-session-provisioning-service.js";
export { PostgresIDESessionRepository } from "./infrastructure/repositories/postgres-ide-session-repository.js";
export { PostgresWorkspaceSnapshotRepository } from "./infrastructure/repositories/postgres-workspace-snapshot-repository.js";
//# sourceMappingURL=index.d.ts.map