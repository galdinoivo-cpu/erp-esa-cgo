import { useCgo } from "@/state/CgoContext";
import { formatDateTime } from "@/domain/time";

export default function LogsPage() {
  const { rawDb } = useCgo();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-white">Logs</h1>
      <div className="space-y-2">
        {rawDb.auditLogs.map((l) => (
          <div key={l.id} className="rounded-lg border border-cgo-border bg-cgo-panel p-3 text-sm">
            <div className="flex flex-wrap justify-between gap-2">
              <span className="font-mono text-xs text-cgo-accent">{l.eventType}</span>
              <span className="text-xs text-cgo-muted">{formatDateTime(l.createdAt)}</span>
            </div>
            <div className="text-slate-200 mt-1">{l.description}</div>
            <div className="text-xs text-cgo-muted mt-1">
              user {l.userId} · {l.source}
              {l.observation ? ` · ${l.observation}` : ""}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
