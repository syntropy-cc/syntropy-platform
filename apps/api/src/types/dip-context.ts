/**
 * DIP context passed into the API for artifact, contract, project, and IACP routes (COMP-003.7, COMP-004.6, COMP-006.6, COMP-005.8).
 * Kept in types to avoid circular dependency between server and routes.
 */

import type {
  ArtifactLifecycleService,
  ArtifactRepository,
  ContractRepository,
  CreateProjectUseCase,
  ProjectRepository,
} from "@syntropy/dip";
import type {
  ContractDSLParser,
  SmartContractEvaluator,
} from "@syntropy/dip-contracts";
import type { IACPRepository } from "@syntropy/dip-iacp";
import type { IACPEngine } from "@syntropy/dip-iacp";
import type { IACPEventPublisherPort } from "@syntropy/dip-iacp";

export interface DipContext {
  lifecycleService: ArtifactLifecycleService;
  artifactRepository: ArtifactRepository;
  contractRepository: ContractRepository;
  smartContractEvaluator: SmartContractEvaluator;
  contractDSLParser: ContractDSLParser;
  projectRepository: ProjectRepository;
  createProjectUseCase: CreateProjectUseCase;
  /** IACP repository (COMP-005.8). */
  iacpRepository: IACPRepository;
  /** Optional: used for activate endpoint to evaluate governance. */
  iacpEngine?: IACPEngine;
  /** Optional: publish lifecycle events (created, activated, terminated). */
  iacpEventPublisher?: IACPEventPublisherPort;
}
