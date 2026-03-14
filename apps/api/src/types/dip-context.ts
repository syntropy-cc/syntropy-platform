/**
 * DIP context passed into the API for artifact and contract routes (COMP-003.7, COMP-004.6).
 * Kept in types to avoid circular dependency between server and routes.
 */

import type {
  ArtifactLifecycleService,
  ArtifactRepository,
  ContractRepository,
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
}
