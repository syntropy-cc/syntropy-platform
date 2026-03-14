/**
 * InstitutionProfileProjector — builds display-ready InstitutionProfile (COMP-020.3).
 * Architecture: Hub Institution Orchestration
 */

import type { InstitutionProfile } from "../domain/institution-orchestration/institution-profile.js";
import type { InstitutionProfileReaderPort } from "../domain/institution-orchestration/ports/institution-profile-reader-port.js";

/**
 * Projects institution data into the InstitutionProfile read model.
 * Delegates to a reader port (ACL to DIP/Platform/Hub); caller wires implementation.
 */
export class InstitutionProfileProjector {
  constructor(private readonly reader: InstitutionProfileReaderPort) {}

  /**
   * Returns display-ready profile for the institution, or null if not found.
   */
  async getProfile(institutionId: string): Promise<InstitutionProfile | null> {
    const trimmed = institutionId?.trim();
    if (!trimmed) {
      return null;
    }
    return this.reader.getProfile(trimmed);
  }
}
