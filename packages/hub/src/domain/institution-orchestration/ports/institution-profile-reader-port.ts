/**
 * Port for reading institution data to build InstitutionProfile (COMP-020.3).
 * Implemented by ACL adapter that calls DIP / Platform / Hub APIs.
 */

import type { InstitutionProfile } from "../institution-profile.js";

export interface InstitutionProfileReaderPort {
  getProfile(institutionId: string): Promise<InstitutionProfile | null>;
}
