"use client";

/**
 * Labs article content editor — Monaco in MyST Markdown mode (COMP-035.1).
 */

import { useState, useCallback } from "react";
import { MonacoEditor } from "@syntropy/ui";

interface ArticleEditorClientProps {
  articleId: string;
  title: string;
  initialContent: string;
}

export function ArticleEditorClient({
  articleId,
  title,
  initialContent,
}: ArticleEditorClientProps) {
  const [content, setContent] = useState(initialContent);

  const handleSave = useCallback(() => {
    // TODO: PUT /api/v1/labs/articles/:id when API is wired
    console.info("Save requested for article", articleId);
  }, [articleId]);

  return (
    <div className="flex flex-col">
      <p className="mb-2 text-sm text-muted-foreground">
        Editing: {title} — Use Cmd+S to save.
      </p>
      <div className="rounded-lg border border-border overflow-hidden">
        <MonacoEditor
          value={content}
          onChange={setContent}
          language="markdown"
          height="480px"
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
