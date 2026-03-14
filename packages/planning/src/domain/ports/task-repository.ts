/**
 * Task repository port (COMP-029.5).
 * Architecture: Planning domain, PAT-004
 */

import type { Task } from "../task.js";

export interface TaskRepository {
  save(task: Task): Promise<void>;
  findById(taskId: string): Promise<Task | null>;
  findByUserId(userId: string): Promise<Task[]>;
}
