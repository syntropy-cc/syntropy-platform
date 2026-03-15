"use client";

/**
 * Hub contribution editor page — Monaco Editor (COMP-035.1).
 * GET /hub/contribute/:id/editor
 */

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useCallback } from "react";
import { MonacoEditor } from "@syntropy/ui";

export default function HubContributeEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";

  const [content, setContent] = useState(
    "// Contribution editor\n// Use Cmd+S to save.\nconst example = true;\n"
  );

  const handleSave = useCallback(() => {
    // TODO: persist via API when WebSocket/IDE session is wired (COMP-035.2)
    console.info("Save requested for contribution", id);
  }, [id]);

  return (
    <div className="flex h-screen flex-col">
      <header className="flex shrink-0 items-center gap-4 border-b border-border px-4 py-2">
        <Link
          href={`/hub/contribute/${id}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to contribution
        </Link>
        <span className="text-sm font-medium text-foreground">
          Editor — Contribution {id}
        </span>
      </header>
      <main className="min-h-0 flex-1">
        <MonacoEditor
          value={content}
          onChange={setContent}
          language="typescript"
          height="100%"
          onSave={handleSave}
        />
      </main>
    </div>
  );
}
