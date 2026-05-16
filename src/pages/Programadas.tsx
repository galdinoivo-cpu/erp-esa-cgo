import { useMemo } from "react";
import { useCgo } from "@/state/CgoContext";
import { isOnAgenda, isOperationTerminal } from "@/domain/radarRules";
import { formatDateTime } from "@/domain/time";

export default function Programadas() {
  const { dbView, now } = useCgo();

  const rows = useMemo(() => {
    return dbView.operationInstances
      .filter((o) => !isOperationTerminal(o))
      .filter((o) => isOnAgenda(o, now))
      .sort((a, b) => new Date(a.radarEntryAt).getTime() - new Date(b.radarEntryAt).getTime());
  }, [dbView, now]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-white">Operações programadas</h1>
        <p className="text-cgo-muted text-sm mt-1">
          Futuras: ainda fora da janela do Radar. Quando <code className="text-cgo-accent">agora ≥ radarEntryAt</code>,
          entram automaticamente no Radar (simulação a cada 30s + ao mudar o relógio).
        </p>
      </div>
      <div className="overflow-x-auto rounded-lg border border-cgo-border">
        <table className="w-full text-sm">
          <thead className="bg-cgo-panel text-left text-xs text-cgo-muted uppercase">
            <tr>
              <th className="p-3">Operação</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Fazenda</th>
              <th className="p-3">Talhão</th>
              <th className="p-3">COL</th>
              <th className="p-3">Prestador</th>
              <th className="p-3">Tráfego</th>
              <th className="p-3">Pendência</th>
              <th className="p-3">Entrada Radar</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-6 text-center text-cgo-muted">
                  Nenhuma operação na agenda para o instante simulado atual.
                </td>
              </tr>
            ) : (
              rows.map((o) => (
                <tr key={o.id} className="border-t border-cgo-border hover:bg-white/5">
                  <td className="p-3 font-medium text-white">{o.title}</td>
                  <td className="p-3">{o.clientName}</td>
                  <td className="p-3">{o.farmName}</td>
                  <td className="p-3">{o.fieldName}</td>
                  <td className="p-3">{o.col}</td>
                  <td className="p-3">{o.provider}</td>
                  <td className="p-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        o.traffic === "verde"
                          ? "bg-emerald-900/40 text-emerald-300"
                          : o.traffic === "amarelo"
                            ? "bg-amber-900/40 text-amber-200"
                            : "bg-rose-900/40 text-rose-200"
                      }`}
                    >
                      {o.traffic}
                    </span>
                  </td>
                  <td className="p-3 text-cgo-muted max-w-[200px]">{o.currentIssue}</td>
                  <td className="p-3 font-mono text-xs whitespace-nowrap">{formatDateTime(o.radarEntryAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
