/**
 * Shared TypeScript types and branded IDs.
 * Architecture: COMP-001, COMP-015 (Learn IDs).
 */

export {
  createCareerId,
  createCourseId,
  createFragmentId,
  createTrackId,
  isCareerId,
  isCourseId,
  isFragmentId,
  isTrackId,
} from "./ids.js";
export type { CareerId, CourseId, FragmentId, TrackId } from "./ids.js";
