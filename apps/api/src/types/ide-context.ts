/**
 * IDE context for REST API IDE routes (COMP-030.8).
 *
 * Injected when registering IDE routes; provides session repository,
 * provisioning service, quota enforcer, and optional workspace snapshot
 * repository for COMP-035.6 workspace persistence.
 */

import type {
  IDESessionRepository,
  IDESessionProvisioningService,
  ResourceQuotaEnforcer,
  WorkspaceSnapshotRepository,
} from "@syntropy/ide";

export interface IDEContext {
  sessionRepository: IDESessionRepository;
  provisioningService: IDESessionProvisioningService;
  quotaEnforcer: ResourceQuotaEnforcer;
  /** Optional: for workspace auto-save and restore (COMP-035.6). */
  workspaceSnapshotRepository?: WorkspaceSnapshotRepository;
}
