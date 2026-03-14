/**
 * IDE context for REST API IDE routes (COMP-030.8).
 *
 * Injected when registering IDE routes; provides session repository,
 * provisioning service, and quota enforcer.
 */

import type {
  IDESessionRepository,
  IDESessionProvisioningService,
  ResourceQuotaEnforcer,
} from "@syntropy/ide";

export interface IDEContext {
  sessionRepository: IDESessionRepository;
  provisioningService: IDESessionProvisioningService;
  quotaEnforcer: ResourceQuotaEnforcer;
}
