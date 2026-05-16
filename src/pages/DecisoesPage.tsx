import { useCgo } from "@/state/CgoContext";
import { formatDateTime } from "@/domain/time";

export default function DecisoesPage() {
  const { rawDb } = useCgo();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-white">Decisões CGO</h1>
      {rawDb.cgoDecisions.length === 0 ? (
        <p className="text-cgo-muted text-sm">Nenhuma decisão registada ainda.</p>
      ) : (
        <div className="space-y-2">
          {rawDb.cgoDecisions.map((d) => (
            <div key={d.id} className="rounded-lg border border-cgo-border bg-cgo-panel p-4 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-cgo-accent font-medium">{d.decisionType}</span>
                <span className="text-xs text-cgo-muted">{formatDateTime(d.createdAt)}</span>
              </div>
              <p className="text-slate-100 mt-2">{d.instruction}</p>
              <p className="text-xs text-cgo-muted mt-2">
                Responsável execução: {d.assignedTo} · prazo {formatDateTime(d.deadline)}
              </p>
              <p className="text-xs mt-1">Justificativa: {d.justification}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
