/**
 * MentorSession repository port (COMP-029.5).
 * Architecture: Planning domain, PAT-004
 */

import type { MentorSession } from "../mentor-session.js";

export interface MentorSessionRepository {
  save(session: MentorSession): Promise<void>;
  findById(sessionId: string): Promise<MentorSession | null>;
  findByMentorId(mentorId: string): Promise<MentorSession[]>;
  findByLearnerId(learnerId: string): Promise<MentorSession[]>;
}
