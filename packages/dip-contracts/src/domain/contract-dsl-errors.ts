/**
 * Domain errors for Contract DSL parsing.
 * Architecture: COMP-004.4, smart-contract-engine subdomain
 */

/**
 * Thrown when contract DSL input is malformed or invalid.
 * Message is descriptive for debugging and user feedback.
 */
export class ContractDSLParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContractDSLParseError";
    Object.setPrototypeOf(this, ContractDSLParseError.prototype);
  }
}
