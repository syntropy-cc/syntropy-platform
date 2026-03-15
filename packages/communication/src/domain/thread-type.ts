/**
 * Thread type — classification of a conversation (COMP-028.1).
 * Architecture: COMP-028, communication domain
 */

export type ThreadType = "direct" | "group" | "notification";

const THREAD_TYPES: ThreadType[] = ["direct", "group", "notification"];

export function isThreadType(value: string): value is ThreadType {
  return THREAD_TYPES.includes(value as ThreadType);
}
