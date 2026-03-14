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
//# sourceMappingURL=index.d.ts.map