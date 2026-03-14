/**
 * Learn course detail — fragments list (COMP-032.3).
 * GET /learn/courses/:id
 */

import Link from "next/link";
import { fetchApi, type CourseItem } from "../../../../lib/api";

export default async function LearnCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: courseId } = await params;
  const result = await fetchApi<CourseItem>(
    `/api/v1/learn/courses/${courseId}`
  );

  if ("error" in result) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-foreground">Course</h1>
        <p className="mt-2 text-muted-foreground">
          {result.error.code === "NOT_FOUND"
            ? "Course not found."
            : result.error.message}
        </p>
      </div>
    );
  }

  const course = result.data;
  if (!course) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Course not found.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-4">
        <Link href="/learn" className="text-sm text-muted-foreground hover:underline">
          ← Back to paths
        </Link>
      </div>
      <h1 className="text-2xl font-semibold text-foreground">{course.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {course.fragmentIds.length} fragment(s) · {course.status}
      </p>
      <ul className="mt-6 space-y-2">
        {course.fragmentIds.map((fragmentId) => (
          <li key={fragmentId}>
            <Link
              href={`/learn/fragments/${fragmentId}`}
              className="block rounded border border-border bg-card p-3 transition hover:bg-accent/50"
            >
              <span className="text-foreground">Fragment</span>
              <span className="ml-2 font-mono text-sm text-muted-foreground">
                {fragmentId}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {course.fragmentIds.length === 0 && (
        <p className="mt-6 text-muted-foreground">No fragments in this course.</p>
      )}
    </div>
  );
}
