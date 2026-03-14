/**
 * MentorSessionSchedulingService — schedules sessions after checking availability (COMP-029.4).
 * Architecture: Planning domain, depends on MentorAvailabilityPort
 */

import type {
  MentorAvailabilityPort,
  AvailabilityWindow,
} from "../domain/ports/mentor-availability-port.js";
import { MentorSession } from "../domain/mentor-session.js";

/**
 * Thrown when scheduling is attempted but the mentor is not available.
 */
export class MentorNotAvailableError extends Error {
  constructor(
    public readonly mentorId: string,
    public readonly window: AvailabilityWindow
  ) {
    super(
      `Mentor ${mentorId} is not available in the requested window`
    );
    this.name = "MentorNotAvailableError";
    Object.setPrototypeOf(this, MentorNotAvailableError.prototype);
  }
}

/**
 * Schedules a mentor session after verifying mentor availability.
 */
export class MentorSessionSchedulingService {
  constructor(private readonly availability: MentorAvailabilityPort) {}

  async schedule(params: {
    sessionId: string;
    mentorId: string;
    learnerId: string;
    scheduledAt: Date;
    durationMinutes: number;
  }): Promise<MentorSession> {
    const start = params.scheduledAt;
    const end = new Date(
      start.getTime() + params.durationMinutes * 60 * 1000
    );
    const window: AvailabilityWindow = { start, end };
    const available = await this.availability.isAvailable(
      params.mentorId,
      window
    );
    if (!available) {
      throw new MentorNotAvailableError(params.mentorId, window);
    }
    return MentorSession.create({
      sessionId: params.sessionId,
      mentorId: params.mentorId,
      learnerId: params.learnerId,
      scheduledAt: params.scheduledAt,
    });
  }
}
