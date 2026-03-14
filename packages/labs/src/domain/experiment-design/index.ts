/**
 * Experiment design domain — ExperimentDesign aggregate (COMP-024).
 * Architecture: experiment-design.md
 */

export {
  ExperimentDesign,
  type ExperimentDesignParams,
} from "./experiment-design.js";
export {
  ExperimentResult,
  type ExperimentResultParams,
} from "./experiment-result.js";
export {
  ExperimentStatus,
  isExperimentStatus,
} from "./experiment-status.js";
export {
  AnonymizationPolicyEnforcer,
  PERSONAL_DATA_FIELDS,
  type AnonymizationPolicy,
  type PersonalDataField,
} from "./services/anonymization-policy-enforcer.js";
