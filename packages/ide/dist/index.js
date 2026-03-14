/**
 * IDE domain package.
 * Architecture: COMP-030
 */
export { IDESession } from "./domain/ide-session.js";
export { IDESessionStatus, isIDESessionStatus, } from "./domain/ide-session-status.js";
export { Container, ContainerStatus, } from "./domain/container.js";
export { QuotaExceededError } from "./domain/errors.js";
export { ResourceQuotaEnforcer } from "./domain/services/resource-quota-enforcer.js";
export { WorkspaceSnapshot, } from "./domain/workspace-snapshot.js";
export { IDEArtifactBridge, SessionNotActiveError, } from "./application/artifact-publish-bridge.js";
export { IDESessionProvisioningService, SessionNotFoundError, SessionNotSuspensibleError, } from "./application/ide-session-provisioning-service.js";
export { PostgresIDESessionRepository } from "./infrastructure/repositories/postgres-ide-session-repository.js";
export { PostgresWorkspaceSnapshotRepository } from "./infrastructure/repositories/postgres-workspace-snapshot-repository.js";
