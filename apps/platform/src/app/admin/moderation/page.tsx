/**
 * Moderation dashboard — flag queue from GET /api/v1/moderation/flags (COMP-032.6).
 */

import React from "react";
import { fetchApi } from "@/lib/api-client";

interface ModerationFlag {
  flagId: string;
  entityType: string;
  entityId: string;
  reason: string;
  status: string;
  createdAt: string;
}

export default async function ModerationPage() {
  const result = await fetchApi<ModerationFlag[]>("moderation/flags");
  const flags = result.ok && Array.isArray(result.data) ? result.data : [];
  const error = !result.ok ? result.error : null;

  return (
    <div>
      <h1>Moderation</h1>
      {error && (
        <p style={{ color: "var(--color-error, #b91c1c)" }}>
          {error.code}: {error.message}
        </p>
      )}
      {flags.length === 0 && !error && <p>No flags in queue.</p>}
      {flags.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "0.5rem", borderBottom: "1px solid #ccc" }}>Flag ID</th>
              <th style={{ textAlign: "left", padding: "0.5rem", borderBottom: "1px solid #ccc" }}>Entity</th>
              <th style={{ textAlign: "left", padding: "0.5rem", borderBottom: "1px solid #ccc" }}>Reason</th>
              <th style={{ textAlign: "left", padding: "0.5rem", borderBottom: "1px solid #ccc" }}>Status</th>
              <th style={{ textAlign: "left", padding: "0.5rem", borderBottom: "1px solid #ccc" }}>Created</th>
            </tr>
          </thead>
          <tbody>
            {flags.map((f) => (
              <tr key={f.flagId}>
                <td style={{ padding: "0.5rem", borderBottom: "1px solid #eee" }}>{f.flagId}</td>
                <td style={{ padding: "0.5rem", borderBottom: "1px solid #eee" }}>{f.entityType} / {f.entityId}</td>
                <td style={{ padding: "0.5rem", borderBottom: "1px solid #eee" }}>{f.reason}</td>
                <td style={{ padding: "0.5rem", borderBottom: "1px solid #eee" }}>{f.status}</td>
                <td style={{ padding: "0.5rem", borderBottom: "1px solid #eee" }}>{new Date(f.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
