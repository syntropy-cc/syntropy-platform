/**
 * Port for mentor availability (COMP-029.4).
 * Implementations query Learn Mentorship or calendar; keeps Planning independent.
 */

/**
 * Time window for availability check.
 */
export interface AvailabilityWindow {
  start: Date;
  end: Date;
}

/**
 * Port to check whether a mentor is available in a given window.
 * Used before creating a MentorSession; implemented by Learn or app.
 */
export interface MentorAvailabilityPort {
  isAvailable(
    mentorId: string,
    window: AvailabilityWindow
  ): Promise<boolean>;
}
