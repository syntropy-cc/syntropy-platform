/**
 * Shared TypeScript types and branded IDs.
 * Architecture: COMP-001, COMP-015 (Learn IDs).
 */

export {
  createCareerId,
  createCourseId,
  createCreatorWorkflowId,
  createFragmentId,
  createTrackId,
  isCareerId,
  isCourseId,
  isCreatorWorkflowId,
  isFragmentId,
  isTrackId,
} from "./ids.js";
export type {
  CareerId,
  CourseId,
  CreatorWorkflowId,
  FragmentId,
  TrackId,
} from "./ids.js";
