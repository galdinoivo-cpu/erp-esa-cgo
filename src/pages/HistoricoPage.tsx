import { useMemo } from "react";
import { useCgo } from "@/state/CgoContext";
import { formatDateTime } from "@/domain/time";

export default function HistoricoPage() {
  const { rawDb } = useCgo();
  const rows = useMemo(() => {
    return rawDb.operationInstances.filter(
      (o) => o.status === "concluido" || o.status === "cancelado" || o.archived || o.closedAt
    );
  }, [rawDb.operationInstances]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-white">Histórico</h1>
      <p className="text-cgo-muted text-sm">
        MVP: mostra instâncias com estado terminal. Na demo seed ainda não há concluídas — complete uma operação na
        evolução do produto.
      </p>
      {rows.length === 0 ? (
        <p className="text-cgo-muted">Sem registos históricos.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((o) => (
            <li key={o.id} className="rounded-lg border border-cgo-border bg-cgo-panel p-3 text-sm">
              <strong className="text-white">{o.title}</strong> — {o.status}
              {o.closedAt && <span className="text-cgo-muted"> · {formatDateTime(o.closedAt)}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
