/**
 * DIP context passed into the API for artifact, contract, and project routes (COMP-003.7, COMP-004.6, COMP-006.6).
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

export interface DipContext {
  lifecycleService: ArtifactLifecycleService;
  artifactRepository: ArtifactRepository;
  contractRepository: ContractRepository;
  smartContractEvaluator: SmartContractEvaluator;
  contractDSLParser: ContractDSLParser;
  projectRepository: ProjectRepository;
  createProjectUseCase: CreateProjectUseCase;
}
